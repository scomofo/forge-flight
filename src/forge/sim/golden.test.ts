import assert from "node:assert/strict";
import test from "node:test";
import { materials, missions, processes } from "@/forge/content/catalog.ts";
import { relativeLuminance, stressStops } from "@/forge/palette.ts";
import { evaluate, recommendProcess, runAnalysis, type DesignInput } from "@/forge/sim/evaluate.ts";
import {
  axialStress,
  bendingStress,
  cantileverTipDeflection,
  eulerBuckling,
  fatigueLifeCycles,
  finiteWingSlope,
  inducedDragCoeff,
  lift,
  rectangleInertia,
  safetyFactor,
  simplySupportedCenterDeflection,
  staticMargin,
  thermalStress,
  torsionShear,
  tubeInertia,
  unitCost,
  utilization,
} from "@/forge/sim/formulas.ts";
import { hashCanon } from "@/forge/sim/hash.ts";
import { gradeReflection, replay } from "@/forge/ledger.ts";

test("axial stress", () => {
  assert.ok(Math.abs(axialStress(1000, 1e-4) - 10e6) < 1);
});

test("bending stress", () => {
  assert.ok(Math.abs(bendingStress(100, 0.01, 1e-6) - 1e6) < 1);
});

test("cantilever tip deflection", () => {
  const d = cantileverTipDeflection(100, 1, 200e9, 1e-8);
  assert.ok(Math.abs(d - 100 / 6000) < 1e-9);
});

test("simply supported center deflection", () => {
  const d = simplySupportedCenterDeflection(100, 1, 200e9, 1e-8);
  assert.ok(Math.abs(d - 100 / 96000) < 1e-12);
});

test("euler pinned vs cantilever", () => {
  const pinned = eulerBuckling(200e9, 1e-8, 1, 1);
  const free = eulerBuckling(200e9, 1e-8, 2, 1);
  assert.ok(Math.abs(pinned - Math.PI ** 2 * 200e9 * 1e-8) < 1);
  assert.ok(Math.abs(free - pinned / 4) < 1e-6);
});

test("torsion shear", () => {
  assert.ok(Math.abs(torsionShear(10, 0.01, 1e-8) - 10e6) < 1);
});

test("thermal stress", () => {
  const s = thermalStress(200e9, 12e-6, 50, 0.3);
  assert.ok(Math.abs(s - (200e9 * 12e-6 * 50) / 0.7) < 1);
});

test("lift", () => {
  const L = lift(1.225, 10, 0.2, 0.8);
  assert.ok(Math.abs(L - 9.8) < 1e-9);
});

test("induced drag", () => {
  const cdi = inducedDragCoeff(1, 6, 0.8);
  assert.ok(Math.abs(cdi - 1 / (Math.PI * 6 * 0.8)) < 1e-12);
});

test("static margin band", () => {
  assert.ok(Math.abs(staticMargin(0.3, 0.22, 1) - 0.08) < 1e-12);
});

test("fatigue forward Basquin", () => {
  const n = fatigueLifeCycles(200e6, 1000e6, -0.1);
  const back = 1000e6 * (2 * n) ** -0.1;
  assert.ok(Math.abs(back - 200e6) / 200e6 < 1e-6);
});

test("rectangle and tube inertia", () => {
  assert.ok(Math.abs(rectangleInertia(0.02, 0.01) - (0.02 * 0.01 ** 3) / 12) < 1e-18);
  const i = tubeInertia(0.012, 0.0096);
  assert.ok(i > 0 && i < tubeInertia(0.012, 0));
});

test("safety factor is the inverse of utilization", () => {
  assert.ok(Math.abs(safetyFactor(200, 50) - 4) < 1e-12);
  assert.ok(Math.abs(utilization(50, 200) - 0.25) < 1e-12);
});

test("finite wing slope at high AR approaches 2π", () => {
  assert.ok(finiteWingSlope(1000) < 2 * Math.PI);
  assert.ok(finiteWingSlope(1000) > 6);
});

test("cost terms stay itemized", () => {
  const c = unitCost({
    mass_kg: 0.02,
    cost_usd_per_kg: 4,
    machineRate_usd_per_hr: 75,
    cycleTime_hr: 0.15,
    setupCost_usd: 50,
    toolingCost_usd: 0,
    quantity: 10,
    labor_usd: 2,
    finishing_usd: 1,
    scrapFactor: 1.1,
  });
  assert.ok(Math.abs(c.material - 0.02 * 4 * 1.1) < 1e-9);
  assert.ok(Math.abs(c.machine - 11.25) < 1e-9);
  assert.ok(Math.abs(c.amortised - 5) < 1e-9);
  assert.ok(Math.abs(c.unit - (c.material + c.machine + c.amortised + 2 + 1)) < 1e-9);
});

