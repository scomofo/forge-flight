import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { getTrack, lessonsFor } from "@/course/catalog";
import { useProgress } from "@/course/progress";
import { isPassed, lessonKey, PASS_AT, type TrackId } from "@/course/types";

export const Route = createFileRoute("/learn/$trackId/")({
  component: TrackPage,
  head: ({ params }) => {
    const track = getTrack(params.trackId);
    return { meta: [{ title: track ? `${track.course} · Axiom` : "Axiom" }] };
  },
});

function TrackPage() {
  const { trackId } = Route.useParams();
  const track = getTrack(trackId);
  const completed = useProgress((s) => s.completed);

  if (!track) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-16">
          <h1 className="font-serif text-4xl">That track isn’t on the bench.</h1>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center text-accent">
            Back to Axiom
          </Link>
        </main>
      </div>
    );
  }

  const lessons = lessonsFor(track.id);
  const minutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <Link to="/" className="inline-flex min-h-11 items-center text-sm text-muted">
          All courses
        </Link>
        <p className="mt-6 font-serif text-sm text-accent">
          {track.index} · {minutes} min
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{track.course}</h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{track.lede}</p>
        {track.id === "math" ? (
          <Link
            to="/learn/diagnostic"
            className="mt-6 block rounded-lg border border-line bg-surface px-4 py-4 sm:px-5"
          >
            <p className="text-sm font-medium text-accent">Start here: the placement diagnostic</p>
            <p className="mt-1 max-w-prose leading-relaxed text-ink">
              45 minutes, open-resource, 24 questions across six topics. It assigns only the modules
              you need — test out of the rest. It never assigns a pass/fail label.
            </p>
          </Link>
        ) : null}
        <ol className="mt-10 border-t border-line">
          {lessons.map((lesson) => {
            const score = completed[lessonKey(track.id as TrackId, lesson.id)];
            const passed = isPassed(score, lesson.passAt ?? PASS_AT);
            return (
              <li key={lesson.id} className="border-b border-line">
                <Link
                  to="/learn/$trackId/$lessonId"
                  params={{ trackId: track.id, lessonId: lesson.id }}
                  className="flex min-h-16 items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="font-serif text-sm text-accent">
                      {String(lesson.index).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block font-serif text-2xl leading-snug">{lesson.title}</span>
                    <span className="mt-1 block text-sm text-muted">{lesson.minutes} min</span>
                  </span>
                  <span className={passed ? "shrink-0 text-sm text-accent" : "shrink-0 text-sm tabular-nums text-muted"}>
                    {score === undefined ? "New" : passed ? "Passed" : `${score}/4`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
