/**
 * The 45-minute, open-resource placement diagnostic for the math runway.
 *
 * 24 questions, 4 per topic across six topics. It assigns modules — it never
 * assigns a pass/fail label. A topic at 3–4 of 4 tests out of its module;
 * 0–2 of 4 takes the module.
 */

export const DIAGNOSTIC_TOPICS = [
  "ratios-units",
  "algebra",
  "powers",
  "graphs",
  "geometry-trig",
  "vectors",
] as const;

export type DiagnosticTopic = (typeof DIAGNOSTIC_TOPICS)[number];

export const TOPIC_LABELS: Record<DiagnosticTopic, string> = {
  "ratios-units": "Ratios & units",
  algebra: "Algebra",
  powers: "Powers & notation",
  graphs: "Graphs",
  "geometry-trig": "Geometry & trig",
  vectors: "Vectors",
};

export type DiagnosticQuestion = {
  id: string;
  topic: DiagnosticTopic;
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  // ——— ratios & units ———
  {
    id: "ru-1",
    topic: "ratios-units",
    prompt: "A bolt is specified as 12 mm diameter. In inches that is about…",
    options: ["0.47 in", "4.7 in", "0.047 in", "305 in"],
    answer: 0,
    why: "12 / 25.4 ≈ 0.47. A bolt is finger-scale, not arm-scale — the estimate kills the other answers.",
  },
  {
    id: "ru-2",
    topic: "ratios-units",
    prompt: "Which expression converts 60 km/h to m/s?",
    options: [
      "60 × (1000 m / 3600 s)",
      "60 × (3600 s / 1000 m)",
      "60 ÷ 1000 × 3600",
      "60 km/h × 1",
    ],
    answer: 0,
    why: "km must cancel (bottom of the factor) and hours must cancel: 60 × 1000/3600 ≈ 16.7 m/s.",
  },
  {
    id: "ru-3",
    topic: "ratios-units",
    prompt: "A recipe for 4 parts uses 250 g of resin. For 10 parts you need…",
    options: ["625 g", "1000 g", "250 g", "62.5 g"],
    answer: 0,
    why: "Scale factor 10/4 = 2.5; 250 × 2.5 = 625 g. Ratios scale the quantity, not the ratio.",
  },
  {
    id: "ru-4",
    topic: "ratios-units",
    prompt: "A drawing is 1:50. A wall measures 4 cm on the drawing. The real wall is…",
    options: ["2.0 m", "0.08 m", "200 m", "4 m"],
    answer: 0,
    why: "4 cm × 50 = 200 cm = 2.0 m. The drawing is smaller than reality, so you multiply.",
  },
  // ——— algebra ———
  {
    id: "al-1",
    topic: "algebra",
    prompt: "If v = d/t, then t equals…",
    options: ["d/v", "v/d", "d·v", "v − d"],
    answer: 0,
    why: "Multiply both sides by t, divide by v: t = d/v. Units check: m ÷ (m/s) = s.",
  },
  {
    id: "al-2",
    topic: "algebra",
    prompt: "P = 2,400 W and V = 120 V. From P = VI, the current is…",
    options: ["20 A", "288,000 A", "0.05 A", "2,520 A"],
    answer: 0,
    why: "I = P/V = 2400/120 = 20 A. Watts per volt is amperes — the units confirm the rearrangement.",
  },
  {
    id: "al-3",
    topic: "algebra",
    prompt: "Solve 3x + 7 = 25.",
    options: ["6", "32/3", "18", "4/3"],
    answer: 0,
    why: "Subtract 7 (→ 3x = 18), divide by 3 (→ x = 6). Check: 3·6 + 7 = 25. 32/3 comes from adding 7, 18 from skipping the divide, and 4/3 from dividing only the 25.",
  },
  {
    id: "al-4",
    topic: "algebra",
    prompt: "A = πr² = 78.5 cm². The radius is about…",
    options: ["5 cm", "25 cm", "12.5 cm", "625 cm"],
    answer: 0,
    why: "r² = 78.5/π ≈ 25, so r ≈ 5 cm. Undo the multiplication by π first, then take the root.",
  },
  // ——— powers ———
  {
    id: "po-1",
    topic: "powers",
    prompt: "3.6 × 10⁶ mm³ expressed in m³ is…",
    options: ["3.6 × 10⁻³ m³", "3.6 × 10⁻⁶ m³", "3.6 × 10³ m³", "3.6 m³"],
    answer: 0,
    why: "1 m³ = (10³)³ = 10⁹ mm³, so divide by 10⁹: 3.6 × 10⁶⁻⁹ = 3.6 × 10⁻³ m³.",
  },
  {
    id: "po-2",
    topic: "powers",
    prompt: "250 kPa in pascals is…",
    options: ["2.5 × 10⁵ Pa", "2.5 × 10² Pa", "2.5 × 10⁸ Pa", "250 Pa"],
    answer: 0,
    why: "kilo = 10³: 250 × 10³ = 2.5 × 10⁵ Pa.",
  },
  {
    id: "po-3",
    topic: "powers",
    prompt: "(4 × 10⁻³)² equals…",
    options: ["1.6 × 10⁻⁵", "1.6 × 10⁻⁶", "8 × 10⁻³", "1.6 × 10⁻⁹"],
    answer: 0,
    why: "Square the digits (16) and double the exponent (−6): 16 × 10⁻⁶ = 1.6 × 10⁻⁵.",
  },
  {
    id: "po-4",
    topic: "powers",
    prompt: "A cube's side grows by 50% (k = 1.5). Its surface area grows by…",
    options: ["2.25×", "1.5×", "3.375×", "3×"],
    answer: 0,
    why: "Area scales as k² = 2.25. (Volume would be k³ = 3.375 — the dimension sets the exponent.)",
  },
  // ——— graphs ———
  {
    id: "gr-1",
    topic: "graphs",
    prompt: "A line passes through (2, 5) and (6, 17). Its slope is…",
    options: ["3", "4", "12", "1/3"],
    answer: 0,
    why: "(17 − 5)/(6 − 2) = 12/4 = 3.",
  },
  {
    id: "gr-2",
    topic: "graphs",
    prompt: "A spring stretches 4 mm under 20 N and 10 mm under 50 N. The stiffness (slope) is…",
    options: ["5 N/mm", "0.2 mm/N", "200 N/mm", "30 N/mm"],
    answer: 0,
    why: "ΔF/Δx = 30/6 = 5 N/mm. Slope units are y-units per x-unit: newtons per millimeter.",
  },
  {
    id: "gr-3",
    topic: "graphs",
    prompt: "For a fixed distance, travel time versus speed is…",
    options: [
      "inverse: double speed, halve time",
      "direct: double speed, double time",
      "unrelated",
      "quadratic",
    ],
    answer: 0,
    why: "t = d/v. Doubling the denominator halves the result — the signature of inverse proportion.",
  },
  {
    id: "gr-4",
    topic: "graphs",
    prompt: "A calibration line through (0, 0.2) and (10, 5.2) has intercept…",
    options: ["0.2", "0.5", "5.2", "0"],
    answer: 0,
    why: "The intercept is the value at x = 0, given directly: 0.2. This intercept is nonzero: the instrument reads 0.2 at no load — an offset to zero out or question.",
  },
  // ——— geometry & trig ———
  {
    id: "gt-1",
    topic: "geometry-trig",
    prompt: "In a right triangle the hypotenuse is 10 and the angle is 30°. The side opposite is…",
    options: ["5", "8.66", "10", "0.5"],
    answer: 0,
    why: "opp = hyp × sin 30° = 10 × 0.5 = 5.",
  },
  {
    id: "gt-2",
    topic: "geometry-trig",
    prompt: "A 6 m ladder leans at 70° to the ground. Its top is at height…",
    options: ["6·sin 70° ≈ 5.64 m", "6·cos 70° ≈ 2.05 m", "6·tan 70° ≈ 16.5 m", "6 m"],
    answer: 0,
    why: "Height is opposite the 70° angle: 6 sin 70° ≈ 5.64 m. The cosine gives the footprint.",
  },
  {
    id: "gt-3",
    topic: "geometry-trig",
    prompt: "90° in radians is…",
    options: ["π/2", "π", "2π", "1"],
    answer: 0,
    why: "π rad = 180°, so 90° = π/2.",
  },
  {
    id: "gt-4",
    topic: "geometry-trig",
    prompt: "A ramp rises 3 m over 12 m horizontal. Its angle satisfies…",
    options: ["tan θ = 3/12", "sin θ = 12/3", "cos θ = 3/12", "θ = 3/12 degrees"],
    answer: 0,
    why: "Opposite = 3, adjacent = 12, and tan = opp/adj. θ ≈ 14° — but the setup, not the angle, is the point.",
  },
  // ——— vectors ———
  {
    id: "ve-1",
    topic: "vectors",
    prompt: "A force has components (6, 8) N. Its magnitude is…",
    options: ["10 N", "14 N", "48 N", "100 N"],
    answer: 0,
    why: "√(36 + 64) = √100 = 10 N.",
  },
  {
    id: "ve-2",
    topic: "vectors",
    prompt: "Two tugboats pull east (300 N) and north (400 N). The resultant magnitude is…",
    options: ["500 N", "700 N", "100 N", "120,000 N"],
    answer: 0,
    why: "Right angle: √(300² + 400²) = 500 N. Another 3-4-5 in work clothes.",
  },
  {
    id: "ve-3",
    topic: "vectors",
    prompt: "A 100 N force points straight down. Its horizontal component is…",
    options: ["0 N", "100 N", "50 N", "−100 N"],
    answer: 0,
    why: "Straight down means 90° from horizontal: 100·cos 90° = 0. All of it is vertical.",
  },
  {
    id: "ve-4",
    topic: "vectors",
    prompt: "Vector A = (2, −1), B = (3, 4). A + B equals…",
    options: ["(5, 3)", "(5, 5)", "(−1, −5)", "(6, −4)"],
    answer: 0,
    why: "Add components separately: (2+3, −1+4) = (5, 3). Signs ride along.",
  },
];

