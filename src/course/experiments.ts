/**
 * Engineering 101, Week 27 — experiment design and small-sample statistics.
 *
 * Pure, testable logic: descriptive statistics for small samples, the
 * Student-t 95% confidence interval, Grubbs-style outlier screening,
 * ordinary least-squares fits with parameter uncertainty, and the
 * arithmetic behind factorial experiment plans (runs, randomization,
 * blocking, center points).
 *
 * All values are classroom-grade closed forms; t and Grubbs critical values
 * are pinned from standard statistical tables.
 */

export function mean(xs: number[]): number {
  if (xs.length === 0) throw new Error("mean of empty sample");
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (Bessel's correction, n − 1). Spread of the data. */
export function sampleStd(xs: number[]): number {
  if (xs.length < 2) throw new Error("sampleStd needs at least 2 points");
  const m = mean(xs);
  const ss = xs.reduce((a, x) => a + (x - m) * (x - m), 0);
  return Math.sqrt(ss / (xs.length - 1));
}

/** Standard error of the mean. Wobble of the average, not the data. */
export function stdError(xs: number[]): number {
  return sampleStd(xs) / Math.sqrt(xs.length);
}

/** Two-sided 95% Student-t critical values (0.975 quantile), df 1..30. */
export const T_CRITICAL_95: Record<number, number> = {
  1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365,
  8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145,
  15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.08,
  22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048,
  29: 2.045, 30: 2.042,
};

export function tCritical95(df: number): number {
  if (df < 1) throw new Error("df must be >= 1");
  return df <= 30 ? T_CRITICAL_95[df] : 1.96;
}

export type ConfidenceInterval = {
  mean: number;
  std: number;
  se: number;
  df: number;
  t: number;
  halfWidth: number;
  lo: number;
  hi: number;
};

/** 95% confidence interval for the mean of a small sample. */
export function confidenceInterval95(xs: number[]): ConfidenceInterval {
  if (xs.length < 2) throw new Error("confidenceInterval95 needs at least 2 points");
  const m = mean(xs);
  const s = sampleStd(xs);
  const se = s / Math.sqrt(xs.length);
  const df = xs.length - 1;
  const t = tCritical95(df);
  const halfWidth = t * se;
  return { mean: m, std: s, se, df, t, halfWidth, lo: m - halfWidth, hi: m + halfWidth };
}

/**
 * Grubbs-style outlier score for one suspect point: |x − mean| / s.
 * Compare against grubbsCritical(n); exceeding it is grounds to
 * *investigate*, not an automatic deletion.
 */
export function grubbsScore(xs: number[], suspect: number): number {
  return Math.abs(suspect - mean(xs)) / sampleStd(xs);
}

/** Two-sided Grubbs critical values, alpha = 0.05, for n = 3..12. */
export const GRUBBS_CRITICAL_05: Record<number, number> = {
  3: 1.155, 4: 1.481, 5: 1.715, 6: 1.887, 7: 2.02, 8: 2.127,
  9: 2.215, 10: 2.29, 11: 2.355, 12: 2.412,
};

export function grubbsCritical(n: number): number | null {
  return GRUBBS_CRITICAL_05[n] ?? null;
}

export type LinearFit = {
  n: number;
  slope: number;
  intercept: number;
  r2: number;
  seSlope: number;
  seIntercept: number;
  residuals: number[];
};

/** Ordinary least-squares line y = slope * x + intercept, with standard errors. */
export function linearFit(x: number[], y: number[]): LinearFit {
  if (x.length !== y.length) throw new Error("x and y must have equal length");
  if (x.length < 3) throw new Error("linearFit needs at least 3 points");
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  const sxx = x.reduce((a, xi) => a + (xi - mx) * (xi - mx), 0);
  if (sxx === 0) throw new Error("x has no spread");
  const sxy = x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const residuals = x.map((xi, i) => y[i] - (slope * xi + intercept));
  const ssRes = residuals.reduce((a, r) => a + r * r, 0);
  const ssTot = y.reduce((a, yi) => a + (yi - my) * (yi - my), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  const s2 = ssRes / (n - 2);
  const seSlope = Math.sqrt(s2 / sxx);
  const seIntercept = Math.sqrt(s2 * (1 / n + (mx * mx) / sxx));
  return { n, slope, intercept, r2, seSlope, seIntercept, residuals };
}

/** Recover g from a T^2-vs-L pendulum fit: g = 4*pi^2 / slope. */
export function gravityFromSlope(slope: number): number {
  return (4 * Math.PI * Math.PI) / slope;
}

// ---------------------------------------------------------------------------
// Factorial experiment plans.
// ---------------------------------------------------------------------------

export type Fraction = "full" | "half";

/** Number of corner runs for a 2^k design (half fraction needs k >= 2... but allow 2). */
export function factorialRuns(k: number, fraction: Fraction): number {
  if (k < 2) throw new Error("factorial design needs at least 2 factors");
  if (fraction === "half" && k < 3)
    throw new Error("half fraction needs at least 3 factors to keep main effects clear");
  return fraction === "full" ? 2 ** k : 2 ** (k - 1);
}

/** What a center-point replicate detects. */
export function centerPointPurpose(): string {
  return "Center points sit at the middle of every factor range. If their mean falls off the plane the corners define, the response curves — a straight-line model is dishonest and the design needs axial points or a quadratic term.";
}

/** Seeded shuffle of run indices; generic over the run payload so the caller
 *  can carry labels. Returns the permutation of indices. */
export function randomizedOrder<T>(runs: T[], seed: number): number[] {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 1664525 * s + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const order = runs.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return order;
}

export type PlanSummary = {
  factors: string[];
  levels: string[][];
  cornerRuns: number;
  centerReplicates: number;
  totalRuns: number;
  blocks: string | null;
};

/** Summarize a plan: factors, levels, corner runs, center replicates, blocks. */
export function planSummary(opts: {
  factors: string[];
  levels: string[][];
  fraction: Fraction;
  centerReplicates: number;
  blockOn?: string;
}): PlanSummary {
  const k = opts.factors.length;
  if (k !== opts.levels.length) throw new Error("each factor needs its level list");
  for (const lv of opts.levels) {
    if (lv.length !== 2) throw new Error("2^k designs need exactly 2 levels per factor");
  }
  const cornerRuns = factorialRuns(k, opts.fraction);
  return {
    factors: opts.factors,
    levels: opts.levels,
    cornerRuns,
    centerReplicates: opts.centerReplicates,
    totalRuns: cornerRuns + opts.centerReplicates,
    blocks: opts.blockOn ?? null,
  };
}

/** Main effect of a factor from corner means: (mean at +) − (mean at −), halved. */
export function mainEffect(meanAtPlus: number, meanAtMinus: number): number {
  return (meanAtPlus - meanAtMinus) / 2;
}
