/**
 * Materials 101, Week 19 — selection, corrosion, sustainability.
 *
 * Pure, UI-free logic: an extended material database (mechanical plus
 * cost, embodied energy, CO2, and corrosion rating), hard-constraint
 * screening, property-index ranking, weighted trade studies, and a
 * galvanic-series corrosion checker.
 *
 * Property numbers are representative teaching values, not datasheet
 * values. They are honest enough to teach the method and must never be
 * quoted as specifications.
 */

export type SelMaterial = {
  id: string;
  name: string;
  family: "metal" | "ceramic" | "polymer" | "composite" | "natural";
  density: number; // g/cm^3
  modulus: number; // GPa
  strength: number; // MPa (yield or flexural, generic allowable)
  cost: number; // $/kg, order-of-magnitude
  embodied: number; // MJ/kg primary production
  co2: number; // kg CO2e/kg primary production
  corrosion: number; // 1 (rusts if you look at it) to 5 (noble/passive)
  note: string;
};

export const selMaterials: SelMaterial[] = [
  {
    id: "al6061",
    name: "6061-T6 aluminum",
    family: "metal",
    density: 2.7,
    modulus: 69,
    strength: 240,
    cost: 6,
    embodied: 200,
    co2: 12,
    corrosion: 4,
    note: "Passive oxide film; pits in chloride. The light-metal default.",
  },
  {
    id: "steel1045",
    name: "1045 carbon steel",
    family: "metal",
    density: 7.85,
    modulus: 210,
    strength: 450,
    cost: 2,
    embodied: 30,
    co2: 2.5,
    corrosion: 2,
    note: "Strong and cheap; rusts without coating. The baseline everything is measured against.",
  },
  {
    id: "ss316",
    name: "316L stainless",
    family: "metal",
    density: 8.0,
    modulus: 193,
    strength: 220,
    cost: 9,
    embodied: 60,
    co2: 5,
    corrosion: 5,
    note: "Chromium-nickel passive film; watch for chloride pitting and crevice attack.",
  },
  {
    id: "ti64",
    name: "Ti-6Al-4V",
    family: "metal",
    density: 4.43,
    modulus: 114,
    strength: 900,
    cost: 60,
    embodied: 550,
    co2: 40,
    corrosion: 5,
    note: "Superb specific strength and corrosion; you pay in dollars and megajoules.",
  },
  {
    id: "cfrp",
    name: "CFRP (unidirectional, along fiber)",
    family: "composite",
    density: 1.55,
    modulus: 140,
    strength: 1200,
    cost: 80,
    embodied: 300,
    co2: 25,
    corrosion: 4,
    note: "Along-fiber numbers. Across the fiber it is a different, lesser material. Galvanically noble — it will eat aluminum it touches.",
  },
  {
    id: "gfrp",
    name: "GFRP",
    family: "composite",
    density: 1.9,
    modulus: 25,
    strength: 300,
    cost: 15,
    embodied: 100,
    co2: 7,
    corrosion: 4,
    note: "The working composite: cheaper than carbon, still no rust.",
  },
  {
    id: "hdpe",
    name: "HDPE",
    family: "polymer",
    density: 0.95,
    modulus: 1.0,
    strength: 25,
    cost: 2.5,
    embodied: 80,
    co2: 2.5,
    corrosion: 5,
    note: "Immune to most corrosion; softens early and creeps under load.",
  },
  {
    id: "nylon",
    name: "Nylon 6/6",
    family: "polymer",
    density: 1.14,
    modulus: 3.0,
    strength: 80,
    cost: 5,
    embodied: 120,
    co2: 7,
    corrosion: 4,
    note: "Tough engineering polymer; absorbs water and swells.",
  },
  {
    id: "pine",
    name: "Pine (with grain)",
    family: "natural",
    density: 0.5,
    modulus: 10,
    strength: 40,
    cost: 1.5,
    embodied: 8,
    co2: 0.5,
    corrosion: 3,
    note: "A natural composite. Numbers run with the grain; across it, far less.",
  },
  {
    id: "alumina",
    name: "Alumina",
    family: "ceramic",
    density: 3.9,
    modulus: 380,
    strength: 300,
    cost: 10,
    embodied: 55,
    co2: 4,
    corrosion: 5,
    note: "Stiff, hard, corrosion-proof — and brittle. Strength quoted is flexural.",
  },
  {
    id: "concrete",
    name: "Concrete",
    family: "ceramic",
    density: 2.4,
    modulus: 30,
    strength: 5,
    cost: 0.2,
    embodied: 1.5,
    co2: 0.15,
    corrosion: 4,
    note: "Unbeatable on cost and embodied energy; tensile strength is a rumor.",
  },
];

/** Design briefs. Each names the loading geometry, which fixes the index. */
export type IndexKind =
  | "tie-stiffness"
  | "tie-strength"
  | "beam-stiffness"
  | "beam-strength"
  | "plate-stiffness";