export type TopicScore = { correct: number; total: number };

export type ModuleId = "ratios-units" | "algebra" | "powers" | "graphs" | "triangles-vectors";

export const MODULE_TITLES: Record<ModuleId, string> = {
  "ratios-units": "0A · Ratios, units, and the factor-label method",
  algebra: "0B · Algebra as a design tool",
  powers: "0C · Powers and scientific notation",
  graphs: "0D · Graphs and proportional reasoning",
  "triangles-vectors": "0E · Geometry, triangles, and vectors",
};

export const MODULE_ORDER: ModuleId[] = [
  "ratios-units",
  "algebra",
  "powers",
  "graphs",
  "triangles-vectors",
];

/** Which diagnostic topics feed each module's recommendation. */
const MODULE_TOPICS: Record<ModuleId, DiagnosticTopic[]> = {
  "ratios-units": ["ratios-units"],
  algebra: ["algebra"],
  powers: ["powers"],
  graphs: ["graphs"],
  "triangles-vectors": ["geometry-trig", "vectors"],
};

/** 3–4 of 4 on a topic tests out; 0–2 takes the module. */
const TEST_OUT_AT = 3;

export type ModuleRecommendation = {
  moduleId: ModuleId;
  title: string;
  take: boolean;
  reason: string;
};

export function recommendModules(
  byTopic: Record<DiagnosticTopic, TopicScore>,
): ModuleRecommendation[] {
  return MODULE_ORDER.map((moduleId) => {
    const topics = MODULE_TOPICS[moduleId];
    const weak = topics.filter(
      (t) => (byTopic[t]?.correct ?? 0) < TEST_OUT_AT,
    );
    const take = weak.length > 0;
    const parts = topics.map(
      (t) => `${byTopic[t]?.correct ?? 0} of ${byTopic[t]?.total ?? 4} on ${TOPIC_LABELS[t]}`,
    );
    return {
      moduleId,
      title: MODULE_TITLES[moduleId],
      take,
      reason: take
        ? `Scored ${parts.join("; ")} — this module earns its keep.`
        : `Scored ${parts.join("; ")} — solid; test out and move on.`,
    };
  });
}
