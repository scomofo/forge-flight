/**
 * Pure elasticity logic for Physics 101, Week 7.
 *
 * Axial deformation, stress/strain, second moments of area, cantilever
 * deflection, and factor of safety. All SI. No UI — unit-testable.
 */

/** Teaching material values (E in Pa, yield in Pa). Not code allowables. */
export const ELASTIC_MATS = [
  { id: "steel", name: "Steel", short: "Steel", e: 200e9, yield: 250e6 },
  { id: "al", name: "Aluminum", short: "Al", e: 69e9, yield: 270e6 },
  { id: "wood", name: "Wood", short: "Wood", e: 10e9, yield: 40e6 },
] as const;

export type ElasticMat = (typeof ELASTIC_MATS)[number];

/** σ = F/A — stress in pascals. */
export function stress(forceN: number, areaM2: number): number {
  return forceN / areaM2;
}

/** ε = ΔL/L — dimensionless engineering strain. */
export function strain(deltaL: number, length: number): number {
  return deltaL / length;
}

/** Area of a solid circular section. */
export function areaCircle(diameterM: number): number {
  return (Math.PI * diameterM * diameterM) / 4;
}

/** Area of a rectangular section. */
export function areaRect(widthM: number, depthM: number): number {
  return widthM * depthM;
}

/** δ = FL/AE — axial elongation of a uniform bar in the elastic range. */
export function axialDelta(forceN: number, lengthM: number, areaM2: number, ePa: number): number {
  return (forceN * lengthM) / (areaM2 * ePa);
}

/** I = bh³/12 — second moment of area of a rectangle about its centroidal axis. */
export function inertiaRect(widthM: number, depthM: number): number {
  return (widthM * depthM ** 3) / 12;
}

/** I = πd⁴/64 — second moment of area of a solid circle. */
export function inertiaCircle(diameterM: number): number {
  return (Math.PI * diameterM ** 4) / 64;
}

/**
 * δ = FL³/3EI — tip deflection of a cantilever with a tip load, small-deflection
 * linear elastic range. Treat as a scaling law first, a number second.
 */
export function cantileverDelta(forceN: number, lengthM: number, ePa: number, inertiaM4: number): number {
  return (forceN * lengthM ** 3) / (3 * ePa * inertiaM4);
}

/** n = ultimate / working — factor of safety. */
export function factorOfSafety(ultimateLoad: number, workingLoad: number): number {
  return ultimateLoad / workingLoad;
}

/** σ_allow = σ_ultimate / n. */
export function allowableStress(ultimatePa: number, n: number): number {
  return ultimatePa / n;
}

/**
 * Deterministic pseudo-random in [-1, 1] from a string seed — so the
 * "measured" deflection in the bench is stable per configuration.
 */
export function seededNoise(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return ((h >>> 0) % 2000) / 1000 - 1;
}

/**
 * Simulated measurement of a cantilever tip deflection: the linear model plus
 * support compliance (the clamp is never perfectly fixed) and material scatter.
 * The bias is deliberate and named — it is the lesson, not a bug.
 */
export function measuredDeflection(modelDelta: number, seed: string): number {
  const supportCompliance = 0.09; // clamp rotation adds ~9%
  const scatter = 0.05 * seededNoise(seed); // ±5% material/test scatter
  return modelDelta * (1 + supportCompliance + scatter);
}

/** Percent error of a prediction against a measurement. */
export function percentError(predicted: number, measured: number): number {
  return ((predicted - measured) / measured) * 100;
}
