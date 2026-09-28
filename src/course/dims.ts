/**
 * Dimensional analysis over the mechanical base dimensions M (mass),
 * L (length), T (time). Pure data + functions; the DimCheck bench renders
 * on top of this, and physics-w1.test.ts exercises it directly.
 *
 * A dimension is the triple of exponents in M^a L^b T^c. Multiplying
 * quantities adds exponents; raising to a power scales them. An equation
 * is dimensionally valid only when every additive term — and both sides —
 * share the same triple.
 */

export type Dims = { M: number; L: number; T: number };

export const ZERO: Dims = { M: 0, L: 0, T: 0 };

/** Named mechanical quantities and their dimensions. */
export const QUANTITIES: Record<string, Dims> = {
  mass: { M: 1, L: 0, T: 0 },
  length: { M: 0, L: 1, T: 0 },
  time: { M: 0, L: 0, T: 1 },
  area: { M: 0, L: 2, T: 0 },
  volume: { M: 0, L: 3, T: 0 },
  velocity: { M: 0, L: 1, T: -1 },
  acceleration: { M: 0, L: 1, T: -2 },
  frequency: { M: 0, L: 0, T: -1 },
  momentum: { M: 1, L: 1, T: -1 },
  force: { M: 1, L: 1, T: -2 },
  energy: { M: 1, L: 2, T: -2 },
  torque: { M: 1, L: 2, T: -2 },
  power: { M: 1, L: 2, T: -3 },
  pressure: { M: 1, L: -1, T: -2 },
  density: { M: 1, L: -3, T: 0 },
  viscosity: { M: 1, L: -1, T: -1 },
};

export function dimsOf(name: string): Dims {
  const d = QUANTITIES[name];
  if (!d) throw new Error(`unknown quantity "${name}"`);
  return { ...d };
}

export function addDims(a: Dims, b: Dims): Dims {
  return { M: a.M + b.M, L: a.L + b.L, T: a.T + b.T };
}

export function subDims(a: Dims, b: Dims): Dims {
  return { M: a.M - b.M, L: a.L - b.L, T: a.T - b.T };
}

export function powDims(d: Dims, n: number): Dims {
  return { M: d.M * n, L: d.L * n, T: d.T * n };
}

export function equalDims(a: Dims, b: Dims): boolean {
  return a.M === b.M && a.L === b.L && a.T === b.T;
}

export function isDimensionless(d: Dims): boolean {
  return equalDims(d, ZERO);
}

/**
 * Combine multiplicative factors into one dimension: dims = Σ powerᵢ · dimsᵢ.
 * Models the right-hand side of a candidate equation like ρ¹·v²·A¹.
 */
export function combineFactors(factors: { dims: Dims; power: number }[]): Dims {
  return factors.reduce((acc, f) => addDims(acc, powDims(f.dims, f.power)), { ...ZERO });
}

function sup(n: number): string {
  const digits = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sign = n < 0 ? "⁻" : "";
  return sign + String(Math.abs(n)).split("").map((c) => digits[Number(c)]).join("");
}

/** "M L² T⁻²" style rendering; dimensionless renders as "1". */
export function formatDims(d: Dims): string {
  const parts: string[] = [];
  if (d.M !== 0) parts.push(`M${d.M === 1 ? "" : sup(d.M)}`);
  if (d.L !== 0) parts.push(`L${d.L === 1 ? "" : sup(d.L)}`);
  if (d.T !== 0) parts.push(`T${d.T === 1 ? "" : sup(d.T)}`);
  return parts.length === 0 ? "1" : parts.join(" ");
}

export type CandidateEquation = {
  id: string;
  label: string;
  /** Left-hand side: a single named quantity. */
  lhs: string;
  /** Right-hand side: named quantities with powers. */
  rhs: { quantity: string; power: number }[];
  /** What the learner should conclude. */
  verdict: "valid" | "invalid";
  verdictWhy: string;
};

export const CANDIDATES: CandidateEquation[] = [
  {
    id: "pendulum-ok",
    label: "T = 2π√(l/g)",
    lhs: "time",
    rhs: [
      { quantity: "length", power: 0.5 },
      { quantity: "acceleration", power: -0.5 },
    ],
    verdict: "valid",
    verdictWhy:
      "[l/g] = L / LT⁻² = T², and √T² = T. Both sides are times — the candidate survives dimensional analysis. (The 2π is dimensionless, so dimensions can never confirm or deny it.)",
  },
  {
    id: "pendulum-bad",
    label: "T = 2π√(g/l)",
    lhs: "time",
    rhs: [
      { quantity: "acceleration", power: 0.5 },
      { quantity: "length", power: -0.5 },
    ],
    verdict: "invalid",
    verdictWhy:
      "[g/l] = LT⁻² / L = T⁻², and √T⁻² = T⁻¹ — a frequency, not a time. The equation is dead on dimensional grounds; no experiment needed.",
  },
  {
    id: "drag-ok",
    label: "F = ½ρv²A",
    lhs: "force",
    rhs: [
      { quantity: "density", power: 1 },
      { quantity: "velocity", power: 2 },
      { quantity: "area", power: 1 },
    ],
    verdict: "valid",
    verdictWhy:
      "[ρv²A] = ML⁻³ · L²T⁻² · L² = MLT⁻² = [F]. The dynamic-pressure form of drag is dimensionally sound.",
  },
  {
    id: "ke-bad",
    label: "E = ½mv",
    lhs: "energy",
    rhs: [
      { quantity: "mass", power: 1 },
      { quantity: "velocity", power: 1 },
    ],
    verdict: "invalid",
    verdictWhy:
      "[mv] = M · LT⁻¹ = MLT⁻¹ — that is momentum, not energy. Energy needs one more length: E = ½mv² gives ML²T⁻². A missing square is the classic dimensional slip.",
  },
];

export function candidateDims(c: CandidateEquation): { lhs: Dims; rhs: Dims } {
  const lhs = dimsOf(c.lhs);
  const rhs = combineFactors(c.rhs.map((f) => ({ dims: dimsOf(f.quantity), power: f.power })));
  return { lhs, rhs };
}

export function candidateBalances(c: CandidateEquation): boolean {
  const { lhs, rhs } = candidateDims(c);
  return equalDims(lhs, rhs);
}
