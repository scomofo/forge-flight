/**
 * Engineering 101, Week 28 — iteration & optimization: pure, testable logic.
 *
 * Trade studies (normalized weighted scoring, dominance, weight robustness),
 * parametric sweeps (one variable at a time), and convergence detection
 * (when the answer stops moving, you stop iterating).
 *
 * All arithmetic is deterministic; no UI here. Values are classroom-grade
 * and derived from the formulas the lessons teach.
 */

export type Direction = "max" | "min";

export type Criterion = {
  id: string;
  name: string;
  unit: string;
  direction: Direction;
  /** Relative importance; weights are renormalized, so only ratios matter. */
  weight: number;
};

export type Alternative = {
  id: string;
  name: string;
  /** Raw scores keyed by criterion id. Higher raw numbers are not
   *  automatically better — `direction` decides that. */
  scores: Record<string, number>;
};

export type ScoredAlternative = {
  id: string;
  name: string;
  /** Normalized 0..1 per criterion (1 = best observed). */
  normalized: Record<string, number>;
  total: number;
};

function criterionRange(alts: Alternative[], criterion: Criterion): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const a of alts) {
    const v = a.scores[criterion.id];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return [lo, hi];
}

/**
 * Min-max normalization per criterion across the alternatives.
 * "max" direction: best observed → 1, worst → 0.
 * "min" direction: lowest raw value → 1, highest → 0.
 * A degenerate criterion (all scores equal) scores 1 for everyone.
 */
export function normalizeScores(
  alts: Alternative[],
  criteria: Criterion[],
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const a of alts) {
    out[a.id] = {};
    for (const c of criteria) {
      const [lo, hi] = criterionRange(alts, c);
      const v = a.scores[c.id];
      if (!Number.isFinite(lo) || hi <= lo) {
        out[a.id][c.id] = 1;
        continue;
      }
      const t = c.direction === "max" ? (v - lo) / (hi - lo) : (hi - v) / (hi - lo);
      out[a.id][c.id] = Math.min(1, Math.max(0, t));
    }
  }
  return out;
}

function totalWeight(criteria: Criterion[]): number {
  return criteria.reduce((s, c) => s + c.weight, 0);
}

export function weightedTotal(normalized: Record<string, number>, criteria: Criterion[]): number {
  const w = totalWeight(criteria);
  if (w <= 0) return 0;
  return criteria.reduce((s, c) => s + (normalized[c.id] ?? 0) * (c.weight / w), 0);
}

/** Alternatives ranked best-first, with normalized scores and totals. */
export function rankAlternatives(alts: Alternative[], criteria: Criterion[]): ScoredAlternative[] {
  const norm = normalizeScores(alts, criteria);
  return alts
    .map((a) => ({
      id: a.id,
      name: a.name,
      normalized: norm[a.id],
      total: weightedTotal(norm[a.id], criteria),
    }))
    .sort((x, y) => y.total - x.total);
}

/** True when `a` is at least as good as `b` on every criterion and
 *  strictly better on at least one — a dominated alternative can be
 *  rejected without arguing about weights. */
export function dominates(
  a: Record<string, number>,
  b: Record<string, number>,
  criteria: Criterion[],
): boolean {
  let strictlyBetter = false;
  for (const c of criteria) {
    const av = a[c.id] ?? 0;
    const bv = b[c.id] ?? 0;
    if (av < bv) return false;
    if (av > bv) strictlyBetter = true;
  }
  return strictlyBetter;
}

/** Ids of alternatives dominated by at least one other alternative. */
export function dominatedAlternatives(alts: Alternative[], criteria: Criterion[]): string[] {
  const norm = normalizeScores(alts, criteria);
  return alts
    .filter((a) => alts.some((b) => b.id !== a.id && dominates(norm[b.id], norm[a.id], criteria)))
    .map((a) => a.id);
}

export type WeightMargin = {
  /** How far this criterion's weight can RISE (pp, 0..100) before the winner changes. */
  up: number;
  /** How far it can FALL before the winner changes. */
  down: number;
};

/**
 * Weight robustness: move one criterion's weight up and down (renormalizing
 * the rest), and report how far it travels before a different alternative
 * takes the lead. Infinity means "as far as the sweep checked" — the winner
 * is solid on this weight.
 */
export function weightFlipMargin(
  alts: Alternative[],
  criteria: Criterion[],
  criterionId: string,
  stepPp = 1,
  limitPp = 100,
): WeightMargin {
  const norm = normalizeScores(alts, criteria);
  const baseTotal = totalWeight(criteria);
  const target = criteria.find((c) => c.id === criterionId);
  if (!target || baseTotal <= 0) return { up: Infinity, down: Infinity };
  const winnerId = rankAlternatives(alts, criteria)[0]?.id;

  const winnerAt = (deltaPp: number): string | undefined => {
    const factor = (target.weight + deltaPp / 100) / target.weight;
    const scaled = criteria.map((c) =>
      c.id === criterionId ? { ...c, weight: Math.max(0, c.weight * factor) } : c,
    );
    const ranked = alts
      .map((a) => ({ id: a.id, total: weightedTotal(norm[a.id], scaled) }))
      .sort((x, y) => y.total - x.total);
    return ranked[0]?.id;
  };

  const scan = (dir: 1 | -1): number => {
    for (let d = stepPp; d <= limitPp; d += stepPp) {
      const w = winnerAt(dir * d);
      if (w !== winnerId) return d - stepPp;
    }
    return Infinity;
  };
  return { up: scan(1), down: scan(-1) };
}

