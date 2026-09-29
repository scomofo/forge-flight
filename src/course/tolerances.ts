/**
 * Engineering 101, Week 26 — tolerance stacks, fits, and process capability.
 *
 * Pure arithmetic, no UI. Process capability numbers are classroom-grade
 * typical values (what a competent shop holds on a ~50 mm feature without
 * heroics), not certifiable data — the lessons and benches say so.
 */

export interface StackPart {
  label: string;
  /** Nominal dimension in mm. */
  nominal: number;
  /** Bilateral ± tolerance in mm. */
  tol: number;
}

/** Worst-case stack: every part at its extreme in the same direction. */
export function worstCaseStack(parts: StackPart[]): number {
  return parts.reduce((sum, part) => sum + Math.abs(part.tol), 0);
}

/**
 * Statistical (RSS) stack: independent random variations add in quadrature.
 * Valid only when the variations are independent and roughly centered.
 */
export function rssStack(parts: StackPart[]): number {
  return Math.sqrt(parts.reduce((sum, part) => sum + part.tol * part.tol, 0));
}

export function nominalTotal(parts: StackPart[]): number {
  return parts.reduce((sum, part) => sum + part.nominal, 0);
}

export type StackVerdict = "passes-worst-case" | "passes-rss-only" | "fails";

/**
 * Verdict against a hard limit on the assembled total (e.g. a cavity size).
 * worst and rss are the totals above nominal; limit is the allowed overshoot.
 */
export function stackVerdict(limit: number, worst: number, rss: number): StackVerdict {
  if (worst <= limit) return "passes-worst-case";
  if (rss <= limit) return "passes-rss-only";
  return "fails";
}

// ---------------------------------------------------------------------------
// Fits
// ---------------------------------------------------------------------------

export interface FitLimits {
  holeMin: number;
  holeMax: number;
  shaftMin: number;
  shaftMax: number;
}

export type FitKind = "clearance" | "transition" | "interference";

export interface FitResult {
  kind: FitKind;
  /** Loosest condition: biggest hole, smallest shaft. */
  maxClearance: number;
  /** Tightest condition: smallest hole, biggest shaft. Negative = interference. */
  minClearance: number;
}

/** Classify a hole/shaft pair from its limit dimensions (all in mm). */
export function classifyFit(limits: FitLimits): FitResult {
  const maxClearance = limits.holeMax - limits.shaftMin;
  const minClearance = limits.holeMin - limits.shaftMax;
  const kind: FitKind =
    minClearance >= 0 ? "clearance" : maxClearance <= 0 ? "interference" : "transition";
  return { kind, maxClearance, minClearance };
}

// ---------------------------------------------------------------------------
// Process capability
// ---------------------------------------------------------------------------

export type VolumeBand = "prototype" | "low" | "medium" | "high";

export interface ProcessCapability {
  id: string;
  name: string;
  /** Typical ± tolerance held on a ~50 mm feature, mm. */
  typicalTolMm: number;
  /** Where the economics work: prototype (1–10), low (10–500), medium (500–10k), high (10k+). */
  sweetSpot: VolumeBand;
  /** True when a dedicated die or mold must be paid for before the first part, so low volume cannot amortize it. */
  toolingHeavy?: boolean;
  materials: string[];
  note: string;
}

