import { useEffect, useState } from "react";
import { BenchShell, Readouts, Segmented, WellButton } from "./ui";
import {
  buildMarginTable,
  fmeaRanking,
  lowestMargin,
  riskPriority,
  tableVerdict,
  type FmeaRow,
  type MarginRow,
} from "@/course/loads";

// ---------------------------------------------------------------------------
// LoadPathBench — trace the load, then build the margin table.
// ---------------------------------------------------------------------------

const PATH_KEY = "ff:loadpath-w23";

const PATH_STAGES = [
  "Tow rope carries the 2 kN tow load",
  "Release hook transfers the load into the lug pin",
  "Lug carries 2 kN through the pin hole",
  "Two bracket bolts carry 1 kN of shear each",
  "Fuselage frame distributes the load to the longerons",
];

const DEFAULT_MARGIN_ROWS: MarginRow[] = [
  { label: "Limit tension (MPa)", applied: 120, allowable: 167 },
  { label: "Limit bending (MPa)", applied: 90, allowable: 167 },
  { label: "Ultimate tension (MPa)", applied: 180, allowable: 310 },
  { label: "Bearing at pin hole (MPa)", applied: 140, allowable: 220 },
];

const PATH_RUBRIC = [
  "The five load-path stages run unbroken from load entry to ground.",
  "Every margin-table row has an applied and an allowable value.",
  "Every row shows MS ≥ 0 — no negative margins anywhere.",
  "The governing (thinnest-margin) row is a load case I understand best.",
  "Limit and ultimate cases stay in separate rows with their own allowables.",
];

function loadPathState(): { order: number[]; rows: MarginRow[] } {
  try {
    const raw = localStorage.getItem(PATH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { order?: number[]; rows?: MarginRow[] };
      if (
        Array.isArray(parsed.order) &&
        parsed.order.length === PATH_STAGES.length &&
        Array.isArray(parsed.rows) &&
        parsed.rows.length > 0
      ) {
        return { order: parsed.order, rows: parsed.rows };
      }
    }
  } catch {
    /* private browsing: fall through to defaults */
  }
  return {
    order: PATH_STAGES.map((_, i) => i),
    rows: DEFAULT_MARGIN_ROWS.map((r) => ({ ...r })),
  };
}

