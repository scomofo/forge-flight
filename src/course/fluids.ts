/**
 * Physics 101, Week 8 — pure fluids & flight logic. SI units in, SI units out.
 *
 * The aerodynamic closed forms (lift, drag, static margin) are re-exported
 * from the glider sandbox's own formulas so the pre-lab speaks the same
 * numbers as Glider Lab: src/forge/sim/formulas.ts.
 */
import { drag, inducedDragCoeff, lift, staticMargin } from "../forge/sim/formulas.ts";

export { drag, inducedDragCoeff, lift, staticMargin };

export const RHO_AIR = 1.225; // kg/m^3, sea level
export const RHO_WATER = 1000; // kg/m^3, fresh
export const RHO_SEAWATER = 1025; // kg/m^3
export const RHO_MERCURY = 13534; // kg/m^3
export const G = 9.81; // m/s^2

/** Gauge pressure at depth h in a fluid at rest: p = rho g h. */
export function hydrostaticPressure(rho_kgm3: number, g: number, depth_m: number): number {
  return rho_kgm3 * g * depth_m;
}

/** Archimedes: buoyant force equals the weight of displaced fluid. */
export function buoyantForce(rho_kgm3: number, g: number, displacedVolume_m3: number): number {
  return rho_kgm3 * g * displacedVolume_m3;
}

/**
 * Fraction of an object's volume submerged when floating freely:
 * rho_obj / rho_fluid. Above 1 it cannot float; below 0 is nonsense.
 * Returns the raw ratio so callers can see "sinks" (> 1) explicitly.
 */
export function floatFraction(objectDensity_kgm3: number, fluidDensity_kgm3: number): number {
  if (fluidDensity_kgm3 <= 0) return Number.POSITIVE_INFINITY;
  return objectDensity_kgm3 / fluidDensity_kgm3;
}

/** Continuity for steady incompressible flow: A1 v1 = A2 v2. */
export function continuitySpeed(v1_ms: number, area1_m2: number, area2_m2: number): number {
  if (area2_m2 <= 0) return Number.POSITIVE_INFINITY;
  return (v1_ms * area1_m2) / area2_m2;
}

/**
 * Horizontal Venturi pressure drop from Bernoulli: p1 - p2 = 1/2 rho (v2^2 - v1^2).
 * Steady, incompressible, inviscid, same streamline, same elevation.
 */
export function venturiPressureDrop(rho_kgm3: number, v1_ms: number, v2_ms: number): number {
  return 0.5 * rho_kgm3 * (v2_ms ** 2 - v1_ms ** 2);
}

/** Dynamic pressure: the kinetic energy per unit volume of the airstream. */
export function dynamicPressure(rho_kgm3: number, v_ms: number): number {
  return 0.5 * rho_kgm3 * v_ms ** 2;
}

/**
 * Stall speed from level-flight force balance: L = W with CL at max.
 * v_stall = sqrt(2 W / (rho S CLmax)).
 */
export function stallSpeed(
  mass_kg: number,
  g: number,
  rho_kgm3: number,
  wingArea_m2: number,
  clMax: number,
): number {
  const denom = rho_kgm3 * wingArea_m2 * clMax;
  if (denom <= 0) return Number.POSITIVE_INFINITY;
  return Math.sqrt((2 * mass_kg * g) / denom);
}

/** Wing loading: weight per unit wing area. The single number that sets stall speed. */
export function wingLoading(mass_kg: number, g: number, wingArea_m2: number): number {
  if (wingArea_m2 <= 0) return Number.POSITIVE_INFINITY;
  return (mass_kg * g) / wingArea_m2;
}

export type StabilityVerdict = "unstable" | "marginal" | "stable" | "overstable";

/**
 * The glider model's teaching band: stable means the neutral point sits
 * 5–25% of a chord behind the CG. Negative is unflyable; beyond 25% the
 * glider is nose-heavy and mushy rather than unstable.
 */
export function stabilityVerdict(sm: number): StabilityVerdict {
  if (sm < 0.05) return "unstable";
  if (sm <= 0.25) return "stable";
  return "overstable";
}

export type ForceBalance = {
  lift_N: number;
  drag_N: number;
  weight_N: number;
  liftOverWeight: number;
  glideRatio: number;
  balanced: boolean;
};

/**
 * Steady-glide force balance at one speed and one lift coefficient.
 * "Balanced" means lift carries the weight within 10% — the pre-lab's bar.
 */
export function forceBalance(input: {
  mass_kg: number;
  g: number;
  rho_kgm3: number;
  speed_ms: number;
  wingArea_m2: number;
  cl: number;
  cd: number;
}): ForceBalance {
  const lift_N = lift(input.rho_kgm3, input.speed_ms, input.wingArea_m2, input.cl);
  const drag_N = drag(input.rho_kgm3, input.speed_ms, input.wingArea_m2, input.cd);
  const weight_N = input.mass_kg * input.g;
  const liftOverWeight = weight_N > 0 ? lift_N / weight_N : Number.POSITIVE_INFINITY;
  const glideRatio = drag_N > 0 ? lift_N / drag_N : Number.POSITIVE_INFINITY;
  return {
    lift_N,
    drag_N,
    weight_N,
    liftOverWeight,
    glideRatio,
    balanced: Math.abs(liftOverWeight - 1) <= 0.1,
  };
}
