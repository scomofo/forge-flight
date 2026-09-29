/**
 * Materials 101, Week 18 — pure family logic (no UI).
 *
 * Property envelopes for the four families, hard-constraint screening,
 * the composite rule of mixtures, and specific (per-mass) properties.
 * Numbers are classroom values, not datasheet claims: envelopes span the
 * ordinary engineering range of each family, and screening uses the
 * envelope edge that favors the family (best case) so a "fail" is honest.
 */

export type FamilyId = "metal" | "ceramic" | "polymer" | "composite";

export const FAMILIES: FamilyId[] = ["metal", "ceramic", "polymer", "composite"];

export const FAMILY_LABEL: Record<FamilyId, string> = {
  metal: "Metal",
  ceramic: "Ceramic",
  polymer: "Polymer",
  composite: "Composite",
};

export type FamilyProfile = {
  family: FamilyId;
  /** Property envelopes as [low, high]. */
  density: [number, number]; // g/cm³
  modulus: [number, number]; // GPa
  strength: [number, number]; // MPa, tensile (ceramics: flaw-limited tensile)
  serviceTemp: [number, number]; // °C, continuous service
  directional: boolean; // properties depend strongly on orientation
  conducts: boolean | "varies"; // electrical conduction
  corrosionResistant: boolean; // typical uncoated behavior
  diesBy: string; // the characteristic failure mode
  tempStory: string; // what the service-temperature limit means
  /**
   * A specialist sub-family that clears service temperatures above the
   * ordinary envelope, at a cost penalty. Screening judges the family at its
   * best edge, so above serviceTemp[1] (and up to upTo) the family is judged
   * as this grade instead of being killed outright.
   */
  hotEscape?: {
    via: string; // the grades that survive
    upTo: number; // °C, continuous service ceiling of those grades
    costVsSteel: number; // rough material cost multiple vs ordinary steel
    oxidationResistant: boolean; // survives hot air uncoated
  };
};

export const PROFILES: Record<FamilyId, FamilyProfile> = {
  metal: {
    family: "metal",
    density: [2.7, 7.9],
    modulus: [70, 200],
    strength: [200, 1000],
    serviceTemp: [-50, 400],
    directional: false,
    conducts: true,
    corrosionResistant: false,
    diesBy: "Yields, then tears — or creeps under sustained load when hot.",
    tempStory:
      "Sustained load above roughly 0.4× the melting point (in kelvin) brings creep: aluminum sags near 150°C, steels near 450°C. Nickel superalloys push on to about 1000°C, at roughly 20× the cost of steel.",
    hotEscape: { via: "nickel superalloys", upTo: 1000, costVsSteel: 20, oxidationResistant: true },
  },
  ceramic: {
    family: "ceramic",
    density: [2.5, 4.0],
    modulus: [70, 400],
    strength: [50, 500],
    serviceTemp: [-50, 1400],
    directional: false,
    conducts: false,
    corrosionResistant: true,
    diesBy: "Snaps with almost no warning — and cracks from sudden temperature change (thermal shock).",
    tempStory:
      "Covalent and ionic networks keep their stiffness to 1000°C and beyond. Heat is not the enemy; rapid change of heat is.",
  },
  polymer: {
    family: "polymer",
    density: [0.9, 1.4],
    modulus: [0.1, 4],
    strength: [20, 100],
    serviceTemp: [-50, 150],
    directional: false,
    conducts: false,
    corrosionResistant: true,
    diesBy: "Softens through its glass transition, then creeps under any sustained load.",
    tempStory:
      "Stiffness is borrowed from frozen chains. Past the glass transition the chains move and the modulus collapses — HDPE is done near 80°C; only exotics like PEEK reach 250°C.",
  },
  composite: {
    family: "composite",
    density: [1.2, 2.0],
    modulus: [10, 150],
    strength: [100, 1500],
    serviceTemp: [-50, 250],
    directional: true,
    conducts: "varies",
    corrosionResistant: true,
    diesBy: "Delaminates or splits across the fiber; the matrix sets the temperature ceiling.",
    tempStory:
      "The fiber can take the heat, but the matrix cannot — an epoxy-matrix composite is done near 120°C no matter how heroic the carbon is.",
  },
};

/** Specific (per-mass) stiffness: GPa per g/cm³. */
export function specificModulus(modulusGPa: number, density: number): number {
  return modulusGPa / density;
}

/** Specific (per-mass) strength: MPa per g/cm³. */
export function specificStrength(strengthMPa: number, density: number): number {
  return strengthMPa / density;
}

/**
 * Rule of mixtures, Voigt bound: load parallel to continuous fibers.
 * The stiff fiber carries the strain; the composite is fiber-dominated.
 */
export function voigtModulus(fiberFrac: number, eFiber: number, eMatrix: number): number {
  return fiberFrac * eFiber + (1 - fiberFrac) * eMatrix;
}

/**
 * Rule of mixtures, Reuss bound: load across the fibers (series).
 * The soft matrix takes most of the strain; the composite is matrix-dominated.
 */
export function reussModulus(fiberFrac: number, eFiber: number, eMatrix: number): number {
  return 1 / (fiberFrac / eFiber + (1 - fiberFrac) / eMatrix);
}

