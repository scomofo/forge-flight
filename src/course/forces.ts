/**
 * Pure force-analysis logic for Physics 101, Week 3.
 *
 * No UI here: inclined-plane resolution, the static/kinetic friction model,
 * the ideal Atwood machine, and Hooke's law. All classroom values; g is the
 * standard 9.81 m/s².
 */

export const G = 9.81;

export type InclineState = "stuck" | "sliding";

export type FrictionPair = {
  id: string;
  label: string;
  /** Static coefficient. Classroom values, not tribology data. */
  muS: number;
  /** Kinetic coefficient. Classroom values, not tribology data. */
  muK: number;
};

export const FRICTION_PAIRS: FrictionPair[] = [
  { id: "wood", label: "Wood on wood", muS: 0.5, muK: 0.3 },
  { id: "steel", label: "Steel on steel (dry)", muS: 0.6, muK: 0.4 },
  { id: "rubber", label: "Rubber on asphalt", muS: 0.9, muK: 0.7 },
  { id: "ice", label: "Ice on steel", muS: 0.1, muK: 0.05 },
  { id: "teflon", label: "Teflon on steel", muS: 0.04, muK: 0.04 },
];

export function frictionPair(id: string): FrictionPair {
  const pair = FRICTION_PAIRS.find((p) => p.id === id);
  if (!pair) throw new Error(`unknown friction pair: ${id}`);
  return pair;
}

/**
 * Resolve gravity into incline components for a mass on a plane tilted
 * angleDeg from horizontal. Returns newtons: `along` points downslope,
 * `normal` presses into the plane.
 */
export function inclineComponents(
  massKg: number,
  angleDeg: number,
): { along: number; normal: number } {
  const theta = (angleDeg * Math.PI) / 180;
  const weight = massKg * G;
  return {
    along: weight * Math.sin(theta),
    normal: weight * Math.cos(theta),
  };
}

/**
 * The slip-angle identity: a block starts to slide when tan θ = μs,
 * so μs = tan(slipAngleDeg). Independent of mass — mass cancels.
 */
export function muFromSlipAngle(slipAngleDeg: number): number {
  return Math.tan((slipAngleDeg * Math.PI) / 180);
}

export type InclineResult = {
  state: InclineState;
  /** Normal force, N. */
  normal: number;
  /** Friction actually exerted, N: equals the downslope pull when stuck, μk·N when sliding. */
  friction: number;
  /** Net downslope force, N. */
  net: number;
  /** Downslope acceleration, m/s². */
  accel: number;
};

/**
 * Block on an incline with the two-regime friction model.
 *
 * Stuck while the downslope pull does not exceed μs·N; then friction
 * matches the pull exactly and nothing moves. Past that, kinetic friction
 * μk·N opposes the motion and the remainder accelerates the block.
 */
export function blockOnIncline(
  massKg: number,
  angleDeg: number,
  muS: number,
  muK: number,
): InclineResult {
  const { along, normal } = inclineComponents(massKg, angleDeg);
  const fMax = muS * normal;
  if (along <= fMax + 1e-9) {
    return { state: "stuck", normal, friction: along, net: 0, accel: 0 };
  }
  const friction = muK * normal;
  const net = along - friction;
  return { state: "sliding", normal, friction, net, accel: net / massKg };
}

export type PulleyResult = {
  /** Signed acceleration, m/s². Positive means the m2 side descends. */
  accel: number;
  /** String tension, N. Uniform in the ideal massless string. */
  tension: number;
};

/**
 * Ideal Atwood machine: two masses over a massless, frictionless pulley.
 * From the two free-body diagrams: m2·g − T = m2·a and T − m1·g = m1·a,
 * giving a = (m2 − m1)·g / (m1 + m2) and T = 2·m1·m2·g / (m1 + m2).
 */
export function atwood(m1Kg: number, m2Kg: number): PulleyResult {
  const accel = ((m2Kg - m1Kg) * G) / (m1Kg + m2Kg);
  const tension = (2 * m1Kg * m2Kg * G) / (m1Kg + m2Kg);
  return { accel, tension };
}

/**
 * Hooke's law, signed: F = −k·x. Positive x is stretch from equilibrium;
 * the returned force is the spring's restoring force (negative = pulling back).
 */
export function springForce(stiffnessNpm: number, displacementM: number): number {
  return -stiffnessNpm * displacementM;
}
