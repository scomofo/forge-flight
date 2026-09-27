import { create } from "zustand";
import { persist } from "zustand/middleware";
import { missionById, type Mission } from "@/forge/content/catalog";
import { gradeReflection, sealEntry, type LedgerEntry, type RubricScore } from "@/forge/ledger";
import type { DesignInput, PartInput, VehicleInput } from "@/forge/sim/evaluate";
import { PHASES, type Phase } from "@/forge/types";

export type MissionRun = {
  missionId: string;
  iteration: number;
  phase: Phase;
  everSealed: boolean;
  sealed: boolean;
  maxReached: number;
  parts: PartInput[];
  vehicle: VehicleInput | null;
  quantity: number;
  fidelity: "L0" | "L1";
  dfmOverride: boolean;
  analyses: string[];
  testDone: boolean;
  reflection: string;
  ledger: LedgerEntry[];
  rubric: RubricScore[] | null;
  bestRubric: number;
  sealedCount: number;
};

type ForgeStore = {
  runs: Record<string, MissionRun>;
  seen: string[];
  lastNudge: number;
  ensure: (id: string) => void;
  patch: (id: string, partial: Partial<MissionRun>) => void;
  setParam: (id: string, partId: string, key: string, value: number) => void;
  setPart: (id: string, partId: string, partial: Partial<PartInput>) => void;
  setVehicle: (id: string, partial: Partial<VehicleInput>) => void;
  go: (id: string, phase: Phase) => void;
  advance: (id: string) => void;
  recordAnalysis: (id: string, kind: string) => void;
  submit: (id: string, constraintsMet: boolean) => void;
  see: (conceptId: string) => void;
  nudge: () => boolean;
};

function blank(mission: Mission): MissionRun {
  return {
    missionId: mission.id,
    iteration: 1,
    phase: "brief",
    everSealed: false,
    sealed: false,
    maxReached: 0,
    parts: mission.parts.map((part) => ({
      id: part.id,
      name: part.name,
      kind: part.kind,
      params: { ...part.params },
      materialId: part.materialId,
      processId: part.processId,
      loads: part.loads.map((load) => ({ ...load })),
      liftFed: part.liftFed,
    })),
    vehicle: mission.vehicle ? { ...mission.vehicle } : null,
    quantity: mission.constraints.quantity ?? 1,
    fidelity: "L0",
    dfmOverride: false,
    analyses: [],
    testDone: false,
    reflection: "",
    ledger: [],
    rubric: null,
    bestRubric: 0,
    sealedCount: 0,
  };
}

export function canEnter(run: MissionRun, phase: Phase): boolean {
  if (run.everSealed) return true;
  return PHASES.indexOf(phase) <= run.maxReached;
}

export function toDesign(run: MissionRun, mission: Mission): DesignInput {
  return {
    parts: run.parts,
    vehicle: run.vehicle,
    environment: mission.environment,
    quantity: run.quantity,
    limits: mission.constraints,
    fidelity: run.fidelity,
    seed: 1,
    excitation_hz: run.fidelity === "L1" ? 180 : 0,
  };
}

export function rubricPercent(scores: RubricScore[]): number {
  if (!scores.length) return 0;
  return (scores.reduce((sum, score) => sum + score.score, 0) / (scores.length * 2)) * 100;
}

export function unlocked(runs: Record<string, MissionRun>, mission: Mission): boolean {
  if (mission.locked) return false;
  return mission.unlockAfter.every((id) => {
    const run = runs[id];
    return !!run && run.sealedCount >= 3 && run.bestRubric >= 70;
  });
}

function snapshot(run: MissionRun) {
  return {
    iteration: run.iteration,
    parts: run.parts,
    vehicle: run.vehicle,
    quantity: run.quantity,
    fidelity: run.fidelity,
  };
}

