/**
 * Engineering 101, Week 30 — capstone synthesis support logic.
 *
 * Pure functions only, no UI. Three jobs:
 *  1. The capstone design package rubric (lesson `capmethod` + CapPackageBench):
 *     requirement -> model -> test -> mismatch -> justified revision. Each
 *     section scored 0-2; the gate demands every section present (a
 *     simulation score alone is insufficient) and a 70% total.
 *  2. The cumulative worked design (lesson `glidersynth` + CapPredictBench):
 *     the 100 g tow-launch glider run end to end through the W21-W29 tools —
 *     requirements, uncertainty, loads and margins, sizing, materials and
 *     joints, tolerances, experiment, and the trade study. Locked predictions
 *     face the chain's numbers, then the mismatch gets its autopsy.
 *  3. The final gate (lesson `capmastery` + CapReviewBench): a 12-item
 *     closed-book bank — four full-cycle items, four integration items, four
 *     cross-cutting — the 70% gate, and the correction workflow for missed
 *     full-cycle items.
 *
 * SI units in, SI units out unless a value is explicitly named otherwise.
 */

export const G = 9.81;

/** The five sections of the capstone design package. */
export type CapSection = "requirement" | "model" | "test" | "mismatch" | "revision";

export const CAP_SECTIONS: { id: CapSection; label: string; strong: string }[] = [
  {
    id: "requirement",
    label: "Requirement",
    strong: "Names the demand as a number with a unit and a pass/fail line, and the demand can lose.",
  },
  {
    id: "model",
    label: "Model",
    strong: "Predicts the outcome before the test, with the assumptions ledgered and a validation domain stated.",
  },
  {
    id: "test",
    label: "Test",
    strong: "Measures the predicted quantity with a stated uncertainty, so agreement or disagreement means something.",
  },
  {
    id: "mismatch",
    label: "Mismatch",
    strong: "Names the disagreement honestly and autopsies the ledger — assumptions first, arithmetic last.",
  },
  {
    id: "revision",
    label: "Justified revision",
    strong: "Changes one thing, says why that thing and not another, and re-checks the margins it touched.",
  },
];

/** Per-section scores: 0 = absent, 1 = weak, 2 = strong. */
export type CapScores = Record<CapSection, 0 | 1 | 2>;

export const CAP_GATE_PCT = 70;
export const CAP_MAX_TOTAL = CAP_SECTIONS.length * 2;

export function capTotal(scores: CapScores): number {
  return CAP_SECTIONS.reduce((s, sec) => s + scores[sec.id], 0);
}

export function capPct(scores: CapScores): number {
  return (100 * capTotal(scores)) / CAP_MAX_TOTAL;
}

/**
 * The capstone gate. Simulation score alone is insufficient: every section
 * must be present (score >= 1) AND the total must reach 70%. A perfect model
 * with no test, or a clean test with no named mismatch, fails the gate.
 */
export function capstoneGate(scores: CapScores): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  for (const sec of CAP_SECTIONS) {
    if (scores[sec.id] < 1) reasons.push(`${sec.label}: absent — the gate requires all five sections`);
  }
  const pct = capPct(scores);
  if (pct < CAP_GATE_PCT) reasons.push(`Total ${pct.toFixed(0)}% is under the ${CAP_GATE_PCT}% gate`);
  return { pass: reasons.length === 0, reasons };
}

/**
 * The Week-30 reference design: the same 100 g tow-launch glider the
 * Materials synthesis ran through its spar chain (W20), now carried through
 * the full engineering cycle. The 2.5 g gust factor is the least certain
 * input and is stated as an estimate, not a measurement.
 */
export const CAP_REFERENCE = {
  gliderMassKg: 0.1,
  gustFactor: 2.5, // estimate
  halfSpanM: 0.25,
  sectionBMm: 4,
  sectionHMm: 6,
  /** Tip deflection must stay under 5 mm or the wing twists off trim. */
  deflectionLimitMm: 5,
  fosStrength: 1.5,
} as const;

export type CapMaterial = {
  id: string;
  name: string;
  ePa: number;
  strengthPa: number;
  densityKgM3: number;
  route: string;
};

export const CAP_MATERIALS: CapMaterial[] = [
  {
    id: "balsa",
    name: "Balsa (along grain)",
    ePa: 3.0e9,
    strengthPa: 35e6,
    densityKgM3: 160,
    route: "Select dense stick; seal against moisture",
  },
  {
    id: "al7075",
    name: "7075-T6 aluminum",
    ePa: 71.7e9,
    strengthPa: 505e6,
    densityKgM3: 2810,
    route: "Solution treat, quench, age (T6)",
  },
];

