/**
 * Pure phase-diagram logic for Materials 101, Week 17.
 *
 * No UI here: teaching-grade linearizations of the Cu–Ni isomorphous system
 * and the Pb–Sn eutectic system, the lever rule, tie-line readers, and an
 * equilibrium solidification path (plus a coring estimate for fast cooling).
 *
 * All numbers are classroom-grade linearizations — good enough to learn the
 * reading rules, not to certify a part. Real boundaries curve; the methods
 * are identical.
 */

/** Compositions in weight percent, temperatures in °C. */
export const CU_NI = {
  /** Linearized liquidus: T = 1085 + 3.7·C (Cu 1085°C → Ni 1455°C). */
  liquidus: (cNi: number) => 1085 + 3.7 * cNi,
  /** Linearized solidus, running just below the liquidus. */
  solidus: (cNi: number) => 1085 + 3.2 * cNi,
  /** Composition of liquid on the liquidus at temperature t. */
  liquidOnLiquidus: (t: number) => (t - 1085) / 3.7,
  /** Composition of solid on the solidus at temperature t. */
  solidOnSolidus: (t: number) => (t - 1085) / 3.2,
};

export type IsoRegion = "L" | "alpha" | "L+alpha";

/** Phase field for a Cu–Ni alloy of cNi wt% Ni at temperature t. */
export function isoRegionAt(cNi: number, t: number): IsoRegion {
  if (t >= CU_NI.liquidus(cNi)) return "L";
  if (t <= CU_NI.solidus(cNi)) return "alpha";
  return "L+alpha";
}

export interface TieLine {
  /** Composition of the left (lower-solute) phase end, wt%. */
  cLeft: number;
  /** Composition of the right (higher-solute) phase end, wt%. */
  cRight: number;
}

/** Tie-line ends for Cu–Ni at (cNi, t); null outside the two-phase lens. */
export function isoTieLineAt(cNi: number, t: number): TieLine | null {
  if (isoRegionAt(cNi, t) !== "L+alpha") return null;
  return { cLeft: CU_NI.liquidOnLiquidus(t), cRight: CU_NI.solidOnSolidus(t) };
}

/**
 * The lever rule from mass balance: with overall composition c0 between the
 * tie-line ends cA and cB, the fraction of the phase at cA is the opposite
 * segment over the whole tie line.
 */
export function leverFractions(
  c0: number,
  cA: number,
  cB: number,
): { wA: number; wB: number } {
  if (cA === cB) throw new Error("tie line has zero length");
  const wA = (cB - c0) / (cB - cA);
  return { wA, wB: 1 - wA };
}

export const PB_SN = {
  eutecticC: 61.9,
  eutecticT: 183,
  /** Pb-side liquidus composition at T (inverts T = 327 − 2.326·C). */
  liquidusAlpha: (t: number) => (327 - t) / 2.326,
  /** Sn-side liquidus composition at T. */
  liquidusBeta: (t: number) => 61.9 + (t - 183) / 1.286,
  /** α/(L+α) boundary above the eutectic temperature. */
  solidusAlpha: (t: number) => 19.2 * ((327 - t) / 144),
  /** β/(L+β) boundary above the eutectic temperature. */
  solidusBeta: (t: number) => 100 - 2.5 * ((232 - t) / 49),
  /** Solubility of Sn in α-Pb below the eutectic temperature. */
  solvusAlpha: (t: number) => 19.2 * (t / 183),
  /** Solubility of Pb in β-Sn below the eutectic temperature. */
  solvusBeta: (t: number) => 100 - 2.5 * (t / 183),
};

export type EutecticRegion =
  | "L"
  | "alpha"
  | "beta"
  | "L+alpha"
  | "L+beta"
  | "alpha+beta"
  | "eutectic";

const EUT_TOL = 0.5;

