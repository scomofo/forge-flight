/**
 * Physics 101, Week 9 — pure logic for oscillations, waves, and thermal.
 *
 * No UI, no app imports: unit-testable in isolation. SI throughout
 * (kg, m, s, N, Pa, °C). Angles in radians.
 */

// ---------------------------------------------------------------------------
// Simple harmonic motion: m·x¨ + k·x = 0
// ---------------------------------------------------------------------------

/** Natural angular frequency ω = √(k/m), rad/s. */
export function shmOmega(k: number, m: number): number {
  return Math.sqrt(k / m);
}

/** Period T = 2π√(m/k), seconds. */
export function shmPeriod(k: number, m: number): number {
  return (2 * Math.PI) / shmOmega(k, m);
}

/** Cyclic frequency f = 1/T, Hz. */
export function shmFrequency(k: number, m: number): number {
  return shmOmega(k, m) / (2 * Math.PI);
}

/** Position x(t) = A·cos(ωt + φ), meters. */
export function shmPosition(A: number, omega: number, phase: number, t: number): number {
  return A * Math.cos(omega * t + phase);
}

/** Velocity v(t) = −Aω·sin(ωt + φ), m/s. */
export function shmVelocity(A: number, omega: number, phase: number, t: number): number {
  return -A * omega * Math.sin(omega * t + phase);
}

/** Total mechanical energy E = ½kA², joules — constant for undamped SHM. */
export function shmEnergy(k: number, A: number): number {
  return 0.5 * k * A * A;
}

/** Kinetic energy at displacement x: KE = ½k(A² − x²), joules. */
export function shmKinetic(k: number, A: number, x: number): number {
  return 0.5 * k * (A * A - x * x);
}

/** Potential energy at displacement x: PE = ½kx², joules. */
export function shmPotential(k: number, x: number): number {
  return 0.5 * k * x * x;
}

// ---------------------------------------------------------------------------
// Driven oscillator and resonance
// ---------------------------------------------------------------------------

/**
 * Steady-state magnification X/(F₀/k) at frequency ratio r = ω/ωₙ
 * with damping ratio ζ: 1/√((1−r²)² + (2ζr)²).
 */
export function magnification(r: number, zeta: number): number {
  const d = (1 - r * r) * (1 - r * r) + (2 * zeta * r) * (2 * zeta * r);
  return 1 / Math.sqrt(d);
}

/** Frequency ratio of the response peak: r* = √(1 − 2ζ²) (≈1 for light damping). */
export function resonantRatio(zeta: number): number {
  return Math.sqrt(Math.max(0, 1 - 2 * zeta * zeta));
}

/** Quality factor Q = 1/(2ζ): the resonant peak height for light damping. */
export function qualityFactor(zeta: number): number {
  return 1 / (2 * zeta);
}

/** Steady-state amplitude X = (F₀/k)·magnification(r, ζ), meters. */
export function steadyAmplitude(F0: number, k: number, r: number, zeta: number): number {
  return (F0 / k) * magnification(r, zeta);
}

// ---------------------------------------------------------------------------
// Waves
// ---------------------------------------------------------------------------

/** Wave speed v = fλ, m/s. */
export function waveSpeed(f: number, lambda: number): number {
  return f * lambda;
}

/** Wavelength λ = v/f, meters. */
export function wavelength(v: number, f: number): number {
  return v / f;
}

/** nth standing-wave frequency on a string fixed at both ends: fₙ = n·v/(2L), Hz. */
export function standingFreq(n: number, v: number, L: number): number {
  return (n * v) / (2 * L);
}

// ---------------------------------------------------------------------------
// Thermal expansion and thermal stress
// ---------------------------------------------------------------------------

export type ThermalMaterial = {
  name: string;
  /** Linear expansion coefficient α, per °C. */
  alpha: number;
  /** Young's modulus E, Pa. */
  E: number;
  /** Representative yield strength, Pa — for the %−of−yield readout. */
  yieldPa: number;
};

export const THERMAL_MATERIALS: ThermalMaterial[] = [
  { name: "Steel", alpha: 12e-6, E: 200e9, yieldPa: 250e6 },
  { name: "Aluminum", alpha: 23e-6, E: 70e9, yieldPa: 240e6 },
  { name: "Copper", alpha: 17e-6, E: 120e9, yieldPa: 210e6 },
  { name: "Concrete", alpha: 10e-6, E: 30e9, yieldPa: 40e6 },
];

/** Free thermal expansion ΔL = α·L₀·ΔT, meters (signed with ΔT). */
export function thermalExpansion(L0: number, alpha: number, dT: number): number {
  return alpha * L0 * dT;
}

/**
 * Stress in a fully constrained bar: σ = E·α·ΔT, Pa.
 * Positive ΔT (heating) gives compression; the sign here is the
 * tensile-positive convention, so heating returns negative (compressive).
 */
export function thermalStress(E: number, alpha: number, dT: number): number {
  return -E * alpha * dT;
}

/** Expansion gap a joint must absorb for the worst-case swing: |ΔL|, meters. */
export function jointGap(L0: number, alpha: number, dT: number): number {
  return Math.abs(thermalExpansion(L0, alpha, dT));
}
