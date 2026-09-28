import { createFileRoute, Link } from "@tanstack/react-router";
import { LessonView } from "@/components/lesson-view";
import { SiteHeader } from "@/components/site-header";
import { getLesson, getTrack } from "@/course/catalog";

export const Route = createFileRoute("/learn/$trackId/$lessonId")({
  component: LessonPage,
  head: ({ params }) => {
    const lesson = getLesson(params.trackId, params.lessonId);
    return { meta: [{ title: lesson ? `${lesson.title} · Axiom` : "Axiom" }] };
  },
});

function LessonPage() {
  const { trackId, lessonId } = Route.useParams();
  const lesson = getLesson(trackId, lessonId);
  const track = getTrack(trackId);

  if (!lesson || !track) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-16">
          <h1 className="font-serif text-4xl">That lesson isn’t on the bench.</h1>
          <Link to="/learn" className="mt-6 inline-flex min-h-11 items-center text-accent">
            Back to Axiom
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8">
        <Link
          to="/learn/$trackId"
          params={{ trackId: track.id }}
          className="inline-flex min-h-11 items-center text-sm text-muted"
        >
          {track.course}
        </Link>
      </div>
      <LessonView key={`${lesson.track}/${lesson.id}`} lesson={lesson} />
    </div>
  );
}