test("quantity 10 recommends milling and 10000 recommends molding for nylon", () => {
  const nylon = materials.find((m) => m.id === "nylon66")!;
  const low = recommendProcess(0.02, nylon, 10, processes)!;
  const high = recommendProcess(0.02, nylon, 10000, processes)!;
  assert.equal(low.id, "cnc_3axis");
  assert.equal(high.id, "injection_mold");
});

test("same input is byte-stable", () => {
  const mission = missions.find((m) => m.id === "drone_arm")!;
  const input = designFrom(mission);
  const a = evaluate(input, materials, processes);
  const b = evaluate(input, materials, processes);
  assert.equal(a.inputHash, b.inputHash);
  assert.equal(a.maxDeflection_mm, b.maxDeflection_mm);
  assert.equal(JSON.stringify(a.failures), JSON.stringify(b.failures));
});

test("thin wall warns and an undercut fails the mill", () => {
  const mission = missions.find((m) => m.id === "drone_arm")!;
  const input = designFrom(mission);
  input.parts[0]!.params.wall_mm = 0.6;
  input.parts[0]!.params.undercut = 1;
  const ev = evaluate(input, materials, processes);
  assert.equal(ev.passDfm, false);
  assert.ok(ev.dfmChecks.some((c) => c.id === "arm/no_undercut" && !c.pass));
});

test("drone arm default nylon misses the deflection limit", () => {
  const mission = missions.find((m) => m.id === "drone_arm")!;
  const ev = evaluate(designFrom(mission), materials, processes);
  assert.equal(ev.passDeflection, false);
  const stress = runAnalysis("static_stress", designFrom(mission), materials, processes);
  assert.equal(stress.pass, false);
  assert.ok(stress.assumptions.length > 0);
});

test("aluminum arm on the same tube clears yield and sag", () => {
  const mission = missions.find((m) => m.id === "drone_arm")!;
  const input = designFrom(mission);
  input.parts[0]!.materialId = "al6061";
  input.parts[0]!.processId = "cnc_3axis";
  const ev = evaluate(input, materials, processes);
  assert.equal(ev.passStress, true);
  assert.equal(ev.passDeflection, true);
});

test("doubling a plate thickness multiplies I by eight", () => {
  const thin = rectangleInertia(0.09, 0.002);
  const thick = rectangleInertia(0.09, 0.004);
  assert.ok(Math.abs(thick / thin - 8) < 1e-9);
});

test("colormap endpoints stay distinct under luminance", () => {
  const lo = relativeLuminance(stressStops[0]!);
  const hi = relativeLuminance(stressStops[stressStops.length - 1]!);
  assert.ok(Math.abs(hi - lo) > 0.4);
  assert.notEqual(stressStops[0]!.slice(1, 3), stressStops[0]!.slice(3, 5));
});

test("ledger replay returns the last snapshot when the chain is intact", () => {
  const entries = [
    entry(1, null, { wall: 1.5 }),
    entry(2, "", { wall: 2.2 }),
  ];
  entries[1]!.parentHash = entries[0]!.hash;
  entries[1]!.hash = hashCanon({ ...entries[1], hash: "" });
  const played = replay(entries);
  assert.equal(played?.wall, 2.2);
});

test("reflection rubric can clear 70 without a numeric answer", () => {
  const scores = gradeReflection(
    "I thickened the wall. Stiffness rose, mass rose. The model assumes a tip load and linear elasticity, so the safety factor is not a flight clearance.",
    2,
    true,
  );
  const avg = scores.reduce((s, r) => s + r.score, 0) / scores.length / 2;
  assert.ok(avg >= 0.7);
  assert.ok(!scores.some((s) => /mm thick/.test(s.feedback)));
});

function entry(iteration: number, parent: string | null, snapshot: { wall: number }) {
  const base = {
    id: `e${iteration}`,
    iteration,
    phase: "review" as const,
    parentHash: parent,
    snapshot,
    action: "seal",
    hash: "",
  };
  return { ...base, hash: hashCanon({ ...base, hash: "" }) };
}

function designFrom(mission: (typeof missions)[number]): DesignInput {
  return {
    parts: mission.parts.map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      params: { ...p.params },
      materialId: p.materialId,
      processId: p.processId,
      loads: p.loads.map((l) => ({ ...l })),
      liftFed: p.liftFed,
    })),
    vehicle: mission.vehicle ? { ...mission.vehicle } : null,
    environment: mission.environment,
    quantity: mission.constraints.quantity ?? 1,
    limits: mission.constraints,
    fidelity: "L0",
    seed: 1,
  };
}
