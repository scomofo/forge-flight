/**
 * Engineering 101, Week 22 — measurement uncertainty and error propagation.
 *
 * Pure, testable logic: first-order propagation of input uncertainties through
 * a scalar model, worst-case vs root-sum-square combination, normalized
 * sensitivities, variance-share ranking, and a seeded Monte Carlo sanity
 * check. No UI here; the benches import these functions.
 */

/** One measured input: nominal value and its ± uncertainty, same units. */
export type Uncertain = { nominal: number; unc: number };

function relStep(x: number): number {
  const ax = Math.abs(x);
  return 1e-6 * (ax > 1e-12 ? ax : 1e-12);
}

/** Central-difference partial derivative of f with respect to input i. */
export function partial(f: (xs: number[]) => number, xs: number[], i: number): number {
  const h = relStep(xs[i]);
  const xp = xs.slice();
  xp[i] += h;
  const xm = xs.slice();
  xm[i] -= h;
  return (f(xp) - f(xm)) / (2 * h);
}

export function partials(f: (xs: number[]) => number, xs: number[]): number[] {
  return xs.map((_, i) => partial(f, xs, i));
}

/**
 * Worst-case combination: every error conspires in the same direction.
 * u_y = Σ |∂f/∂xᵢ| · uᵢ. This is the number you can sign a contract on.
 */
export function worstCase(f: (xs: number[]) => number, xs: Uncertain[]): number {
  const nom = xs.map((x) => x.nominal);
  return partials(f, nom).reduce((s, d, i) => s + Math.abs(d) * xs[i].unc, 0);
}

/**
 * Root-sum-square combination for independent random errors.
 * u_y = √( Σ (∂f/∂xᵢ · uᵢ)² ). This is the scatter you should expect.
 */
export function rss(f: (xs: number[]) => number, xs: Uncertain[]): number {
  const nom = xs.map((x) => x.nominal);
  const terms = partials(f, nom).map((d, i) => d * xs[i].unc);
  return Math.sqrt(terms.reduce((s, t) => s + t * t, 0));
}

/** Fraction of the RSS variance owned by each input. Sums to 1. */
export function varianceShares(f: (xs: number[]) => number, xs: Uncertain[]): number[] {
  const nom = xs.map((x) => x.nominal);
  const sq = partials(f, nom).map((d, i) => (d * xs[i].unc) ** 2);
  const total = sq.reduce((s, t) => s + t, 0);
  if (total <= 0) return sq.map(() => 0);
  return sq.map((t) => t / total);
}

/** Index of the input owning the largest variance share — the upgrade target. */
export function dominantIndex(f: (xs: number[]) => number, xs: Uncertain[]): number {
  const shares = varianceShares(f, xs);
  let best = 0;
  shares.forEach((s, i) => {
    if (s > shares[best]) best = i;
  });
  return best;
}

/**
 * Normalized sensitivities Sᵢ = (xᵢ/y)·(∂y/∂xᵢ): the percent the output moves
 * per percent the input moves. Sign is kept — stiffness-like inputs go
 * negative (more stiffness, less deflection). Scale-invariant: nominals of 1
 * give the exact exponents of a power-law model.
 */
export function normalizedSensitivities(f: (xs: number[]) => number, xs: number[]): number[] {
  const y = f(xs);
  if (y === 0) return xs.map(() => 0);
  return partials(f, xs).map((d, i) => (xs[i] / y) * d);
}

/** Deterministic PRNG (mulberry32) so the Monte Carlo check is reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Monte Carlo sanity check: sample each input uniformly over
 * [nominal − unc, nominal + unc] and return the sample standard deviation of
 * the output. For a near-linear model this lands near rss(f, xs) / √3 — the
 * √3 converts a stated ± bound into the standard deviation of a uniform
 * distribution. A large disagreement means the linear approximation is
 * breaking down (or a bug is hiding in the model).
 */
export function monteCarloStd(
  f: (xs: number[]) => number,
  xs: Uncertain[],
  n: number,
  seed: number,
): number {
  const rand = mulberry32(seed);
  let mean = 0;
  let m2 = 0;
  for (let k = 1; k <= n; k++) {
    const sample = xs.map((x) => x.nominal + (rand() * 2 - 1) * x.unc);
    const y = f(sample);
    const delta = y - mean;
    mean += delta / k;
    m2 += delta * (y - mean);
  }
  return Math.sqrt(m2 / (n - 1));
}

/** The Week 22 worked example: thrust from chamber pressure and throat area, SI in/out. */
export function thrustSI([pPa, dM]: number[]): number {
  return pPa * Math.PI * (dM / 2) ** 2;
}

