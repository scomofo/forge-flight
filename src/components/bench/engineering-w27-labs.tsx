import { useEffect, useMemo, useState } from "react";
import { BenchShell, Readouts, Segmented, Slider, WellButton, fmt } from "./ui";
import {
  confidenceInterval95,
  factorialRuns,
  grubbsCritical,
  grubbsScore,
  gravityFromSlope,
  linearFit,
  mainEffect,
  planSummary,
  randomizedOrder,
  mean,
} from "@/course/experiments";

// ---------------------------------------------------------------------------
// DoeBench — lay out a factorial plan and say what each choice defends.
// ---------------------------------------------------------------------------

type Scenario = {
  id: string;
  name: string;
  factors: string[];
  levels: string[][];
  nuisance: string;
  hypothesis: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "lapjoint",
    name: "Lap-joint shear",
    factors: ["Glue", "Cure time"],
    levels: [
      ["Standard epoxy", "Toughened epoxy"],
      ["2 h", "24 h"],
    ],
    nuisance: "The two test rigs drift against each other",
    hypothesis: "Toughened epoxy with a 24 h cure raises shear strength by ≥ 1.5 MPa over standard/2 h.",
  },
  {
    id: "thrust",
    name: "Thrust rig",
    factors: ["Propellant temp", "Nozzle throat", "Igniter"],
    levels: [
      ["−20 °C", "+40 °C"],
      ["Standard", "Enlarged"],
      ["Type X", "Type Y"],
    ],
    nuisance: "Morning vs afternoon ambient drift",
    hypothesis: "Propellant temperature has a main effect on thrust ≥ 0.3 kN; igniter type does not.",
  },
  {
    id: "bracket",
    name: "Bracket stiffness",
    factors: ["Thickness", "Width"],
    levels: [
      ["2 mm", "4 mm"],
      ["20 mm", "40 mm"],
    ],
    nuisance: "Sheet stock varies coil to coil",
    hypothesis: "Doubling thickness raises stiffness ≥ 6× (cubic law), width only linearly.",
  },
];

const DOE_RUBRIC = [
  "The plan names every factor with two concrete levels.",
  "Full vs half fraction is a stated choice with a reason.",
  "The nuisance variable is blocked, not wished away.",
  "Center-point replicates exist and their purpose is stated.",
  "The hypothesis names numbers the data could falsify.",
];

