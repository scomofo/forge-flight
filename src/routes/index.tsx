import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { missions } from "@/forge/content/catalog";
import { unlocked, useForge } from "@/forge/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Bay,
  head: () => ({
    meta: [
      { title: "Forge & Flight" },
      {
        name: "description",
        content: "Carry one part from the brief through materials, a check, a process, and a test. Then change it.",
      },
    ],
  }),
});

function Bay() {
  const runs = useForge((s) => s.runs);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useForge.persist.hasHydrated()) setReady(true);
    else return useForge.persist.onFinishHydration(() => setReady(true));
  }, []);
  return (
    <main className="forge min-h-dvh bg-hangar text-bone">
      <header className="border-b border-line-forge px-5 py-4">
        <p className="font-forge text-sm tracking-wide text-brass">Hangar bay</p>
        <h1 className="font-forge mt-1 text-4xl tracking-tight">Forge & Flight</h1>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <p className="max-w-prose text-sm leading-relaxed text-dust">
          One artifact, one loop. Read the brief, shape it, give it a material, run the check, pick how it is made, then watch the test. A sealed note starts the next iteration. This is an educational model. It is not a clearance to build or fly anything.
        </p>
        <ul className="mt-8 space-y-3">
          {missions.map((mission) => {
            const open = ready && unlocked(runs, mission);
            const run = runs[mission.id];
            return (
              <li key={mission.id} className="rounded-lg border border-line-forge bg-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-forge text-2xl">{mission.title}</h2>
                    <p className="mt-1 text-sm text-dust">
                      {mission.locked
                        ? "Not on the floor yet."
                        : open
                          ? run
                            ? `Iteration ${run.iteration}${run.sealedCount ? ` · ${run.sealedCount} sealed` : ""}`
                            : "Open"
                          : "Opens after three sealed glider iterations at 70 or better."}
                    </p>
                  </div>
                  {open ? (
                    <Link
                      to="/mission/$missionId"
                      params={{ missionId: mission.id }}
                      className="inline-flex min-h-11 items-center rounded-lg bg-brass px-4 text-sm text-brass-ink"
                    >
                      Open
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-11 items-center gap-2 text-sm text-dust">
                      <Lock className="size-4" aria-hidden />
                      Locked
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