/** Gust lift on the whole aircraft. */
export function capGustLift(massKg: number, gustFactor: number, g = G): number {
  return massKg * g * gustFactor;
}

/** Root bending moment for one wing panel, uniform lift: M = L * s / 4. */
export function capRootMoment(liftN: number, halfSpanM: number): number {
  return (liftN * halfSpanM) / 4;
}

/** Rectangular section: area, second moment, extreme fiber distance. */
export function capSection(bM: number, hM: number): { areaM2: number; inertiaM4: number; cM: number } {
  return { areaM2: bM * hM, inertiaM4: (bM * hM ** 3) / 12, cM: hM / 2 };
}

/** Bending stress σ = M c / I. */
export function capBendingStress(momentNm: number, cM: number, inertiaM4: number): number {
  return (momentNm * cM) / inertiaM4;
}

/** Uniform-load cantilever tip deflection δ = w L^4 / (8 E I). */
export function capTipDeflection(wPerM: number, spanM: number, ePa: number, inertiaM4: number): number {
  return (wPerM * spanM ** 4) / (8 * ePa * inertiaM4);
}

/** Design allowable = strength / FoS. */
export function capAllowable(strengthPa: number, fos: number): number {
  return strengthPa / fos;
}

export type CapChainResult = {
  liftN: number;
  momentNm: number;
  stressMPa: number;
  results: {
    material: CapMaterial;
    deflectionMm: number;
    massG: number;
    allowableMPa: number;
    strengthMargin: number;
    passesStiffness: boolean;
  }[];
  /** Which constraint binds the design. */
  bindingConstraint: "strength" | "stiffness" | "mass";
};

/**
 * The cumulative worked design: gust load -> root moment -> bending stress ->
 * tip deflection -> allowables, for balsa and 7075-T6. The chain crosses the
 * whole course: requirements (W21), beam mechanics (physics W6/W7 tools),
 * uncertainty (W22), allowables and margins (W14/W23), materials (W19).
 */
export function capChain(): CapChainResult {
  const liftN = capGustLift(CAP_REFERENCE.gliderMassKg, CAP_REFERENCE.gustFactor);
  const momentNm = capRootMoment(liftN, CAP_REFERENCE.halfSpanM);
  const sec = capSection(CAP_REFERENCE.sectionBMm / 1000, CAP_REFERENCE.sectionHMm / 1000);
  const stressPa = capBendingStress(momentNm, sec.cM, sec.inertiaM4);
  const wPerM = liftN / 2 / CAP_REFERENCE.halfSpanM;

  const results = CAP_MATERIALS.map((material) => {
    const deflectionMm = 1000 * capTipDeflection(wPerM, CAP_REFERENCE.halfSpanM, material.ePa, sec.inertiaM4);
    const massG = 1000 * material.densityKgM3 * sec.areaM2 * CAP_REFERENCE.halfSpanM;
    const allowableMPa = capAllowable(material.strengthPa, CAP_REFERENCE.fosStrength) / 1e6;
    const strengthMargin = allowableMPa / (stressPa / 1e6) - 1;
    return {
      material,
      deflectionMm,
      massG,
      allowableMPa,
      strengthMargin,
      passesStiffness: deflectionMm <= CAP_REFERENCE.deflectionLimitMm,
    };
  });

  return {
    liftN,
    momentNm,
    stressMPa: stressPa / 1e6,
    results,
    bindingConstraint: "stiffness",
  };
}

/**
 * The engineered mismatch: the aluminum spar is built and static-tested; the
 * measured tip deflection is 0.61 mm against the model's 0.46 mm — a 33%
 * miss. The test stands; the model gets autopsied.
 */
export const CAP_MISMATCH = {
  predictedDeflectionMm: 0.46,
  measuredDeflectionMm: 0.61,
  measurementUncertaintyMm: 0.05,
  description:
    "Hypothetical static distributed-load test on the 7075-T6 spar, matching the model load case: nominal prediction 0.46 mm, supplied measurement 0.61 ± 0.05 mm; prediction uncertainty is not yet quantified.",
} as const;

export type MismatchSuspect = {
  id: string;
  name: string;
  /** Whether this suspect is the named most-likely cause. */
  prime: boolean;
  why: string;
};

