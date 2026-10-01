import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  completed: Record<string, number>;
  lastKey: string | null;
  /** Last diagnostic placement: topic -> correct count. Persisted separately from lesson completion. */
  placement: Record<string, number> | null;
  /**
   * Whether the capstone design package currently passes its rubric gate.
   * This is the capstone's completion signal — distinct from the lesson quiz
   * score, which only records recognition questions.
   */
  capstonePass: boolean;
  /**
   * Practical evidence, per lesson: the learner explicitly marked the bench
   * work done on the Try tab. This is the learner's own call — nothing here
   * checks their work — and it is recorded separately from the quiz score.
   */
  practical: Record<string, boolean>;
  hydrated: boolean;
  mark: (key: string, correct: number) => void;
  visit: (key: string) => void;
  savePlacement: (scores: Record<string, number>) => void;
  setCapstonePass: (pass: boolean) => void;
  markPractical: (key: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      lastKey: null,
      placement: null,
      capstonePass: false,
      practical: {},
      hydrated: false,
      mark: (key, correct) =>
        set((s) => ({
          completed: {
            ...s.completed,
            [key]: Math.max(correct, s.completed[key] ?? 0),
          },
        })),
      visit: (key) => set({ lastKey: key }),
      savePlacement: (scores) => set({ placement: { ...scores } }),
      setCapstonePass: (pass) => set({ capstonePass: pass }),
      markPractical: (key) =>
        set((s) => ({
          practical: { ...s.practical, [key]: true },
        })),
      reset: () => set({ completed: {}, lastKey: null, placement: null, capstonePass: false, practical: {} }),
    }),
    {
      name: "axiom-progress",
      skipHydration: true,
      partialize: (s) => ({
        completed: s.completed,
        lastKey: s.lastKey,
        placement: s.placement,
        capstonePass: s.capstonePass,
        practical: s.practical,
      }),
      onRehydrateStorage: () => () => {
        useProgress.setState({ hydrated: true });
      },
    },
  ),
);

export function ProgressHydrator() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);
  return null;
}
