/**
 * Physics 101, Week 10 — synthesis support logic.
 *
 * Pure functions only, no UI. Two jobs:
 *  1. The tow-launch synthesis chain (lesson `towlaunch` + Glider Lab I):
 *     tow energy -> drag polar -> trim speed -> steady-glide force balance ->
 *     glide range, all built on the forge sim's closed forms
 *     (src/forge/sim/formulas.ts) so the lab reuses the mission's own model.
 *  2. The mastery check (lesson `masterycheck`): the 12-item closed-book bank,
 *     the 70% gate, and the correction workflow for missed conservation/FBD
 *     items.
 *
 * SI units in, SI units out.
 */
import {
  finiteWingSlope,
  inducedDragCoeff,
  liftCoeff,
  staticMargin,
} from "../forge/sim/formulas.ts";

export const G = 9.81;
export const RHO_AIR = 1.225;

/**
 * The Week-10 reference glider: the forge "glider" mission's vehicle reduced
 * to the numbers the synthesis chain needs. The parasite-drag coefficient is
 * the least certain input and is stated as an estimate, not a measurement.
 */
export const REFERENCE_GLIDER = {
  massKg: 0.1,
  spanM: 0.5,
  chordM: 0.09,
  alphaDeg: 4,
  cd0: 0.03,
  oswald: 0.85,
  stallDeg: 12,
  xNpMm: 135, // neutral point, from the mission's stability analysis
  xCgMm: 120,
  releaseSpeedMs: 8,
  releaseAltitudeM: 30,
} as const;

export function wingArea(spanM: number, chordM: number): number {
  return spanM * chordM;
}

export function aspectRatio(spanM: number, chordM: number): number {
  return (spanM * spanM) / wingArea(spanM, chordM);
}

export type Polar = { cl: number; cd: number; ld: number };

/** Drag polar at a trim angle: linear lift slope, parasite + induced drag. */
export function polarAt(alphaDeg: number, cd0: number, ar: number, oswald: number): Polar {
  const cl = liftCoeff((alphaDeg * Math.PI) / 180, 0, finiteWingSlope(ar), (REFERENCE_GLIDER.stallDeg * Math.PI) / 180);
  const cd = cd0 + inducedDragCoeff(cl, ar, oswald);
  return { cl, cd, ld: cl / cd };
}

/** Trim speed from L = W solved for v. */
export function trimSpeed(weightN: number, rho: number, areaM2: number, cl: number): number {
  return Math.sqrt((2 * weightN) / (rho * areaM2 * cl));
}

export type GlideState = { liftN: number; dragN: number; gammaDeg: number };

/** Steady-glide force balance: the flight-path angle is set by D/L. */
export function steadyGlide(weightN: number, ld: number): GlideState {
  const gamma = Math.atan(1 / ld);
  return {
    liftN: weightN * Math.cos(gamma),
    dragN: weightN * Math.sin(gamma),
    gammaDeg: (gamma * 180) / Math.PI,
  };
}

/** Still-air glide range: every meter of altitude buys L/D meters of distance. */
export function glideRange(altitudeM: number, ld: number): number {
  return altitudeM * ld;
}

/** Sink rate from the flight-path geometry: v_sink = v / sqrt(1 + (L/D)^2). */
export function sinkRate(speedMs: number, ld: number): number {
  return speedMs / Math.sqrt(1 + ld * ld);
}

export type TowLedger = { keJ: number; peJ: number; totalJ: number };

/** The tow line's work, split into the speed and altitude accounts. */
export function towEnergy(massKg: number, releaseSpeedMs: number, altitudeM: number, g = G): TowLedger {
  const keJ = 0.5 * massKg * releaseSpeedMs ** 2;
  const peJ = massKg * g * altitudeM;
  return { keJ, peJ, totalJ: keJ + peJ };
}

/**
 * Altitude spent buying missing speed: released below trim, the glider trades
 * PE for KE until lift meets weight. Zero when already at or above trim.
 */
export function speedDeficitDrop(v0: number, vTrim: number, g = G): number {
  if (vTrim <= v0) return 0;
  return (vTrim * vTrim - v0 * v0) / (2 * g);
}

/** Static margin as a percentage of chord, via the forge closed form. */
export function staticMarginPct(xNpMm: number, xCgMm: number, macMm: number): number {
  return staticMargin(xNpMm, xCgMm, macMm) * 100;
}

