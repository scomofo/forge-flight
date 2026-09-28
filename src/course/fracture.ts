/**
 * Materials 101, Week 16 — fracture, fatigue & creep: pure mechanics.
 *
 * SI units throughout: stress in Pa, crack half-length in m, stress
 * intensity in Pa√m, temperature in K, Larson-Miller time in hours.
 * No UI here — everything is unit-testable.
 */

/** Local stress at a notch root: the nominal stress multiplied by K_t. */
export function stressConcentration(kt: number, nominal: number): number {
  return kt * nominal;
}

/**
 * Mode-I stress intensity for a crack of half-length `a`.
 * Y defaults to 1 (center crack in an infinite plate); pass the geometry
 * factor for edge cracks, holes, and other configurations.
 */
export function stressIntensity(sigma: number, a: number, Y = 1): number {
  return Y * sigma * Math.sqrt(Math.PI * a);
}

/** Critical crack half-length: the size at which K reaches K_IC at stress sigma. */
export function criticalCrackSize(kic: number, sigma: number, Y = 1): number {
  const ratio = kic / (Y * sigma);
  return (ratio * ratio) / Math.PI;
}

/** Critical stress: the stress that drives a crack of half-length `a` to K_IC. */
export function criticalStress(kic: number, a: number, Y = 1): number {
  return kic / (Y * Math.sqrt(Math.PI * a));
}

/**
 * Griffith fracture stress from the energy balance: the elastic strain
 * energy released by extending the crack pays for the new surface.
 * E in Pa, gamma (surface energy) in J/m², a in m.
 */
export function griffithStress(E: number, gamma: number, a: number): number {
  return Math.sqrt((2 * E * gamma) / (Math.PI * a));
}

/**
 * Basquin's law: cycles to failure at stress amplitude sigmaA.
 * sigmaFPrime (fatigue strength coefficient) in Pa, b negative (≈ −0.05…−0.12).
 */
export function basquinLife(sigmaA: number, sigmaFPrime: number, b: number): number {
  return 0.5 * Math.pow(sigmaA / sigmaFPrime, 1 / b);
}

/** Basquin's law inverted: allowable stress amplitude for N cycles. */
export function basquinStress(N: number, sigmaFPrime: number, b: number): number {
  return sigmaFPrime * Math.pow(2 * N, b);
}

/**
 * Miner's rule: cumulative damage from load blocks.
 * Each block is [applied cycles, life at that stress level]; failure is
 * predicted when the sum reaches 1.
 */
export function minersDamage(blocks: ReadonlyArray<readonly [number, number]>): number {
  return blocks.reduce((sum, [n, N]) => sum + n / N, 0);
}

export type ParisResult = {
  aFinal: number;
  fractured: boolean;
  /** Cycles elapsed when K_max first reached K_IC, or null if it never did. */
  cyclesToFracture: number | null;
};

/**
 * Paris-law crack growth: integrates da/dN = C·(ΔK)^m with
 * ΔK = Y·Δσ·√(πa), checking K_max = Y·σ_max·√(πa) against K_IC each step.
 * C in (m/cycle)/(Pa√m)^m, stresses in Pa, lengths in m.
 */
export function parisGrowth(opts: {
  a0: number;
  C: number;
  m: number;
  deltaSigma: number;
  sigmaMax: number;
  kic: number;
  Y?: number;
  cycles: number;
  steps?: number;
}): ParisResult {
  const Y = opts.Y ?? 1;
  const steps = Math.max(1, Math.floor(opts.steps ?? 1000));
  const dN = opts.cycles / steps;
  let a = opts.a0;
  for (let i = 0; i < steps; i++) {
    const kMax = Y * opts.sigmaMax * Math.sqrt(Math.PI * a);
    if (kMax >= opts.kic) {
      return { aFinal: a, fractured: true, cyclesToFracture: i * dN };
    }
    const dK = Y * opts.deltaSigma * Math.sqrt(Math.PI * a);
    a += opts.C * Math.pow(dK, opts.m) * dN;
  }
  const kMax = Y * opts.sigmaMax * Math.sqrt(Math.PI * a);
  if (kMax >= opts.kic) {
    return { aFinal: a, fractured: true, cyclesToFracture: opts.cycles };
  }
  return { aFinal: a, fractured: false, cyclesToFracture: null };
}

/**
 * Larson-Miller parameter: P = T·(C + log₁₀ t_r), T in kelvin, t_r in
 * hours, C = 20 for most alloys. One number collapses time and temperature.
 */
export function larsonMiller(T: number, tHours: number, C = 20): number {
  return T * (C + Math.log10(tHours));
}

/** Rupture life in hours at temperature T from a known Larson-Miller parameter. */
export function ruptureTime(lm: number, T: number, C = 20): number {
  return Math.pow(10, lm / T - C);
}

/** Molar gas constant, J/(mol·K). */
export const GAS_CONSTANT = 8.314;

/**
 * Norton's power law for steady-state creep rate:
 * ε̇ = A·σⁿ·e^(−Q/RT). sigma in Pa, Q in J/mol, T in K.
 */
export function nortonRate(A: number, sigma: number, n: number, Q: number, T: number): number {
  return A * Math.pow(sigma, n) * Math.exp(-Q / (GAS_CONSTANT * T));
}
