import { useEffect, useState } from "react";
import { BenchShell, fmt, Readouts, WellButton } from "./ui";
import {
  CAP_MASTERY_BANK,
  CAP_MAX_TOTAL,
  CAP_MASTERY_GATE_PCT,
  CAP_MISMATCH,
  CAP_REFERENCE,
  CAP_SECTIONS,
  MISMATCH_SUSPECTS,
  capChain,
  capCorrectionsRequired,
  capMasteryPass,
  capMasteryPct,
  capPct,
  capTotal,
  capstoneGate,
  type CapMasteryItem,
  type CapScores,
  type CapSection,
} from "@/course/capstone";

const inputCls =
  "mt-1 w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-well-fg ring-1 ring-white/25 placeholder:text-well-dim/60";

// ---------------------------------------------------------------------------
// CapPackageBench — the capstone design package: requirement, model, test,
// mismatch, justified revision. Each section self-scored 0–2; the gate demands
// every section present and a 70% total. Simulation alone cannot pass.
// ---------------------------------------------------------------------------

const PACKAGE_STORE = "ff:cappackage-w30";

type PackageState = {
  text: Record<CapSection, string>;
  scores: CapScores;
};

function loadPackage(): PackageState {
  const empty: PackageState = {
    text: { requirement: "", model: "", test: "", mismatch: "", revision: "" },
    scores: { requirement: 0, model: 0, test: 0, mismatch: 0, revision: 0 },
  };
  try {
    const raw = localStorage.getItem(PACKAGE_STORE);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PackageState>;
    return {
      text: { ...empty.text, ...(parsed.text ?? {}) },
      scores: { ...empty.scores, ...(parsed.scores ?? {}) },
    };
  } catch {
    return empty;
  }
}

