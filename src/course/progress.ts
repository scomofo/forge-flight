import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { capstoneGate } from "./capstone.ts";
import { loadPackage, PACKAGE_STORE } from "./capstone-package.ts";

type ProgressState = {
  completed: Record<string, number>;
  lastKey: string | null;
  /** Last diagnostic placement: topic -> correct count. Persisted separately from lesson completion. */
  placement: Record<string, number> | null;
  /** Derived from the current written package and its self-scores, never a persisted authority. */
  capstonePass: boolean;
  /** Learner-marked bench work, not an independent assessment. */
  practical: Record<string, boolean>;
  hydrated: boolean;
  mark: (key: string, correct: number) => void;
  visit: (key: string) => void;
  savePlacement: (scores: Record<string, number>) => void;
  setCapstonePass: (pass: boolean) => void;
  markPractical: (key: string) => void;
  reset: () => void;
};

function savedPackagePass() {
  return capstoneGate(loadPackage().scores).pass;
}

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
      // Reset tracking, not the separately saved written package. Clearing that
      // evidence is an explicit, confirmed action in the capstone bench.
      reset: () => set({ completed: {}, lastKey: null, placement: null, capstonePass: savedPackagePass(), practical: {} }),
    }),
    {
      name: "axiom-progress",
      skipHydration: true,
      // Keep tracking usable in memory when storage is blocked or full. The
      // capstone bench separately reports whether its written evidence saved.
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try { return localStorage.getItem(name); } catch { return null; }
        },
        setItem: (name, value) => {
          try { localStorage.setItem(name, value); } catch { /* in-memory only */ }
        },
        removeItem: (name) => {
          try { localStorage.removeItem(name); } catch { /* storage unavailable */ }
        },
      })),
      partialize: (s) => ({
        completed: s.completed,
        lastKey: s.lastKey,
        placement: s.placement,
        practical: s.practical,
      }),
      onRehydrateStorage: () => () => {
        // Ignore legacy cached completion, even when the bench is not mounted.
        useProgress.setState({ hydrated: true, capstonePass: savedPackagePass() });
      },
    },
  ),
);

export function ProgressHydrator() {
  useEffect(() => {
    void useProgress.persist.rehydrate();
    const sync = (event: StorageEvent) => {
      if (event.key === PACKAGE_STORE || event.key === null) {
        // Refresh other progress before publishing derived completion: this
        // tab may have an older quiz/placement snapshot than the writing tab.
        void useProgress.persist.rehydrate();
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return null;
}