/** Directionality ratio: how many times stiffer along the fiber than across it. */
export function anisotropyRatio(fiberFrac: number, eFiber: number, eMatrix: number): number {
  return voigtModulus(fiberFrac, eFiber, eMatrix) / reussModulus(fiberFrac, eFiber, eMatrix);
}

/**
 * Thermal-shock stress estimate: σ ≈ E·α·ΔT.
 * Returns MPa. Compare against the family's tensile strength.
 */
export function thermalShockStress(modulusGPa: number, ctePerK: number, deltaTK: number): number {
  return modulusGPa * 1000 * ctePerK * deltaTK; // GPa → MPa
}

/** Creep-onset estimate: ~0.4 × melting point, in kelvin, converted back to °C. */
export function creepOnsetC(meltingPointC: number): number {
  return 0.4 * (meltingPointC + 273.15) - 273.15;
}

export type Constraints = {
  minServiceTemp?: number; // °C, continuous
  maxDensity?: number; // g/cm³
  minModulus?: number; // GPa
  minStrength?: number; // MPa
  electrical?: "conduct" | "insulate" | "any";
  corrosion?: boolean; // must resist corrosion uncoated
  forbidDirectional?: boolean; // load direction unknown → anisotropy unacceptable
};

export type ScreenResult = {
  family: FamilyId;
  passes: boolean;
  failedOn: string[];
  /** Set when the family survives only through its hotEscape grades. */
  survivesVia?: string;
  /** Cost multiple vs ordinary steel carried by those grades. */
  costPenalty?: number;
  /** Plain-language flag explaining the narrow survival. */
  caveat?: string;
};

/**
 * Hard-constraint screening. Each family is judged at its BEST envelope edge,
 * so a fail means even the family's champion cannot clear the bar.
 * Soft tradeoffs (cost, mass, "nice to have") are not screens — they rank
 * the survivors, and that ranking is a separate, human step.
 */
export function screenFamilies(c: Constraints): ScreenResult[] {
  return FAMILIES.map((family) => {
    const p = PROFILES[family];
    const failedOn: string[] = [];
    const escape =
      c.minServiceTemp !== undefined &&
      p.serviceTemp[1] < c.minServiceTemp &&
      p.hotEscape !== undefined &&
      c.minServiceTemp <= p.hotEscape.upTo
        ? p.hotEscape
        : undefined;
    if (c.minServiceTemp !== undefined && !escape && p.serviceTemp[1] < c.minServiceTemp) {
      failedOn.push(
        `service temperature: needs ${c.minServiceTemp}°C, family tops out at ${p.serviceTemp[1]}°C`,
      );
    }
    if (c.maxDensity !== undefined && p.density[0] > c.maxDensity) {
      failedOn.push(
        `density: needs ≤ ${c.maxDensity} g/cm³, family starts at ${p.density[0]} g/cm³`,
      );
    }
    if (c.minModulus !== undefined && p.modulus[1] < c.minModulus) {
      failedOn.push(
        `stiffness: needs ${c.minModulus} GPa, family tops out at ${p.modulus[1]} GPa`,
      );
    }
    if (c.minStrength !== undefined && p.strength[1] < c.minStrength) {
      failedOn.push(
        `strength: needs ${c.minStrength} MPa, family tops out at ${p.strength[1]} MPa`,
      );
    }
    if (c.electrical === "conduct" && p.conducts !== true) {
      failedOn.push("electrical: must conduct, family insulates (or varies)");
    }
    if (c.electrical === "insulate" && p.conducts === true) {
      failedOn.push("electrical: must insulate, family conducts");
    }
    if (c.corrosion && !(escape ? escape.oxidationResistant : p.corrosionResistant)) {
      failedOn.push("corrosion: must survive uncoated, family needs protection");
    }
    if (c.forbidDirectional && p.directional) {
      failedOn.push("directionality: load direction unknown, anisotropy unacceptable");
    }
    const passes = failedOn.length === 0;
    if (escape && passes) {
      return {
        family,
        passes,
        failedOn,
        survivesVia: escape.via,
        costPenalty: escape.costVsSteel,
        caveat: `ordinary grades top out at ${p.serviceTemp[1]}°C; at ${c.minServiceTemp}°C only ${escape.via} survive, at ~${escape.costVsSteel}× the cost of steel`,
      };
    }
    return { family, passes, failedOn };
  });
}

/**
 * The screen-then-rank pick. Survivors that clear the screens outright beat
 * survivors that clear them only through a cost-penalty grade. Returns the
 * single outright survivor, or — if every survivor carries a penalty — the
 * cheapest of them. Returns null when nothing survives or when two or more
 * outright survivors remain (ranking them is a human tradeoff step).
 */
export function recommendFamily(results: ScreenResult[]): FamilyId | null {
  const standing = results.filter((r) => r.passes);
  const outright = standing.filter((r) => r.costPenalty === undefined);
  if (outright.length === 1) return outright[0].family;
  if (outright.length > 1 || standing.length === 0) return null;
  return [...standing].sort((a, b) => (a.costPenalty ?? 0) - (b.costPenalty ?? 0))[0].family;
}

/** Families still standing after the screens, in canonical order. */
export function survivors(results: ScreenResult[]): FamilyId[] {
  return results.filter((r) => r.passes).map((r) => r.family);
}
