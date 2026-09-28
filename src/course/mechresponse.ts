/**
 * Mechanical response — stress–strain curve models, the 0.2%-offset yield
 * construction, toughness integration, and parameter extraction from noisy
 * data. Pure logic: no UI. Stresses in MPa, strains dimensionless (mm/mm).
 */

export type CurvePoint = { strain: number; stress: number };

export type MaterialParams = {
  name: string;
  family: "metal" | "ceramic" | "polymer";
  /** Young's modulus, MPa */
  E: number;
  /** 0.2%-offset yield strength, MPa (equals UTS for brittle materials) */
  yieldStrength: number;
  /** ultimate tensile strength, MPa */
  uts: number;
  /** engineering strain at fracture */
  fractureStrain: number;
  brittle: boolean;
};

/** Deterministic PRNG so "measured" data is stable between renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HARDENING_EXPONENT = 0.5;
/** Fraction of the post-yield strain interval at which UTS is reached. */
const UTS_FRACTION = 0.55;
/** Engineering stress at fracture, as a fraction of UTS (necking drop). */
const FRACTURE_STRESS_FRACTION = 0.85;

/**
 * Generate an engineering stress–strain curve: linear elastic to yield,
 * power-law hardening to UTS, then a linear necking drop to fracture.
 * Brittle materials are linear to fracture. Optional relative noise is
 * applied to stress only, so strain values stay exact.
 */
export function generateCurve(
  p: MaterialParams,
  opts: { points?: number; noise?: number; seed?: number } = {},
): CurvePoint[] {
  const { points = 200, noise = 0, seed = 1 } = opts;
  const rand = mulberry32(seed);
  const yieldStrain = p.yieldStrength / p.E;

  // Strain grid: dense through the elastic region (where the slope matters),
  // coarser through the long plastic tail. Without this, a 200-point grid
  // over 36% elongation puts zero points inside a 0.2% elastic region.
  const strains: number[] = [];
  const elasticCap = Math.min(3 * yieldStrain, p.fractureStrain * 0.999);
  if (!p.brittle && elasticCap > 0 && elasticCap < p.fractureStrain) {
    const elasticPoints = Math.min(60, Math.floor(points * 0.3));
    for (let i = 0; i < elasticPoints; i++) {
      strains.push((elasticCap * i) / (elasticPoints - 1));
    }
    const rest = points - elasticPoints;
    for (let i = 1; i <= rest; i++) {
      strains.push(elasticCap + ((p.fractureStrain - elasticCap) * i) / rest);
    }
  } else {
    for (let i = 0; i < points; i++) {
      strains.push((p.fractureStrain * i) / (points - 1));
    }
  }

  const pts: CurvePoint[] = [];
  for (const strain of strains) {
    let stress: number;
    if (p.brittle || strain <= yieldStrain) {
      stress = p.E * strain;
    } else {
      const utsStrain = yieldStrain + UTS_FRACTION * (p.fractureStrain - yieldStrain);
      if (strain <= utsStrain) {
        const t = (strain - yieldStrain) / (utsStrain - yieldStrain);
        stress = p.yieldStrength + (p.uts - p.yieldStrength) * Math.pow(t, HARDENING_EXPONENT);
      } else {
        const t = (strain - utsStrain) / (p.fractureStrain - utsStrain);
        stress = p.uts - (1 - FRACTURE_STRESS_FRACTION) * p.uts * t;
      }
    }
    if (noise > 0) stress *= 1 + noise * (rand() * 2 - 1);
    pts.push({ strain, stress: Math.max(0, stress) });
  }
  return pts;
}

/**
 * 0.2%-offset yield: the stress where the curve crosses the line
 * σ = E(ε − 0.002). Returns null when the curve never crosses (brittle
 * materials that fracture inside the offset band).
 */
export function offsetYield(curve: CurvePoint[], E: number): number | null {
  // f starts at E·0.002 > 0 (curve above the shifted line) and falls through
  // zero where the hardening curve meets the offset line.
  const f = (pt: CurvePoint) => pt.stress - E * (pt.strain - 0.002);
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1];
    const b = curve[i];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0 && fb <= 0 && fa !== fb) {
      const t = fa / (fa - fb);
      return a.stress + t * (b.stress - a.stress);
    }
  }
  return null;
}