export type GliderSynthesis = {
  weightN: number;
  areaM2: number;
  aspectRatio: number;
  cl: number;
  cd: number;
  liftDrag: number;
  trimSpeedMs: number;
  gammaDeg: number;
  liftN: number;
  dragN: number;
  rangeM: number;
  sinkMs: number;
  marginPct: number;
  tow: TowLedger;
  deficitDropM: number;
};

/** The full tow-launch chain for the reference glider, every link computed. */
export function referenceGliderSynthesis(): GliderSynthesis {
  const gl = REFERENCE_GLIDER;
  const weightN = gl.massKg * G;
  const areaM2 = wingArea(gl.spanM, gl.chordM);
  const ar = aspectRatio(gl.spanM, gl.chordM);
  const polar = polarAt(gl.alphaDeg, gl.cd0, ar, gl.oswald);
  const vTrim = trimSpeed(weightN, RHO_AIR, areaM2, polar.cl);
  const glide = steadyGlide(weightN, polar.ld);
  return {
    weightN,
    areaM2,
    aspectRatio: ar,
    cl: polar.cl,
    cd: polar.cd,
    liftDrag: polar.ld,
    trimSpeedMs: vTrim,
    gammaDeg: glide.gammaDeg,
    liftN: glide.liftN,
    dragN: glide.dragN,
    rangeM: glideRange(gl.releaseAltitudeM, polar.ld),
    sinkMs: sinkRate(vTrim, polar.ld),
    marginPct: staticMarginPct(gl.xNpMm, gl.xCgMm, gl.chordM * 1000),
    tow: towEnergy(gl.massKg, gl.releaseSpeedMs, gl.releaseAltitudeM),
    deficitDropM: speedDeficitDrop(gl.releaseSpeedMs, vTrim),
  };
}

// ---------------------------------------------------------------------------
// Mastery check: the closed-book bank, the gate, and the correction workflow.
// ---------------------------------------------------------------------------

export type MasteryTopic = "conservation" | "fbd" | "mixed";