export const MISMATCH_SUSPECTS: MismatchSuspect[] = [
  {
    id: "adhesive",
    name: "The bonded root joint flexes — the model's 'cantilever root' is a lie",
    prime: true,
    why: "The model clamps the spar at the root; the build glues it into a socket. Adhesive compliance and fit-up clearance add a root rotation the beam equation never sees. A few tenths of a degree at the root is a tenth of a millimeter at the tip.",
  },
  {
    id: "e-value",
    name: "The E of this extrusion batch is low",
    prime: false,
    why: "7075-T6 E is 71.7 GPa within a few percent — it cannot explain 33%. Reaching for material data first is the classic misdirection: E is the best-known number in the chain.",
  },
  {
    id: "load-dist",
    name: "The test load is not the gust distribution",
    prime: false,
    why: "True — a tip point load is not a uniform gust — but the test was designed to be comparable: the equivalent tip force was computed from the uniform case. The distribution accounts for single-digit percent, not 33%.",
  },
  {
    id: "section",
    name: "Arithmetic error in the section properties",
    prime: false,
    why: "I = bh³/12 = 72 mm⁴ checks out twice. The autopsy looks at the ledger before the arithmetic — and the arithmetic is the one thing everyone already checked.",
  },
];

/**
 * The justified revision: one change, named and defended. Model the root as a
 * torsional spring in series with the beam; fit the spring from the measured
 * 0.61 mm; re-check the margins the change touches.
 */
export function revisedDeflection(
  beamDeflectionMm: number,
  rootRotationRad: number,
  halfSpanM: number,
): number {
  return beamDeflectionMm + (1000 * rootRotationRad * halfSpanM);
}

// ---------------------------------------------------------------------------
// The final gate: the 12-item closed-book bank.
// ---------------------------------------------------------------------------

export type CapMasteryTopic = "cycle" | "integration" | "mixed";

