/**
 * Pure phase-diagram logic for Materials 101, Week 17.
 *
 * No UI here: teaching-grade linearizations of the Cu–Ni isomorphous system
 * and the Pb–Sn eutectic system, the lever rule, tie-line readers, and an
 * equilibrium solidification path (not a nonequilibrium coring simulation).
 *
 * All numbers are classroom-grade linearizations — good enough to learn the
 * reading rules, not to certify a part. Real boundaries curve; the methods
 * are identical.
 */

/** Validate reader inputs rather than extrapolating impossible compositions. */
function validatePoint(c: number, t: number) {
  if (!Number.isFinite(c) || c < 0 || c > 100) throw new RangeError("composition must be in [0, 100] wt%");
  if (!Number.isFinite(t) || t < 0 || t > 2000) throw new RangeError("temperature must be finite and in the teaching domain [0, 2000] °C");
}
function validateIso(c: number, t: number) {
  validatePoint(c, t);
  if (c < 20 || c > 45) throw new RangeError("Cu–Ni straight-line approximation is restricted to 20–45 wt% Ni");
}

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
  validateIso(cNi, t);
  if (t >= CU_NI.liquidus(cNi)) return "L";
  if (t <= CU_NI.solidus(cNi)) return "alpha";
  return "L+alpha";
}

export type Phase = "L" | "alpha" | "beta";
export const PHASE_LABELS: Record<Phase, string> = { L: "liquid", alpha: "α solid", beta: "β solid" };
export interface TieLine {
  /** Phase identities travel with the ordered endpoints. */
  leftPhase: Phase;
  rightPhase: Phase;
  /** Composition of the left (lower-solute) phase end, wt%. */
  cLeft: number;
  /** Composition of the right (higher-solute) phase end, wt%. */
  cRight: number;
}

/** Tie-line ends for Cu–Ni at (cNi, t); null outside the two-phase lens. */
export function isoTieLineAt(cNi: number, t: number): TieLine | null {
  if (isoRegionAt(cNi, t) !== "L+alpha") return null;
  return { cLeft: CU_NI.liquidOnLiquidus(t), cRight: CU_NI.solidOnSolidus(t), leftPhase: "L", rightPhase: "alpha" };
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
  for (const c of [c0, cA, cB]) {
    if (!Number.isFinite(c) || c < 0 || c > 100) throw new RangeError("composition must be finite and in [0, 100]");
  }
  if (cA === cB) throw new Error("tie line has zero length");
  if (cA > cB) throw new RangeError("tie-line ends must be ordered low to high");
  if (c0 < cA - 1e-9 || c0 > cB + 1e-9) throw new RangeError("overall composition must lie between tie-line ends");
  const wA = Math.max(0, Math.min(1, (cB - c0) / (cB - cA)));
  return { wA, wB: 1 - wA };
}

export const PB_SN = {
  eutecticC: 61.9,
  eutecticT: 183,
  /** Pb-side straight line through (0,327) and (61.9,183); endpoint-exact. */
  liquidusAlpha: (t: number) => 61.9 * ((327 - t) / 144),
  /** Sn-side liquidus composition at T. */
  liquidusBeta: (t: number) => 61.9 + 38.1 * ((t - 183) / 49),
  /** α/(L+α) boundary above the eutectic temperature. */
  solidusAlpha: (t: number) => 19.2 * ((327 - t) / 144),
  /** β/(L+β) boundary above the eutectic temperature. */
  solidusBeta: (t: number) => 100 - 2.5 * ((232 - t) / 49),
  /** Solubility of Sn in α-Pb below the eutectic temperature. */
  solvusAlpha: (t: number) => 19.2 * (t / 183),
  /** Sn concentration in β-Sn on its solvus, wt% Sn (not wt% Pb). */
  solvusBeta: (t: number) => 100 - 2.5 * (t / 183),
};

export type EutecticRegion =
  | "L"
  | "alpha"
  | "beta"
  | "L+alpha"
  | "L+beta"
  | "alpha+beta"
  | "eutectic"
  | "pure-melting";

const EUT_TOL = 1e-7; // numerical equality only, not a ±0.5 °C three-phase band

