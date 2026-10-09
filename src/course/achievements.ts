import { create } from "zustand";
import { persist } from "zustand/middleware";
import { playBadgeUnlock } from "../lib/audio.ts";

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: "Flight & Aerodynamics" | "Structures & Materials" | "Manufacturing & DFM" | "Curriculum Mastery";
  iconName: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_flight",
    title: "Flight Pioneer",
    description: "Executed your first virtual flight test on the mission bench.",
    category: "Flight & Aerodynamics",
    iconName: "PlaneTakeoff",
  },
  {
    id: "aero_stability",
    title: "Aerodynamic Master",
    description: "Achieved a golden static margin (0.10–0.20) on a passing glider design.",
    category: "Flight & Aerodynamics",
    iconName: "Wind",
  },
  {
    id: "featherspar",
    title: "Featherweight Spar",
    description: "Passed glider constraints with total vehicle mass under 38g.",
    category: "Structures & Materials",
    iconName: "Feather",
  },
  {
    id: "dfm_pro",
    title: "Precision Fabricator",
    description: "Achieved a perfect 100/100 DFM score on a manufactured part.",
    category: "Manufacturing & DFM",
    iconName: "Cpu",
  },
  {
    id: "materials_master",
    title: "Materials Alchemist",
    description: "Passed all lessons in the Materials Science & Selection track.",
    category: "Structures & Materials",
    iconName: "Layers",
  },
  {
    id: "capstone_pass",
    title: "Grand Aerospace Engineer",
    description: "Passed the comprehensive Capstone evaluation.",
    category: "Curriculum Mastery",
    iconName: "Award",
  },
  {
    id: "full_seal",
    title: "Master Aeronaut",
    description: "Sealed 3 distinct iterations with 70%+ reflection score.",
    category: "Curriculum Mastery",
    iconName: "Trophy",
  },
];

interface AchievementState {
  unlockedBadges: string[];
  newlyUnlocked: string | null;
  unlockBadge: (badgeId: string) => void;
  clearNewlyUnlocked: () => void;
}

export const useAchievements = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedBadges: [],
      newlyUnlocked: null,
      unlockBadge: (badgeId: string) => {
        const { unlockedBadges } = get();
        if (!unlockedBadges.includes(badgeId)) {
          set({
            unlockedBadges: [...unlockedBadges, badgeId],
            newlyUnlocked: badgeId,
          });
          playBadgeUnlock();
        }
      },
      clearNewlyUnlocked: () => set({ newlyUnlocked: null }),
    }),
    {
      name: "forge-achievements",
    },
  ),
);
