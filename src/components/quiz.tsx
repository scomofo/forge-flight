import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PASS_AT, type Lesson } from "@/course/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Answer keys are authored mostly as option A or B, so options are shown in a
 * shuffled order. The order is seeded from the lesson and question, so it is
 * stable across renders and server/client, and changes on each retake.
 */
function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffledOrder(count: number, seed: string): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  let state = hash(seed) || 1;
  for (let i = count - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function Quiz({
  lesson,
  next,
  onResult,
}: {
  lesson: Lesson;
  next?: { track: string; id: string; title: string };
  onResult: (correct: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const question = lesson.checks[index];
  const order = shuffledOrder(
    question.options.length,
    `${lesson.track}/${lesson.id}/${index}/${attempt}`,
  );
  const need = lesson.passAt ?? PASS_AT;

  if (done) {
    const passed = correct >= need;
    return (
      <div className="border-t border-line pt-8">
        <p className="font-serif text-3xl text-ink">
          {correct} of {lesson.checks.length}.
        </p>
        <p className="mt-3 max-w-prose leading-relaxed text-ink">
          {passed
            ? `Pass. ${need} or more correct. You can go to the next lesson. The bench stays available if you want another look.`
            : `Not a pass. You need ${need} of ${lesson.checks.length}. Go back to Try, do the task again, then retake this check. Your best score is the one that is saved.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrect(0);
              setDone(false);
              setAttempt(attempt + 1);
            }}
          >
            Try the check again
          </Button>
          {passed && next ? (
            <Link
              to="/learn/$trackId/$lessonId"
              params={{ trackId: next.track, lessonId: next.id }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              Next · {next.title}
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <fieldset className="border-t border-line pt-8">
      <legend className="font-serif text-sm text-accent">
        Question {index + 1} of {lesson.checks.length}
      </legend>
      <p className="mt-3 font-serif text-2xl leading-snug text-ink">{question.prompt}</p>
      <div className="mt-5 flex flex-col gap-2">
        {order.map((i) => {
          const option = question.options[i];
          const revealed = picked !== null;
          const isAnswer = i === question.answer;
          const isPick = i === picked;
          return (
            <button
              key={option}
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
      {picked !== null ? (
        <div className="mt-5">
          <p className="text-sm font-medium text-ink">
            {picked === question.answer ? "Yes." : "Not quite."}
          </p>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{question.why}</p>
          <Button
            className="mt-5"
            onClick={() => {
              const nextCorrect = correct + (picked === question.answer ? 1 : 0);
              if (index === lesson.checks.length - 1) {
                setCorrect(nextCorrect);
                setDone(true);
                onResult(nextCorrect);
                return;
              }
              setCorrect(nextCorrect);
              setPicked(null);
              setIndex(index + 1);
            }}
          >
            {index === lesson.checks.length - 1 ? "See the result" : "Next question"}
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}
