import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { ShelfJob } from "@/components/shelf-job";
import { JOB_KEY } from "@/course/job";
import { useProgress } from "@/course/progress";
import { isPassed } from "@/course/types";

export const Route = createFileRoute("/learn/job")({
  component: JobPage,
  head: () => ({ meta: [{ title: "The shelf · Axiom" }] }),
});

function JobPage() {
  const mark = useProgress((s) => s.mark);
  const visit = useProgress((s) => s.visit);
  const score = useProgress((s) => s.completed[JOB_KEY]);

  useEffect(() => {
    visit(JOB_KEY);
  }, [visit]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
        <p className="font-serif text-sm text-accent">The job{isPassed(score) ? " · Passed" : ""}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">Specify the shelf.</h1>
        <p className="mt-4 max-w-prose text-sm font-medium text-accent">Aim</p>
        <p className="mt-1 max-w-prose text-lg leading-relaxed text-ink">
          You will choose the material and the thickness of one shelf board so that strength, sag, and mass all pass together.
        </p>
        <div className="mt-10">
          <ShelfJob alreadyPassed={isPassed(score)} onPassed={(n) => mark(JOB_KEY, n)} />
        </div>
        <nav className="mt-16 border-t border-line pt-6">
          <Link to="/" className="inline-flex min-h-11 items-center text-sm text-ink">
            ← Back to the course
          </Link>
        </nav>
      </article>
    </div>
  );
}