/** Phase field for a Pb–Sn alloy of cSn wt% Sn at temperature t. */
export function eutecticRegionAt(cSn: number, t: number): EutecticRegion {
  validatePoint(cSn, t);
  const te = PB_SN.eutecticT;
  if ((cSn === 0 && Math.abs(t - 327) <= EUT_TOL) || (cSn === 100 && Math.abs(t - 232) <= EUT_TOL)) return "pure-melting";
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
    if (t >= 232) {
      // Sn-side liquidus is gone (Sn melts at 232°C): α, L+α, then liquid
      // toward the eutectic valley.
      if (cSn <= cSolA) return "alpha";
      if (cSn < cLiqA) return "L+alpha";
      return "L";
    }
    const cSolB = PB_SN.solidusBeta(t);
    const cLiqB = PB_SN.liquidusBeta(t);
    if (cSn <= cSolA) return "alpha";
    if (cSn < cLiqA) return "L+alpha";
    if (cSn <= cLiqB) return "L";
    if (cSn < cSolB) return "L+beta";
    return "beta";
  }
  const tc = Math.min(t, te);
  const cSvA = PB_SN.solvusAlpha(tc);
  const cSvB = PB_SN.solvusBeta(tc);
  if (cSn <= cSvA) return "alpha";
  if (cSn < cSvB) return "alpha+beta";
  return "beta";
}

/**
 * Tie-line ends for the Pb–Sn diagram at (cSn, t), ordered low → high wt% Sn;
 * null for single-phase fields, limiting pure-phase boundary states, and
 * the eutectic reaction line (three possible phases; fractions not unique).
 */
export function eutecticTieLineAt(cSn: number, t: number): TieLine | null {
  const region = eutecticRegionAt(cSn, t);
  switch (region) {
    case "L+alpha":
      return { cLeft: PB_SN.solidusAlpha(t), cRight: PB_SN.liquidusAlpha(t), leftPhase: "alpha", rightPhase: "L" };
    case "L+beta":
      return { cLeft: PB_SN.liquidusBeta(t), cRight: PB_SN.solidusBeta(t), leftPhase: "L", rightPhase: "beta" };
    case "alpha+beta": {
      const tc = Math.min(t, PB_SN.eutecticT);
      return { cLeft: PB_SN.solvusAlpha(tc), cRight: PB_SN.solvusBeta(tc), leftPhase: "alpha", rightPhase: "beta" };
    }
    default:
      return null;
  }
}

export const EUTECTIC_REGION_LABELS: Record<EutecticRegion, string> = {
  "pure-melting": "Pure-component melting (solid + liquid)",
  L: "Liquid",
  alpha: "α (Pb-rich solid)",
  beta: "β (Sn-rich solid)",
  "L+alpha": "L + α",
  "L+beta": "L + β",
  "alpha+beta": "α + β",
  eutectic: "Eutectic reaction (L + α + β)",
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
  validateIso(cNi, 1200);
  if (!Number.isFinite(stepC) || stepC <= 0) throw new RangeError("temperature step must be positive and finite");
  const tLiq = CU_NI.liquidus(cNi);
  const tSol = CU_NI.solidus(cNi);
  const n = Math.ceil((tLiq - tSol) / stepC);
  if (n > 10000) throw new RangeError("temperature step would exceed 10000 steps");
  const steps: SolidStep[] = [];
  // Include the solidus even when the requested step does not divide the range.
  for (let i = 0; i <= n; i++) {
    const t = i === n ? tSol : Math.max(tSol, tLiq - i * stepC);
    const cL = CU_NI.liquidOnLiquidus(t);
    const cS = CU_NI.solidOnSolidus(t);
    const { wA: wL, wB: wS } = leverFractions(cNi, cL, cS);
    steps.push({ t, cL, cS, wL, wS });
  }
  return steps;
}

/**
 * Comparison of first equilibrium solid and final equilibrium solid, wt% Ni.
 * This is NOT a no-diffusion/Scheil calculation or a measured core→rim profile.
 * The legacy function name is retained for callers; UI labels state the scope.
 */
export function coringSpread(cNi: number): { core: number; rim: number } {
  validateIso(cNi, 1200);
  const tLiq = CU_NI.liquidus(cNi);
  return { core: CU_NI.solidOnSolidus(tLiq), rim: cNi };
}