/** Toughness: ∫σ dε by the trapezoidal rule, in MPa = MJ/m³. */
export function toughness(curve: CurvePoint[]): number {
  let area = 0;
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1];
    const b = curve[i];
    area += 0.5 * (a.stress + b.stress) * (b.strain - a.strain);
  }
  return area;
}

/**
 * Young's modulus from the initial linear region. Fits a through-origin
 * slope on a growing prefix of points and stops when the next point leaves
 * the line by more than 3% — the proportional limit, past which the slope
 * is no longer E. Noise on teaching data is ~1%, so 3% separates cleanly.
 */
export function estimateModulus(curve: CurvePoint[]): number {
  const slopeOf = (n: number) => {
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += curve[i].strain * curve[i].stress;
      den += curve[i].strain * curve[i].strain;
    }
    return den > 0 ? num / den : NaN;
  };
  let n = Math.min(5, curve.length);
  let best = slopeOf(n);
  for (let k = n + 1; k <= curve.length; k++) {
    const s = slopeOf(k - 1);
    const pt = curve[k - 1];
    const pred = s * pt.strain;
    if (pred > 0 && Math.abs(pt.stress - pred) / pred > 0.03) break;
    n = k;
    best = slopeOf(k);
  }
  return best;
}

export type ExtractedParams = {
  E: number;
  yieldStrength: number | null;
  uts: number;
  elongation: number;
  toughness: number;
};

/** Read E, 0.2%-offset yield, UTS, elongation, and toughness off a curve. */
export function extractParams(curve: CurvePoint[]): ExtractedParams {
  const E = estimateModulus(curve);
  let uts = -Infinity;
  for (const p of curve) if (p.stress > uts) uts = p.stress;
  return {
    E,
    yieldStrength: offsetYield(curve, E),
    uts,
    elongation: curve[curve.length - 1].strain,
    toughness: toughness(curve),
  };
}

/** Reduction of area from original and final cross-sections. */
export function reductionOfArea(a0: number, af: number): number {
  return (a0 - af) / a0;
}

/** Design allowable: characteristic strength divided by factor of safety. */
export function designAllowable(characteristicStrength: number, factorOfSafety: number): number {
  return characteristicStrength / factorOfSafety;
}

/**
 * Representative engineering values (room temperature, tension).
 * yieldStrength is the 0.2% proof stress; brittle entries fracture in the
 * elastic line, so their yield equals their UTS.
 */
export const MATERIALS: MaterialParams[] = [
  {
    name: "1020 mild steel",
    family: "metal",
    E: 200_000,
    yieldStrength: 350,
    uts: 420,
    fractureStrain: 0.36,
    brittle: false,
  },
  {
    name: "1020 steel, cold-worked",
    family: "metal",
    E: 200_000,
    yieldStrength: 700,
    uts: 760,
    fractureStrain: 0.08,
    brittle: false,
  },
  {
    name: "6061-T6 aluminum",
    family: "metal",
    E: 68_900,
    yieldStrength: 276,
    uts: 310,
    fractureStrain: 0.12,
    brittle: false,
  },
  {
    name: "Ti-6Al-4V",
    family: "metal",
    E: 114_000,
    yieldStrength: 880,
    uts: 950,
    fractureStrain: 0.14,
    brittle: false,
  },
  {
    name: "Annealed copper",
    family: "metal",
    E: 117_000,
    yieldStrength: 70,
    uts: 220,
    fractureStrain: 0.45,
    brittle: false,
  },
  {
    name: "PMMA (acrylic)",
    family: "polymer",
    E: 3_200,
    yieldStrength: 70,
    uts: 75,
    fractureStrain: 0.05,
    brittle: false,
  },
  {
    name: "Soda-lime glass",
    family: "ceramic",
    E: 70_000,
    yieldStrength: 70,
    uts: 70,
    fractureStrain: 0.001,
    brittle: true,
  },
  {
    name: "Alumina",
    family: "ceramic",
    E: 380_000,
    yieldStrength: 300,
    uts: 300,
    fractureStrain: 0.0008,
    brittle: true,
  },
];
