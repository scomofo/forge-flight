/**
 * Materials 101, Week 11 — bonding → property prediction logic.
 *
 * Pure, UI-free rules: given a bond type, read off the qualitative property
 * pack; given a learner's prediction, score it against the pack. All numbers
 * are honest orders of magnitude, labeled as such — bond energy correlates
 * with melting point, it does not determine it by formula.
 */

export type BondKind =
  | "metallic"
  | "ionic"
  | "covalent-network"
  | "covalent-molecular"
  | "secondary";

export type Conduction = "conductor" | "insulator" | "insulator-until-molten";
export type Mechanical = "ductile" | "brittle" | "soft";
export type Thermal = "high-melting" | "decomposes-or-softens" | "low-melting";

export interface PropertyPack {
  conduction: Conduction;
  mechanical: Mechanical;
  thermal: Thermal;
}

export type ReferencePropertyPack = {
  conduction: Conduction | "semiconductor" | "material-dependent";
  mechanical: Mechanical | "material-dependent";
  thermal: Thermal | "high-temperature" | "material-dependent";
};

export interface BondProfile extends PropertyPack {
  kind: BondKind;
  label: string;
  /** Illustrative separation energy; compare only with its stated molar basis. */
  energyBasis: string;
  energyRangeKJ: [number, number];
  examples: string;
  why: string;
}

export const BOND_PROFILES: Record<BondKind, BondProfile> = {
  metallic: {
    kind: "metallic",
    energyBasis: "Cohesive separation per mole of atoms; not heat of fusion",
    label: "Metallic",
    energyRangeKJ: [100, 850],
    examples: "Sodium, copper, iron, tungsten",
    conduction: "conductor",
    mechanical: "ductile",
    thermal: "high-melting",
    why: "Mobile, delocalized electrons support metallic conduction. Slip can be possible without changing the whole bonding pattern, but ductility depends on microstructure, processing and test temperature. Metallic bonding alone does not establish a melting temperature or guarantee ductility; sodium and tungsten illustrate the breadth of this family.",
  },
  ionic: {
    kind: "ionic",
    energyBasis: "Separation to gaseous ions per mole of formula units; not heat of fusion",
    label: "Ionic",
    energyRangeKJ: [600, 4000],
    examples: "Sodium chloride, magnesium oxide",
    conduction: "insulator-until-molten",
    mechanical: "brittle",
    thermal: "high-melting",
    why: "A simplified salt lattice has oppositely charged ions. Many room-temperature salt crystals have little mobile charge and are brittle under ordinary loading. Molten salts conduct through ion motion. These are representative tendencies; temperature, defects and available slip processes can alter solid-state behavior.",
  },
  "covalent-network": {
    kind: "covalent-network",
    energyBasis: "Illustrative bond dissociation per mole of bonds; not a bulk melting calculation",
    label: "Covalent (network)",
    energyRangeKJ: [150, 600],
    examples: "Diamond and quartz are representative insulating networks; silicon carbide is a semiconductor",
    conduction: "insulator",
    mechanical: "brittle",
    thermal: "high-melting",
    why: "Strong directional bonds in a continuous network often give high stiffness and limited easy slip. Electrical behavior needs the specific material: diamond can insulate, silicon carbide is a semiconductor, and graphite conducts especially well within its layers. High-temperature resistance is not a promise that the material melts instead of decomposing or subliming; atmosphere also matters.",
  },
  "covalent-molecular": {
    kind: "covalent-molecular",
    energyBasis: "Intramolecular bond dissociation per mole of bonds, not intermolecular fusion",
    label: "Covalent (molecular)",
    energyRangeKJ: [150, 600],
    examples: "Sulfur (S₈ rings), ice, sugar",
    conduction: "insulator",
    mechanical: "brittle",
    thermal: "low-melting",
    why: "Strong bonds hold each molecule together; weaker interactions act between molecules. Sulfur is a representative brittle, insulating molecular crystal with a low melting temperature. Other molecular solids can instead decompose. Their internal bond energy is not their heat of fusion.",
  },
  secondary: {
    kind: "secondary",
    energyBasis: "Intermolecular interaction scale; the interacting units must be specified",
    label: "Secondary (dominant)",
    energyRangeKJ: [1, 40],
    examples: "Polyethylene, waxes, rubber",
    conduction: "insulator",
    mechanical: "soft",
    thermal: "decomposes-or-softens",
    why: "Interactions between chains influence rearrangement, but the chains themselves are covalently bonded. Glass-transition softening, crystalline melting and chemical degradation are different. Mechanical response depends on temperature, crystallinity, orientation and crosslinks; this family does not have one universal softness or thermal threshold.",
  },
};

/** Legacy representative pack, not a universal family classification. */
export function predictProperties(kind: BondKind): PropertyPack {
  const p = BOND_PROFILES[kind];
  return { conduction: p.conduction, mechanical: p.mechanical, thermal: p.thermal };
}

/**
 * Legacy numeric energy-band classifier, retained for saved integrations.
 * Despite its historical name, this is NOT a melting regime or temperature
 * prediction and is not displayed by the current teaching components.
 */
