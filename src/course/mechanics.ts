/**
 * Mechanics of components — pure sizing logic for Engineering 101 Week 24.
 *
 * All inputs and outputs are SI: meters, newtons, pascals, radians.
 * These are classroom-grade closed-form results (Euler, My/I, Tr/J, von Mises)
 * for prismatic sections. No UI here; the benches consume these functions.
 */

/** Cross-section shapes the sizing benches support. Dimensions in meters. */
export type Section =
  | { kind: "rectangle"; b: number; h: number }
  | { kind: "rect-tube"; b: number; h: number; t: number }
  | { kind: "round-tube"; d: number; t: number }
  | { kind: "solid-round"; d: number }
  | { kind: "i-beam"; bf: number; tf: number; hw: number; tw: number };

/**
 * Section properties: area A (m²), second moment I about the strong axis (m⁴),
 * section modulus S = I/c (m³), torsion constant J (m⁴), half-depth c (m).
 *
 * J for closed sections (tubes) is the polar moment Ix + Iy. For the open
 * rectangle and I-beam it is the narrow-rectangle approximation
 * J ≈ Σ a·b³·(1/3 − 0.21·(b/a)) — fine for classroom sizing, not for thin-wall
 * torsion of open sections where warping dominates.
 */
export type SectionProps = {
  A: number;
  I: number;
  S: number;
  J: number;
  c: number;
};

/** Torsion constant for a narrow rectangle, long side a, short side b. */
function narrowRectJ(a: number, b: number): number {
  const long = Math.max(a, b);
  const short = Math.min(a, b);
  return long * short ** 3 * (1 / 3 - 0.21 * (short / long));
}

export function sectionProps(s: Section): SectionProps {
  switch (s.kind) {
    case "rectangle": {
      const { b, h } = s;
      const I = (b * h ** 3) / 12;
      return { A: b * h, I, S: I / (h / 2), J: narrowRectJ(b, h), c: h / 2 };
    }
    case "rect-tube": {
      const { b, h, t } = s;
      const bi = b - 2 * t;
      const hi = h - 2 * t;
      const I = (b * h ** 3 - bi * hi ** 3) / 12;
      const A = b * h - bi * hi;
      return { A, I, S: I / (h / 2), J: narrowRectJ(b, h) + narrowRectJ(bi, hi), c: h / 2 };
    }
    case "round-tube": {
      const di = s.d - 2 * s.t;
      const I = (Math.PI * (s.d ** 4 - di ** 4)) / 64;
      const A = (Math.PI * (s.d ** 2 - di ** 2)) / 4;
      return { A, I, S: I / (s.d / 2), J: 2 * I, c: s.d / 2 };
    }
    case "solid-round": {
      const I = (Math.PI * s.d ** 4) / 64;
      const A = (Math.PI * s.d ** 2) / 4;
      return { A, I, S: I / (s.d / 2), J: 2 * I, c: s.d / 2 };
    }
    case "i-beam": {
      const { bf, tf, hw, tw } = s;
      const H = hw + 2 * tf;
      const I = (bf * H ** 3 - (bf - tw) * hw ** 3) / 12;
      const A = 2 * bf * tf + hw * tw;
      const J = 2 * narrowRectJ(bf, tf) + narrowRectJ(hw, tw);
      return { A, I, S: I / (H / 2), J, c: H / 2 };
    }
  }
}

/** Bending stress σ = M/S (Pa). */
export function bendingStress(momentNm: number, sectionModulusM3: number): number {
  return momentNm / sectionModulusM3;
}

/** Section modulus needed so that a moment M stays under an allowable (m³). */
export function requiredSectionModulus(momentNm: number, allowablePa: number): number {
  return momentNm / allowablePa;
}

/** End conditions for a column; the K factor scales the effective length. */
export type EndCondition = "fixed-free" | "pinned-pinned" | "fixed-pinned" | "fixed-fixed";

export const END_K: Record<EndCondition, number> = {
  "fixed-free": 2.0,
  "pinned-pinned": 1.0,
  "fixed-pinned": 0.7,
  "fixed-fixed": 0.5,
};

/** Effective length Le = K·L (m). */
export function effectiveLength(lengthM: number, ends: EndCondition): number {
  return END_K[ends] * lengthM;
}

/** Euler buckling load P_cr = π²·E·I / Le² (N). */
export function eulerLoad(ePa: number, iM4: number, leM: number): number {
  return (Math.PI ** 2 * ePa * iM4) / leM ** 2;
}

/** Torsional shear stress τ = T·r / J (Pa). */
export function torsionalShear(torqueNm: number, radiusM: number, jM4: number): number {
  return (torqueNm * radiusM) / jM4;
}

/** Angle of twist φ = T·L / (G·J) (radians). */
export function twistAngle(torqueNm: number, lengthM: number, gPa: number, jM4: number): number {
  return (torqueNm * lengthM) / (gPa * jM4);
}

/** Plane-stress von Mises equivalent: √(σx² − σx·σy + σy² + 3τxy²) (Pa). */
export function vonMises(sxPa: number, syPa: number, txyPa: number): number {
  return Math.sqrt(sxPa ** 2 - sxPa * syPa + syPa ** 2 + 3 * txyPa ** 2);
}

/** Margin of safety MS = allowable/applied − 1. Negative means it fails. */
export function marginOfSafety(allowable: number, applied: number): number {
  return allowable / applied - 1;
}

/**
 * Von Mises stress on the outer fiber of a solid shaft carrying bending
 * moment M and torque T (Pa). σ = 32M/πd³, τ = 16T/πd³, then von Mises.
 */
export function shaftVonMises(momentNm: number, torqueNm: number, diameterM: number): number {
  const sigma = (32 * momentNm) / (Math.PI * diameterM ** 3);
  const tau = (16 * torqueNm) / (Math.PI * diameterM ** 3);
  return vonMises(sigma, 0, tau);
}

/**
 * Smallest solid-shaft diameter (m) whose von Mises stress equals the
 * allowable — from d³ = 32·√(M² + ¾T²) / (π·σ_allow). Round UP in practice.
 */
export function shaftDiameterVonMises(momentNm: number, torqueNm: number, allowablePa: number): number {
  return Math.cbrt((32 * Math.sqrt(momentNm ** 2 + 0.75 * torqueNm ** 2)) / (Math.PI * allowablePa));
}