/* ------------------------------------------------------------------ */
/* Measurement chains for the error-budget bench.                      */
/* ------------------------------------------------------------------ */

export type ChainLink = {
  id: string;
  label: string;
  unit: string;
  nominal: number;
  minUnc: number;
  maxUnc: number;
  step: number;
  defaultUnc: number;
  decimals: number;
};

export type Chain = {
  id: string;
  name: string;
  blurb: string;
  resultUnit: string;
  resultDecimals: number;
  links: ChainLink[];
  /** SI (or stated-unit) result from link values in their stated units. */
  evaluate: (vals: number[]) => number;
};

export const chains: Chain[] = [
  {
    id: "thrust",
    name: "Thrust rig",
    blurb: "F = p·A from chamber pressure and throat diameter.",
    resultUnit: "N",
    resultDecimals: 0,
    links: [
      { id: "p", label: "Pressure", unit: "MPa", nominal: 10.0, minUnc: 0.02, maxUnc: 0.5, step: 0.01, defaultUnc: 0.1, decimals: 2 },
      { id: "d", label: "Throat diameter", unit: "mm", nominal: 50.0, minUnc: 0.02, maxUnc: 0.5, step: 0.01, defaultUnc: 0.1, decimals: 2 },
    ],
    evaluate: ([pMPa, dMm]) => pMPa * 1e6 * Math.PI * ((dMm * 1e-3) / 2) ** 2,
  },
  {
    id: "straingage",
    name: "Strain-gauge force",
    blurb: "F = E·ε·A on an instrumented steel bar.",
    resultUnit: "N",
    resultDecimals: 0,
    links: [
      { id: "E", label: "Young's modulus", unit: "GPa", nominal: 200, minUnc: 1, maxUnc: 8, step: 0.5, defaultUnc: 2, decimals: 1 },
      { id: "eps", label: "Strain", unit: "µε", nominal: 1000, minUnc: 5, maxUnc: 60, step: 1, defaultUnc: 10, decimals: 0 },
      { id: "d", label: "Bar diameter", unit: "mm", nominal: 25.0, minUnc: 0.02, maxUnc: 0.5, step: 0.01, defaultUnc: 0.05, decimals: 2 },
    ],
    evaluate: ([eGPa, epsMicro, dMm]) =>
      eGPa * 1e9 * epsMicro * 1e-6 * Math.PI * ((dMm * 1e-3) / 2) ** 2,
  },
  {
    id: "density",
    name: "Density",
    blurb: "ρ = m/V for an alloy coupon.",
    resultUnit: "g/cm³",
    resultDecimals: 3,
    links: [
      { id: "m", label: "Mass", unit: "g", nominal: 100.0, minUnc: 0.02, maxUnc: 0.5, step: 0.01, defaultUnc: 0.05, decimals: 2 },
      { id: "V", label: "Volume", unit: "mL", nominal: 12.5, minUnc: 0.02, maxUnc: 0.4, step: 0.01, defaultUnc: 0.05, decimals: 2 },
    ],
    evaluate: ([mG, vMl]) => mG / vMl,
  },
];

/* ------------------------------------------------------------------ */
/* Sensitivity explorer functions (scale-invariant; nominals of 1).    */
/* ------------------------------------------------------------------ */

export type SensFn = {
  id: string;
  name: string;
  formula: string;
  inputs: { id: string; label: string }[];
  evaluate: (xs: number[]) => number;
};

export const sensFunctions: SensFn[] = [
  {
    id: "thrust",
    name: "Thrust",
    formula: "F = p·A(d)",
    inputs: [
      { id: "p", label: "Pressure p" },
      { id: "d", label: "Diameter d" },
    ],
    evaluate: ([p, d]) => p * Math.PI * (d / 2) ** 2,
  },
  {
    id: "beam",
    name: "Beam deflection",
    formula: "δ = FL³/3EI",
    inputs: [
      { id: "F", label: "Load F" },
      { id: "L", label: "Length L" },
      { id: "E", label: "Modulus E" },
      { id: "I", label: "Inertia I" },
    ],
    evaluate: ([F, L, E, I]) => (F * L ** 3) / (3 * E * I),
  },
  {
    id: "hoop",
    name: "Hoop stress",
    formula: "σ = pr/t",
    inputs: [
      { id: "p", label: "Pressure p" },
      { id: "r", label: "Radius r" },
      { id: "t", label: "Wall t" },
    ],
    evaluate: ([p, r, t]) => (p * r) / t,
  },
];