export const indexInfo: Record<IndexKind, { label: string; formula: string; blurb: string }> = {
  "tie-stiffness": {
    label: "Tie, stiffness-limited",
    formula: "M = E / ρ",
    blurb: "Minimize mass at fixed axial stiffness.",
  },
  "tie-strength": {
    label: "Tie, strength-limited",
    formula: "M = σ / ρ",
    blurb: "Minimize mass at fixed tensile load.",
  },
  "beam-stiffness": {
    label: "Beam, stiffness-limited",
    formula: "M = E^1/2 / ρ",
    blurb: "Minimize mass at fixed bending stiffness.",
  },
  "beam-strength": {
    label: "Beam, strength-limited",
    formula: "M = σ^2/3 / ρ",
    blurb: "Minimize mass at fixed bending strength.",
  },
  "plate-stiffness": {
    label: "Panel, stiffness-limited",
    formula: "M = E^1/3 / ρ",
    blurb: "Minimize mass at fixed panel bending stiffness.",
  },
};

/**
 * The property index for a material under a given brief. Derived, not
 * chosen: write mass as a function of the free geometric variable,
 * eliminate it with the constraint, and the material group that remains
 * is the index. Higher is better.
 */
export function propertyIndex(m: SelMaterial, kind: IndexKind): number {
  const rho = m.density;
  switch (kind) {
    case "tie-stiffness":
      return m.modulus / rho;
    case "tie-strength":
      return m.strength / rho;
    case "beam-stiffness":
      return Math.sqrt(m.modulus) / rho;
    case "beam-strength":
      return Math.cbrt(m.strength * m.strength) / rho;
    case "plate-stiffness":
      return Math.cbrt(m.modulus) / rho;
  }
}

export type Constraints = {
  minStrength: number; // MPa
  maxDensity: number; // g/cm^3
  maxCost: number; // $/kg
  minCorrosion: number; // 1-5
  maxEmbodied: number; // MJ/kg
};

export type ScreenFailure = { mat: SelMaterial; reasons: string[] };
export type ScreenResult = { pass: SelMaterial[]; fail: ScreenFailure[] };

/** Hard screens are binary: one failed constraint rejects the candidate. */
export function screenMaterials(db: SelMaterial[], c: Constraints): ScreenResult {
  const pass: SelMaterial[] = [];
  const fail: ScreenFailure[] = [];
  for (const mat of db) {
    const reasons: string[] = [];
    if (mat.strength < c.minStrength) reasons.push(`strength ${mat.strength} < ${c.minStrength} MPa`);
    if (mat.density > c.maxDensity) reasons.push(`density ${mat.density} > ${c.maxDensity} g/cm³`);
    if (mat.cost > c.maxCost) reasons.push(`cost $${mat.cost} > $${c.maxCost}/kg`);
    if (mat.corrosion < c.minCorrosion)
      reasons.push(`corrosion rating ${mat.corrosion} < ${c.minCorrosion}`);
    if (mat.embodied > c.maxEmbodied)
      reasons.push(`embodied energy ${mat.embodied} > ${c.maxEmbodied} MJ/kg`);
    if (reasons.length === 0) pass.push(mat);
    else fail.push({ mat, reasons });
  }
  return { pass, fail };
}

/** Rank survivors by the brief's index, best first. */
export function rankMaterials(mats: SelMaterial[], kind: IndexKind): SelMaterial[] {
  return [...mats].sort((a, b) => propertyIndex(b, kind) - propertyIndex(a, kind));
}

export type TradeWeights = { performance: number; cost: number; carbon: number };

export type TradeEntry = {
  mat: SelMaterial;
  index: number;
  perfNorm: number;
  costNorm: number;
  carbonNorm: number;
  score: number;
};

/**
 * Weighted trade study over the survivors. Each column is normalized
 * 0–1 across the set (best = 1), then combined by the weights. Cost and
 * carbon are inverted: cheaper and cleaner score higher.
 */
