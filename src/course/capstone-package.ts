import type { CapScores, CapSection } from "./capstone.ts";

export const PACKAGE_STORE = "ff:cappackage-w30";

export type PackageState = {
  text: Record<CapSection, string>;
  scores: CapScores;
};

type PackageStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export function emptyPackage(): PackageState {
  return {
    text: { requirement: "", model: "", test: "", mismatch: "", revision: "" },
    scores: { requirement: 0, model: 0, test: 0, mismatch: 0, revision: 0 },
  };
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

/** Preserve written evidence; never accept a score for an empty section. */
export function normalizePackage(value: unknown): PackageState {
  const out = emptyPackage();
  const input = record(value);
  const text = record(input.text);
  const scores = record(input.scores);
  for (const key of Object.keys(out.text) as CapSection[]) {
    const written = text[key];
    out.text[key] = typeof written === "string" ? written : "";
    const score = scores[key];
    out.scores[key] = out.text[key].trim() && (score === 1 || score === 2) ? score : 0;
  }
  return out;
}

/** An edited section needs a fresh self-assessment, not its old score. */
export function editPackageText(state: PackageState, key: CapSection, text: string): PackageState {
  const next = normalizePackage(state);
  if (next.text[key] !== text) next.scores[key] = 0;
  next.text[key] = text;
  return next;
}

export function scorePackageSection(state: PackageState, key: CapSection, score: 0 | 1 | 2): PackageState {
  const next = normalizePackage(state);
  next.scores[key] = next.text[key].trim() && (score === 1 || score === 2) ? score : 0;
  return next;
}

/** Storage is optional so SSR and restricted/private browsing remain usable. */
export function loadPackage(storage?: Pick<PackageStorage, "getItem">): PackageState {
  try {
    const store = storage ?? (typeof localStorage === "undefined" ? undefined : localStorage);
    const raw = store?.getItem(PACKAGE_STORE);
    return raw ? normalizePackage(JSON.parse(raw)) : emptyPackage();
  } catch {
    return emptyPackage();
  }
}

export function savePackage(state: PackageState, storage?: Pick<PackageStorage, "setItem">): boolean {
  try {
    const store = storage ?? (typeof localStorage === "undefined" ? undefined : localStorage);
    if (!store) return false;
    store.setItem(PACKAGE_STORE, JSON.stringify(normalizePackage(state)));
    return true;
  } catch {
    return false;
  }
}
