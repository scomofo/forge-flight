import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bench } from "@/components/bench";
import { ExampleInputs } from "@/components/example-inputs";
import { getExampleContext } from "@/course/example-context";
import type { ExampleContext } from "@/course/types";
import { ConceptHelp } from "@/components/concept-help";
import { LessonSections } from "@/components/lesson-sections";
import { LessonWalkthroughPanel } from "@/components/lesson-walkthrough";
import { materialsWalkthroughs } from "@/course/materials-walkthroughs";
import { LessonClip } from "@/components/lesson-clip";
import { lessonFigures } from "@/components/figures";
import { Quiz } from "@/components/quiz";
import { isIntroTrack, lessonNeighbors } from "@/course/catalog";
import { useProgress } from "@/course/progress";
import { isPassed, lessonKey, PASS_AT, type IdeaHelp, type Lesson, type LessonReadBlock } from "@/course/types";
import { cn } from "@/lib/cn";

const steps = [
  {
    label: "Read",
    guide: "Read the lesson in the order it is presented. Some start from a problem, some from an example, and some go straight to the rule.",
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

function StartHere({ lesson, figure }: { lesson: Lesson; figure?: ReactNode }) {
  const parts = lesson.start.split(" || ");
  const opening = lesson.opening;
  if (opening?.mode === "prose") {
    return (
      <section>
        <h2 className="font-serif text-sm text-accent">{opening.heading ?? "Start here"}</h2>
        <div className="mt-4 flex flex-col gap-4">
          {parts.filter(Boolean).map((line, i) => (
            <div key={i}>
              <p className={cn("max-w-prose leading-relaxed text-ink", i === 0 ? "text-lg" : "")}>{line}</p>
              {i === 0 && figure ? figure : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const labels = opening?.labels ?? ["Picture this", "The word", "Why the rule looks like that"];
  const rows = parts
    .map((line, i) => [labels[i] ?? `Part ${i + 1}`, line] as [string, string])
    .filter((row) => Boolean(row[1]));
  return (
    <section>
      <h2 className="font-serif text-sm text-accent">{opening?.heading ?? "Start here"}</h2>
      <ol className="mt-4 flex flex-col gap-6">
        {rows.map(([label, line], i) => (
          <li key={`${label}-${i}`}>
            <p className="text-sm font-medium text-accent">{label}</p>
            <p className="mt-1 max-w-prose text-lg leading-relaxed text-ink">{line}</p>
            {i === 0 && figure ? figure : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Example({ text, heading = "For example", help, context }: { text: string; heading?: string; help?: IdeaHelp[]; context?: ExampleContext }) {
  const parts = text.split(" || ");
  const rows = [
    ["The case", parts[0]],
    ["The arithmetic", parts[1]],
    ["The call", parts[2]],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <section className="rounded-lg border border-line bg-surface px-4 py-4 sm:px-5">
      <h2 className="font-serif text-sm text-accent">{heading}</h2>
      <ExampleInputs context={context} />
      <ol className="mt-3 flex flex-col gap-4">
        {rows.map(([label, line]) => (
          <li key={label}>
            <p className="text-sm font-medium text-accent">{label}</p>
            <p className="mt-1 max-w-prose leading-relaxed text-ink">{line}</p>
          </li>
        ))}
      </ol>
      {help?.length ? <ConceptHelp help={help} /> : null}
    </section>
  );
}

function Move({ text, heading = "The move" }: { text: string; heading?: string }) {
  const parts = text.split(" || ");
  const rows = [
    ["When", parts[0]],
    ["Do", parts[1]],
    ["Then stop", parts[2]],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return (
    <section className="rounded-lg border border-line px-4 py-4 sm:px-5">
      <h2 className="font-serif text-sm text-accent">{heading}</h2>
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

function legacyReadFlow(): LessonReadBlock[] {
  return [
    { kind: "idea", idea: 0 },
    { kind: "idea", idea: 1 },
    { kind: "idea", idea: 2 },
    { kind: "example" },
    { kind: "move" },
  ];
}

function ReadFlow({ lesson }: { lesson: Lesson }) {
  const flow = lesson.readFlow ?? legacyReadFlow();
  return (
    <div>
      {flow.map((block, i) => {
        if (block.kind === "idea") {
          const idea = lesson.ideas[block.idea];
          const { point, rest } = splitPoint(idea.body);
          return (
            <section key={`idea-${block.idea}-${i}`} className="border-b border-line py-8">
              <p className="font-serif text-sm text-accent">{block.label ?? `Point 0${block.idea + 1}`}</p>
              <h2 className="mt-2 font-serif text-2xl text-ink">{idea.heading}</h2>
              <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink">{point}</p>
              {rest ? <p className="mt-3 max-w-prose leading-relaxed text-muted">{rest}</p> : null}
              {idea.formula ? <p className="mt-4 font-serif text-xl text-accent">{idea.formula}</p> : null}
              {idea.formulaNote ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{idea.formulaNote}</p> : null}
              {idea.sections?.length ? <LessonSections sections={idea.sections} /> : null}
              {idea.help?.length ? <ConceptHelp help={idea.help} /> : null}
            </section>
          );
        }
        if (block.kind === "example") {
          return (
            <div key={`example-${i}`} className="mt-8">
              <Example text={lesson.example} heading={block.heading} help={lesson.exampleHelp} context={getExampleContext(lesson.track, lesson.id)} />
            </div>
          );
        }
        if (block.kind === "move") {
          return (
            <div key={`move-${i}`} className="mt-4">
              <Move text={lesson.use} heading={block.heading} />
            </div>
          );
        }
        return (
          <aside key={`aside-${i}`} className="my-8 border-l-2 border-accent pl-4">
            <p className="text-sm font-medium text-accent">{block.heading}</p>
            <p className="mt-2 max-w-prose leading-relaxed text-ink">{block.body}</p>
          </aside>
        );
      })}
    </div>
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
  const walkthrough = lesson.track === "materials" ? materialsWalkthroughs[lesson.id] : undefined;

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
        <StartHere lesson={lesson} figure={Figure ? <><ExampleInputs context={getExampleContext(lesson.track, lesson.id)} compact /><Figure /></> : undefined} />
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
          {walkthrough ? <LessonWalkthroughPanel key={key} walkthrough={walkthrough} /> : null}
          <ReadFlow lesson={lesson} />
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
