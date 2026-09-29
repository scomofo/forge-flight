import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bench } from "@/components/bench";
import { LessonClip } from "@/components/lesson-clip";
import { lessonFigures } from "@/components/figures";
import { Quiz } from "@/components/quiz";
import { isIntroTrack, lessonNeighbors } from "@/course/catalog";
import { useProgress } from "@/course/progress";
import { isPassed, lessonKey, PASS_AT, type Lesson } from "@/course/types";
import { cn } from "@/lib/cn";

const steps = [
  {
    label: "Read",
    guide: "Read top to bottom. Each lesson starts with something you can picture, then names the idea, then gives the rule.",
  },
  {
    label: "Try",
    guide: "Use the bench to watch the rule work. Nothing new here — just the same rule with numbers you can change.",
  },
  {
    label: "Check",
    guide:
      "Four questions. Pick one answer, read why it is right or wrong, then continue. Hit this lesson's pass mark to move on. You can retry.",
  },
] as const;

function splitPoint(body: string) {
  const cut = body.indexOf(". ");
  if (cut === -1 || cut > 220) return { point: body, rest: "" };
  return { point: body.slice(0, cut + 1), rest: body.slice(cut + 2) };
}

function StartHere({ text, figure }: { text: string; figure?: ReactNode }) {
  const parts = text.split(" || ");
  const rows = [
    ["Picture this", parts[0]],
    ["The word", parts[1]],
    ["Why the rule looks like that", parts[2]],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <section>
      <h2 className="font-serif text-sm text-accent">Start here</h2>
      <ol className="mt-4 flex flex-col gap-6">
        {rows.map(([label, line]) => (
          <li key={label}>
            <p className="text-sm font-medium text-accent">{label}</p>
            <p className="mt-1 max-w-prose text-lg leading-relaxed text-ink">{line}</p>
            {label === "Picture this" && figure ? figure : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Example({ text }: { text: string }) {
  const parts = text.split(" || ");
  const rows = [
    ["The case", parts[0]],
    ["The arithmetic", parts[1]],
    ["The call", parts[2]],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <section className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
      <h2 className="font-serif text-sm text-accent">For example</h2>
      <ol className="mt-3 flex flex-col gap-4">
        {rows.map(([label, line]) => (
          <li key={label}>
            <p className="text-sm font-medium text-accent">{label}</p>
            <p className="mt-1 max-w-prose leading-relaxed text-ink">{line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Move({ text }: { text: string }) {
  const parts = text.split(" || ");
  const rows = [
    ["When", parts[0]],
    ["Do", parts[1]],
    ["Then stop", parts[2]],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <section className="rounded-lg border border-line px-4 py-4 sm:px-5">
      <h2 className="font-serif text-sm text-accent">The move</h2>
      <ol className="mt-3 flex flex-col gap-4">
        {rows.map(([label, line]) => (
          <li key={label}>
            <p className="text-sm font-medium text-accent">{label}</p>
            <p className="mt-1 max-w-prose leading-relaxed text-ink">{line}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const [step, setStep] = useState(0);
  const key = lessonKey(lesson.track, lesson.id);
  const mark = useProgress((s) => s.mark);
  const visit = useProgress((s) => s.visit);
  const score = useProgress((s) => s.completed[key]);
  const need = lesson.passAt ?? PASS_AT;
  const { prev, next } = lessonNeighbors(lesson.track, lesson.id);
  const Figure = lessonFigures[key];

  useEffect(() => {
    visit(key);
  }, [key, visit]);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <p className="font-serif text-sm text-accent">
        Lesson {String(lesson.index).padStart(2, "0")} · {lesson.minutes} min
        {isPassed(score, need) ? " · Passed" : ""}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">{lesson.title}</h1>
      <div className="mt-8">
        <StartHere text={lesson.start} figure={Figure ? <Figure /> : undefined} />
      </div>
      <p className="mt-10 max-w-prose text-sm font-medium text-accent">What you will be able to do</p>
      <p className="mt-1 max-w-prose text-lg leading-relaxed text-ink">{lesson.lede}</p>

      <div className="sticky top-0 z-10 -mx-5 mt-8 border-y border-line bg-bg px-5 sm:-mx-8 sm:px-8">
        <div className="grid grid-cols-3" role="tablist" aria-label="Lesson steps">
          {steps.map((item, i) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={step === i}
              onClick={() => setStep(i)}
              className={cn(
                "min-h-11 text-sm",
                step === i ? "text-ink" : "text-muted",
              )}
            >
              <span className={cn("inline-block border-b-2 py-3", step === i ? "border-accent" : "border-transparent")}>
                {i + 1} {item.label}
              </span>
            </button>
          ))}
        </div>
        <p className="pb-3 text-sm leading-relaxed text-muted">
          {steps[step].guide}
          {step === 1 && lesson.clip
            ? " A clip under the bench is only a look. The rule you use is the one on this page."
            : ""}
        </p>
      </div>

      {step === 0 ? (
        <div>
          <h2 className="mt-10 font-serif text-sm text-accent">Now the rule</h2>
          <ol>
            {lesson.ideas.map((idea, i) => {
              const { point, rest } = splitPoint(idea.body);
              return (
              <li key={idea.heading} className="border-b border-line py-8">
                <p className="font-serif text-sm text-accent">Point 0{i + 1}</p>
                <h2 className="mt-2 font-serif text-2xl text-ink">{idea.heading}</h2>
                <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink">{point}</p>
                {rest ? <p className="mt-3 max-w-prose leading-relaxed text-muted">{rest}</p> : null}
                {idea.formula ? (
                  <p className="mt-4 font-serif text-xl text-accent">{idea.formula}</p>
                ) : null}
              </li>
              );
            })}
          </ol>
          <div className="mt-10 flex flex-col gap-4">
            <Example text={lesson.example} />
            <Move text={lesson.use} />
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-transform duration-150 active:scale-[0.96]"
          >
            Try the bench
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="pt-8">
          <Move text={lesson.use} />
          <div className="mt-8">
            <Bench key={`${lesson.track}/${lesson.id}`} id={lesson.bench} />
          </div>
          {lesson.clip ? <LessonClip clip={lesson.clip} /> : null}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-transform duration-150 active:scale-[0.96]"
          >
            Take the check
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="pt-8">
          <Quiz
            lesson={lesson}
            next={next ? { track: next.track, id: next.id, title: next.title } : undefined}
            onResult={(n) => mark(key, n)}
          />
        </div>
      ) : null}

      <nav className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm">
        {prev ? (
          <Link
            to="/learn/$trackId/$lessonId"
            params={{ trackId: prev.track, lessonId: prev.id }}
            className="min-h-11 text-muted"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/learn/$trackId/$lessonId"
            params={{ trackId: next.track, lessonId: next.id }}
            className="min-h-11 text-right text-ink"
          >
            {next.title} →
          </Link>
        ) : isIntroTrack(lesson.track) ? (
          <Link to="/learn/job" className="min-h-11 text-right text-ink">
            The shelf job →
          </Link>
        ) : (
          <Link to="/learn/$trackId" params={{ trackId: lesson.track }} className="min-h-11 text-right text-ink">
            Back to the course
          </Link>
        )}
      </nav>
    </article>
  );
}
