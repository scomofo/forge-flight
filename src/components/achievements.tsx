import { useEffect } from "react";
import { BADGES, useAchievements, type Badge } from "@/course/achievements";
import { Award, Cpu, Feather, Layers, PlaneTakeoff, Trophy, Wind, X } from "lucide-react";

const ICON_MAP: Record<string, typeof Award> = {
  PlaneTakeoff,
  Wind,
  Feather,
  Cpu,
  Layers,
  Award,
  Trophy,
};

export function AchievementToast() {
  const newlyUnlocked = useAchievements((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievements((s) => s.clearNewlyUnlocked);

  useEffect(() => {
    if (newlyUnlocked) {
      const timer = setTimeout(() => {
        clearNewlyUnlocked();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, clearNewlyUnlocked]);

  if (!newlyUnlocked) return null;

  const badge = BADGES.find((b) => b.id === newlyUnlocked);
  if (!badge) return null;

  const IconComponent = ICON_MAP[badge.iconName] || Award;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-xl border border-brass/50 bg-panel/95 p-4 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brass/20 text-brass">
        <IconComponent className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-forge text-xs uppercase tracking-wider text-brass">Achievement Unlocked!</p>
        <h4 className="font-forge text-base text-bone">{badge.title}</h4>
        <p className="line-clamp-2 text-xs text-dust">{badge.description}</p>
      </div>
      <button
        type="button"
        onClick={clearNewlyUnlocked}
        className="rounded-md p-1 text-dust hover:text-bone"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function BadgesShelf() {
  const unlockedBadges = useAchievements((s) => s.unlockedBadges);

  return (
    <section className="rounded-xl border border-line-forge bg-panel p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-line-forge/60 pb-3">
        <div>
          <p className="font-forge text-xs tracking-wider uppercase text-brass">Recognition & Badges</p>
          <h3 className="font-forge text-xl text-bone">Engineering Milestones</h3>
        </div>
        <div className="rounded-full bg-brass/10 px-3 py-1 font-mono text-xs text-brass border border-brass/30">
          {unlockedBadges.length} / {BADGES.length} Unlocked
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          const IconComponent = ICON_MAP[badge.iconName] || Award;
          return (
            <div
              key={badge.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${
                isUnlocked
                  ? "border-brass/40 bg-brass/5 text-bone shadow-sm"
                  : "border-line-forge/50 bg-panel/40 text-dust/60 opacity-60"
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                  isUnlocked ? "bg-brass text-brass-ink shadow-md" : "bg-panel-2 text-dust/40 border border-line-forge"
                }`}
              >
                <IconComponent className="size-5" />
              </div>
              <div>
                <h4 className={`font-forge text-sm ${isUnlocked ? "text-bone" : "text-dust"}`}>
                  {badge.title}
                </h4>
                <p className="mt-0.5 text-xs text-dust leading-snug">{badge.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
