/**
 * Pure strengthening / heat-treatment logic for Materials 101, Week 15.
 *
 * No UI here: mechanism math (Hall-Petch, work hardening, solid solution),
 * a mechanism comparison table, and the alloy × route outcome table that
 * powers the process-to-property design memo bench. All numbers are
 * classroom-grade estimates — good enough to choose a process, not to
 * certify a part.
 */

/** Hall-Petch: σ = σ₀ + k / √d, d in meters, σ in MPa, k in MPa·m^1/2. */
export function hallPetch(sigma0: number, k: number, dMicrons: number): number {
  if (dMicrons <= 0) throw new Error("grain size must be positive");
  return sigma0 + k / Math.sqrt(dMicrons * 1e-6);
}

/**
 * Work hardening with saturation: σ = σ_ann + (σ_sat − σ_ann)·(1 − e^(−3f)).
 * f is the fractional cold reduction (0–1). Strength climbs fast at first
 * and levels off as the dislocation forest gets dense.
 */
export function workHarden(sigmaAnn: number, sigmaSat: number, f: number): number {
  if (f < 0 || f > 1) throw new Error("cold reduction fraction must be in [0, 1]");
  return sigmaAnn + (sigmaSat - sigmaAnn) * (1 - Math.exp(-3 * f));
}

/** Solid-solution strengthening: Δσ ∝ √c, c = solute fraction (0–1). */
export function solidSolution(sigma0: number, a: number, c: number): number {
  if (c < 0 || c > 1) throw new Error("solute fraction must be in [0, 1]");
  return sigma0 + a * Math.sqrt(c);
}

export type MechanismId = "grain" | "work" | "solution" | "precip";

export interface Mechanism {
  id: MechanismId;
  name: string;
  /** What defect or feature blocks the dislocations. */
  obstacle: string;
  /** Typical yield-strength gain this route can deliver, MPa. */
  gainRange: [number, number];
  /** What you pay: ductility loss, cost, anisotropy, process control… */
  price: string;
  /** Relative process cost: 1 = cheap shop work, 3 = controlled heat treatment. */
  costIndex: number;
  ductilityLoss: "low" | "moderate" | "high";
}

export const MECHANISMS: Mechanism[] = [
  {
    id: "grain",
    name: "Grain refinement",
    obstacle: "Grain boundaries — every boundary stops a slip plane dead.",
    gainRange: [50, 160],
    price: "Needs thermomechanical control to keep grains small; over-anneal and the gain evaporates.",
    costIndex: 2,
    ductilityLoss: "low",
  },
  {
    id: "work",
    name: "Work hardening",
    obstacle: "Dislocation tangles — dislocations tripping over each other.",
    gainRange: [100, 300],
    price: "Ductility falls hard, the metal goes anisotropic, and you cannot weld it soft again without losing the gain.",
    costIndex: 1,
    ductilityLoss: "high",
  },
  {
    id: "solution",
    name: "Solid-solution strengthening",
    obstacle: "Solute atoms straining the lattice around them.",
    gainRange: [80, 200],
    price: "Alloying elements cost money and can hurt conductivity, corrosion resistance, or weldability.",
    costIndex: 2,
    ductilityLoss: "moderate",
  },
  {
    id: "precip",
    name: "Precipitation hardening",
    obstacle: "Fine precipitates forcing dislocations to bow between them.",
    gainRange: [200, 320],
    price: "Demands tight solution-treat, quench, and aging control; overage and the precipitates coarsen past their peak.",
    costIndex: 3,
    ductilityLoss: "moderate",
  },
];

export type AlloyId = "1045" | "4140" | "2024" | "6061" | "cu";

export interface Alloy {
  id: AlloyId;
  name: string;
  family: string;
  /** Soft-condition (annealed / O-temper) baseline. */
  base: { yield: number; elong: number };
  /** Relative material cost, 1 = plain carbon steel. */
  cost: number;
  notes: string;
}

export const ALLOYS: Alloy[] = [
  { id: "1045", name: "1045 medium-carbon steel", family: "steel", base: { yield: 310, elong: 16 }, cost: 1.0, notes: "The workhorse: cheap, hardenable by quench, weldable with care." },
  { id: "4140", name: "4140 Cr-Mo steel", family: "steel", base: { yield: 415, elong: 26 }, cost: 1.6, notes: "Chromium and molybdenum deepen hardening — thick sections quench through." },
  { id: "2024", name: "2024 aluminum (Al-Cu)", family: "aluminum", base: { yield: 75, elong: 20 }, cost: 2.4, notes: "Heat-treatable by aging, but poor weldability and needs cladding against corrosion." },
  { id: "6061", name: "6061 aluminum (Al-Mg-Si)", family: "aluminum", base: { yield: 55, elong: 25 }, cost: 1.9, notes: "Ages to a good strength, welds well, the general-purpose structural aluminum." },
  { id: "cu", name: "C11000 copper", family: "copper", base: { yield: 70, elong: 45 }, cost: 2.1, notes: "Not heat-treatable — only cold work and grain size move its strength." },
];