export function DoeBench() {
  const [scenarioId, setScenarioId] = useState("lapjoint");
  const [fraction, setFraction] = useState<"full" | "half">("full");
  const [centers, setCenters] = useState(2);
  const [seed, setSeed] = useState(7);
  const [checked, setChecked] = useState<boolean[]>(() => DOE_RUBRIC.map(() => false));
  const [answers, setAnswers] = useState({ runs: "", randomize: "", centers: "" });
  const [graded, setGraded] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const k = scenario.factors.length;
  const effFraction = fraction === "half" && k < 3 ? "full" : fraction;

  const plan = useMemo(
    () =>
      planSummary({
        factors: scenario.factors,
        levels: scenario.levels,
        fraction: effFraction,
        centerReplicates: centers,
        blockOn: scenario.nuisance,
      }),
    [scenario, effFraction, centers],
  );

  const cornerLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < plan.cornerRuns; i += 1) {
      const bits = scenario.factors.map((_, f) => ((i >> f) & 1 ? "+" : "−"));
      labels.push(bits.join(" "));
    }
    return labels;
  }, [plan.cornerRuns, scenario]);

  const order = useMemo(
    () => randomizedOrder(cornerLabels, seed),
    [cornerLabels, seed],
  );

  const correctRuns = plan.cornerRuns;
  const grade = () => {
    const runsOk = Number(answers.runs) === correctRuns;
    const randOk = answers.randomize === "lurking";
    const centersOk = answers.centers === "curvature";
    return { runsOk, randOk, centersOk, all: runsOk && randOk && centersOk };
  };

  return (
    <BenchShell
      prompt="Pick a test scenario and lay out its factorial plan: fraction, center points, blocks, randomized order. || The plan summary shows what the design can estimate and what each defense is for. || Answer the three graded questions, then write down the falsifiable hypothesis."
      note="Half fractions are refused for two-factor plans — with only two factors there is nothing safe to alias away. Real blocking also needs the block sizes to match the run counts."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Plan rubric — check what the evidence earns</div>
          <ul className="grid gap-2">
            {DOE_RUBRIC.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked[i]}
                    onChange={() =>
                      setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))
                    }
                  />
                  <span className={checked[i] ? "text-well-dim line-through" : ""}>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <Segmented
        label="Test scenario"
        value={scenarioId}
        onChange={setScenarioId}
        options={SCENARIOS.map((s) => ({ value: s.id, label: s.name }))}
      />
      <Segmented
        label="Fraction"
        value={fraction}
        onChange={setFraction}
        options={[
          { value: "full", label: "Full 2^k — every corner" },
          { value: "half", label: "Half fraction — k ≥ 3 only" },
        ]}
      />
      <div className="sm:col-span-2">
        <Slider
          label="Center-point replicates"
          value={centers}
          min={0}
          max={4}
          step={1}
          display={String(centers)}
          onChange={setCenters}
        />
      </div>

      <Readouts
        items={[
          { label: "Corner runs", value: String(plan.cornerRuns) },
          { label: "Total runs", value: String(plan.totalRuns) },
          { label: "Fraction used", value: effFraction === "full" ? "Full" : "Half" },
          { label: "Blocked on", value: scenario.nuisance.split(" ").slice(0, 3).join(" ") + "…" },
        ]}
      />

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-well-dim">Randomized run order (seed {seed})</p>
          <WellButton onClick={() => setSeed((s) => s + 1)}>Re-seed</WellButton>
        </div>
        <ol className="grid gap-1 sm:grid-cols-2">
          {order.map((cornerIdx, slot) => (
            <li key={slot} className="rounded bg-white/5 px-3 py-2 text-sm tabular-nums">
              <span className="text-well-dim">{slot + 1}.</span> {cornerLabels[cornerIdx]}
            </li>
          ))}
          {Array.from({ length: centers }, (_, i) => (
            <li key={`c${i}`} className="rounded bg-white/5 px-3 py-2 text-sm text-accent">
              C{i + 1}. Center point (all factors mid)
            </li>
          ))}
        </ol>
        <p className="mt-2 text-sm text-well-dim">
          Hypothesis under test: {scenario.hypothesis}
        </p>
      </div>

      <div className="mb-5 grid gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-well-dim">Corner runs in this plan</span>
          <input
            className="w-32 rounded bg-white/10 px-3 py-2 tabular-nums"
            inputMode="numeric"
            value={answers.runs}
            onChange={(e) => setAnswers({ ...answers, runs: e.target.value })}
            aria-label="Corner runs in this plan"
          />
        </label>
        <Segmented
          label="Randomization defends against…"
          value={answers.randomize}
          onChange={(v) => setAnswers({ ...answers, randomize: v })}
          options={[
            { value: "lurking", label: "Lurking variables — hidden drift lining up with a factor" },
            { value: "count", label: "Too many runs — it cuts the run count" },
          ]}
        />
        <Segmented
          label="Center points detect…"
          value={answers.centers}
          onChange={(v) => setAnswers({ ...answers, centers: v })}
          options={[
            { value: "curvature", label: "Curvature — the response bending off the flat model" },
            { value: "noise", label: "Noise — they replace replication" },
          ]}
        />
        <div>
          <WellButton onClick={() => setGraded(true)}>Grade my answers</WellButton>
        </div>
        {graded && (
          <div className="text-sm">
            {(() => {
              const g = grade();
              return (
                <ul className="grid gap-1">
                  <li className={g.runsOk ? "text-accent" : "text-red-300"}>
                    {g.runsOk ? "✓" : "✗"} Corner runs: {correctRuns} — {factorialRuns(k, effFraction)} from 2^{k}
                    {effFraction === "half" ? "/2" : ""}.
                  </li>
                  <li className={g.randOk ? "text-accent" : "text-red-300"}>
                    {g.randOk ? "✓" : "✗"} Randomization breaks alignment with lurking drift; it never cuts runs.
                  </li>
                  <li className={g.centersOk ? "text-accent" : "text-red-300"}>
                    {g.centersOk ? "✓" : "✗"} Center points test the flat model — off the plane means curvature.
                  </li>
                </ul>
              );
            })()}
          </div>
        )}
      </div>

    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// LabReportBench — the evidence task: statistics, suspect point, honest graph,
