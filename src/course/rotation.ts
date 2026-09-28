/**
 * Pure rotation / statics logic for Physics 101, Week 6.
 *
 * No UI here — everything is unit-testable arithmetic. Angles are in degrees
 * at the boundary (what a learner types) and radians inside.
 */

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/** Torque τ = r · F · sin(θ), with θ the angle between r and F (degrees). */
export function torque(r: number, f: number, angleDeg: number): number {
  return r * f * Math.sin(degToRad(angleDeg));
}

/** Lever arm: the perpendicular distance from pivot to the force's line of action. */
export function leverArm(r: number, angleDeg: number): number {
  return r * Math.sin(degToRad(angleDeg));
}

/** Net torque from a list of signed torques (CCW positive). */
export function netTorque(torques: number[]): number {
  return torques.reduce((s, t) => s + t, 0);
}

// ---------------------------------------------------------------------------
// Angular kinematics (constant-α analogues of the Week 2 equations)
// ---------------------------------------------------------------------------

export function angularVelocity(thetaRad: number, t: number): number {
  if (t === 0) throw new Error("time must be non-zero");
  return thetaRad / t;
}

export function angularAcceleration(deltaOmega: number, t: number): number {
  if (t === 0) throw new Error("time must be non-zero");
  return deltaOmega / t;
}

/** Constant-α motion: returns final angle and angular velocity. */
export function constAlphaMotion(
  theta0: number,
  omega0: number,
  alpha: number,
  t: number,
): { theta: number; omega: number } {
  return {
    theta: theta0 + omega0 * t + 0.5 * alpha * t * t,
    omega: omega0 + alpha * t,
  };
}

// ---------------------------------------------------------------------------
// Linear–angular map
// ---------------------------------------------------------------------------

/** v = ωr (tangential speed). */
export function tangentialSpeed(omega: number, r: number): number {
  return omega * r;
}

/** a_t = αr (tangential acceleration). */
export function tangentialAcceleration(alpha: number, r: number): number {
  return alpha * r;
}

/** a_c = ω²r (centripetal acceleration, toward center). */
export function centripetalAcceleration(omega: number, r: number): number {
  return omega * omega * r;
}

// ---------------------------------------------------------------------------
// Rotational inertia
// ---------------------------------------------------------------------------

export type InertiaShape =
  | "point"
  | "solid-cylinder"
  | "hoop"
  | "rod-center"
  | "rod-end"
  | "solid-sphere";

/**
 * Moment of inertia about the shape's symmetry axis.
 * For rods, `size` is the length L; for the rest it is the radius r.
 */
export function inertia(shape: InertiaShape, m: number, size: number): number {
  if (m <= 0 || size <= 0) throw new Error("mass and size must be positive");
  switch (shape) {
    case "point":
      return m * size * size;
    case "solid-cylinder":
      return 0.5 * m * size * size;
    case "hoop":
      return m * size * size;
    case "rod-center":
      return (m * size * size) / 12;
    case "rod-end":
      return (m * size * size) / 3;
    case "solid-sphere":
      return 0.4 * m * size * size;
  }
}

/** Parallel-axis theorem: I = I_cm + m·d². */
export function parallelAxis(iCm: number, m: number, d: number): number {
  return iCm + m * d * d;
}

/** Spin-up under constant torque: ω = τt/I, θ = τt²/2I, KE = ½Iω². */
export function spinUp(
  I: number,
  appliedTorque: number,
  t: number,
): { omega: number; theta: number; ke: number } {
  if (I <= 0) throw new Error("inertia must be positive");
  const alpha = appliedTorque / I;
  return {
    omega: alpha * t,
    theta: 0.5 * alpha * t * t,
    ke: 0.5 * I * alpha * t * alpha * t,
  };
}

// ---------------------------------------------------------------------------
// Beam reactions (simply supported beam, vertical loads, downward positive)
// ---------------------------------------------------------------------------

export type PointLoad = { x: number; f: number };
export type UniformLoad = { from: number; to: number; w: number };

export type BeamSolution = {
  /** Reaction at the left (pin) support, N upward. */
  ay: number;
  /** Reaction at the right (roller) support, N upward. */
  by: number;
  /** Total downward load, N. */
  totalLoad: number;
};

/**
 * Solve a simply supported beam: ΣF_y = 0 and ΣM = 0 about the left support.
 * Point loads and uniform loads are all taken as downward-positive inputs;
 * returned reactions are upward-positive.
 */
export function beamReactions(
  length: number,
  points: PointLoad[],
  uniforms: UniformLoad[],
): BeamSolution {
  if (length <= 0) throw new Error("beam length must be positive");
  const onBeam = (x: number, what: string) => {
    if (x < 0 || x > length) throw new Error(`${what} at x=${x} is off the beam`);
  };
  let totalLoad = 0;
  let momentAboutA = 0;
  for (const p of points) {
    onBeam(p.x, "point load");
    if (p.f < 0) throw new Error("point load magnitude must be non-negative");
    totalLoad += p.f;
    momentAboutA += p.f * p.x;
  }
  for (const u of uniforms) {
    onBeam(u.from, "uniform load start");
    onBeam(u.to, "uniform load end");
    if (u.to < u.from) throw new Error("uniform load must run left to right");
    if (u.w < 0) throw new Error("uniform load intensity must be non-negative");
    const f = u.w * (u.to - u.from);
    totalLoad += f;
    momentAboutA += f * ((u.from + u.to) / 2);
  }
  const by = momentAboutA / length;
  return { ay: totalLoad - by, by, totalLoad };
}

/** Shear just right of the left support for a solved beam (sanity readout). */
export function shearAtLeft(solution: BeamSolution): number {
  return solution.ay;
}
