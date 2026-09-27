/** L0 closed forms from the handoff appendix. SI units in, SI units out. */

export function axialStress(force_N: number, area_m2: number): number {
  return force_N / area_m2;
}

export function bendingStress(moment_Nm: number, c_m: number, inertia_m4: number): number {
  return (moment_Nm * c_m) / inertia_m4;
}

export function cantileverTipDeflection(force_N: number, length_m: number, e_Pa: number, inertia_m4: number): number {
  return (force_N * length_m ** 3) / (3 * e_Pa * inertia_m4);
}

export function simplySupportedCenterDeflection(force_N: number, length_m: number, e_Pa: number, inertia_m4: number): number {
  return (force_N * length_m ** 3) / (48 * e_Pa * inertia_m4);
}

/** K is the effective-length factor. Fixed-free cantilever is 2. Both ends pinned is 1. */
export function eulerBuckling(e_Pa: number, inertia_m4: number, k: number, length_m: number): number {
  return (Math.PI ** 2 * e_Pa * inertia_m4) / (k * length_m) ** 2;
}

export function torsionShear(torque_Nm: number, r_m: number, j_m4: number): number {
  return (torque_Nm * r_m) / j_m4;
}

export function thermalStress(e_Pa: number, alpha_perK: number, deltaT_K: number, poisson: number): number {
  return (e_Pa * alpha_perK * deltaT_K) / (1 - poisson);
}

export function lift(rho: number, v_ms: number, area_m2: number, cl: number): number {
  return 0.5 * rho * v_ms ** 2 * area_m2 * cl;
}

export function drag(rho: number, v_ms: number, area_m2: number, cd: number): number {
  return 0.5 * rho * v_ms ** 2 * area_m2 * cd;
}

export function inducedDragCoeff(cl: number, aspectRatio: number, oswald: number): number {
  return cl ** 2 / (Math.PI * aspectRatio * oswald);
}

export function staticMargin(xNp_m: number, xCg_m: number, mac_m: number): number {
  return (xNp_m - xCg_m) / mac_m;
}

/** Basquin: σ_a = σ_f' (2N)^b. Returns reversals-to-failure as cycles N. Illustrative coefficients only. */
export function fatigueLifeCycles(sigmaA_Pa: number, sigmaFPrime_Pa: number, b: number): number {
  const twoN = (sigmaA_Pa / sigmaFPrime_Pa) ** (1 / b);
  return 0.5 * twoN;
}

export function rectangleInertia(width_m: number, height_m: number): number {
  return (width_m * height_m ** 3) / 12;
}

export function tubeInertia(outer_m: number, inner_m: number): number {
  return (Math.PI / 64) * (outer_m ** 4 - inner_m ** 4);
}

export function tubePolar(outer_m: number, inner_m: number): number {
  return (Math.PI / 32) * (outer_m ** 4 - inner_m ** 4);
}

export function tubeArea(outer_m: number, inner_m: number): number {
  return (Math.PI / 4) * (outer_m ** 2 - inner_m ** 2);
}

export function safetyFactor(allowable: number, actual: number): number {
  if (actual <= 0) return Number.POSITIVE_INFINITY;
  return allowable / actual;
}

export function utilization(actual: number, allowable: number): number {
  if (allowable <= 0) return Number.POSITIVE_INFINITY;
  return actual / allowable;
}

export type CostTerms = {
  material: number;
  machine: number;
  amortised: number;
  labor: number;
  finishing: number;
  unit: number;
};

/** scrap multiplies material only. Every other term is shown separately. */
export function unitCost(input: {
  mass_kg: number;
  cost_usd_per_kg: number;
  machineRate_usd_per_hr: number;
  cycleTime_hr: number;
  setupCost_usd: number;
  toolingCost_usd: number;
  quantity: number;
  labor_usd: number;
  finishing_usd: number;
  scrapFactor: number;
}): CostTerms {
  const qty = Math.max(1, input.quantity);
  const material = input.mass_kg * input.cost_usd_per_kg * input.scrapFactor;
  const machine = input.machineRate_usd_per_hr * input.cycleTime_hr;
  const amortised = (input.setupCost_usd + input.toolingCost_usd) / qty;
  const unit = material + machine + amortised + input.labor_usd + input.finishing_usd;
  return { material, machine, amortised, labor: input.labor_usd, finishing: input.finishing_usd, unit };
}

/**
 * Finite-wing lift slope from a 2π thin-airfoil slope and a lifting-line correction a = a0 / (1 + a0/(π AR)).
 * That reduces to 2π · AR / (AR + 2). Per radian.
 */
export function finiteWingSlope(aspectRatio: number): number {
  return (2 * Math.PI * aspectRatio) / (aspectRatio + 2);
}

/** Teaching polar: linear to stall, then a straight decay. Not a wind-tunnel table. */
export function liftCoeff(alpha_rad: number, cl0: number, slope: number, stall_rad: number): number {
  const linear = cl0 + slope * alpha_rad;
  if (alpha_rad <= stall_rad) return linear;
  const clStall = cl0 + slope * stall_rad;
  const end = stall_rad + (13 * Math.PI) / 180;
  const floor = 0.4 * clStall;
  if (alpha_rad >= end) return floor;
  const f = (alpha_rad - stall_rad) / (end - stall_rad);
  return clStall + (floor - clStall) * f;
}

export function sectionModulusTube(outer_m: number, inner_m: number): { i: number; c: number } {
  return { i: tubeInertia(outer_m, inner_m), c: outer_m / 2 };
}
