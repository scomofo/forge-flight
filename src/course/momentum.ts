/**
 * Pure momentum/collision logic for Physics 101, Week 5.
 * No UI: everything here is unit-testable. Signs follow the convention
 * that positive velocity points right along the line of motion.
 */

export interface CollisionResult {
  u1: number;
  u2: number;
}

/** Momentum p = m·v (kg·m/s). */
export function momentum(m: number, v: number): number {
  return m * v;
}

/** Kinetic energy K = ½·m·v² (J). */
export function kineticEnergy(m: number, v: number): number {
  return 0.5 * m * v * v;
}

/** Impulse J = F_avg · Δt (N·s = kg·m/s). */
export function impulse(force: number, dt: number): number {
  return force * dt;
}

/** Momentum change Δp = m·(v1 − v0). */
export function deltaP(m: number, v0: number, v1: number): number {
  return m * (v1 - v0);
}

/** Average force implied by a momentum change: F = Δp/Δt. */
export function avgForce(dp: number, dt: number): number {
  return dp / dt;
}

/**
 * Perfectly elastic 1D collision. Conservation of momentum and kinetic
 * energy together give:
 *   u1 = ((m1−m2)·v1 + 2·m2·v2) / (m1+m2)
 *   u2 = (2·m1·v1 + (m2−m1)·v2) / (m1+m2)
 */
export function elastic1D(m1: number, v1: number, m2: number, v2: number): CollisionResult {
  const total = m1 + m2;
  return {
    u1: ((m1 - m2) * v1 + 2 * m2 * v2) / total,
    u2: (2 * m1 * v1 + (m2 - m1) * v2) / total,
  };
}

/** Perfectly inelastic 1D collision (they stick): shared velocity v = (m1·v1 + m2·v2)/(m1+m2). */
export function stick1D(m1: number, v1: number, m2: number, v2: number): number {
  return (m1 * v1 + m2 * v2) / (m1 + m2);
}

/**
 * 1D collision with coefficient of restitution e (0 ≤ e ≤ 1).
 * Momentum is conserved and the separation speed is e times the
 * approach speed: u2 − u1 = e·(v1 − v2).
 */
export function restitution1D(
  m1: number,
  v1: number,
  m2: number,
  v2: number,
  e: number,
): CollisionResult {
  const total = m1 + m2;
  return {
    u1: (m1 * v1 + m2 * v2 + m2 * e * (v2 - v1)) / total,
    u2: (m1 * v1 + m2 * v2 + m1 * e * (v1 - v2)) / total,
  };
}

/** Coefficient of restitution recovered from measured velocities: e = (u2 − u1)/(v1 − v2). */
export function restitutionFromData(v1: number, v2: number, u1: number, u2: number): number {
  return (u2 - u1) / (v1 - v2);
}

/** Center of mass of point masses on a line. */
export function centerOfMass(masses: { m: number; x: number }[]): number {
  const total = masses.reduce((s, p) => s + p.m, 0);
  return masses.reduce((s, p) => s + p.m * p.x, 0) / total;
}

/** Total momentum of a set of bodies on a line. */
export function totalMomentum(bodies: { m: number; v: number }[]): number {
  return bodies.reduce((s, b) => s + momentum(b.m, b.v), 0);
}

/** Total kinetic energy of a set of bodies on a line. */
export function totalKE(bodies: { m: number; v: number }[]): number {
  return bodies.reduce((s, b) => s + kineticEnergy(b.m, b.v), 0);
}
