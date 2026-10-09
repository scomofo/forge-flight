import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Rocket, Award } from "lucide-react";
import { missions } from "@/forge/content/catalog";
import { unlocked, useForge } from "@/forge/store";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SkillRadar } from "@/components/analytics";
import { BadgesShelf, AchievementToast } from "@/components/achievements";
import { playClick } from "@/lib/audio";

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
    const init = () => {
      useForge.getState().ensure("glider");
      setReady(true);
    };
    if (useForge.persist.hasHydrated()) init();
    else return useForge.persist.onFinishHydration(init);
  }, []);

  return (
    <div className="forge min-h-dvh bg-hangar text-bone">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-8">
        <header className="border-b border-line-forge/80 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-forge text-xs uppercase tracking-widest text-brass">Aviation Laboratory & Workbench</p>
              <h1 className="font-forge mt-1 text-4xl sm:text-5xl tracking-tight text-bone">Forge & Flight</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dust">
                Design and virtual flight testing environment. Shape artifacts, evaluate material properties, simulate structural & aerodynamic loads, pick shop processes, and run real-time virtual flight tests.
              </p>
            </div>
            <Link
              to="/learn"
              onClick={playClick}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-brass/40 bg-panel px-4 text-sm font-forge text-brass hover:bg-brass hover:text-brass-ink transition-all shadow-sm"
            >
              <Award className="size-4" />
              <span>Full Curriculum</span>
            </Link>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-8">
            <section>
              <h2 className="font-forge text-xl text-bone mb-4 flex items-center gap-2">
                <Rocket className="size-5 text-brass" />
                <span>Active Mission Hangar Bays</span>
              </h2>
              <ul className="space-y-4">
                {missions.map((mission) => {
                  const open = ready && unlocked(runs, mission);
                  const run = runs[mission.id];
                  return (
                    <li key={mission.id} className="rounded-xl border border-line-forge bg-panel p-5 shadow-lg transition-all hover:border-brass/30">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-forge text-2xl text-bone">{mission.title}</h3>
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
                            onClick={playClick}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brass px-5 text-sm font-medium text-brass-ink hover:brightness-110 transition-all shadow-md"
                          >
                            <span>Open Bench</span>
                          </Link>
                        ) : (
                          <span className="inline-flex min-h-11 items-center gap-2 text-sm text-dust bg-panel-2 px-3 rounded-lg border border-line-forge/40">
                            <Lock className="size-4" aria-hidden />
                            Locked
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <BadgesShelf />
          </div>

          <aside className="space-y-6">
            <SkillRadar />
          </aside>
        </div>
      </main>
      <AchievementToast />
    </div>
  );
}