export type CapMasteryItem = {
  id: string;
  topic: CapMasteryTopic;
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

/**
 * Twelve closed-book items: four full-cycle (requirement -> model -> test ->
 * mismatch -> revision reasoning), four integration (chaining weeks of tools
 * on one decision), four cross-cutting the rest of the course. The weighting
 * is deliberate — running the full cycle and chaining the tools are the
 * load-bearing skills of Engineering 101.
 */
export const CAP_MASTERY_BANK: CapMasteryItem[] = [
  {
    id: "cycle-sim",
    topic: "cycle",
    prompt: "A simulation predicts the glider spar deflects 0.46 mm and the designer ships it. The capstone gate says…",
    options: [
      "Pass — the model is the deliverable",
      "Fail — a simulation score alone is insufficient; no test, mismatch, or revision is shown",
      "Pass if the simulation converged",
      "Fail — simulations are never allowed",
    ],
    answer: 1,
    why: "The gate requires all five sections: requirement, model, test, mismatch, justified revision. A number with no test behind it is a rumor wearing units.",
  },
  {
    id: "cycle-mismatch",
    topic: "cycle",
    prompt: "The measured deflection is 0.61 mm against a 0.46 mm prediction. The first move is…",
    options: [
      "Recheck the arithmetic",
      "Interrogate the assumption ledger — the root clamp is the prime suspect",
      "Average the two numbers",
      "Rebuild the spar stiffer",
    ],
    answer: 1,
    why: "Disagreement autopsies start with assumptions, not arithmetic: the 'perfect cantilever root' was marked assumed, and adhesive compliance plus fit-up clearance add a root rotation the beam equation never sees.",
  },
  {
    id: "cycle-req",
    topic: "cycle",
    prompt: "Which requirement can a design actually lose to?",
    options: [
      "'The spar shall be light and strong.'",
      "'The spar tip shall deflect at most 5 mm under the 2.5 g gust load.'",
      "'Make the spar from a good material.'",
      "'The spar should feel stiff.'",
    ],
    answer: 1,
    why: "A requirement is a demand with a number, a unit, and a pass/fail line. The others are moods — a design cannot lose to a mood.",
  },
  {
    id: "cycle-revision",
    topic: "cycle",
    prompt: "The justified revision is justified because it…",
    options: [
      "Changes everything until the numbers match",
      "Changes one thing, names why that thing and not another, and re-checks the margins it touched",
      "Adds a safety factor to cover the gap",
      "Blames the measurement",
    ],
    answer: 1,
    why: "One change, defended; the suspects it beat are named; every margin the change touches gets re-checked. A bigger factor of safety is insurance priced on an unknown you refused to name.",
  },
  {
    id: "int-binding",
    topic: "integration",
    prompt: "The worked glider design: strength margins run 2.7× to 53×, yet balsa loses. The binding constraint is…",
    options: ["Strength — the margins lie", "Stiffness — balsa's 11.1 mm sag fails the 5 mm screen", "Mass — balsa is too heavy", "Fatigue — the gust cycles"],
    answer: 1,
    why: "The chain finds the driver: strength clears everywhere (53× for aluminum), but balsa's 11.1 mm deflection fails the 5 mm stiffness screen. Engineers who assume the driver optimize the wrong link.",
  },
  {
    id: "int-margin",
    topic: "integration",
    prompt: "A lug sees 12 kN limit load on 100 mm² of 7075-T6 (allowable 167 MPa). The margin of safety is…",
    options: ["MS = 0.39", "MS = 1.39", "MS = −0.28", "FoS = 0.72"],
    answer: 0,
    why: "Applied = 120 MPa. FoS = 167/120 = 1.39, so MS = FoS − 1 = 0.39. Margin of safety is the factor minus one — the fraction of headroom, not the factor.",
  },
  {
    id: "int-unc",
    topic: "integration",
    prompt: "An error budget shows pressure owns 86% of the thrust uncertainty. The next dollar goes to…",
    options: ["A better diameter gauge", "A better pressure transducer", "More decimal places in the report", "Averaging more runs"],
    answer: 1,
    why: "Leverage × sloppiness = priority (W22). Upgrading the dominant link moves the total; upgrading a 5% link is theater.",
  },
  {
    id: "int-tol",
    topic: "integration",
    prompt: "Three tolerances stack to 0.25 mm worst-case and 0.15 mm RSS into a 0.20 mm clearance. For a safety interlock you…",
    options: [
      "Ship it — RSS passes",
      "Redesign — tighten the dominant tolerance or open the clearance; safety is staked on worst-case",
      "Average the two methods",
      "Ship it and inspect every part",
    ],
    answer: 1,
    why: "RSS is statistics as mercy — it assumes the tolerances conspire never. A safety interlock is staked on Murphy's law as arithmetic: worst-case. Loosening a tolerance only grows the worst-case stack. The method is the risk posture.",
  },
  {
    id: "mix-fmea",
    topic: "mixed",
    prompt: "An FMEA row scores severity 9, occurrence 2, detection 8. The RPN is 144. The cheapest way to cut it is…",
    options: [
      "Lower the severity by redesigning the consequence",
      "Improve detection — an 8 is a blind spot you can fix",
      "Accept 144 — occurrence is already low",
      "Multiply differently",
    ],
    answer: 1,
    why: "RPN = S × O × D = 144. Severity is hard to move and occurrence is already 2; detection at 8 means failures hide. A test or inspection that finds the failure mode cuts D and the RPN with it.",
  },
  {
    id: "mix-trade",
    topic: "mixed",
    prompt: "In a trade study, one alternative beats another on every criterion. You…",
    options: [
      "Keep both — more options is safer",
      "Reject the dominated one — dominance is a free rejection",
      "Reweight until it wins",
      "Average their scores",
    ],
    answer: 1,
    why: "Dominance is the one honest shortcut in trade studies: no weighting scheme can rescue an alternative that loses everywhere. Reweighting to save it is cooking the books.",
  },
  {
    id: "mix-ethics",
    topic: "mixed",
    prompt: "A factor of safety of 1.5 on a manned structure is…",
    options: [
      "Pure arithmetic",
      "An ethical statement about uncertainty and consequence, priced into the design",
      "A guess",
      "Required to be 2.0",
    ],
    answer: 1,
    why: "The factor prices what you do not know against what failure would cost. That is a moral judgment wearing a number — which is why the engineer signs the drawing.",
  },
  {
    id: "mix-assume",
    topic: "mixed",
    prompt: "The most valuable line on an assumption ledger is…",
    options: [
      "The longest derivation",
      "The assumption marked 'assumed' and most likely to be wrong",
      "The measured value",
      "The final answer",
    ],
    answer: 1,
    why: "Measured is trusted, derived is checked — assumed is where the design can surprise you. Naming the most-likely-wrong assumption is the cheapest risk control in engineering.",
  },
];

export const CAP_MASTERY_GATE_PCT = 70;

export function capMasteryPct(correct: number, total: number): number {
  return total === 0 ? 0 : (100 * correct) / total;
}

export function capMasteryPass(correct: number, total: number): boolean {
  return capMasteryPct(correct, total) >= CAP_MASTERY_GATE_PCT;
}

/** Missed full-cycle items must be corrected in writing before the course is done. */
export function capCorrectionsRequired(missed: CapMasteryItem[]): CapMasteryItem[] {
  return missed.filter((m) => m.topic === "cycle");
}
