import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bench } from "@/components/bench";
import { LessonClip } from "@/components/lesson-clip";
import { Quiz } from "@/components/quiz";
import { isIntroTrack, lessonNeighbors } from "@/course/catalog";
import { useProgress } from "@/course/progress";
import { isPassed, lessonKey, type Lesson } from "@/course/types";
import { cn } from "@/lib/cn";

const steps = [
  {
    label: "Read",
    guide: "Each block starts with the point in one sentence. The paragraph under it is only the reason. Learn the point, then go to Try.",
  },
  {
    label: "Try",
    guide: "Follow “Do this.” Then check “You should see.” If a number looks wild, read “This model leaves out” before you distrust the lesson.",
  },
  {
    label: "Check",
    guide: "Four questions. Pick one answer, read why it is right or wrong, then continue. Three correct is a pass. You can retry.",
  },
] as const;

function splitPoint(body: string) {
  const cut = body.indexOf(". ");
  if (cut === -1 || cut > 220) return { point: body, rest: "" };
  return { point: body.slice(0, cut + 1), rest: body.slice(cut + 2) };
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const [step, setStep] = useState(0);
  const key = lessonKey(lesson.track, lesson.id);
  const mark = useProgress((s) => s.mark);
  const visit = useProgress((s) => s.visit);
  const score = useProgress((s) => s.completed[key]);
  const { prev, next } = lessonNeighbors(lesson.track, lesson.id);

  useEffect(() => {
    visit(key);
  }, [key, visit]);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <p className="font-serif text-sm text-accent">
        Lesson {String(lesson.index).padStart(2, "0")} · {lesson.minutes} min
        {isPassed(score) ? " · Passed" : ""}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">{lesson.title}</h1>
      <p className="mt-4 max-w-prose text-sm font-medium text-accent">Aim</p>
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
          <Bench key={`${lesson.track}/${lesson.id}`} id={lesson.bench} />
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