export function meltingRegime(energyKJ: number): "low" | "moderate" | "high" {
  if (energyKJ < 100) return "low";
  if (energyKJ <= 500) return "moderate";
  return "high";
}

export interface ChallengeSubstance {
  name: string;
  hint: string;
  kind: BondKind;
  why: string;
  /** Measured/reference exceptions override a broad family tendency. */
  properties?: ReferencePropertyPack;
}

/** Unfamiliar substances for the prediction bench — the week's evidence. */
export const SUBSTANCES: ChallengeSubstance[] = [
  {
    name: "Silicon carbide",
    hint: "Every silicon atom is bonded tetrahedrally to four carbons, and every carbon to four silicons, in one continuous network. It is sold as an abrasive.",
    kind: "covalent-network",
    properties: { conduction: "semiconductor", mechanical: "brittle", thermal: "high-temperature" },
    why: "Its strong covalent network helps explain hardness and brittleness. Silicon carbide is a semiconductor, not a categorical insulator. Its high-temperature resistance does not imply a simple ambient-pressure melting point. Check the named material rather than treating its bond label as an electrical measurement.",
  },
  {
    name: "Magnesium",
    properties: { conduction: "conductor", mechanical: "ductile", thermal: "high-melting" },
    hint: "Consider processed magnesium ribbon: a conducting metal that has undergone plastic forming. For this qualitative exercise its 650 °C melting temperature belongs to the high-melting choice relative to sulfur and polyethylene; that category is not a service-temperature rating.",
    kind: "metallic",
    why: "Magnesium conducts. The specified processed ribbon demonstrates plastic formability; it does not imply that every magnesium product is equally ductile at room temperature. Its supplied 650 °C melting point is reference information, not derived from metallic bonding.",
  },
  {
    name: "Polyethylene",
    properties: { conduction: "insulator", mechanical: "soft", thermal: "decomposes-or-softens" },
    hint: "Consider an unfilled, uncrosslinked polyethylene film: covalent backbones with weaker inter-chain interactions. For this exercise choose its easy deformation, electrical insulation, and thermal softening rather than a precise transition temperature.",
    kind: "secondary",
    why: "The specified polyethylene film is an electrical insulator and deforms relatively easily. Its chains can become more mobile without backbone decomposition. Glass transition and melting of crystalline regions are distinct; grade and crystallinity affect their temperatures. The broad thermal answer here identifies softening, not measured chemical degradation.",
  },
  {
    name: "Sodium chloride",
    properties: { conduction: "insulator-until-molten", mechanical: "brittle", thermal: "high-melting" },
    hint: "A crystal of alternating positive and negative ions. It shatters under a hammer and dissolves in water.",
    kind: "ionic",
    why: "A charge-locked lattice: brittle, high-melting, insulating as a solid — but the melt conducts, because the ions themselves are mobile charges.",
  },
  {
    name: "Sulfur",
    properties: { conduction: "insulator", mechanical: "brittle", thermal: "low-melting" },
    hint: "Rings of eight sulfur atoms, each ring strongly bonded internally; the rings stack on each other weakly. It melts at 115°C.",
    kind: "covalent-molecular",
    why: "Molecular, not network: heating defeats only the weak inter-ring bonds, so it melts low. The cold crystal is brittle and insulating.",
  },
  {
    name: "Graphite",
    hint: "Sheets of carbon form a hexagonal mesh, with strong bonds within each sheet and weak bonding between sheets. For this round, predict electrical conduction along a sheet and mechanical sliding between sheets. Consider thermal behavior in a non-oxidizing atmosphere.",
    kind: "covalent-network",
    properties: { conduction: "conductor", mechanical: "soft", thermal: "high-temperature" },
    why: "Delocalized electrons allow conduction along the sheets; conduction across them is much poorer, not identically zero. Layers slide relatively easily, although the sheets themselves are stiff. These directional properties cannot be graded against an isotropic network template. High-temperature resistance here assumes a non-oxidizing atmosphere, not unlimited service in air.",
  },
];

/** Use the named substance's reference behavior, not a universal bond lookup.
 * Sources: NIST, Characterization and Modeling of Silicon-Carbide Power Devices;
 * Cambridge DoITPoMS, Anisotropic electrical conductivity. See audit references. */
export function profileProperties(kind: BondKind): ReferencePropertyPack {
  if (kind === "metallic") return { conduction: "conductor", mechanical: "material-dependent", thermal: "material-dependent" };
  if (kind === "secondary") return { conduction: "insulator", mechanical: "material-dependent", thermal: "material-dependent" };
  if (kind === "covalent-network") return { conduction: "material-dependent", mechanical: "brittle", thermal: "high-temperature" };
  return predictProperties(kind);
}

export function substanceProperties(substance: ChallengeSubstance): ReferencePropertyPack {
  return { ...(substance.properties ?? predictProperties(substance.kind)) };
}

export function scorePrediction(guess: ReferencePropertyPack, actual: ReferencePropertyPack): number {
  let score = 0;
  if (guess.conduction === actual.conduction) score += 1;
  if (guess.mechanical === actual.mechanical) score += 1;
  if (guess.thermal === actual.thermal) score += 1;
  return score;
}
