import { useEffect, useState } from "react";
import { BenchShell, Readouts, Segmented, Slider, WellButton, fmt } from "./ui";
import {
  PROCESSES,
  nominalTotal,
  rssStack,
  screenProcesses,
  stackVerdict,
  worstCaseStack,
  type PartBrief,
  type StackPart,
} from "@/course/tolerances";

// ---------------------------------------------------------------------------
// TolStackBench — build the stack, read the verdict, defend the method.
// ---------------------------------------------------------------------------

const STACK_KEY = "ff:tolstack-w26";

const STACK_PARTS: { label: string; nominal: number }[] = [
  { label: "Bracket flange", nominal: 50 },
  { label: "Spacer", nominal: 30 },
  { label: "Cover", nominal: 20 },
];

const DEFAULT_TOLS = [0.1, 0.05, 0.1];
const DEFAULT_CAVITY = 100.2;

const STACK_RUBRIC = [
  "Every stack contributor in the direction is listed — none forgotten.",
  "Both the worst-case and the RSS totals are computed, not just one.",
  "The verdict names which method it rests on.",
  "I can say what happens if the chosen method is wrong.",
  "The dominant tolerance — the one to attack first — is identified.",
];

function loadStackState(): { tols: number[]; cavity: number } {
  try {
    const raw = localStorage.getItem(STACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { tols?: number[]; cavity?: number };
      if (
        Array.isArray(parsed.tols) &&
        parsed.tols.length === STACK_PARTS.length &&
        parsed.tols.every((t) => typeof t === "number" && t >= 0) &&
        typeof parsed.cavity === "number"
      ) {
        return { tols: parsed.tols, cavity: parsed.cavity };
      }
    }
  } catch {
    /* private browsing: fall through to defaults */
  }
  return { tols: [...DEFAULT_TOLS], cavity: DEFAULT_CAVITY };
}

const STACK_QUESTIONS = [
  {
    prompt: "Worst-case stack total (± mm)",
    answer: 0.25,
    tol: 0.005,
    hint: "Add the three tolerances absolutely.",
  },
  {
    prompt: "RSS stack total (± mm)",
    answer: 0.15,
    tol: 0.005,
    hint: "Square root of the sum of squares.",
  },
];

