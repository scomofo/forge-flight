/**
 * Physics 101, Week 4 — pure energy mechanics.
 *
 * No UI here: every function takes numbers and returns numbers, so the
 * benches and the lesson worked-examples stay honest and the tests can pin
 * the arithmetic. SI units throughout (J, W, kg, m, s).
 */

export const G = 9.81;

/** Work of a constant force: W = F·d·cosθ. θ in degrees from the displacement direction. */
export function work(force: number, distance: number, thetaDeg = 0): number {
  return force * distance * Math.cos((thetaDeg * Math.PI) / 180);
}

/** Net work on a body: the sum of signed works. */
export function netWork(works: number[]): number {
  return works.reduce((sum, w) => sum + w, 0);
}

/** Kinetic energy: K = ½mv². */
export function kineticEnergy(mass: number, speed: number): number {
  return 0.5 * mass * speed * speed;
}

/** Speed from kinetic energy: v = √(2K/m). */
export function speedFromKE(ke: number, mass: number): number {
  return Math.sqrt((2 * ke) / mass);
}

/** Gravitational potential energy: U = mgh (h measured from a chosen datum). */
export function gravPotential(mass: number, height: number, g = G): number {
  return mass * g * height;
}

/** Elastic (spring) potential energy: U = ½kx². */
export function elasticPotential(k: number, x: number): number {
  return 0.5 * k * x * x;
}

/** Speed at the bottom of a frictionless drop: v = √(2gh). */
export function speedFromDrop(height: number, g = G): number {
  return Math.sqrt(2 * g * height);
}

/** Speed after falling a height with an initial speed: v = √(v₀² + 2gh). */
export function speedAfterDrop(v0: number, height: number, g = G): number {
  return Math.sqrt(v0 * v0 + 2 * g * height);
}

/** Average power: P = W/Δt. */
export function power(workJ: number, dt: number): number {
  return workJ / dt;
}

/** Instantaneous mechanical power for a force along the velocity: P = F·v. */
export function mechPower(force: number, speed: number): number {
  return force * speed;
}

export type EnergyAudit = {
  inputWork: number;
  usefulWork: number;
  lost: number;
  efficiency: number;
  /** True when the books balance: useful output cannot exceed input. */
  balanced: boolean;
};

/**
 * Audit a simple mechanism: the work you put in must cover the useful work
 * out plus the losses. Efficiency η = useful / input.
 */
export function energyAudit(inputWork: number, usefulWork: number): EnergyAudit {
  const lost = inputWork - usefulWork;
  return {
    inputWork,
    usefulWork,
    lost,
    efficiency: inputWork > 0 ? usefulWork / inputWork : 0,
    balanced: usefulWork <= inputWork,
  };
}

/** Simple mechanisms offered by the audit bench, with honest loss commentary. */
export type MechanismId = "lever" | "pulley" | "crank";

export const MECHANISMS: { id: MechanismId; name: string; losses: string }[] = [
  {
    id: "lever",
    name: "Lever lift",
    losses: "Pivot friction and the beam's own weight eat part of every stroke.",
  },
  {
    id: "pulley",
    name: "Pulley hoist",
    losses: "Axle friction in each sheave and rope stretch take their cut.",
  },
  {
    id: "crank",
    name: "Hand-crank winch",
    losses: "Gear-mesh friction and the drum bearing dissipate most of the loss.",
  },
];