function shuffle<T>(xs: T[]): T[] {
  const copy = [...xs];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export function LoadPathBench() {
  const [order, setOrder] = useState<number[]>(() => {
    const saved = loadPathState();
    // start scrambled on first visit, saved order afterwards
    try {
      return localStorage.getItem(PATH_KEY) ? saved.order : shuffle(saved.order);
    } catch {
      return saved.order;
    }
  });
  const [rows, setRows] = useState<MarginRow[]>(() => loadPathState().rows);
  const [checked, setChecked] = useState<boolean[]>(() => PATH_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(PATH_KEY, JSON.stringify({ order, rows }));
    } catch {
      /* the sketch simply does not persist */
    }
  }, [order, rows]);

  const correctPositions = order.filter((stage, slot) => stage === slot).length;
  const results = buildMarginTable(rows);
  const overall = tableVerdict(results);
  const governing = lowestMargin(results);

  const move = (slot: number, dir: -1 | 1) => {
    const other = slot + dir;
    if (other < 0 || other >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[slot], next[other]] = [next[other] as number, next[slot] as number];
      return next;
    });
  };

  const updateRow = (i: number, patch: Partial<MarginRow>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((prev) => [...prev, { label: "New load case", applied: 0, allowable: 0 }]);

  const removeRow = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));

  const overallLabel =
    overall === "passes" ? "All rows pass" : overall === "thin" ? "Thin margin present" : "FAIL — redesign";

  return (
    <BenchShell
      prompt="Order the five load-path stages from load entry to ground — use the move buttons until every stage sits in its true position. || Fill the four-line margin table with applied and allowable values; the bench computes FoS, MS, and the verdict per row. || Name the governing line, persist the table, and grade it against the 5-item rubric."
      note="The bench grades your arithmetic — FoS, margin, verdicts — and your path ordering. It cannot check that your applied loads are honest; that check belongs to the reviewer and, eventually, the test rig."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Rubric — check what the evidence earns</div>
          <div className="flex flex-col gap-2">
            {PATH_RUBRIC.map((item, i) => (
              <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                <input
                  type="checkbox"
                  checked={checked[i] ?? false}
                  onChange={() => setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Path order", value: `${correctPositions} / ${PATH_STAGES.length}` },
          { label: "Table verdict", value: overallLabel },
          {
            label: "Governing line",
            value: governing ? `${governing.label} · MS ${governing.ms.toFixed(2)}` : "—",
          },
        ]}
      />
      <div className="mb-2 text-sm font-medium text-well-fg">Load path — tow-hook lug</div>
      <ol className="mb-6 flex flex-col gap-2">
        {order.map((stage, slot) => (
          <li
            key={stage}
            className={`flex items-center gap-3 rounded-lg p-3 ring-1 ${
              stage === slot ? "bg-emerald-400/10 ring-emerald-300/30" : "bg-white/5 ring-white/15"
            }`}
          >
            <span className="w-8 shrink-0 text-sm font-semibold text-well-dim">{slot + 1}</span>
            <span className="flex-1 text-sm text-well-fg">{PATH_STAGES[stage]}</span>
            <span className="text-xs text-well-dim">{stage === slot ? "✓" : ""}</span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Move stage earlier"
                onClick={() => move(slot, -1)}
                disabled={slot === 0}
                className="rounded bg-white/10 px-2 py-1 text-sm text-well-fg disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move stage later"
                onClick={() => move(slot, 1)}
                disabled={slot === order.length - 1}
                className="rounded bg-white/10 px-2 py-1 text-sm text-well-fg disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-well-fg">Margin table</div>
        <WellButton onClick={addRow}>Add load case</WellButton>
      </div>
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const r = results[i];
          if (!r) return null;
          const tone =
            r.verdict === "passes"
              ? "bg-emerald-400/20 text-emerald-200"
              : r.verdict === "thin"
                ? "bg-amber-400/20 text-amber-200"
                : "bg-red-400/20 text-red-200";
          return (
            <div key={i} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
              <div className="mb-2 flex items-center gap-2">
                <input
                  value={row.label}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  className="flex-1 rounded bg-white/10 px-2 py-1 text-sm text-well-fg ring-1 ring-white/20"
                />
                <span className={`rounded-full px-2 py-0.5 text-xs ${tone}`}>
                  {r.verdict === "passes" ? "Pass" : r.verdict === "thin" ? "Thin" : "Fail"}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="rounded bg-white/10 px-2 py-1 text-xs text-well-dim"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="text-xs text-well-dim">
                  Applied
                  <input
                    type="number"
                    value={row.applied}
                    onChange={(e) => updateRow(i, { applied: Number(e.target.value) })}
                    className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-sm text-well-fg ring-1 ring-white/20"
                  />
                </label>
                <label className="text-xs text-well-dim">
                  Allowable
                  <input
                    type="number"
                    value={row.allowable}
                    onChange={(e) => updateRow(i, { allowable: Number(e.target.value) })}
                    className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-sm text-well-fg ring-1 ring-white/20"
                  />
                </label>
                <div className="text-xs text-well-dim">
                  FoS
                  <div className="mt-1 rounded bg-white/5 px-2 py-1 text-sm text-well-fg">
                    {Number.isFinite(r.fos) ? r.fos.toFixed(2) : "—"}
                  </div>
                </div>
                <div className="text-xs text-well-dim">
                  MS
                  <div className="mt-1 rounded bg-white/5 px-2 py-1 text-sm text-well-fg">
                    {Number.isFinite(r.ms) ? r.ms.toFixed(2) : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// FmeaBench — failure modes, S/O/D scoring, mitigations, RPN deltas.
// ---------------------------------------------------------------------------

const FMEA_KEY = "ff:fmea-w23";

const SUBSYSTEMS = ["Tow release", "Wing strut bolt", "Battery pack"] as const;
type Subsystem = (typeof SUBSYSTEMS)[number];

const SAMPLE_ROW: FmeaRow = {
  mode: "Fails to release under load",
  effect: "Glider cannot separate from the tow plane",
  cause: "Return-spring corrosion after a wet season",
  severity: 9,
  occurrence: 3,
  detection: 5,
  mitigation: "Redundant release spring plus a documented spring-replacement interval",
  occurrenceAfter: 1,
  detectionAfter: 2,
};

const FMEA_RUBRIC = [
  "At least three failure-mode rows are complete (mode, effect, cause).",
  "The highest-RPN row has a mitigation that lowers occurrence or detection.",
  "Severity scores reflect the effect honestly — no sandbagging the scary ones.",
  "At least one mitigation improves detection (test, inspection, sensor).",
  "Any row left unmitigated is named as an accepted risk, in writing.",
];

function clampScale(v: number): number {
  if (!Number.isFinite(v)) return 1;
  return Math.min(10, Math.max(1, Math.round(v)));
}

function loadFmea(): { subsystem: Subsystem; rows: FmeaRow[] } {
  try {
    const raw = localStorage.getItem(FMEA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { subsystem?: Subsystem; rows?: FmeaRow[] };
      if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        const subsystem = SUBSYSTEMS.includes(parsed.subsystem as Subsystem)
          ? (parsed.subsystem as Subsystem)
          : SUBSYSTEMS[0];
        return { subsystem, rows: parsed.rows };
      }
    }
  } catch {
    /* private browsing: fall through to the sample */
  }
  return { subsystem: SUBSYSTEMS[0], rows: [{ ...SAMPLE_ROW }] };
}

export function FmeaBench() {
  const [subsystem, setSubsystem] = useState<Subsystem>(() => loadFmea().subsystem);
  const [rows, setRows] = useState<FmeaRow[]>(() => loadFmea().rows);
  const [checked, setChecked] = useState<boolean[]>(() => FMEA_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(FMEA_KEY, JSON.stringify({ subsystem, rows }));
    } catch {
      /* the FMEA simply does not persist */
    }
  }, [subsystem, rows]);

  const ranking = fmeaRanking(rows);
  const worst = ranking[0];
  const totalDelta = ranking.reduce((sum, r) => sum + r.score.delta, 0);

  const update = (i: number, patch: Partial<FmeaRow>) =>
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const add = () =>
    setRows((prev) => [
      ...prev,
      {
        mode: "",
        effect: "",
        cause: "",
        severity: 5,
        occurrence: 5,
        detection: 5,
        mitigation: "",
        occurrenceAfter: 5,
        detectionAfter: 5,
      },
    ]);

  const remove = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i));

  return (
    <BenchShell
      prompt="Pick a subsystem and complete its failure-mode rows: mode, effect, cause, then S/O/D scores 1–10. || For each row write a mitigation and re-score occurrence and detection — the bench shows the RPN before, after, and the delta. || Rank by RPN, attack the top row, persist the FMEA, and grade it against the rubric."
      note="The bench multiplies your scores and ranks your rows. It cannot tell you whether your severity 9 should have been a 10 — calibration of the scores is judgment, and it stays yours."
      controls={
        <>
          <Segmented<Subsystem>
            label="Subsystem under analysis"
            value={subsystem}
            onChange={setSubsystem}
            options={SUBSYSTEMS.map((s) => ({ value: s, label: s }))}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Rubric — check what the FMEA earns</div>
            <div className="flex flex-col gap-2">
              {FMEA_RUBRIC.map((item, i) => (
                <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-well-fg">
                  <input
                    type="checkbox"
                    checked={checked[i] ?? false}
                    onChange={() => setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-white"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Failure modes", value: `${rows.length}` },
          {
            label: "Highest RPN",
            value: worst ? `${worst.score.before} (${worst.row.mode || "unnamed"})` : "—",
          },
          { label: "Total RPN retired", value: `${totalDelta}` },
        ]}
      />
      <div className="flex flex-col gap-4">
        {rows.map((row, i) => {
          const before = riskPriority(row.severity, row.occurrence, row.detection);
          const after = riskPriority(row.severity, row.occurrenceAfter, row.detectionAfter);
          return (
            <div key={i} className="rounded-lg bg-white/5 p-3 ring-1 ring-white/15">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-well-fg">Mode {i + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-well-fg">
                    RPN {before} → {after}
                    {after < before ? ` (−${before - after})` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded bg-white/10 px-2 py-1 text-xs text-well-dim"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(
                  [
                    ["mode", "Failure mode — how it fails"],
                    ["effect", "Effect — what happens"],
                    ["cause", "Cause — why it happens"],
                    ["mitigation", "Mitigation — what changes"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="text-xs text-well-dim">
                    {label}
                    <input
                      value={row[field]}
                      onChange={(e) => update(i, { [field]: e.target.value } as Partial<FmeaRow>)}
                      className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-sm text-well-fg ring-1 ring-white/20"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {(
                  [
                    ["severity", "Severity"],
                    ["occurrence", "Occurrence"],
                    ["detection", "Detection"],
                    ["occurrenceAfter", "Occur. after"],
                    ["detectionAfter", "Detect. after"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="text-xs text-well-dim">
                    {label}
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={row[field]}
                      onChange={(e) => update(i, { [field]: clampScale(Number(e.target.value)) } as Partial<FmeaRow>)}
                      className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-sm text-well-fg ring-1 ring-white/20"
                    />
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <WellButton onClick={add}>Add failure mode</WellButton>
      </div>
    </BenchShell>
  );
}
