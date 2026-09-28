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

export interface BondProfile extends PropertyPack {
  kind: BondKind;
  label: string;
  /** Typical bond/cohesive energy, kJ/mol — order of magnitude, not a constant. */
  energyRangeKJ: [number, number];
  examples: string;
  why: string;
}

export const BOND_PROFILES: Record<BondKind, BondProfile> = {
  metallic: {
    kind: "metallic",
    label: "Metallic",
    energyRangeKJ: [100, 850],
    examples: "Sodium, copper, iron, tungsten",
    conduction: "conductor",
    mechanical: "ductile",
    thermal: "high-melting",
    why: "Valence electrons are delocalized over the whole lattice, so charge moves freely. The same non-directional bonding lets planes of atoms slip past each other without shattering the lattice — that slip is ductility.",
  },
  ionic: {
    kind: "ionic",
    label: "Ionic",
    energyRangeKJ: [600, 4000],
    examples: "Sodium chloride, magnesium oxide",
    conduction: "insulator-until-molten",
    mechanical: "brittle",
    thermal: "high-melting",
    why: "Electrons are transferred, not shared: a lattice of locked charges. No mobile electrons in the solid, so it insulates — but melt it and the ions themselves carry current. Slip brings like charges together, so it cracks instead of yielding.",
  },
  "covalent-network": {
    kind: "covalent-network",
    label: "Covalent (network)",
    energyRangeKJ: [150, 600],
    examples: "Diamond, silicon carbide, quartz",
    conduction: "insulator",
    mechanical: "brittle",
    thermal: "high-melting",
    why: "Every atom shares directional bonds with its neighbors in a continuous network. Melting means breaking those bonds wholesale, so the melting point is high; directional bonds do not slip, so it is brittle; every electron is spoken for, so it insulates.",
  },
  "covalent-molecular": {
    kind: "covalent-molecular",
    label: "Covalent (molecular)",
    energyRangeKJ: [150, 600],
    examples: "Sulfur (S₈ rings), ice, sugar",
    conduction: "insulator",
    mechanical: "brittle",
    thermal: "low-melting",
    why: "Strong bonds inside each molecule, weak secondary bonds between them. Heating only has to defeat the weak ones, so it melts low — while the strong internal bonds make the cold crystal brittle rather than soft.",
  },
  secondary: {
    kind: "secondary",
    label: "Secondary (dominant)",
    energyRangeKJ: [1, 40],
    examples: "Polyethylene, waxes, rubber",
    conduction: "insulator",
    mechanical: "soft",
    thermal: "decomposes-or-softens",
    why: "The load-bearing structure is held by van der Waals forces or hydrogen bonds between chains or molecules. They are one to two orders of magnitude weaker than primary bonds, so the solid softens or decomposes at modest temperature and deforms easily.",
  },
};

export function predictProperties(kind: BondKind): PropertyPack {
  const p = BOND_PROFILES[kind];
  return { conduction: p.conduction, mechanical: p.mechanical, thermal: p.thermal };
}

/**
 * Rough melting regime from a bond energy, kJ/mol. This is a correlation
 * with wide scatter — network topology, entropy, and decomposition all
 * move the real number. Never present it as a formula.
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
}

/** Unfamiliar substances for the prediction bench — the week's evidence. */
export const SUBSTANCES: ChallengeSubstance[] = [
  {
    name: "Silicon carbide",
    hint: "Every silicon atom is bonded tetrahedrally to four carbons, and every carbon to four silicons, in one continuous network. It is sold as an abrasive.",
    kind: "covalent-network",
    why: "A continuous covalent network: hard, high-melting, brittle, insulating. Sold as an abrasive precisely because those directional bonds refuse to slip.",
  },
  {
    name: "Magnesium",
    hint: "A light metal. It can be rolled into ribbon and it burns with a blinding white flame.",
    kind: "metallic",
    why: "Metallic bonding: delocalized electrons conduct, and non-directional bonds let planes slip, so it rolls into ribbon instead of shattering.",
  },
  {
    name: "Polyethylene",
    hint: "Long chains of carbon atoms, each chain covalently bonded along its length — but the chains hold to each other only weakly. A grocery bag.",
    kind: "secondary",
    why: "Strong along the chain, weak between chains — and between chains is where melting and stretching happen. So it softens near 130°C, stretches, and insulates.",
  },
  {
    name: "Sodium chloride",
    hint: "A crystal of alternating positive and negative ions. It shatters under a hammer and dissolves in water.",
    kind: "ionic",
    why: "A charge-locked lattice: brittle, high-melting, insulating as a solid — but the melt conducts, because the ions themselves are mobile charges.",
  },
  {
    name: "Sulfur",
    hint: "Rings of eight sulfur atoms, each ring strongly bonded internally; the rings stack on each other weakly. It melts at 115°C.",
    kind: "covalent-molecular",
    why: "Molecular, not network: heating defeats only the weak inter-ring bonds, so it melts low. The cold crystal is brittle and insulating.",
  },
  {
    name: "Graphite",
    hint: "Sheets of carbon in a hexagonal mesh — strong within the sheet, weak between sheets. It marks paper and conducts electricity.",
    kind: "covalent-network",
    why: "The trick case: covalent in the plane (strong, stiff, conducting along the sheet via delocalized π electrons) and secondary between planes (soft, slippery — which is why it writes). Mixed bonding means a mixed pack.",
  },
];

export function scorePrediction(guess: PropertyPack, actual: PropertyPack): number {
  let score = 0;
  if (guess.conduction === actual.conduction) score += 1;
  if (guess.mechanical === actual.mechanical) score += 1;
  if (guess.thermal === actual.thermal) score += 1;
  return score;
}