// written conclusion with the interval attached.
// ---------------------------------------------------------------------------

const RIG_DATA = [19.4, 19.8, 19.5, 19.9, 20.4, 19.7];
const SUSPECT = 20.4;
const REPORT_KEY = "ff:labreport-w27";

const REPORT_RUBRIC = [
  "Mean, sample std (n − 1), and 95% half-width computed and stated.",
  "The suspect point was scored with Grubbs and kept or investigated — with the decision written down.",
  "The graph's axes and error bars state what they show.",
  "The conclusion reads “value ± interval (95% CI, n = k)” — a margin table can consume it.",
  "Every assumption (rig calibration, steady conditions) sits in the ledger.",
];

const PEND_L = [0.25, 0.5, 0.75, 1.0];
const PEND_T2 = [1.01, 2.02, 3.03, 4.06];

function loadReport(): { conclusion: string; checked: boolean[] } {
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { conclusion?: string; checked?: boolean[] };
      if (typeof parsed.conclusion === "string" && Array.isArray(parsed.checked)) {
        return { conclusion: parsed.conclusion, checked: parsed.checked };
      }
    }
  } catch {
    /* private browsing: fall through */
  }
  return { conclusion: "", checked: REPORT_RUBRIC.map(() => false) };
}

export function LabReportBench() {
  const stats = useMemo(() => confidenceInterval95(RIG_DATA), []);
  const suspectScore = grubbsScore(RIG_DATA, SUSPECT);
  const crit = grubbsCritical(RIG_DATA.length);
  const fit = useMemo(() => linearFit(PEND_L, PEND_T2), []);
  const g = gravityFromSlope(fit.slope);

  const [entries, setEntries] = useState({ mean: "", std: "", half: "" });
  const [graded, setGraded] = useState(false);
  const [suspectCall, setSuspectCall] = useState<"keep" | "investigate" | "">("");
  const [honestAxis, setHonestAxis] = useState(true);
  const [conclusion, setConclusion] = useState(() => loadReport().conclusion);
  const [checked, setChecked] = useState<boolean[]>(() => loadReport().checked);

  useEffect(() => {
    try {
      localStorage.setItem(REPORT_KEY, JSON.stringify({ conclusion, checked }));
    } catch {
      /* the report simply does not persist */
    }
  }, [conclusion, checked]);

  const meanOk = Math.abs(Number(entries.mean) - stats.mean) <= 0.03;
  const stdOk = Math.abs(Number(entries.std) - stats.std) <= 0.03;
  const halfOk = Math.abs(Number(entries.half) - stats.halfWidth) <= 0.06;
  // Deliberately strict on method: population std (n denominator) must fail.
  const popStd = Math.sqrt(
    RIG_DATA.reduce((a, x) => a + (x - mean(RIG_DATA)) ** 2, 0) / RIG_DATA.length,
  );
  const usedPopulationStd =
    entries.std !== "" && Math.abs(Number(entries.std) - popStd) <= 0.03 && !stdOk;

  const yMin = honestAxis ? 0 : 19.0;
  const yMax = 20.8;
  const W = 560;
  const H = 180;
  const px = (i: number) => 40 + (i / (RIG_DATA.length - 1)) * (W - 80);
  const py = (v: number) => H - 20 - ((v - yMin) / (yMax - yMin)) * (H - 50);

  return (
    <BenchShell
      prompt="Compute the rig statistics and enter mean, sample std, and 95% half-width — graded against the machine. || Score the suspect point with Grubbs, read the honest-vs-truncated strip plot, and check the pendulum fit. || Write the conclusion a margin table can consume: value ± interval, n, and the suspect-point decision."
      note="The pendulum fit is the lesson's worked case — slope, intercept, and g should match the text, which is the point: the bench checks that you can reproduce the paper trail."
      controls={
        <div className="sm:col-span-2">
          <div className="mb-2 text-sm text-well-dim">Report rubric — check what the evidence earns</div>
          <ul className="grid gap-2">
            {REPORT_RUBRIC.map((item, i) => (
              <li key={item}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked[i] ?? false}
                    onChange={() =>
                      setChecked((prev) => prev.map((v, j) => (j === i ? !v : v)))
                    }
                  />
                  <span className={checked[i] ? "text-well-dim line-through" : ""}>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Rig readings (kN)", value: RIG_DATA.join(", ") },
          { label: "Suspect point", value: `${SUSPECT} kN` },
          { label: "n", value: String(RIG_DATA.length) },
        ]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-well-dim">Mean (kN)</span>
          <input
            className="rounded bg-white/10 px-3 py-2 tabular-nums"
            inputMode="decimal"
            value={entries.mean}
            onChange={(e) => setEntries({ ...entries, mean: e.target.value })}
            aria-label="Mean in kN"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-well-dim">Sample std, n − 1 (kN)</span>
          <input
            className="rounded bg-white/10 px-3 py-2 tabular-nums"
            inputMode="decimal"
            value={entries.std}
            onChange={(e) => setEntries({ ...entries, std: e.target.value })}
            aria-label="Sample standard deviation in kN"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-well-dim">95% half-width (kN)</span>
          <input
            className="rounded bg-white/10 px-3 py-2 tabular-nums"
            inputMode="decimal"
            value={entries.half}
            onChange={(e) => setEntries({ ...entries, half: e.target.value })}
            aria-label="95 percent half-width in kN"
          />
        </label>
      </div>
      <div className="mb-5">
        <WellButton onClick={() => setGraded(true)}>Grade the statistics</WellButton>
        {graded && (
          <ul className="mt-2 grid gap-1 text-sm">
            <li className={meanOk ? "text-accent" : "text-red-300"}>
              {meanOk ? "✓" : "✗"} Mean {fmt(stats.mean, 2)} kN.
            </li>
            <li className={stdOk ? "text-accent" : "text-red-300"}>
              {stdOk ? "✓" : "✗"} Sample std {fmt(stats.std, 2)} kN
              {usedPopulationStd
                ? " — that is the population std (÷ n). The sample std divides by n − 1; one degree of freedom went to the mean."
                : "."}
            </li>
            <li className={halfOk ? "text-accent" : "text-red-300"}>
              {halfOk ? "✓" : "✗"} Half-width {fmt(stats.halfWidth, 2)} kN (t = {fmt(stats.t, 3)}, df = {stats.df}).
            </li>
          </ul>
        )}
      </div>

      <div className="mb-5 rounded bg-white/5 p-4">
        <p className="mb-2 text-sm font-medium text-well-fg">Suspect-point hearing</p>
        <Readouts
          items={[
            { label: "Grubbs score", value: fmt(suspectScore, 2) },
            { label: "Critical (n = 6)", value: crit === null ? "—" : fmt(crit, 3) },
            { label: "Verdict", value: crit !== null && suspectScore < crit ? "Not excludable" : "Investigate" },
          ]}
        />
        <Segmented
          label="Your call on the 20.4 kN point"
          value={suspectCall}
          onChange={setSuspectCall}
          options={[
            { value: "keep", label: "Keep — score below critical, decision noted" },
            { value: "investigate", label: "Investigate — find the cause before touching the data" },
          ]}
        />
        {suspectCall !== "" && (
          <p className="mt-2 text-sm text-well-dim">
            G = {fmt(suspectScore, 2)} against a critical {crit === null ? "—" : fmt(crit, 2)}: the point
            stays in the dataset either way, and the score goes in the notebook. Deleting it silently would
            narrow the interval to a lie.
          </p>
        )}
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-well-fg">The strip plot makes an argument</p>
          <WellButton onClick={() => setHonestAxis((v) => !v)}>
            {honestAxis ? "Truncate the axis" : "Restore honest axis"}
          </WellButton>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded bg-white/5" role="img" aria-label="Strip plot of rig readings">
          {[0, 1, 2, 3, 4].map((i) => {
            const v = yMin + ((yMax - yMin) / 4) * i;
            return (
              <g key={i}>
                <line x1={40} x2={W - 40} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.12)" />
                <text x={34} y={py(v) + 4} textAnchor="end" fontSize={11} fill="rgba(255,255,255,0.5)">
                  {fmt(v, 1)}
                </text>
              </g>
            );
          })}
          <rect x={40} y={py(stats.hi)} width={W - 80} height={py(stats.lo) - py(stats.hi)} fill="rgba(120,200,255,0.15)" />
          <line x1={40} x2={W - 40} y1={py(stats.mean)} y2={py(stats.mean)} stroke="rgba(120,200,255,0.9)" strokeWidth={2} />
          {RIG_DATA.map((v, i) => (
            <circle key={i} cx={px(i)} cy={py(v)} r={6} fill={v === SUSPECT ? "#f0a35e" : "#e8e4da"} />
          ))}
          <text x={W - 44} y={py(stats.hi) - 6} textAnchor="end" fontSize={11} fill="rgba(120,200,255,0.8)">
            95% CI
          </text>
        </svg>
        <p className="mt-2 text-sm text-well-dim">
          {honestAxis
            ? "Axis from zero: the spread is honest — six readings clustered inside half a kilonewton on a 20 kN scale. This is the argument the data actually make."
            : "Axis truncated at 19: the same six points now look wildly scattered. Nothing changed but the rhetoric — this is the graph that lies while plotting true numbers."}
        </p>
      </div>

      <div className="mb-5 rounded bg-white/5 p-4">
        <p className="mb-2 text-sm font-medium text-well-fg">Pendulum fit — reproduce the paper trail</p>
        <Readouts
          items={[
            { label: "Slope", value: `${fmt(fit.slope, 2)} s²/m` },
            { label: "Intercept", value: `${fmt(fit.intercept, 2)} s²` },
            { label: "g = 4π²/slope", value: `${fmt(g, 2)} m/s²` },
            { label: "Residuals", value: fit.residuals.every((r) => Math.abs(r) < 0.01) ? "Static — no pattern" : "Patterned — model suspect" },
          ]}
        />
        <p className="text-sm text-well-dim">
          Main effect check (from the plan): glue {fmt(mainEffect(10.8, 8.2), 2)} MPa per coded level —
          the factorial arithmetic from lesson 1, reproduced here.
        </p>
      </div>

      <div className="mb-5">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-well-fg">Conclusion — write it so a margin table can consume it</span>
          <textarea
            className="min-h-28 rounded bg-white/10 px-3 py-2"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Thrust = 19.78 ± 0.37 kN (95% CI, n = 6). The 20.4 kN point scored G = 1.74 against 1.89 — kept, decision noted. …"
            aria-label="Lab report conclusion"
          />
        </label>
        <p className="mt-1 text-sm text-well-dim">{conclusion.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>
    </BenchShell>
  );
}
