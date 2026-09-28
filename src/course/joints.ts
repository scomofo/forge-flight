/**
 * Engineering 101, Week 25 — materials selection in a system.
 *
 * Pure, testable logic for the joint/material decision benches: joint
 * efficiency, fastener bearing/shear, thermal-mismatch stress, galvanic
 * compatibility, weld verdicts, and per-interface verdicts for the assembly
 * briefs.
 *
 * All property numbers are representative teaching values for classroom
 * decisions, not certifiable data — the benches say so explicitly.
 */

export type JointMethod = "bolt" | "rivet" | "tig" | "adhesive" | "interference";

export const JOINT_METHODS: { value: JointMethod; label: string; hint: string }[] = [
  { value: "bolt", label: "Bolted", hint: "Clamp + shear. Inspectable, removable; stress concentrates at the hole." },
  { value: "rivet", label: "Riveted", hint: "Permanent shear fastener. No clamp preload; light sheet metal." },
  { value: "tig", label: "TIG welded", hint: "Fusion joint. Full load path but the heat-affected zone is weaker." },
  { value: "adhesive", label: "Adhesive bonded", hint: "Spreads shear over area. Needs surface prep; temperature-limited." },
  { value: "interference", label: "Press / shrink fit", hint: "Friction from interference. Metal-to-metal only, no holes." },
];

export type Material = {
  id: string;
  name: string;
  /** GPa */
  e: number;
  /** MPa; tensile strength for composites (no true yield) */
  strength: number;
  /** 1/°C */
  alpha: number;
  /** g/cm³ */
  rho: number;
  /** Galvanic potential vs SCE, V; null = non-conductive (no galvanic cell). */
  potential: number | null;
  weldability: "excellent" | "good" | "fair" | "poor" | "none";
  /** Fraction of base-metal strength a sound TIG weld keeps (0 when not weldable). */
  weldFactor: number;
};

export const MATERIALS: Material[] = [
  { id: "steel1018", name: "1018 steel", e: 200, strength: 370, alpha: 12e-6, rho: 7.87, potential: -0.6, weldability: "excellent", weldFactor: 1.0 },
  { id: "ss304", name: "304 stainless", e: 193, strength: 215, alpha: 17e-6, rho: 8.0, potential: -0.1, weldability: "good", weldFactor: 0.9 },
  { id: "al6061", name: "6061-T6 aluminum", e: 68, strength: 240, alpha: 23e-6, rho: 2.7, potential: -0.75, weldability: "good", weldFactor: 0.7 },
  { id: "al2024", name: "2024-T3 aluminum", e: 73, strength: 320, alpha: 23e-6, rho: 2.78, potential: -0.75, weldability: "poor", weldFactor: 0.5 },
  { id: "ti64", name: "Ti-6Al-4V", e: 114, strength: 880, alpha: 8.6e-6, rho: 4.43, potential: -0.05, weldability: "good", weldFactor: 0.95 },
  { id: "copper", name: "C110 copper", e: 115, strength: 70, alpha: 17e-6, rho: 8.94, potential: -0.2, weldability: "fair", weldFactor: 0.8 },
  { id: "cfrp", name: "CFRP (quasi-isotropic)", e: 70, strength: 600, alpha: 0.5e-6, rho: 1.6, potential: 0.25, weldability: "none", weldFactor: 0 },
  { id: "gfrp", name: "GFRP", e: 25, strength: 400, alpha: 10e-6, rho: 2.0, potential: null, weldability: "none", weldFactor: 0 },
  { id: "nylon", name: "Nylon 6/6", e: 3, strength: 80, alpha: 80e-6, rho: 1.14, potential: null, weldability: "none", weldFactor: 0 },
];

