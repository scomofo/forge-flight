/** Exact classroom data, not a calibration certificate or a test of a real sensor. */
export type DataPair = readonly [number, number];
export type Relationship = "direct" | "inverse" | "neither";

export function fitTwoPoints(first: DataPair, second: DataPair) {
  const [x1, y1] = first;
  const [x2, y2] = second;
  if (![x1, y1, x2, y2].every(Number.isFinite) || x1 === x2) {
    throw new RangeError("Two finite points with different x-values are required.");
  }
  const rise = y2 - y1;
  const run = x2 - x1;
  const slope = rise / run;
  const intercept = y1 - slope * x1;
  return { rise, run, slope, intercept };
}

export const LOAD_CELL_POINTS = [[10, 2.1], [50, 10.5]] as const;
export const LOAD_CELL_FIT = fitTwoPoints(...LOAD_CELL_POINTS);

/** Positive, exact three-pair exercises only. This is not a noisy-data model selector. */
export function analyzeProportion(points: readonly DataPair[]) {
  if (points.length !== 3 || points.some(p => p.some(n => !Number.isFinite(n) || n <= 0)) ||
      new Set(points.map(p => p[0])).size !== points.length) {
    throw new RangeError("Use three positive finite pairs with distinct x-values.");
  }
  const ratios = points.map(([x, y]) => y / x);
  const products = points.map(([x, y]) => x * y);
  const constant = (values: number[]) => values.every(v => Math.abs(v - values[0]) <= 1e-10 * Math.max(1, Math.abs(v), Math.abs(values[0])));
  const kind: Relationship = constant(ratios) ? "direct" : constant(products) ? "inverse" : "neither";
  return { kind, ratios, products };
}

export const PROPORTION_PRACTICE: readonly {
  id: string;
  setup: string;
  xLabel: string;
  yLabel: string;
  points: readonly DataPair[];
  explanation: string;
}[] = [
  {
    id: "spring", setup: "Three exact readings from an ideal spring within its linear range.",
    xLabel: "Stretch x (mm)", yLabel: "Force F (N)", points: [[2, 10], [4, 20], [8, 40]],
    explanation: "F/x stays at 5 N/mm. Double the stretch and the force doubles. For this model, F = 5x.",
  },
  {
    id: "work", setup: "A fixed 12 kJ job at three constant useful power levels; ignore losses.",
    xLabel: "Power P (kW)", yLabel: "Time t (s)", points: [[2, 6], [4, 3], [6, 2]],
    explanation: "P × t stays at 12 kJ, because 1 kW = 1 kJ/s. Double the power and the time halves: t = 12/P.",
  },
  {
    id: "offset", setup: "Three exact, unitless data pairs. Is a straight line enough to make them proportional?",
    xLabel: "x", yLabel: "y", points: [[1, 5], [2, 7], [4, 11]],
    explanation: "The ratios are 5, 3.5 and 2.75; the products are 5, 14 and 44. Neither stays constant. These points lie on y = 2x + 3: linear, but not directly proportional.",
  },
  {
    id: "falling", setup: "A falling set of exact, unitless readings. A downward curve alone is not an inverse-proportion test.",
    xLabel: "x", yLabel: "y", points: [[1, 8], [2, 4], [4, 1]],
    explanation: "The products are 8, 8 and 4, so they are not constant. The first two pairs tempt you to say inverse; the third pair breaks that pattern. The ratios are not constant either.",
  },
];
