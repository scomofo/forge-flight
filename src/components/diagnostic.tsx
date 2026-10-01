import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DIAGNOSTIC_TOPICS,
  TOPIC_LABELS,
  diagnosticQuestions,
  recommendModules,
  type DiagnosticTopic,
  type TopicScore,
} from "@/course/diagnostic";
import { useProgress } from "@/course/progress";
import { shuffledOrder } from "@/lib/shuffle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Stage = "intro" | "quiz" | "results";

export function Diagnostic() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const savePlacement = useProgress((s) => s.savePlacement);
  const lastPlacement = useProgress((s) => s.placement);
  const [correct, setCorrect] = useState<Record<DiagnosticTopic, number>>(() => ({
    "ratios-units": 0,
    algebra: 0,
    powers: 0,
    graphs: 0,
    "geometry-trig": 0,
    vectors: 0,
  }));

  const question = diagnosticQuestions[index];
  const byTopic = useMemo<Record<DiagnosticTopic, TopicScore>>(() => {
    const out = {} as Record<DiagnosticTopic, TopicScore>;
    for (const t of DIAGNOSTIC_TOPICS) {
      out[t] = { correct: correct[t], total: 4 };
    }
    return out;
  }, [correct]);
  const recommendations = useMemo(() => recommendModules(byTopic), [byTopic]);
  const toTake = recommendations.filter((r) => r.take);

  if (stage === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <p className="font-serif text-sm text-accent">Math Runway · Placement</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
          The 45-minute diagnostic
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink">
          24 questions across six topics: ratios and units, algebra, powers, graphs, geometry and
          trigonometry, vectors. Open-resource — a calculator and notes are fine. Speed is not
          graded; setup and reasoning are.
        </p>
        <p className="mt-4 max-w-prose leading-relaxed text-muted">
          This assigns modules, never a pass/fail label. Score 4 of 4 on a topic and you test
          out of its module. Score 3 or fewer and the module is assigned. Each module is a
          single lesson of about 30–45 minutes, and its check wants 4 of 4, the same bar.
        </p>
        {lastPlacement ? (
          <div className="mt-6 rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
            <p className="text-sm font-medium text-accent">Your last placement</p>
            <ul className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3">
              {DIAGNOSTIC_TOPICS.map((t) => (
                <li key={t} className="text-sm text-muted">
                  {TOPIC_LABELS[t]}: <span className="tabular-nums text-ink">{lastPlacement[t] ?? 0} / 4</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Button className="mt-8" onClick={() => setStage("quiz")}>
          Begin the diagnostic
        </Button>
      </div>
    );
  }

  if (stage === "quiz") {
    const revealed = picked !== null;
    // Options are shuffled with a seeded order (same mechanism as the lesson
    // quiz) so the correct answer is not always first; grading still uses the
    // canonical option index.
    const order = shuffledOrder(question.options.length, `diagnostic/${question.id}/${attempt}`);
    return (
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <p className="font-serif text-sm text-accent">
          Question {index + 1} of {diagnosticQuestions.length} · {TOPIC_LABELS[question.topic]}
        </p>
        <p className="mt-3 font-serif text-2xl leading-snug text-ink">{question.prompt}</p>
        <div className="mt-5 flex flex-col gap-2">
          {order.map((i) => {
            const option = question.options[i];
            const isAnswer = i === question.answer;
            const isPick = i === picked;
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setPicked(i)}
                className={cn(
                  "min-h-11 rounded-lg border px-4 py-3 text-left text-sm leading-snug transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]",
                  !revealed && "border-line bg-surface",
                  revealed && isAnswer && "border-accent bg-accent-soft text-ink",
                  revealed && isPick && !isAnswer && "border-ink bg-surface",
                  revealed && !isAnswer && !isPick && "border-line opacity-50",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        {revealed ? (
          <div className="mt-5">
            <p className="text-sm font-medium text-ink">
              {picked === question.answer ? "Yes." : "Not quite."}
            </p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{question.why}</p>
            <Button
              className="mt-5"
              onClick={() => {
                const nextCorrect = { ...correct };
                if (picked === question.answer) nextCorrect[question.topic] += 1;
                setCorrect(nextCorrect);
                if (index === diagnosticQuestions.length - 1) {
                  savePlacement(nextCorrect);
                  setStage("results");
                  return;
                }
                setPicked(null);
                setIndex(index + 1);
              }}
            >
              {index === diagnosticQuestions.length - 1 ? "See the recommendation" : "Next question"}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <p className="font-serif text-sm text-accent">Math Runway · Your assignment</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
        {toTake.length === 0
          ? "Test out of all five."
          : toTake.length === 1
            ? "One module assigned."
            : `${toTake.length} modules assigned.`}
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-muted">
        Per-topic scores below. This is placement, not a verdict — the modules it assigns are
        single lessons of 30–45 minutes each, and every one gates at 4 of 4 with retakes.
      </p>

      <h2 className="mt-10 font-serif text-sm text-accent">By topic</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DIAGNOSTIC_TOPICS.map((t) => (
          <li key={t} className="rounded-lg border border-line bg-surface px-4 py-3">
            <p className="text-sm text-muted">{TOPIC_LABELS[t]}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-ink">{correct[t]} / 4</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-serif text-sm text-accent">Modules</h2>
      <ol className="mt-3 flex flex-col gap-3">
        {recommendations.map((r) => (
          <li key={r.moduleId} className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{r.reason}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-sm",
                  r.take ? "bg-accent-soft text-accent" : "text-muted",
                )}
              >
                {r.take ? "Take" : "Test out"}
              </span>
            </div>
            {r.take ? (
              <Link
                to="/learn/$trackId/$lessonId"
                params={{ trackId: "math", lessonId: r.moduleId }}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-accent"
              >
                Open the module →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            setIndex(0);
            setPicked(null);
            setAttempt(attempt + 1);
            setCorrect({
              "ratios-units": 0,
              algebra: 0,
              powers: 0,
              graphs: 0,
              "geometry-trig": 0,
              vectors: 0,
            });
            setStage("quiz");
          }}
        >
          Retake the diagnostic
        </Button>
        <Link
          to="/learn/$trackId"
          params={{ trackId: "math" }}
          className="inline-flex min-h-11 items-center text-sm text-muted"
        >
          Back to the Math Runway
        </Link>
      </div>
    </div>
  );
}