export const useForge = create<ForgeStore>()(
  persist(
    (set, get) => ({
      runs: {},
      seen: [],
      lastNudge: 0,
      ensure: (id) => {
        if (get().runs[id]) return;
        const mission = missionById(id);
        if (!mission || mission.locked) return;
        set({ runs: { ...get().runs, [id]: blank(mission) } });
      },
      patch: (id, partial) => {
        const run = get().runs[id];
        if (!run) return;
        set({ runs: { ...get().runs, [id]: { ...run, ...partial } } });
      },
      setParam: (id, partId, key, value) => {
        const run = get().runs[id];
        if (!run) return;
        set({
          runs: {
            ...get().runs,
            [id]: {
              ...run,
              parts: run.parts.map((part) => (part.id === partId ? { ...part, params: { ...part.params, [key]: value } } : part)),
            },
          },
        });
      },
      setPart: (id, partId, partial) => {
        const run = get().runs[id];
        if (!run) return;
        set({
          runs: {
            ...get().runs,
            [id]: { ...run, parts: run.parts.map((part) => (part.id === partId ? { ...part, ...partial } : part)) },
          },
        });
      },
      setVehicle: (id, partial) => {
        const run = get().runs[id];
        if (!run?.vehicle) return;
        set({ runs: { ...get().runs, [id]: { ...run, vehicle: { ...run.vehicle, ...partial } } } });
      },
      go: (id, phase) => {
        const run = get().runs[id];
        if (!run || !canEnter(run, phase)) return;
        if (run.sealed && phase !== run.phase) {
          const parent = run.ledger.at(-1)?.hash ?? null;
          const opened = sealEntry({
            id: `${id}-${run.iteration + 1}-open`,
            iteration: run.iteration + 1,
            phase,
            parentHash: parent,
            snapshot: snapshot(run),
            action: "New iteration",
          });
          set({
            runs: {
              ...get().runs,
              [id]: {
                ...run,
                iteration: run.iteration + 1,
                phase,
                sealed: false,
                maxReached: PHASES.indexOf(phase),
                analyses: [],
                testDone: false,
                reflection: "",
                rubric: null,
                dfmOverride: false,
                ledger: [...run.ledger, opened],
              },
            },
          });
          return;
        }
        set({ runs: { ...get().runs, [id]: { ...run, phase } } });
      },
      advance: (id) => {
        const run = get().runs[id];
        if (!run) return;
        const index = PHASES.indexOf(run.phase);
        const next = PHASES[index + 1];
        if (!next) return;
        const parent = run.ledger.at(-1)?.hash ?? null;
        const step = sealEntry({
          id: `${id}-${run.iteration}-${run.phase}`,
          iteration: run.iteration,
          phase: run.phase,
          parentHash: parent,
          snapshot: snapshot(run),
          action: `Left ${run.phase}`,
        });
        set({
          runs: {
            ...get().runs,
            [id]: {
              ...run,
              phase: next,
              maxReached: Math.max(run.maxReached, index + 1),
              ledger: [...run.ledger, step],
            },
          },
        });
      },
      recordAnalysis: (id, kind) => {
        const run = get().runs[id];
        if (!run || run.analyses.includes(kind)) return;
        set({ runs: { ...get().runs, [id]: { ...run, analyses: [...run.analyses, kind] } } });
      },
      submit: (id, constraintsMet) => {
        const run = get().runs[id];
        if (!run || run.reflection.trim().length < 30) return;
        const rubric = gradeReflection(run.reflection, run.iteration, constraintsMet);
        const pct = rubricPercent(rubric);
        const parent = run.ledger.at(-1)?.hash ?? null;
        const sealed = sealEntry({
          id: `${id}-${run.iteration}-seal`,
          iteration: run.iteration,
          phase: "review",
          parentHash: parent,
          snapshot: snapshot(run),
          action: "Reflection sealed",
          note: run.reflection.trim(),
        });
        set({
          runs: {
            ...get().runs,
            [id]: {
              ...run,
              sealed: true,
              everSealed: true,
              rubric,
              bestRubric: Math.max(run.bestRubric, pct),
              sealedCount: run.sealedCount + 1,
              ledger: [...run.ledger, sealed],
            },
          },
        });
      },
      see: (conceptId) => {
        if (get().seen.includes(conceptId)) return;
        set({ seen: [...get().seen, conceptId] });
      },
      nudge: () => {
        const now = Date.now();
        if (now - get().lastNudge < 90_000) return false;
        set({ lastNudge: now });
        return true;
      },
    }),
    {
      name: "forge-flight-v1",
      partialize: (state) => ({ runs: state.runs }),
    },
  ),
);