export const PROCESSES: ProcessCapability[] = [
  {
    id: "sand-cast",
    name: "Sand casting",
    typicalTolMm: 0.5,
    sweetSpot: "low",
    materials: ["aluminum", "iron", "steel", "bronze"],
    note: "Cheap tooling, rough as-cast surface; holds little without machining.",
  },
  {
    id: "die-cast",
    name: "Die casting",
    typicalTolMm: 0.1,
    sweetSpot: "high",
    toolingHeavy: true,
    materials: ["aluminum", "zinc", "magnesium"],
    note: "Expensive steel dies; thin walls and fine detail at volume.",
  },
  {
    id: "cnc-mill",
    name: "CNC milling",
    typicalTolMm: 0.025,
    sweetSpot: "low",
    materials: ["aluminum", "steel", "titanium", "brass", "plastic"],
    note: "The default for precise metal parts at low-to-medium volume.",
  },
  {
    id: "turning",
    name: "CNC turning",
    typicalTolMm: 0.025,
    sweetSpot: "medium",
    materials: ["aluminum", "steel", "brass", "titanium"],
    note: "Round parts; fast once programmed.",
  },
  {
    id: "sheet",
    name: "Sheet metal forming",
    typicalTolMm: 0.25,
    sweetSpot: "medium",
    materials: ["steel", "aluminum", "stainless"],
    note: "Brackets, enclosures, chassis; bend radii and springback rule the design.",
  },
  {
    id: "fdm",
    name: "FDM 3D printing",
    typicalTolMm: 0.2,
    sweetSpot: "prototype",
    materials: ["pla", "petg", "abs", "nylon"],
    note: "No tooling, overnight parts; anisotropic and rough.",
  },
  {
    id: "sla",
    name: "SLA 3D printing",
    typicalTolMm: 0.1,
    sweetSpot: "prototype",
    materials: ["resin"],
    note: "Fine detail for prototypes; brittle resins, small envelopes.",
  },
  {
    id: "grinding",
    name: "Precision grinding",
    typicalTolMm: 0.005,
    sweetSpot: "low",
    materials: ["steel", "carbide"],
    note: "A finishing op, not a from-scratch process; slow and costly.",
  },
  {
    id: "edm",
    name: "EDM",
    typicalTolMm: 0.012,
    sweetSpot: "low",
    materials: ["steel", "titanium", "carbide"],
    note: "Hard metals and sharp internal corners; glacially slow.",
  },
];

export interface PartBrief {
  material: string;
  /** Planned production volume, units. */
  volume: number;
  /** Tightest ± tolerance the part must hold, mm. */
  tightestTolMm: number;
}

export interface ProcessScreening {
  process: ProcessCapability;
  viable: boolean;
  reasons: string[];
}

const VOLUME_ORDER: VolumeBand[] = ["prototype", "low", "medium", "high"];

function bandForVolume(volume: number): VolumeBand {
  if (volume <= 10) return "prototype";
  if (volume <= 500) return "low";
  if (volume <= 10000) return "medium";
  return "high";
}

/**
 * Screen every known process against a part brief. Tolerance is the first
 * screen (a process that cannot hold the tolerance is out), volume economics
 * second (too far above the sweet spot, or too far below it for a
 * tooling-heavy process), material compatibility third.
 */
export function screenProcesses(brief: PartBrief): ProcessScreening[] {
  const band = bandForVolume(brief.volume);
  return PROCESSES.map((process) => {
    const reasons: string[] = [];
    let viable = true;
    if (process.typicalTolMm > brief.tightestTolMm) {
      viable = false;
      reasons.push(
        `cannot hold ±${brief.tightestTolMm} mm (typical ±${process.typicalTolMm} mm) — needs a secondary op`,
      );
    } else {
      reasons.push(`holds ±${brief.tightestTolMm} mm (typical ±${process.typicalTolMm} mm)`);
    }
    const bandGap =
      VOLUME_ORDER.indexOf(band) - VOLUME_ORDER.indexOf(process.sweetSpot);
    if (bandGap >= 2) {
      viable = false;
      reasons.push(`uneconomical at ${brief.volume} units (a ${process.sweetSpot}-volume process)`);
    } else if (bandGap <= -2 && process.toolingHeavy) {
      // Below the sweet spot only tooling-heavy processes suffer: the die cost
      // cannot spread over so few parts. Tooling-free processes stay flat.
      viable = false;
      reasons.push(
        `uneconomical at ${brief.volume} units — tooling cannot amortize (a ${process.sweetSpot}-volume process)`,
      );
    } else if (bandGap === 1 || (bandGap === -1 && process.toolingHeavy)) {
      reasons.push(`workable at ${brief.volume} units but not its sweet spot`);
    } else {
      reasons.push(`economic at ${brief.volume} units`);
    }
    const materialOk = process.materials.some((m) =>
      brief.material.toLowerCase().includes(m),
    );
    if (!materialOk) {
      viable = false;
      reasons.push(`not a ${brief.material} process`);
    } else {
      reasons.push(`runs ${brief.material}`);
    }
    return { process, viable, reasons };
  });
}