export type MasteryItem = {
  id: string;
  topic: MasteryTopic;
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

/**
 * Twelve closed-book items: four conservation, four free-body diagrams, four
 * cross-cutting the rest of the block. The weighting is deliberate — those two
 * topics are the load-bearing skills of the whole course.
 */
export const MASTERY_BANK: MasteryItem[] = [
  {
    id: "cons-drop",
    topic: "conservation",
    prompt: "A 0.50 kg ball falls 10 m with no air drag. Its speed just before impact is…",
    options: ["≈ 14 m/s", "≈ 9.9 m/s", "≈ 19.6 m/s", "≈ 7.0 m/s"],
    answer: 0,
    why: "mgh = ½mv² ⇒ v = √(2gh) = √(2·9.81·10) ≈ 14 m/s. The mass cancels — a 5 kg ball lands at the same speed. 9.9 m/s is √(gh), the classic dropped factor of 2.",
  },
  {
    id: "cons-collide",
    topic: "conservation",
    prompt: "A 2.0 kg cart at 3.0 m/s hits a stationary 1.0 kg cart and they stick. The pair moves at…",
    options: ["2.0 m/s", "3.0 m/s", "1.5 m/s", "1.0 m/s"],
    answer: 0,
    why: "Momentum is conserved: (2.0)(3.0) = (3.0)v ⇒ v = 2.0 m/s. Kinetic energy is not — the missing 3.0 J went into deformation and heat. Conserving KE here is the error the item hunts.",
  },
  {
    id: "cons-pendulum",
    topic: "conservation",
    prompt: "A pendulum swings with no friction. Through the swing, which is conserved?",
    options: ["Mechanical energy", "Momentum", "Both", "Neither"],
    answer: 0,
    why: "Gravity is conservative and the string does no work, so KE + PE is constant. Momentum is not conserved — gravity and the string exert external impulses throughout the swing.",
  },
  {
    id: "cons-inelastic",
    topic: "conservation",
    prompt: "In a perfectly inelastic collision, kinetic energy is lost. It went into…",
    options: [
      "Deformation, heat, and sound",
      "The other object's kinetic energy",
      "Potential energy of the system",
      "Nowhere — energy is always conserved as KE",
    ],
    answer: 0,
    why: "Total energy is conserved; kinetic energy is not. Internal forces do work that becomes thermal energy, sound, and permanent deformation. 'Conserved' attaches to the total, never to one ledger column.",
  },
  {
    id: "fbd-incline",
    topic: "fbd",
    prompt: "A block slides without friction down a 30° incline. Its acceleration is…",
    options: ["g·sin30° ≈ 4.9 m/s²", "g·cos30° ≈ 8.5 m/s²", "g ≈ 9.8 m/s²", "g·tan30° ≈ 5.7 m/s²"],
    answer: 0,
    why: "Axes along the plane: the downslope weight component is mg·sin30°, so a = g·sin30° ≈ 4.9 m/s². Cosine is the into-the-plane component — it sets the normal force, not the acceleration.",
  },
  {
    id: "fbd-book",
    topic: "fbd",
    prompt: "A book rests on a table. The forces on the book are…",
    options: [
      "Gravity down and the normal force up, equal in magnitude",
      "Gravity down only — the table pushes nothing",
      "The normal force up only — the table's stiffness balances gravity",
      "Gravity down, plus friction sideways",
    ],
    answer: 0,
    why: "Equilibrium means ΣF = 0: gravity mg down, normal N = mg up. No motion means no friction. The table doesn't 'cancel' gravity — it pushes back exactly as hard as the book presses down.",
  },
  {
    id: "fbd-push",
    topic: "fbd",
    prompt:
      "You push two touching blocks (3 kg against your hands, 2 kg in front of it) with 10 N on a frictionless floor. The 3 kg block pushes the 2 kg block with…",
    options: ["4 N", "6 N", "10 N", "5 N"],
    answer: 0,
    why: "Both accelerate together at a = 10/5 = 2 m/s². Isolate the 2 kg block: its only horizontal force is the contact push, so F = (2)(2) = 4 N. The 10 N acts on the 3 kg block — forces don't transmit through bodies undiminished.",
  },
  {
    id: "fbd-atwood",
    topic: "fbd",
    prompt: "An Atwood machine: 3 kg and 5 kg over a massless, frictionless pulley. The string tension is…",
    options: ["36.8 N", "29.4 N", "49.0 N", "39.2 N"],
    answer: 0,
    why: "a = (5−3)g/(5+3) = g/4 = 2.45 m/s². For the 3 kg mass: T − 3g = 3a ⇒ T = 3(9.81 + 2.45) = 36.8 N. Tension sits between the two weights — the lighter mass is yanked up harder than its own weight.",
  },
  {
    id: "mix-power",
    topic: "mixed",
    prompt: "The dimension of power is…",
    options: ["ML²T⁻³", "ML²T⁻²", "MLT⁻²", "MLT⁻³"],
    answer: 0,
    why: "Power is energy per time: [E]/T = ML²T⁻²/T = ML²T⁻³. ML²T⁻² is energy; MLT⁻² is force. One wrong exponent is a different physical quantity entirely.",
  },
  {
    id: "mix-vector",
    topic: "mixed",
    prompt: "A = (3, 4) and B = (−3, 1). |A + B| is…",
    options: ["5", "7", "√26 ≈ 5.1", "10"],
    answer: 0,
    why: "A + B = (0, 5), so |A + B| = 5. Adding the magnitudes (5 + √10 ≈ 8.2) is the classic error — magnitudes add only for parallel vectors.",
  },
  {
    id: "mix-torque",
    topic: "mixed",
    prompt: "A 30 kg child sits 2.0 m left of a seesaw pivot. Where must a 20 kg child sit on the right to balance?",
    options: ["3.0 m right", "2.0 m right", "1.3 m right", "4.5 m right"],
    answer: 0,
    why: "Balance needs equal torques: (30)(2.0) = (20)d ⇒ d = 3.0 m. The lighter child needs the longer lever arm — torque is force times distance, not force alone.",
  },
  {
    id: "mix-buoy",
    topic: "mixed",
    prompt: "A 0.50 m³ crate is fully submerged in water (ρ = 1000 kg/m³). The buoyant force is…",
    options: ["≈ 4.9 kN", "≈ 0.49 kN", "≈ 49 kN", "Zero — it depends on the crate's weight"],
    answer: 0,
    why: "Archimedes: F = ρVg = (1000)(0.50)(9.81) ≈ 4.9 kN. Buoyancy depends on displaced water, not on the crate's weight — the weight decides whether it sinks, not how hard the water pushes.",
  },
];

/** The block gate: 70% clears the mastery check. */
export const MASTERY_GATE_PCT = 70;

export function masteryPct(correct: number, total: number): number {
  return total === 0 ? 0 : (correct / total) * 100;
}

export function masteryPass(correct: number, total: number): boolean {
  return masteryPct(correct, total) >= MASTERY_GATE_PCT;
}

/**
 * Missed items that demand a filed correction before Materials 101:
 * every missed conservation-law or free-body-diagram item.
 */
export function correctionsRequired(missed: MasteryItem[]): MasteryItem[] {
  return missed.filter((m) => m.topic === "conservation" || m.topic === "fbd");
}