export function CapPackageBench() {
  const [state, setState] = useState<PackageState>(loadPackage);
  useEffect(() => {
    try {
      localStorage.setItem(PACKAGE_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const total = capTotal(state.scores);
  const pct = capPct(state.scores);
  const gate = capstoneGate(state.scores);
  const missing = CAP_SECTIONS.filter((s) => state.scores[s.id] < 1);

  return (
    <BenchShell
      prompt="Build your capstone design package: write one requirement, one model, one test, one mismatch, one justified revision. || Score each section 0–2 against the rubric. The gate opens only when every section is present and the total reaches 70% — simulation alone cannot pass."
      note="The package persists in this browser. Score honestly: a weak section marked 1 keeps the gate honest; a weak section marked 2 fools only you."
      controls={
        <div className="sm:col-span-2">
          <WellButton
            onClick={() =>
              setState({
                text: { requirement: "", model: "", test: "", mismatch: "", revision: "" },
                scores: { requirement: 0, model: 0, test: 0, mismatch: 0, revision: 0 },
              })
            }
          >
            Start a fresh package
          </WellButton>
        </div>
      }
    >
      <Readouts
        items={[
          { label: "Total", value: `${total} / ${CAP_MAX_TOTAL} (${fmt(pct, 0)}%)` },
          { label: "Sections present", value: `${5 - missing.length} / 5` },
          { label: "Gate", value: gate.pass ? "open" : "closed" },
        ]}
      />
      <div className="mt-4 grid gap-4">
        {CAP_SECTIONS.map((sec) => (
          <div key={sec.id} className="rounded-lg ring-1 ring-white/15 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-well-fg">{sec.label}</p>
              <p className="text-xs text-well-dim">
                strong = {sec.strong}
              </p>
            </div>
            <textarea
              className={inputCls + " min-h-20"}
              placeholder={`Write the ${sec.label.toLowerCase()}…`}
              value={state.text[sec.id]}
              onChange={(e) => setState((s) => ({ ...s, text: { ...s.text, [sec.id]: e.target.value } }))}
              aria-label={`${sec.label} text`}
            />
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label={`${sec.label} self-score`}>
              {([0, 1, 2] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={state.scores[sec.id] === v}
                  onClick={() => setState((s) => ({ ...s, scores: { ...s.scores, [sec.id]: v } }))}
                  className={
                    "min-h-11 flex-1 rounded-lg px-3 py-2 text-sm " +
                    (state.scores[sec.id] === v ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {v === 0 ? "0 · absent" : v === 1 ? "1 · weak" : "2 · strong"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        {gate.pass ? (
          <p className="rounded-lg bg-well-fg px-3 py-2 text-sm text-well">
            Gate open. All five sections present, total at 70% or better — a simulation score alone could
            never do this. The package is the deliverable.
          </p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-well-dim">
            {gate.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// CapPredictBench — locked predictions for the reference design, then the
// engineered mismatch and its autopsy.
// ---------------------------------------------------------------------------

const PREDICT_STORE = "ff:cappredict-w30";

type PredictState = {
  predictions: { alDefl: string; balsaDefl: string; binding: "" | "strength" | "stiffness" | "mass" } | null;
  suspect: string;
  note: string;
};

function loadPredict(): PredictState {
  try {
    const raw = localStorage.getItem(PREDICT_STORE);
    if (raw) return JSON.parse(raw) as PredictState;
  } catch {
    /* ignore */
  }
  return { predictions: null, suspect: "", note: "" };
}

function withinTol(raw: string, target: number, tolFrac: number): boolean {
  const v = Number.parseFloat(raw);
  if (!Number.isFinite(v)) return false;
  return Math.abs(v - target) <= Math.abs(target) * tolFrac;
}

export function CapPredictBench() {
  const [state, setState] = useState<PredictState>(loadPredict);
  const [draft, setDraft] = useState({ alDefl: "", balsaDefl: "", binding: "" as "" | "strength" | "stiffness" | "mass" });
  useEffect(() => {
    try {
      localStorage.setItem(PREDICT_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const chain = capChain();
  const al = chain.results.find((r) => r.material.id === "al7075")!;
  const balsa = chain.results.find((r) => r.material.id === "balsa")!;
  const locked = state.predictions !== null;

  const marks = locked
    ? [
        withinTol(state.predictions!.alDefl, al.deflectionMm, 0.4),
        withinTol(state.predictions!.balsaDefl, balsa.deflectionMm, 0.4),
        state.predictions!.binding === chain.bindingConstraint,
      ]
    : [];
  const hits = marks.filter(Boolean).length;
  const prime = MISMATCH_SUSPECTS.find((s) => s.prime)!;

  const lock = () => {
    if (!draft.alDefl.trim() || !draft.balsaDefl.trim() || !draft.binding) return;
    setState((s) => ({ ...s, predictions: { ...draft } }));
  };
  const reset = () => {
    setDraft({ alDefl: "", balsaDefl: "", binding: "" });
    setState((s) => ({ ...s, predictions: null, suspect: "", note: "" }));
  };

  return (
    <BenchShell
      prompt="Capstone pre-lab: lock your predictions for the reference design — tip deflection in 7075-T6 and in balsa, and which constraint binds. || Then face the chain's numbers, take the 0.61 mm measurement, and autopsy the disagreement: name the prime suspect."
      note="Section 4×6 mm, half-span 250 mm, 2.5 g gust on the 100 g glider, uniform lift, deflection limit 5 mm. Locked predictions cannot be edited after reveal — that is the point."
      controls={
        !locked ? (
          <div className="sm:col-span-2">
            <WellButton onClick={lock}>Lock predictions</WellButton>
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={reset}>Predict again</WellButton>
          </div>
        )
      }
    >
      <Readouts
        items={[
          { label: "Gust lift", value: `${fmt(chain.liftN, 2)} N` },
          { label: "Root moment", value: `${fmt(chain.momentNm, 3)} N·m` },
          { label: "Bending stress", value: `${fmt(chain.stressMPa, 2)} MPa` },
          { label: "Deflection limit", value: `${CAP_REFERENCE.deflectionLimitMm} mm` },
        ]}
      />
      {!locked && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-well-dim">
            Aluminum tip deflection (mm)
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 0.5"
              value={draft.alDefl}
              onChange={(e) => setDraft((d) => ({ ...d, alDefl: e.target.value }))}
              aria-label="Predicted aluminum tip deflection in mm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-well-dim">
            Balsa tip deflection (mm)
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 11"
              value={draft.balsaDefl}
              onChange={(e) => setDraft((d) => ({ ...d, balsaDefl: e.target.value }))}
              aria-label="Predicted balsa tip deflection in mm"
            />
          </label>
          <div className="flex flex-col gap-1 text-sm text-well-dim sm:col-span-2">
            <span>Binding constraint</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Binding constraint">
              {(["strength", "stiffness", "mass"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={draft.binding === b}
                  onClick={() => setDraft((d) => ({ ...d, binding: b }))}
                  className={
                    "min-h-11 flex-1 rounded-lg px-3 py-2 text-sm " +
                    (draft.binding === b ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {locked && (
        <div className="mt-4">
          <Readouts
            items={[
              { label: "Your aluminum", value: `${state.predictions!.alDefl} mm ${marks[0] ? "✓" : "✗"}` },
              { label: "Chain aluminum", value: `${fmt(al.deflectionMm, 2)} mm` },
              { label: "Your balsa", value: `${state.predictions!.balsaDefl} mm ${marks[1] ? "✓" : "✗"}` },
              { label: "Chain balsa", value: `${fmt(balsa.deflectionMm, 1)} mm` },
              { label: "Your binding", value: `${state.predictions!.binding} ${marks[3] ? "✓" : "✗"}` },
              { label: "Chain binding", value: chain.bindingConstraint },
              { label: "Predictions hit", value: `${hits} / 3` },
            ]}
          />
          <div className="mt-4 rounded-lg ring-1 ring-white/15 p-3">
            <p className="text-sm font-medium text-well-fg">The test disagrees</p>
            <p className="mt-1 text-sm text-well-dim">{CAP_MISMATCH.description}</p>
            <p className="mt-2 text-sm text-well-dim">
              The bars do not touch — this is a real disagreement, not noise. Autopsy the ledger: which
              suspect is prime?
            </p>
            <div className="mt-2 grid gap-2">
              {MISMATCH_SUSPECTS.map((s) => {
                const on = state.suspect === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setState((st) => ({ ...st, suspect: s.id }))}
                    className={
                      "min-h-11 rounded-lg px-3 py-2 text-left text-sm " +
                      (on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                    }
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            {state.suspect && (
              <div className="mt-3">
                {state.suspect === prime.id ? (
                  <p className="rounded-lg bg-well-fg px-3 py-2 text-sm text-well">
                    Prime suspect named: {prime.why} The revision models the root as a torsional spring in
                    series with the beam, fits the spring from the 0.61 mm, then predicts the deflection at a second test load before measuring it, and re-checks the strength
                    margins — which still clear by 50×.
                  </p>
                ) : (
                  <p className="text-sm text-well-dim">
                    {MISMATCH_SUSPECTS.find((s) => s.id === state.suspect)!.why} The ledger says assumptions
                    first, arithmetic last — and the best-known numbers in the chain are the last suspects.
                  </p>
                )}
                <label className="mt-2 flex flex-col gap-1 text-sm text-well-dim">
                  Your one-sentence autopsy
                  <textarea
                    className={inputCls + " min-h-16"}
                    placeholder="I reached for ___, the cycle reaches for ___…"
                    value={state.note}
                    onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))}
                    aria-label="Autopsy note"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </BenchShell>
  );
}

// ---------------------------------------------------------------------------
// CapReviewBench — the final gate: the 12-question closed-book check with the
// 70% gate and filed corrections for missed full-cycle items.
// ---------------------------------------------------------------------------

const REVIEW_STORE = "ff:capreview-w30";

const CAP_TOPIC_LABEL: Record<CapMasteryItem["topic"], string> = {
  cycle: "full cycle",
  integration: "integration",
  mixed: "cross-cutting",
};

type ReviewState = {
  phase: "intro" | "running" | "results";
  answers: (number | null)[];
  corrections: Record<string, string>;
};

function loadReview(): ReviewState {
  try {
    const raw = localStorage.getItem(REVIEW_STORE);
    if (raw) return JSON.parse(raw) as ReviewState;
  } catch {
    /* ignore */
  }
  return { phase: "intro", answers: CAP_MASTERY_BANK.map(() => null), corrections: {} };
}

export function CapReviewBench() {
  const [state, setState] = useState<ReviewState>(loadReview);
  const [qIndex, setQIndex] = useState(0);
  useEffect(() => {
    try {
      localStorage.setItem(REVIEW_STORE, JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }, [state]);

  const setAnswer = (qi: number, opt: number) =>
    setState((s) => ({ ...s, answers: s.answers.map((a, i) => (i === qi ? opt : a)) }));

  const correct = state.answers.filter((a, i) => a === CAP_MASTERY_BANK[i].answer).length;
  const pct = capMasteryPct(correct, CAP_MASTERY_BANK.length);
  const passed = capMasteryPass(correct, CAP_MASTERY_BANK.length);
  const missed = CAP_MASTERY_BANK.filter((item, i) => state.answers[i] !== item.answer);
  const required = capCorrectionsRequired(missed);
  const filedCount = required.filter((m) => (state.corrections[m.id] ?? "").trim().length > 0).length;
  const gateOpen = passed && filedCount === required.length;

  const start = () =>
    setState((s) => ({ ...s, phase: "running", answers: CAP_MASTERY_BANK.map(() => null) }));
  const retake = () => {
    setQIndex(0);
    setState((s) => ({ ...s, phase: "running", answers: CAP_MASTERY_BANK.map(() => null) }));
  };

  return (
    <BenchShell
      prompt="Sit the final check: twelve questions, one sitting, closed book — four full-cycle, four integration, four cross-cutting. || 70% clears the score gate; then file a correction for every missed full-cycle item. The course closes on score plus repairs."
      note="Closed book means derive, don't recall. Your answers, score, and filed corrections persist in this browser; the gate state is always visible."
      controls={
        state.phase === "intro" ? (
          <div className="sm:col-span-2">
            <WellButton onClick={start}>Start the final check</WellButton>
          </div>
        ) : state.phase === "running" ? (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={() => setQIndex((i) => Math.max(0, i - 1))}>Previous</WellButton>
            {qIndex < CAP_MASTERY_BANK.length - 1 ? (
              <WellButton onClick={() => setQIndex((i) => Math.min(CAP_MASTERY_BANK.length - 1, i + 1))}>
                Next
              </WellButton>
            ) : (
              <WellButton
                onClick={() => {
                  if (state.answers.every((a) => a !== null)) setState((s) => ({ ...s, phase: "results" }));
                }}
              >
                Score the check
              </WellButton>
            )}
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <WellButton onClick={retake}>Retake the check</WellButton>
          </div>
        )
      }
    >
      {state.phase === "intro" && (
        <div className="text-sm leading-relaxed text-well-dim">
          <p>
            Twelve items, one sitting, no references. The bank is weighted on purpose: running the full
            cycle and chaining the weeks&apos; tools are the load-bearing skills of Engineering 101.
          </p>
          <Readouts
            items={[
              { label: "Questions", value: "12" },
              { label: "Gate", value: `≥ ${CAP_MASTERY_GATE_PCT}% (9 of 12)` },
              { label: "Corrections", value: "every missed full-cycle item" },
            ]}
          />
        </div>
      )}
      {state.phase === "running" && (
        <div>
          <p className="text-sm text-well-dim">
            Question {qIndex + 1} of {CAP_MASTERY_BANK.length} · {CAP_TOPIC_LABEL[CAP_MASTERY_BANK[qIndex].topic]}
          </p>
          <p className="mt-2 text-lg text-well-fg">{CAP_MASTERY_BANK[qIndex].prompt}</p>
          <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Answer options">
            {CAP_MASTERY_BANK[qIndex].options.map((opt, oi) => {
              const on = state.answers[qIndex] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAnswer(qIndex, oi)}
                  className={
                    "min-h-11 rounded-lg px-3 py-2 text-left text-sm " +
                    (on ? "bg-well-fg text-well" : "text-well-fg ring-1 ring-white/25")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {qIndex === CAP_MASTERY_BANK.length - 1 && !state.answers.every((a) => a !== null) && (
            <p className="mt-2 text-sm text-well-dim">Answer all twelve to score — unanswered items count as missed.</p>
          )}
        </div>
      )}
      {state.phase === "results" && (
        <div>
          <Readouts
            items={[
              { label: "Score", value: `${correct} / ${CAP_MASTERY_BANK.length} (${fmt(pct, 1)}%)` },
              { label: "Score gate", value: passed ? "cleared ≥ 70%" : "below 70% — retake" },
              { label: "Corrections filed", value: `${filedCount} / ${required.length}` },
            ]}
          />
          {gateOpen ? (
            <p className="mt-3 rounded-lg bg-well-fg px-3 py-2 text-sm text-well">
              Gate open. Score clears 70% and every missed full-cycle item has a filed correction — the
              course is complete. Requirement, model, test, mismatch, justified revision: yours, from
              memory.
            </p>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-well-dim">
                {!passed
                  ? "The score gate is closed — retake the check."
                  : "The score gate is clear. Now file the corrections: for each missed full-cycle item, write the right reasoning, where yours left the cycle, and the sentence you carry forward."}
              </p>
              <div className="mt-3 grid gap-3">
                {required.map((m) => (
                  <div key={m.id} className="rounded-lg ring-1 ring-white/15 p-3">
                    <p className="text-sm text-well-fg">{m.prompt}</p>
                    <p className="mt-1 text-xs text-well-dim">Correct: {m.options[m.answer]} — {m.why}</p>
                    <textarea
                      className={inputCls + " mt-2 min-h-20"}
                      placeholder="The right reasoning was… Mine left the cycle at… The sentence I carry forward is…"
                      value={state.corrections[m.id] ?? ""}
                      onChange={(e) =>
                        setState((s) => ({ ...s, corrections: { ...s.corrections, [m.id]: e.target.value } }))
                      }
                      aria-label={`Correction for ${m.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm font-medium text-well-fg">Review each item</p>
            <div className="mt-2 grid gap-2">
              {CAP_MASTERY_BANK.map((m, i) => (
                <div key={m.id} className="rounded-lg ring-1 ring-white/15 p-3">
                  <p className="text-sm text-well-fg">
                    {i + 1}. {m.prompt}
                  </p>
                  <p className="mt-1 text-xs text-well-dim">
                    You answered:{" "}
                    {state.answers[i] === null ? "—" : m.options[state.answers[i]!]}
                    {state.answers[i] === m.answer ? " ✓" : ` ✗ (correct: ${m.options[m.answer]})`}
                  </p>
                  <p className="mt-1 text-xs text-well-dim">{m.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BenchShell>
  );
}