export function TolStackBench() {
  const [tols, setTols] = useState<number[]>(() => loadStackState().tols);
  const [cavity, setCavity] = useState<number>(() => loadStackState().cavity);
  const [answers, setAnswers] = useState<string[]>(() => STACK_QUESTIONS.map(() => ""));
  const [method, setMethod] = useState<string>("");
  const [checked, setChecked] = useState<boolean[]>(() => STACK_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(STACK_KEY, JSON.stringify({ tols, cavity }));
    } catch {
      /* the stack simply does not persist */
    }
  }, [tols, cavity]);

  const parts: StackPart[] = STACK_PARTS.map((p, i) => ({
    label: p.label,
    nominal: p.nominal,
    tol: tols[i] ?? 0,
  }));
  const nominal = nominalTotal(parts);
  const worst = worstCaseStack(parts);
  const rss = rssStack(parts);
  const worstTotal = nominal + worst;
  const rssTotal = nominal + rss;
  const limit = cavity - nominal;
  const verdict = stackVerdict(limit, worst, rss);
  const dominant = parts.reduce((a, b) => (b.tol > a.tol ? b : a), parts[0]!);

  const verdictText =
    verdict === "passes-worst-case"
      ? "Passes worst-case — ships under any legal combination."
      : verdict === "passes-rss-only"
        ? "Passes RSS only — ships on statistics; name the consequence."
        : "Fails both — redesign: tighten a tolerance or open the cavity.";

  const setTol = (i: number, value: number) =>
    setTols((prev) => prev.map((t, j) => (j === i ? value : t)));

  return (
    <BenchShell
      prompt="Set the three stack tolerances with the sliders and watch the worst-case and RSS totals move against the cavity size. || The readouts update live: nominal total, worst-case total, RSS total, and the clearance each leaves in the cavity. || Answer the three graded questions, then work the rubric."
      note="Sliders move in 0.01 mm steps and the cavity is a single hard limit; real stacks have form and position contributors too. The judgment — worst-case or RSS — is yours."
      controls={
        <>
          {STACK_PARTS.map((p, i) => (
            <Slider
              key={p.label}
              label={`${p.label} ± (mm)`}
              value={tols[i] ?? 0}
              min={0.01}
              max={0.3}
              step={0.01}
              display={`±${fmt(tols[i] ?? 0, 2)}`}
              onChange={(v) => setTol(i, v)}
            />
          ))}
          <label className="flex min-w-0 flex-col">
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-well-dim">Cavity size (mm)</span>
            </span>
            <input
              type="number"
              className="mt-1 min-h-11 rounded-lg bg-white/10 px-3 text-sm tabular-nums text-well-fg ring-1 ring-white/25"
              value={cavity}
              step={0.01}
              min={nominal}
              onChange={(e) => setCavity(Number(e.target.value))}
            />
          </label>
        </>
      }
    >
      <Readouts
        items={[
          { label: "Nominal total", value: `${fmt(nominal, 2)} mm` },
          { label: "Worst-case total", value: `${fmt(worstTotal, 2)} mm` },
          { label: "RSS total", value: `${fmt(rssTotal, 2)} mm` },
          { label: "Clearance, worst-case", value: `${fmt(cavity - worstTotal, 2)} mm` },
          { label: "Clearance, RSS", value: `${fmt(cavity - rssTotal, 2)} mm` },
          { label: "Dominant tolerance", value: dominant.label },
        ]}
      />
      <p className="mb-5 text-sm leading-relaxed text-well-dim">
        Verdict: <span className="text-well-fg">{verdictText}</span>
      </p>

      <div className="mb-5 grid gap-4">
        {STACK_QUESTIONS.map((q, i) => {
          const given = Number(answers[i]);
          const graded = answers[i]!.trim() !== "";
          const ok = graded && Math.abs(given - q.answer) <= q.tol;
          return (
            <div key={q.prompt}>
              <div className="mb-1 text-sm text-well-dim">{q.prompt}</div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step={0.01}
                  className="min-h-11 w-36 rounded-lg bg-white/10 px-3 text-sm tabular-nums text-well-fg ring-1 ring-white/25"
                  value={answers[i]}
                  onChange={(e) =>
                    setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))
                  }
                  aria-label={q.prompt}
                />
                {graded && (
                  <span className="text-sm text-well-dim">
                    {ok ? "Correct." : `Not quite — ${q.hint}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div>
          <div className="mb-1 text-sm text-well-dim">
            The cover is a safety interlock. Which method governs your verdict?
          </div>
          <div className="flex gap-2">
            {["Worst-case", "RSS"].map((option) => (
              <WellButton key={option} onClick={() => setMethod(option)}>
                <span className={method === option ? "font-semibold" : ""}>
                  {method === option ? "● " : "○ "}
                  {option}
                </span>
              </WellButton>
            ))}
          </div>
          {method !== "" && (
            <p className="mt-2 text-sm text-well-dim">
              {method === "Worst-case"
                ? "Correct — a safety function is staked on Murphy, not on statistics."
                : "RSS is the wrong stake for a safety function: its mercy is borrowed from independence and volume."}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-well-fg">Rubric — check what you did</p>
        <div className="grid gap-2">
          {STACK_RUBRIC.map((item, i) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checked[i]}
                onChange={() =>
                  setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                }
              />
              <span className="text-well-dim">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// ProcChoiceBench — screen the processes, then defend the winner in writing.
// ---------------------------------------------------------------------------

const MEMO_KEY = "ff:procchoice-w26";

interface Brief extends PartBrief {
  id: string;
  title: string;
  blurb: string;
}

const BRIEFS: Brief[] = [
  {
    id: "bracket",
    title: "Bracket — 500 units",
    blurb: "60 mm 6061 aluminum bracket, two hole positions at ±0.05 mm, one cosmetic face.",
    material: "aluminum 6061",
    volume: 500,
    tightestTolMm: 0.05,
  },
  {
    id: "housing",
    title: "Housing — 20,000 units",
    blurb: "Aluminum electronics housing, ±0.15 mm on mating features, thin walls, cosmetic exterior.",
    material: "aluminum",
    volume: 20000,
    tightestTolMm: 0.15,
  },
  {
    id: "jig",
    title: "Jig — 3 units",
    blurb: "One-off steel assembly jig, ±0.10 mm on locating faces, needed next week.",
    material: "steel",
    volume: 3,
    tightestTolMm: 0.1,
  },
];

const MEMO_RUBRIC = [
  "The memo names one winning process.",
  "Every rejected process has a named cause of death (tolerance, volume, or material).",
  "The tight tolerances are each tied to a named function.",
  "Any relaxed tolerance is named with its reason.",
  "The memo states the winner's price honestly — what you pay for it.",
];

function loadMemo(): { briefId: string; processId: string; memo: string } {
  try {
    const raw = localStorage.getItem(MEMO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { briefId?: string; processId?: string; memo?: string };
      if (
        typeof parsed.briefId === "string" &&
        BRIEFS.some((b) => b.id === parsed.briefId) &&
        typeof parsed.processId === "string" &&
        PROCESSES.some((p) => p.id === parsed.processId)
      ) {
        return {
          briefId: parsed.briefId,
          processId: parsed.processId,
          memo: typeof parsed.memo === "string" ? parsed.memo : "",
        };
      }
    }
  } catch {
    /* private browsing: fall through to defaults */
  }
  return { briefId: BRIEFS[0]!.id, processId: "cnc-mill", memo: "" };
}

export function ProcChoiceBench() {
  const [briefId, setBriefId] = useState<string>(() => loadMemo().briefId);
  const [processId, setProcessId] = useState<string>(() => loadMemo().processId);
  const [memo, setMemo] = useState<string>(() => loadMemo().memo);
  const [checked, setChecked] = useState<boolean[]>(() => MEMO_RUBRIC.map(() => false));

  useEffect(() => {
    try {
      localStorage.setItem(MEMO_KEY, JSON.stringify({ briefId, processId, memo }));
    } catch {
      /* the memo simply does not persist */
    }
  }, [briefId, processId, memo]);

  const brief = BRIEFS.find((b) => b.id === briefId) ?? BRIEFS[0]!;
  const screenings = screenProcesses(brief);
  const picked = screenings.find((s) => s.process.id === processId) ?? screenings[0]!;
  const viableCount = screenings.filter((s) => s.viable).length;
  const words = memo.trim().split(/\s+/).filter(Boolean).length;

  return (
    <BenchShell
      prompt="Pick a brief, then a process — the screening table judges your pick against tolerance, volume, and material screens. || Read every reject's cause of death; the screens narrow the field, but geometry judgment stays yours. || Write the choice memo: winner, rejects, functional vs relaxed tolerances."
      note="Capability numbers are classroom-grade typical values; real shops quote their own. The bench checks completeness of your memo, not wisdom — and the screens do not model geometry (a bracket is not round), so say why the viable-but-wrong processes lose."
      controls={
        <>
          <Segmented
            label="Part brief"
            value={briefId}
            onChange={setBriefId}
            options={BRIEFS.map((b) => ({ value: b.id, label: b.title }))}
          />
          <div className="sm:col-span-2">
            <div className="mb-2 text-sm text-well-dim">Process pick</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Process pick">
              {PROCESSES.map((p) => {
                const on = p.id === processId;
                const viable = screenings.find((s) => s.process.id === p.id)?.viable;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setProcessId(p.id)}
                    className={`min-h-11 rounded-lg px-3 py-2 text-left text-sm transition-transform duration-150 ease-out active:scale-[0.96] ${
                      on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25"
                    }`}
                  >
                    {p.name}
                    <span className="block text-xs opacity-70">
                      ±{p.typicalTolMm} mm · {viable ? "clears screens" : "screened out"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-well-dim">{brief.blurb}</p>
      <Readouts
        items={[
          { label: "Tightest tolerance", value: `±${brief.tightestTolMm} mm` },
          { label: "Volume", value: `${brief.volume.toLocaleString()} units` },
          { label: "Processes clearing screens", value: `${viableCount} of ${PROCESSES.length}` },
        ]}
      />

      <div className="mb-5 rounded-lg bg-white/5 p-4">
        <p className="text-sm font-medium text-well-fg">
          {picked.process.name} —{" "}
          {picked.viable ? "clears all three screens" : "does NOT clear the screens"}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-well-dim">
          {picked.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-well-dim">{picked.process.note}</p>
      </div>

      <div className="mb-5">
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor="procchoice-memo" className="text-sm text-well-dim">
            Choice memo
          </label>
          <span className="text-sm tabular-nums text-well-dim">{words} words</span>
        </div>
        <textarea
          id="procchoice-memo"
          className="min-h-36 w-full rounded-lg bg-white/10 p-3 text-sm leading-relaxed text-well-fg ring-1 ring-white/25"
          placeholder="Winner and why. Rejects with causes of death. Which tolerances are functional, which were relaxed, and what the winner costs."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-well-fg">Rubric — check what the memo does</p>
        <div className="grid gap-2">
          {MEMO_RUBRIC.map((item, i) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={checked[i]}
                onChange={() =>
                  setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                }
              />
              <span className="text-well-dim">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </BenchShell>
  );
}
