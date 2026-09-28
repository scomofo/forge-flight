/**
 * Pure kinematics logic for Physics 101, Week 2 (scout/physics-w2).
 *
 * Vector operations, finite-difference differentiation of sampled motion,
 * least-squares fitting of the constant-acceleration model, and closed-form
 * projectile ballistics. No UI — imported by the benches and unit-tested
 * under Node's type stripping.
 */

export type Vec2 = { x: number; y: number };

export function vadd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vsub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vscale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s };
}

export function vdot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function vmag(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

/** Direction of a in degrees, counterclockwise from +x. NaN for the zero vector. */
export function vangleDeg(a: Vec2): number {
  return (Math.atan2(a.y, a.x) * 180) / Math.PI;
}

/** Vector of magnitude m at angleDeg degrees counterclockwise from +x. */
export function vfromPolar(m: number, angleDeg: number): Vec2 {
  const r = (angleDeg * Math.PI) / 180;
  return { x: m * Math.cos(r), y: m * Math.sin(r) };
}

/** Signed length of a's projection onto the direction of b. */
export function vproject(a: Vec2, onto: Vec2): number {
  const m = vmag(onto);
  return m === 0 ? NaN : vdot(a, onto) / m;
}

export type Sample = { t: number; x: number };

/**
 * Average velocity over interval i (between sample i and i+1).
 * This is the secant slope of the x–t graph on that interval.
 */
export function intervalVelocity(samples: Sample[], i: number): number {
  const a = samples[i];
  const b = samples[i + 1];
  if (!a || !b || b.t === a.t) return NaN;
  return (b.x - a.x) / (b.t - a.t);
}

/** Forward-difference velocities for every interval. */
export function intervalVelocities(samples: Sample[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < samples.length - 1; i++) out.push(intervalVelocity(samples, i));
  return out;
}

/**
 * Central-difference velocity at interior sample i:
 * (x[i+1] − x[i−1]) / (t[i+1] − t[i−1]). The honest instantaneous estimate
 * from sampled data — it centers the secant on the sample instead of
 * attributing one interval's slope to its endpoint.
 */
export function centralVelocity(samples: Sample[], i: number): number {
  const a = samples[i - 1];
  const b = samples[i + 1];
  if (!a || !b || b.t === a.t) return NaN;
  return (b.x - a.x) / (b.t - a.t);
}

/**
 * Least-squares fit of x(t) = x0 + v0·τ + ½·a·τ² with τ = t − t[0].
 * Returns the parameters at the first sample's time plus the RMS residual.
 * Solves the 3×3 normal equations directly — no dependencies.
 */
export function fitConstantAccel(samples: Sample[]): { x0: number; v0: number; a: number; rms: number } {
  const t0 = samples[0]?.t ?? 0;
  // Normal equations for basis [1, τ, τ²/2].
  const ata = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const aty = [0, 0, 0];
  for (const s of samples) {
    const tau = s.t - t0;
    const basis = [1, tau, (tau * tau) / 2];
    for (let r = 0; r < 3; r++) {
      aty[r] += basis[r] * s.x;
      for (let c = 0; c < 3; c++) ata[r][c] += basis[r] * basis[c];
    }
  }
  const beta = solve3(ata, aty);
  let se = 0;
  for (const s of samples) {
    const tau = s.t - t0;
    const pred = beta[0] + beta[1] * tau + beta[2] * ((tau * tau) / 2);
    se += (s.x - pred) * (s.x - pred);
  }
  return { x0: beta[0], v0: beta[1], a: beta[2], rms: Math.sqrt(se / samples.length) };
}

/** Gaussian elimination for a 3×3 system. */
function solve3(a: number[][], b: number[]): number[] {
  const m = a.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    [m[col], m[piv]] = [m[piv], m[col]];
    const d = m[col][col];
    if (Math.abs(d) < 1e-12) return [NaN, NaN, NaN];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = m[r][col] / d;
      for (let c = col; c < 4; c++) m[r][c] -= f * m[col][c];
    }
  }
  return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
}

export type Projectile = {
  range: number;
  timeOfFlight: number;
  maxHeight: number;
};

/**
 * Vacuum ballistics: launch at v0 m/s and angleDeg above horizontal from
 * height y0. Axes are independent — horizontal cruise, vertical fall at g.
 */
export function projectile(v0: number, angleDeg: number, y0 = 0, g = 9.81): Projectile {
  const r = (angleDeg * Math.PI) / 180;
  const vx = v0 * Math.cos(r);
  const vy = v0 * Math.sin(r);
  const timeOfFlight = (vy + Math.sqrt(vy * vy + 2 * g * y0)) / g;
  return {
    range: vx * timeOfFlight,
    timeOfFlight,
    maxHeight: y0 + (vy * vy) / (2 * g),
  };
}

/** Launch speed needed to reach `range` at the given angle on flat ground. */
export function launchSpeedForRange(range: number, angleDeg: number, g = 9.81): number {
  const r = (angleDeg * Math.PI) / 180;
  return Math.sqrt((range * g) / Math.sin(2 * r));
}

/** Trajectory points for drawing: n+1 samples from launch to landing. */
export function trajectoryPoints(v0: number, angleDeg: number, n = 40, y0 = 0, g = 9.81): Vec2[] {
  const r = (angleDeg * Math.PI) / 180;
  const { timeOfFlight } = projectile(v0, angleDeg, y0, g);
  const pts: Vec2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * timeOfFlight;
    pts.push({
      x: v0 * Math.cos(r) * t,
      y: y0 + v0 * Math.sin(r) * t - 0.5 * g * t * t,
    });
  }
  return pts;
}

/**
 * The motion-reconstruction bench dataset: a cart logged every 0.5 s.
 * t = 0–2.5 s cruises at 1.6 m/s from x0 = 0.3 m; t = 2.5–6 s thrusts at
 * 0.9 m/s² with continuous position and velocity at the handover.
 * Jitter is deterministic (±2 cm sensor noise), so the bench, the lesson,
 * and the tests all see the same numbers.
 */
function buildMotionData(): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i * 0.5;
    let x: number;
    if (t <= 2.5) {
      x = 0.3 + 1.6 * t;
    } else {
      const dt = t - 2.5;
      x = 4.3 + 1.6 * dt + 0.45 * dt * dt;
    }
    const jitter = 0.02 * Math.sin(i * 2.39);
    out.push({ t, x: Math.round((x + jitter) * 100) / 100 });
  }
  return out;
}

export const MOTION_DATA: Sample[] = buildMotionData();

/** Interval indices of the cruise segment (constant velocity) in MOTION_DATA. */
export const CRUISE_INTERVALS = [0, 1, 2, 3, 4];

/** Interval indices of the thrust segment (constant acceleration) in MOTION_DATA. */
export const THRUST_INTERVALS = [5, 6, 7, 8, 9, 10, 11];

/** Samples of the thrust segment (t ≥ 2.5 s), for the acceleration fit. */
export const THRUST_SAMPLES: Sample[] = MOTION_DATA.slice(5);
