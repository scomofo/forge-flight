import { Link } from "@tanstack/react-router";
import { lessons } from "@/course/catalog";
import { JOB_KEY } from "@/course/job";
import { useProgress } from "@/course/progress";
import { isPassed, lessonComplete, lessonKey } from "@/course/types";

const intro = new Set(["physics", "materials", "engineering"]);

export function SiteHeader() {
  const completed = useProgress((s) => s.completed);
  const capstonePass = useProgress((s) => s.capstonePass);
  const hydrated = useProgress((s) => s.hydrated);
  const core = lessons.filter((lesson) => intro.has(lesson.track));
  const making = lessons.filter((lesson) => lesson.track === "manufacturing");
  const upper = lessons.filter((lesson) => lesson.track !== "manufacturing" && !intro.has(lesson.track));
  const coreDone = core.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const makingDone = making.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const upperDone = upper.filter((lesson) => lessonComplete(lesson, completed[lessonKey(lesson.track, lesson.id)], capstonePass)).length;
  const jobPassed = isPassed(completed[JOB_KEY]);
  const label = !hydrated
    ? "—"
    : coreDone === 0 && makingDone === 0 && upperDone === 0 && !jobPassed
      ? `${core.length} lessons`
      : jobPassed && coreDone === core.length && makingDone === making.length && upperDone === upper.length
        ? "All passed"
        : jobPassed && coreDone === core.length
          ? `Shelf specified · ${makingDone} of ${making.length} making · ${upperDone} of ${upper.length} upper`
          : `${coreDone} of ${core.length}${makingDone ? ` · ${makingDone} making` : ""}${upperDone ? ` · ${upperDone} upper` : ""}${jobPassed ? " · shelf passed" : ""}`;

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl text-ink">
          <span className="inline-block size-2.5 rounded-sm bg-accent" aria-hidden />
          Axiom
        </Link>
        <p className="text-sm tabular-nums text-muted">
          {label}
        </p>
      </div>
    </header>
  );
}