/** Phase field for a Pb–Sn alloy of cSn wt% Sn at temperature t. */
export function eutecticRegionAt(cSn: number, t: number): EutecticRegion {
  const te = PB_SN.eutecticT;
  if (
    Math.abs(t - te) <= EUT_TOL &&
    cSn > PB_SN.solvusAlpha(te) &&
    cSn < PB_SN.solvusBeta(te)
  ) {
    return "eutectic";
  }
  if (t > te) {
    if (t >= 327) return "L";
    const cLiqA = PB_SN.liquidusAlpha(t);
    const cSolA = PB_SN.solidusAlpha(t);
    if (t > 232) {
      // Sn-side liquidus is gone (Sn melts at 232°C): α, L+α, then liquid
      // toward the eutectic valley.
      if (cSn < cSolA) return "alpha";
      if (cSn <= cLiqA) return "L+alpha";
      return "L";
    }
    const cSolB = PB_SN.solidusBeta(t);
    const cLiqB = PB_SN.liquidusBeta(t);
    if (cSn < cSolA) return "alpha";
    if (cSn <= cLiqA) return "L+alpha";
    if (cSn < cLiqB) return "L";
    if (cSn <= cSolB) return "L+beta";
    return "beta";
  }
  const tc = Math.min(t, te);
  const cSvA = PB_SN.solvusAlpha(tc);
  const cSvB = PB_SN.solvusBeta(tc);
  if (cSn < cSvA) return "alpha";
  if (cSn <= cSvB) return "alpha+beta";
  return "beta";
}

/**
 * Tie-line ends for the Pb–Sn diagram at (cSn, t), ordered low → high wt% Sn;
 * null for single-phase fields and the eutectic point (three phases, no
 * single tie line).
 */
export function eutecticTieLineAt(cSn: number, t: number): TieLine | null {
  const region = eutecticRegionAt(cSn, t);
  switch (region) {
    case "L+alpha":
      return { cLeft: PB_SN.solidusAlpha(t), cRight: PB_SN.liquidusAlpha(t) };
    case "L+beta":
      return { cLeft: PB_SN.solidusBeta(t), cRight: PB_SN.liquidusBeta(t) };
    case "alpha+beta": {
      const tc = Math.min(t, PB_SN.eutecticT);
      return { cLeft: PB_SN.solvusAlpha(tc), cRight: PB_SN.solvusBeta(tc) };
    }
    default:
      return null;
  }
}

export const EUTECTIC_REGION_LABELS: Record<EutecticRegion, string> = {
  L: "Liquid",
  alpha: "α (Pb-rich solid)",
  beta: "β (Sn-rich solid)",
  "L+alpha": "L + α",
  "L+beta": "L + β",
  "alpha+beta": "α + β",
  eutectic: "Eutectic (L + α + β)",
};

export interface SolidStep {
  t: number;
  /** Liquid composition on the liquidus, wt% Ni. */
  cL: number;
  /** Solid composition on the solidus, wt% Ni. */
  cS: number;
  wL: number;
  wS: number;
}

/**
 * Equilibrium solidification path for a Cu–Ni alloy: steps of stepC degrees
 * from the liquidus down to the solidus. At each step the tie line gives the
 * phase compositions and the lever rule gives the fractions.
 */
export function isoSolidificationPath(cNi: number, stepC = 2): SolidStep[] {
  if (cNi <= 0 || cNi >= 100) throw new Error("composition must be in (0, 100)");
  const tLiq = CU_NI.liquidus(cNi);
  const tSol = CU_NI.solidus(cNi);
  const steps: SolidStep[] = [];
  for (let t = tLiq; t >= tSol - 1e-9; t -= stepC) {
    const tc = Math.max(t, tSol);
    const cL = CU_NI.liquidOnLiquidus(tc);
    const cS = CU_NI.solidOnSolidus(tc);
    const { wA: wL, wB: wS } = leverFractions(cNi, cL, cS);
    steps.push({ t: tc, cL, cS, wL, wS });
    if (tc === tSol) break;
  }
  return steps;
}

/**
 * Coring estimate for fast cooling (no diffusion in the solid): the first
 * solid to form has the solidus composition at the liquidus temperature, the
 * last solid has the alloy composition. Returns the dendrite core→rim
 * composition spread in wt% Ni.
 */
export function coringSpread(cNi: number): { core: number; rim: number } {
  const tLiq = CU_NI.liquidus(cNi);
  return { core: CU_NI.solidOnSolidus(tLiq), rim: cNi };
}