export function material(id: string): Material {
  const m = MATERIALS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown material ${id}`);
  return m;
}

/** Fully constrained thermal-mismatch stress: σ = E · Δα · ΔT. Returns MPa. */
export function thermalMismatchStress(eGPa: number, dAlphaPerC: number, dTC: number): number {
  return eGPa * 1000 * dAlphaPerC * dTC;
}

export type BoltResult = { bearingMPa: number; shearMPa: number };

/** Single-row lap joint: bearing stress on the plate, shear stress in the bolt. */
export function boltLapJoint(loadN: number, boltDiaMm: number, plateTmm: number, shearPlanes: number): BoltResult {
  const bearingMPa = loadN / (boltDiaMm * plateTmm);
  const shearMPa = loadN / (shearPlanes * (Math.PI * boltDiaMm * boltDiaMm) / 4);
  return { bearingMPa, shearMPa };
}

/** Bonded single-lap area needed: A = P / τ_allow. Returns mm². */
export function adhesiveBondArea(loadN: number, shearAllowMPa: number): number {
  return loadN / shearAllowMPa;
}

export type Env = "dry" | "humid" | "saltwater";

export type GalvanicVerdict = {
  level: "none" | "low" | "medium" | "high";
  /** which side corrodes faster */
  anode: "A" | "B" | "neither";
  gapV: number;
  note: string;
};

/** Galvanic risk from the potential gap and the environment. Classroom model. */
export function galvanicRisk(a: Material, b: Material, env: Env): GalvanicVerdict {
  if (a.potential === null || b.potential === null) {
    return {
      level: "none",
      anode: "neither",
      gapV: 0,
      note: "At least one side is non-conductive — no galvanic cell can form.",
    };
  }
  const gapV = Math.abs(a.potential - b.potential);
  const anode = a.potential < b.potential ? "A" : a.potential > b.potential ? "B" : "neither";
  if (gapV < 0.15) {
    return { level: "low", anode, gapV, note: "Near-identical potentials — galvanic drive is negligible." };
  }
  const threshold = env === "saltwater" ? 0.4 : env === "humid" ? 0.5 : 0.7;
  const mediumLine = env === "saltwater" ? 0.25 : 0.3;
  const level = gapV >= threshold ? "high" : gapV >= mediumLine ? "medium" : "low";
  const anodeName = anode === "A" ? a.name : b.name;
  const note =
    level === "high"
      ? `${anodeName} is the anode and will sacrifice itself. Isolate the metals (sleeve, sealant) or pick a closer couple.`
      : level === "medium"
        ? `${anodeName} is anodic. Watch the area ratio: a small anode feeding a large cathode fails fast.`
        : "Gap is modest for this environment — standard protection is enough.";
  return { level, anode, gapV, note };
}

export type WeldVerdict = { ok: boolean; efficiency: number; notes: string[] };

/** Can these two be TIG welded, and how much base strength survives the HAZ? */
export function weldVerdict(a: Material, b: Material): WeldVerdict {
  const notes: string[] = [];
  if (a.id !== b.id) {
    notes.push(`${a.name} to ${b.name} is a dissimilar couple — TIG fusion is not a standard process here (friction or brazing instead).`);
    return { ok: false, efficiency: 0, notes };
  }
  if (a.weldability === "none") {
    notes.push(`${a.name} cannot be fusion welded — use mechanical fastening or adhesive.`);
    return { ok: false, efficiency: 0, notes };
  }
  const efficiency = a.weldFactor;
  if (a.weldability === "poor") notes.push(`${a.name} is crack-prone in the weld zone — expect rework and inspection cost.`);
  else if (a.weldability === "fair") notes.push(`${a.name} welds with care — preheat and qualified procedure required.`);
  else notes.push(`Sound weld keeps ≈${Math.round(efficiency * 100)}% of base strength.`);
  return { ok: true, efficiency, notes };
}

export type InterfaceVerdict = {
  ok: boolean;
  /** 0–1: the fraction of the weaker member's strength the joint can carry */
  strengthFraction: number;
  issues: string[];
  notes: string[];
};

/**
 * One interface: two materials joined by one method in one environment.
 * ΔT is the service temperature swing for the mismatch check (default 60 °C).
 */
export function interfaceVerdict(
  a: Material,
  b: Material,
  method: JointMethod,
  env: Env,
  dTC: number = 60,
): InterfaceVerdict {
  const issues: string[] = [];
  const notes: string[] = [];
  let strengthFraction = 0.8;

  if (method === "tig") {
    const w = weldVerdict(a, b);
    strengthFraction = w.efficiency;
    notes.push(...w.notes);
    if (!w.ok) issues.push("Welding is not a viable process for this couple.");
  } else if (method === "adhesive") {
    strengthFraction = 0.5;
    notes.push("Adhesive carries ≈50% of the weaker member in a well-designed lap — peel, not shear, usually kills it.");
    if (env === "saltwater") notes.push("Bondline must be sealed — moisture creeps in from the edges.");
  } else if (method === "bolt" || method === "rivet") {
    strengthFraction = method === "bolt" ? 0.7 : 0.6;
    notes.push(`${method === "bolt" ? "Bolted" : "Riveted"} joint carries ≈${Math.round(strengthFraction * 100)}% — the hole is a stress concentration.`);
    const g = galvanicRisk(a, b, env);
    if (g.level === "high") issues.push(`Galvanic: ${g.note}`);
    else if (g.level === "medium") notes.push(`Galvanic watch: ${g.note}`);
  } else {
    // interference
    if (a.potential === null || b.potential === null || a.weldability === "none" || b.weldability === "none") {
      issues.push("Press/shrink fits need two metals — composites and plastics creep out of the grip.");
      strengthFraction = 0;
    } else {
      strengthFraction = 0.9;
      notes.push("Interference carries ≈90% — no holes, no HAZ, but no disassembly either.");
    }
  }

  const dAlpha = Math.abs(a.alpha - b.alpha);
  const softer = a.e < b.e ? a : b;
  // A weld or a bond is fully constrained; a bolted/riveted lap can slip and
  // relieve part of the mismatch. Classroom factor, flagged in the bench note.
  const constraint = method === "bolt" || method === "rivet" ? 0.3 : 1.0;
  const mismatchMPa = thermalMismatchStress(softer.e, dAlpha, dTC) * constraint;
  if (dAlpha > 8e-6 && dTC >= 40) {
    const pct = (mismatchMPa / softer.strength) * 100;
    if (pct > 15) {
      issues.push(
        `Thermal mismatch: Δα = ${(dAlpha * 1e6).toFixed(1)}e-6/°C locks ≈${mismatchMPa.toFixed(0)} MPa into the ${softer.name} over ${dTC} °C` +
          `${constraint < 1 ? " (after joint slip relief)" : " (fully constrained)"} — ${pct.toFixed(0)}% of its strength. The joint breathes with the weather.`,
      );
    } else {
      notes.push(`Thermal mismatch is ≈${mismatchMPa.toFixed(0)} MPa — noted, not driving.`);
    }
  }

  return { ok: issues.length === 0, strengthFraction, issues, notes };
}

export type BriefPart = { id: string; label: string; options: string[] };
export type BriefInterface = { id: string; label: string; between: [string, string]; methods: JointMethod[] };
export type AssemblyBrief = {
  id: string;
  title: string;
  description: string;
  env: Env;
  parts: BriefPart[];
  interfaces: BriefInterface[];
  lesson: string;
};

export const ASSEMBLY_BRIEFS: AssemblyBrief[] = [
  {
    id: "towhook",
    title: "Trailer tow-hook bracket",
    description:
      "A bracket tying a trailer coupler to a steel hitch receiver. Outdoor, road vibration, winter salt spray. The bracket is the part you choose; the receiver stays 1018 steel.",
    env: "saltwater",
    parts: [{ id: "bracket", label: "Bracket material", options: ["steel1018", "al6061", "cfrp", "ti64"] }],
    interfaces: [
      { id: "j1", label: "Bracket ↔ receiver", between: ["bracket", "receiver"], methods: ["bolt", "tig", "adhesive"] },
    ],
    lesson:
      "The Ashby index crowns CFRP for a stiffness-per-mass part. The joint kills it: CFRP cannot be welded to the steel receiver, a bolted hole in CFRP needs a bonded metal insert (more cost, more failure modes), and the galvanic gap to steel in salt spray is severe. Steel welded to steel is the boring winner — the decision record says why boring won.",
  },
  {
    id: "enclosure",
    title: "Avionics enclosure",
    description:
      "A shielded box for flight electronics. Indoor, mild temperature swing. Needs EMI shielding (conductive shell) and a lid that opens for service.",
    env: "dry",
    parts: [
      { id: "case", label: "Case material", options: ["al6061", "ss304", "nylon"] },
      { id: "lid", label: "Lid material", options: ["al6061", "ss304", "nylon"] },
    ],
    interfaces: [
      { id: "j1", label: "Lid ↔ case", between: ["lid", "case"], methods: ["bolt", "rivet", "adhesive"] },
    ],
    lesson:
      "Nylon wins on cost and mass until you read the interface: a non-conductive shell cannot shield EMI, and a lid that must open for service rules out adhesive. The joint requirement deletes an option the property table loved.",
  },
  {
    id: "railing",
    title: "Saltwater dock railing",
    description:
      "Handrail posts and rails on a floating dock. Constant salt spray, UV, and bare hands. 20-year service life with minimal maintenance.",
    env: "saltwater",
    parts: [
      { id: "posts", label: "Post material", options: ["ss304", "al6061", "gfrp"] },
      { id: "rails", label: "Rail material", options: ["ss304", "al6061", "gfrp"] },
    ],
    interfaces: [
      { id: "j1", label: "Rail ↔ post", between: ["rails", "posts"], methods: ["bolt", "tig", "adhesive"] },
    ],
    lesson:
      "Aluminum is the cheap, light answer until saltwater meets the galvanic table and the maintenance budget. 304 costs more per kilogram and carries less per kilogram — and still wins, because the environment is a load and the joint has to live in it for twenty years.",
  },
];

export function assemblyBrief(id: string): AssemblyBrief {
  const b = ASSEMBLY_BRIEFS.find((x) => x.id === id);
  if (!b) throw new Error(`unknown brief ${id}`);
  return b;
}

/** The fixed side of each brief's interface (the part the learner doesn't choose). */
export const FIXED_SIDES: Record<string, string> = {
  receiver: "steel1018",
};