export function tradeStudy(
  mats: SelMaterial[],
  kind: IndexKind,
  weights: TradeWeights,
): TradeEntry[] {
  if (mats.length === 0) return [];
  const wSum = weights.performance + weights.cost + weights.carbon || 1;
  const w = {
    performance: weights.performance / wSum,
    cost: weights.cost / wSum,
    carbon: weights.carbon / wSum,
  };
  const idx = mats.map((m) => propertyIndex(m, kind));
  const costs = mats.map((m) => m.cost);
  const carbons = mats.map((m) => m.co2);
  const norm = (vals: number[], i: number, invert: boolean) => {
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    if (hi === lo) return 1;
    const t = (vals[i] - lo) / (hi - lo);
    return invert ? 1 - t : t;
  };
  return mats
    .map((mat, i) => {
      const perfNorm = norm(idx, i, false);
      const costNorm = norm(costs, i, true);
      const carbonNorm = norm(carbons, i, true);
      return {
        mat,
        index: idx[i],
        perfNorm,
        costNorm,
        carbonNorm,
        score: w.performance * perfNorm + w.cost * costNorm + w.carbon * carbonNorm,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Corrosion
// ---------------------------------------------------------------------------

/** Galvanic series: approximate seawater potentials, V vs SCE. More negative = anodic. */
export type GalvanicMetal = { id: string; name: string; potential: number };

export const galvanicSeries: GalvanicMetal[] = [
  { id: "magnesium", name: "Magnesium", potential: -1.55 },
  { id: "zinc", name: "Zinc", potential: -1.0 },
  { id: "aluminum", name: "Aluminum 6061", potential: -0.75 },
  { id: "steel", name: "Carbon steel", potential: -0.6 },
  { id: "lead", name: "Lead", potential: -0.5 },
  { id: "brass", name: "Brass", potential: -0.35 },
  { id: "copper", name: "Copper", potential: -0.25 },
  { id: "ss316", name: "316 stainless (passive)", potential: -0.1 },
  { id: "titanium", name: "Titanium", potential: -0.05 },
  { id: "graphite", name: "Graphite / CFRP", potential: 0.25 },
];

export type Environment = "dry" | "humid" | "splash" | "immersed";
export type RiskLevel = "negligible" | "low" | "moderate" | "high" | "severe";

const riskOrder: RiskLevel[] = ["negligible", "low", "moderate", "high", "severe"];

export type GalvanicVerdict = {
  anode: GalvanicMetal;
  cathode: GalvanicMetal;
  dV: number;
  level: RiskLevel;
  advice: string;
};

/**
 * Galvanic risk for a metal couple. dV sets the base level; a wet
 * environment and a small-anode/large-cathode area ratio each raise it
 * one step. Dry air with no condensing moisture drops it to negligible:
 * no electrolyte, no cell.
 */
export function galvanicRisk(
  a: GalvanicMetal,
  b: GalvanicMetal,
  env: Environment,
  anodeSmall: boolean,
): GalvanicVerdict {
  const anode = a.potential <= b.potential ? a : b;
  const cathode = anode === a ? b : a;
  const dV = Math.abs(a.potential - b.potential);
  if (dV === 0) {
    return {
      anode: a,
      cathode: b,
      dV,
      level: env === "dry" ? "negligible" : "low",
      advice:
        "Same metal: no galvanic cell, so no galvanic driver. Uniform or crevice corrosion are still on the table — check the mechanism lookup.",
    };
  }
  let level: RiskLevel = dV < 0.1 ? "low" : dV <= 0.25 ? "moderate" : "high";
  const step = (dir: 1 | -1) => {
    const i = Math.min(riskOrder.length - 1, Math.max(0, riskOrder.indexOf(level) + dir));
    level = riskOrder[i];
  };
  if (env === "dry") {
    level = "negligible";
  } else {
    if (env === "immersed") step(1);
    if (anodeSmall) step(1);
  }
  const advice =
    level === "negligible"
      ? "No electrolyte, no cell. Keep it dry and the couple is academic."
      : `Break the cell: isolate the metals, seal out the electrolyte, or make the anode replaceable. ` +
        (anodeSmall
          ? "The anode is small — attack will be fast and localized, so isolation is not optional."
          : "A large anode spreads the attack, but the couple still sets the corrosion rate.");
  return { anode, cathode, dV, level, advice };
}

/** Corrosion mechanisms keyed by morphology — read the surface, name the cell. */
export type CorrosionMode = {
  id: string;
  name: string;
  morphology: string;
  driver: string;
  protection: string;
};

export const corrosionModes: CorrosionMode[] = [
  {
    id: "galvanic",
    name: "Galvanic corrosion",
    morphology: "Attack concentrated on the less noble metal near the joint",
    driver: "Dissimilar metals + electrolyte; ΔV drives, area ratio sets the speed",
    protection: "Isolate the couple, choose compatible metals, or make the anode sacrificial and replaceable",
  },
  {
    id: "pitting",
    name: "Pitting",
    morphology: "Small deep pits under an otherwise intact passive film",
    driver: "Chloride + a passive film (stainless, aluminum): the film breaks locally and will not heal",
    protection: "Upgrade the alloy (molybdenum helps stainless), keep chloride out, avoid stagnant zones",
  },
  {
    id: "crevice",
    name: "Crevice corrosion",
    morphology: "Attack hidden under washers, gaskets, lap joints",
    driver: "Oxygen starvation inside the gap: differential aeration makes the crevice the anode",
    protection: "Seal the crevice (weld instead of bolt where allowed), drain, design so joints cannot trap water",
  },
  {
    id: "scc",
    name: "Stress-corrosion cracking",
    morphology: "Branched cracks, often with little visible metal loss",
    driver: "Tensile stress + specific environment + susceptible alloy, all three at once",
    protection: "Remove the tensile stress (shot peening, annealing), change the alloy, or remove the environment",
  },
  {
    id: "uniform",
    name: "Uniform corrosion",
    morphology: "Even thinning across the exposed surface",
    driver: "The whole surface is the anode; predictable, measurable rate",
    protection: "Corrosion allowance (extra thickness), coatings, inhibitors, or cathodic protection",
  },
];
