import { createFileRoute, Link } from "@tanstack/react-router";
import { Diagnostic } from "@/components/diagnostic";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/learn/diagnostic")({
  component: DiagnosticPage,
  head: () => ({ meta: [{ title: "Placement diagnostic · Axiom" }] }),
});

function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8">
        <Link
          to="/learn/$trackId"
          params={{ trackId: "math" }}
          className="inline-flex min-h-11 items-center text-sm text-muted"
        >
          Math Runway
        </Link>
      </div>
      <Diagnostic key="diagnostic" />
    </div>
  );
}