export type RouteId = "anneal" | "coldwork" | "normalize" | "quench-temper" | "solution-age" | "quench-only";

export interface Route {
  id: RouteId;
  name: string;
  blurb: string;
}

export const ROUTES: Route[] = [
  { id: "anneal", name: "Full anneal", blurb: "Slow cool from high temperature. Soft, ductile, stress-free." },
  { id: "coldwork", name: "Cold work 50%", blurb: "Roll or draw at room temperature. Strong, less ductile, anisotropic." },
  { id: "normalize", name: "Normalize", blurb: "Air-cool from austenite. Finer grains than anneal, a modest strength lift." },
  { id: "quench-temper", name: "Quench + temper", blurb: "Martensite first, then temper back toughness. The high-strength steel route." },
  { id: "solution-age", name: "Solution treat + age", blurb: "Dissolve, freeze, then grow precipitates on schedule. The aluminum route." },
  { id: "quench-only", name: "Quench, no temper", blurb: "Full martensite. Maximum hardness, minimum mercy." },
];

export interface Outcome {
  /** null when the route is metallurgically incompatible with the alloy. */
  compatible: boolean;
  reason?: string;
  yield?: number; // MPa
  elong?: number; // %
  hrc?: number; // approximate Rockwell C, steels only
  costMult?: number;
  note?: string;
}

/**
 * Classroom-grade outcome table. Values are typical handbook numbers,
 * not guarantees — the point is choosing a route, not certifying a part.
 */
const OUTCOMES: Record<AlloyId, Record<RouteId, Outcome>> = {
  "1045": {
    anneal: { compatible: true, yield: 310, elong: 16, hrc: 12, costMult: 1.0, note: "Soft and formable; the starting point, not the finish." },
    coldwork: { compatible: true, yield: 560, elong: 6, hrc: 25, costMult: 1.15, note: "Dislocation forest does the work; ductility is the price." },
    normalize: { compatible: true, yield: 360, elong: 14, hrc: 14, costMult: 1.25, note: "Finer pearlite than anneal — a small, honest lift." },
    "quench-temper": { compatible: true, yield: 850, elong: 12, hrc: 28, costMult: 1.9, note: "Tempered martensite: the standard high-strength 1045 condition." },
    "solution-age": { compatible: false, reason: "Steels have no precipitating phase to age — there is nothing to dissolve and regrow." },
    "quench-only": { compatible: true, yield: 1500, elong: 3, hrc: 55, costMult: 1.7, note: "Hard as glass, brittle as glass. Untempered martensite is a warning, not a product." },
  },
  "4140": {
    anneal: { compatible: true, yield: 415, elong: 26, hrc: 12, costMult: 1.6, note: "Machines beautifully; strength comes later." },
    coldwork: { compatible: true, yield: 700, elong: 5, hrc: 28, costMult: 1.75, note: "Rarely the route — this alloy is bought for its hardenability." },
    normalize: { compatible: true, yield: 500, elong: 18, hrc: 15, costMult: 1.85, note: "A respectable middle ground for thick sections." },
    "quench-temper": { compatible: true, yield: 1300, elong: 11, hrc: 42, costMult: 2.3, note: "The classic: oil quench, temper near 400°C. Strong and still ductile." },
    "solution-age": { compatible: false, reason: "Steels have no precipitating phase to age — there is nothing to dissolve and regrow." },
    "quench-only": { compatible: true, yield: 1800, elong: 2, hrc: 58, costMult: 2.1, note: "Deep-hardening steel at full martensite: impressive numbers, catastrophic toughness." },
  },
  "2024": {
    anneal: { compatible: true, yield: 75, elong: 20, costMult: 2.4, note: "O temper: dead soft, made for forming." },
    coldwork: { compatible: true, yield: 300, elong: 4, costMult: 2.55, note: "H18-style: strong sheet, but forming is over." },
    normalize: { compatible: false, reason: "Normalizing is a steel heat treatment — aluminum has no austenite to cool from." },
    "quench-temper": { compatible: false, reason: "Aluminum forms no martensite; quenching it only traps the solutes for aging." },
    "solution-age": { compatible: true, yield: 345, elong: 12, costMult: 2.9, note: "T3/T6: copper-rich precipitates pin everything. Aircraft-grade." },
    "quench-only": { compatible: false, reason: "A quenched aluminum without aging is just soft metal with locked-in stress." },
  },
  "6061": {
    anneal: { compatible: true, yield: 55, elong: 25, costMult: 1.9, note: "O temper: the bending-and-welding condition." },
    coldwork: { compatible: true, yield: 200, elong: 6, costMult: 2.05, note: "Works, but aging works better and keeps more ductility." },
    normalize: { compatible: false, reason: "Normalizing is a steel heat treatment — aluminum has no austenite to cool from." },
    "quench-temper": { compatible: false, reason: "Aluminum forms no martensite; quenching it only traps the solutes for aging." },
    "solution-age": { compatible: true, yield: 276, elong: 12, costMult: 2.35, note: "T6: the default structural temper — strong, weldable, honest." },
    "quench-only": { compatible: false, reason: "A quenched aluminum without aging is just soft metal with locked-in stress." },
  },
  cu: {
    anneal: { compatible: true, yield: 70, elong: 45, costMult: 2.1, note: "Dead soft: draws into wire without complaint." },
    coldwork: { compatible: true, yield: 272, elong: 6, costMult: 2.25, note: "Half-hard and beyond — the lever that needs no alloy change or furnace. A weld anneals it away." },
    normalize: { compatible: false, reason: "Normalizing is a steel heat treatment; copper has no phase change to exploit." },
    "quench-temper": { compatible: false, reason: "Copper forms no martensite and no precipitates worth aging." },
    "solution-age": { compatible: false, reason: "No precipitating phase — copper cannot be aged." },
    "quench-only": { compatible: false, reason: "Quenching copper changes nothing but its temperature." },
  },
};