// ---------------------------------------------------------------------------
// Parametric sweeps
// ---------------------------------------------------------------------------

export type SweepPoint = { x: number; y: number };

/** One-variable-at-a-time sweep of fn over [from, to] in n equal steps. */
export function sweep(fn: (x: number) => number, from: number, to: number, n: number): SweepPoint[] {
  const pts: SweepPoint[] = [];
  if (n < 1) return pts;
  for (let i = 0; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    pts.push({ x, y: fn(x) });
  }
  return pts;
}

export function argMin(pts: SweepPoint[]): SweepPoint | undefined {
  if (pts.length === 0) return undefined;
  return pts.reduce((best, p) => (p.y < best.y ? p : best));
}

export function argMax(pts: SweepPoint[]): SweepPoint | undefined {
  if (pts.length === 0) return undefined;
  return pts.reduce((best, p) => (p.y > best.y ? p : best));
}

/** Index of the first point satisfying `predicate`, or -1. */
export function firstPassingIndex(pts: SweepPoint[], predicate: (p: SweepPoint) => boolean): number {
  return pts.findIndex(predicate);
}

/**
 * Convergence test: true when the last `n` consecutive relative changes
 * are all smaller than `tol`. The answer has stopped moving — iterate
 * further only if the requirement, not curiosity, demands it.
 */
export function hasConverged(values: number[], tol: number, n: number): boolean {
  if (n < 1 || values.length < n + 1) return false;
  for (let i = values.length - n; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    const denom = Math.abs(curr) > 0 ? Math.abs(curr) : 1;
    if (Math.abs(curr - prev) / denom >= tol) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Worked case: cantilever beam depth sweep (Week 28, lesson 2–3)
// ---------------------------------------------------------------------------

export const BEAM_CASE = {
  forceN: 200,
  lengthM: 1.0,
  widthM: 0.04,
  modulusPa: 70e9,
  densityKgM3: 2700,
  deflectionLimitM: 0.002,
  /** Minimal whole-mm depth (test-pinned) satisfying the 2 mm limit. */
  answerDepthMm: 53,
};

/** Tip deflection of the cantilever, meters, for a rectangular section of depth hMm. */
export function beamDeflectionM(hMm: number): number {
  const h = hMm / 1000;
  const I = (BEAM_CASE.widthM * h ** 3) / 12;
  return (BEAM_CASE.forceN * BEAM_CASE.lengthM ** 3) / (3 * BEAM_CASE.modulusPa * I);
}

/** Mass of the 1 m beam, kg. */
export function beamMassKg(hMm: number): number {
  return BEAM_CASE.densityKgM3 * BEAM_CASE.widthM * (hMm / 1000) * BEAM_CASE.lengthM;
}

// ---------------------------------------------------------------------------
// Worked case: tow-hook bracket trade study (Week 28, lesson 1)
// ---------------------------------------------------------------------------

export const BRACKET_CRITERIA: Criterion[] = [
  { id: "mass", name: "Mass", unit: "g", direction: "min", weight: 0.3 },
  { id: "cost", name: "Cost", unit: "$", direction: "min", weight: 0.25 },
  { id: "stiffness", name: "Stiffness", unit: "/10", direction: "max", weight: 0.2 },
  { id: "lead", name: "Lead time", unit: "days", direction: "min", weight: 0.15 },
  { id: "confidence", name: "Confidence", unit: "/10", direction: "max", weight: 0.1 },
];

export const BRACKET_ALTERNATIVES: Alternative[] = [
  {
    id: "cnc",
    name: "CNC aluminum",
    scores: { mass: 85, cost: 140, stiffness: 9, lead: 12, confidence: 9 },
  },
  {
    id: "cfrp",
    name: "CFRP layup",
    scores: { mass: 45, cost: 220, stiffness: 10, lead: 20, confidence: 6 },
  },
  {
    id: "nylon",
    name: "Printed nylon",
    scores: { mass: 60, cost: 25, stiffness: 4, lead: 2, confidence: 7 },
  },
  {
    id: "steel",
    name: "Steel weldment",
    scores: { mass: 160, cost: 60, stiffness: 8, lead: 8, confidence: 8 },
  },
];

/** Baseline winner of the bracket study (test-pinned). */
export const BRACKET_WINNER_ID = "nylon";
