import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { courseIntro, lessonsFor, tracks } from "@/course/catalog";
import { useProgress } from "@/course/progress";
import { isPassed, lessonKey, PASS_AT } from "@/course/types";

export const Route = createFileRoute("/learn/")({
  component: CoursesPage,
  head: () => ({
    meta: [{ title: "All courses · Axiom" }],
  }),
});

function CoursesPage() {
  const completed = useProgress((s) => s.completed);
  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <p className="font-serif text-sm text-accent">Axiom</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">All courses</h1>
        <h2 className="mt-8 font-serif text-2xl leading-snug">{courseIntro.heading}</h2>
        {courseIntro.approach.map((paragraph, i) => (
          <p key={i} className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
        <h3 className="mt-8 font-serif text-xl leading-snug">Terminology</h3>
        <dl className="mt-4 max-w-prose">
          {courseIntro.terms.map((t) => (
            <div key={t.term} className="mt-3">
              <dt className="font-medium text-ink">{t.term}</dt>
              <dd className="mt-1 text-muted">{t.body}</dd>
            </div>
          ))}
        </dl>
        <ol className="mt-10 border-t border-line">
          {tracks.map((track) => {
            const trackLessons = lessonsFor(track.id);
            const passed = trackLessons.filter((lesson) =>
              isPassed(completed[lessonKey(track.id, lesson.id)], lesson.passAt ?? PASS_AT),
            ).length;
            const minutes = trackLessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
            return (
              <li key={track.id} className="border-b border-line">
                <Link
                  to="/learn/$trackId"
                  params={{ trackId: track.id }}
                  className="flex min-h-16 items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="font-serif text-sm text-accent">{track.index}</span>
                    <span className="mt-1 block font-serif text-2xl leading-snug">{track.course}</span>
                    <span className="mt-1 block max-w-prose text-sm text-muted">{track.lede}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {trackLessons.length} lessons · {minutes} min
                    </span>
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-muted">
                    {passed === 0 ? "New" : `${passed} of ${trackLessons.length} passed`}
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