export function outcome(alloy: AlloyId, route: RouteId): Outcome {
  return OUTCOMES[alloy][route];
}

export interface Requirement {
  id: string;
  name: string;
  minYield?: number; // MPa
  minElong?: number; // %
  minHrc?: number;
  brief: string;
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: "bolt",
    name: "Structural bolt",
    minYield: 800,
    minElong: 10,
    brief: "Grade-8.8-class bolt: yield ≥ 800 MPa with ≥ 10% elongation — strong, but it must stretch before it snaps.",
  },
  {
    id: "skin",
    name: "Aircraft skin sheet",
    minYield: 300,
    minElong: 10,
    brief: "Fuselage skin: yield ≥ 300 MPa, ≥ 10% elongation for forming, and it must survive the weather.",
  },
  {
    id: "tool",
    name: "Cutting tool edge",
    minHrc: 58,
    brief: "A lathe tool edge: hardness ≥ 58 HRC. Toughness is secondary — it only has to outlast the workpiece.",
  },
  {
    id: "frame",
    name: "Bicycle frame tube",
    minYield: 400,
    minElong: 8,
    brief: "Frame tube: yield ≥ 400 MPa, ≥ 8% elongation, and it must be weldable into a frame.",
  },
];

export interface Verdict {
  ok: boolean;
  /** Human-readable reasons, one per failed screen. Empty when ok. */
  reasons: string[];
  /** Yield margin over the floor, when a floor exists. */
  margin?: number;
}

/** Screen the outcome against the requirement's hard limits. */
export function judge(req: Requirement, o: Outcome): Verdict {
  if (!o.compatible) {
    return { ok: false, reasons: [o.reason ?? "Incompatible route."] };
  }
  const reasons: string[] = [];
  if (req.minYield !== undefined && (o.yield ?? 0) < req.minYield) {
    reasons.push(`Yield ${o.yield} MPa misses the ${req.minYield} MPa floor.`);
  }
  if (req.minElong !== undefined && (o.elong ?? 0) < req.minElong) {
    reasons.push(`Elongation ${o.elong}% misses the ${req.minElong}% floor.`);
  }
  if (req.minHrc !== undefined && (o.hrc ?? 0) < req.minHrc) {
    reasons.push(`Hardness ${o.hrc ?? "—"} HRC misses the ${req.minHrc} HRC floor.`);
  }
  return {
    ok: reasons.length === 0,
    reasons,
    margin: req.minYield !== undefined && o.yield ? o.yield / req.minYield : undefined,
  };
}
