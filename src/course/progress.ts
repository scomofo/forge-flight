import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProgressState = {
  completed: Record<string, number>;
  lastKey: string | null;
  hydrated: boolean;
  mark: (key: string, correct: number) => void;
  visit: (key: string) => void;
  reset: () => void;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      lastKey: null,
      hydrated: false,
      mark: (key, correct) =>
        set((s) => ({
          completed: {
            ...s.completed,
            [key]: Math.max(correct, s.completed[key] ?? 0),
          },
        })),
      visit: (key) => set({ lastKey: key }),
      reset: () => set({ completed: {}, lastKey: null }),
    }),
    {
      name: "axiom-progress",
      skipHydration: true,
      partialize: (s) => ({ completed: s.completed, lastKey: s.lastKey }),
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
