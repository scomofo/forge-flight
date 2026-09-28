/**
 * Materials 101, Week 20 — synthesis support logic.
 *
 * Pure functions only, no UI. Two jobs:
 *  1. The spar synthesis chain (lesson `sparsynth` + Spar Lab II): gust load ->
 *     root bending moment -> bending stress -> tip deflection -> allowables ->
 *     fatigue/fracture sanity, for three candidate spar materials. The chain
 *     crosses the whole block: requirements (W19), beam mechanics (physics
 *     W6/W7 tools), allowables (W14), fatigue and fracture (W16), processing
 *     routes (W13/W15), selection (W19).
 *  2. The materials mastery check (lesson `matmastery`): the 12-item
 *     closed-book bank — four chain items, four failure items, four mixed —
 *     the 70% gate, and the correction workflow for missed chain/failure
 *     items.
 *
 * SI units in, SI units out unless a value is explicitly named otherwise.
 */

export const G = 9.81;

/**
 * The Week-20 reference spar: the 100 g tow-launch glider's wing spar cap,
 * reduced to the numbers the synthesis chain needs. The 2.5 g gust factor
 * is the least certain input and is stated as an estimate, not a measurement.
 */
export const REFERENCE_SPAR = {
  gliderMassKg: 0.1,
  gustFactor: 2.5, // estimate
  halfSpanM: 0.25,
  sectionBMm: 4,
  sectionHMm: 6,
  /** Tip deflection must stay under 2% of the half-span or the wing twists off trim. */
  deflectionLimitM: 0.005,
  fosStrength: 1.5,
  fosWood: 2.0, // wood scatters; it earns the bigger factor
} as const;

export type SparMaterial = {
  id: string;
  name: string;
  /** Young's modulus, Pa. */
  ePa: number;
  /** Design strength: yield for metals, flexural strength for wood/composite, Pa. */
  strengthPa: number;
  densityKgM3: number;
  /** Which factor of safety applies to this material's strength. */
  fos: number;
  /** Endurance-limit estimate for the fatigue sanity check, Pa. */
  endurancePa: number;
  /** Fracture toughness for the crack sanity check, Pa*sqrt(m). */
  kIcPaSqrtM: number;
  /** Processing route, one line. */
  route: string;
};

export const SPAR_MATERIALS: SparMaterial[] = [
  {
    id: "balsa",
    name: "Balsa (along grain)",
    ePa: 3.0e9,
    strengthPa: 35e6,
    densityKgM3: 160,
    fos: REFERENCE_SPAR.fosWood,
    endurancePa: 12e6,
    kIcPaSqrtM: 1.1e6,
    route: "Select dense stick, seal against moisture; no heat treatment exists for wood",
  },
  {
    id: "al7075",
    name: "7075-T6 aluminum",
    ePa: 71.7e9,
    strengthPa: 505e6,
    densityKgM3: 2810,
    fos: REFERENCE_SPAR.fosStrength,
    endurancePa: 160e6,
    kIcPaSqrtM: 29e6,
    route: "Solution treat 480°C, quench, age 120°C/24 h (T6) — W15/W17 machinery",
  },
  {
    id: "cfrp",
    name: "Carbon/epoxy, unidirectional",
    ePa: 135e9,
    strengthPa: 1200e6,
    densityKgM3: 1600,
    fos: REFERENCE_SPAR.fosStrength,
    endurancePa: 600e6,
    kIcPaSqrtM: 32e6,
    route: "Pultrude 0° tow, cure per resin schedule; mind the across-fiber weakness",
  },
];

/** Gust lift on the whole aircraft. */
export function gustLift(massKg: number, gustFactor: number, g = G): number {
  return massKg * g * gustFactor;
}

/**
 * Root bending moment for one wing panel, uniform lift distribution:
 * each panel carries half the lift over the half-span, so
 * M = (L/2) * (halfSpan/2) = L * halfSpan / 4.
 */
export function rootMoment(liftTotalN: number, halfSpanM: number): number {
  return (liftTotalN * halfSpanM) / 4;
}

export type SectionProps = { areaM2: number; inertiaM4: number; cM: number };

/** Rectangular section properties. */
export function sectionProps(bM: number, hM: number): SectionProps {
  return { areaM2: bM * hM, inertiaM4: (bM * hM ** 3) / 12, cM: hM / 2 };
}

/** Bending stress sigma = M*c/I. */
export function bendingStress(momentNm: number, cM: number, inertiaM4: number): number {
  return (momentNm * cM) / inertiaM4;
}

/** Cantilever tip deflection under uniform load: delta = w*L^4 / (8*E*I). */
export function tipDeflection(wPerM: number, spanM: number, ePa: number, inertiaM4: number): number {
  return (wPerM * spanM ** 4) / (8 * ePa * inertiaM4);
}

/** Design allowable: characteristic strength divided by the factor of safety. */
export function designAllowable(strengthPa: number, fos: number): number {
  return strengthPa / fos;
}

/**
 * Critical crack size for a through crack, Y = 1:
 * a_c = (K_IC / (sigma * sqrt(pi)))^2. Returns meters.
 */
export function criticalCrackSize(kIcPaSqrtM: number, sigmaPa: number): number {
  return (kIcPaSqrtM / (sigmaPa * Math.sqrt(Math.PI))) ** 2;
}

/** Hall-Petch: sigma = sigma0 + k / sqrt(d), d in micrometers. */
export function hallPetch(sigma0MPa: number, kMPaSqrtUm: number, dUm: number): number {
  return sigma0MPa + kMPaSqrtUm / Math.sqrt(dUm);
}

/** Lever rule: mass fractions of alpha and beta at C0 between C_alpha and C_beta (wt%). */
export function leverFractions(c0: number, cAlpha: number, cBeta: number): { alpha: number; beta: number } {
  const beta = (c0 - cAlpha) / (cBeta - cAlpha);
  return { alpha: 1 - beta, beta };
}

/** Characteristic diffusion length 2*sqrt(D*t), meters. */
export function diffusionLength(dM2s: number, tS: number): number {
  return 2 * Math.sqrt(dM2s * tS);
}

/**
 * Basquin life multiplier when stress changes by `stressRatio`:
 * N is proportional to sigma^(1/b), so N2/N1 = ratio^(1/b). b is negative.
 */
export function basquinLifeMultiplier(stressRatio: number, b: number): number {
  return stressRatio ** (1 / b);
}

export type SparResult = {
  material: SparMaterial;
  massG: number;
  deflectionMm: number;
  allowableMPa: number;
  strengthMargin: number;
  stiffnessPass: boolean;
  fatigueRatio: number;
  criticalCrackM: number;
};

export type SparSynthesis = {
  liftN: number;
  momentNm: number;
  stressMPa: number;
  results: SparResult[];
  /** The screen that kills the lightest option: the binding constraint. */
  bindingConstraint: "stiffness";
};

/** The full spar chain for the reference glider, every link computed. */
export function sparChain(): SparSynthesis {
  const sp = REFERENCE_SPAR;
  const liftN = gustLift(sp.gliderMassKg, sp.gustFactor);
  const momentNm = rootMoment(liftN, sp.halfSpanM);
  const sec = sectionProps(sp.sectionBMm / 1000, sp.sectionHMm / 1000);
  const stressPa = bendingStress(momentNm, sec.cM, sec.inertiaM4);
  const wPerM = liftN / 2 / sp.halfSpanM;

  const results: SparResult[] = SPAR_MATERIALS.map((material) => {
    const massG = (sec.areaM2 * sp.halfSpanM * material.densityKgM3 * 1000) ;
    const deflectionM = tipDeflection(wPerM, sp.halfSpanM, material.ePa, sec.inertiaM4);
    const allowablePa = designAllowable(material.strengthPa, material.fos);
    return {
      material,
      massG,
      deflectionMm: deflectionM * 1000,
      allowableMPa: allowablePa / 1e6,
      strengthMargin: allowablePa / stressPa,
      stiffnessPass: deflectionM <= sp.deflectionLimitM,
      fatigueRatio: stressPa / material.endurancePa,
      criticalCrackM: criticalCrackSize(material.kIcPaSqrtM, stressPa),
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

// ---------------------------------------------------------------------------
// Mastery check: the closed-book bank, the gate, and the correction workflow.
// ---------------------------------------------------------------------------

export type MatMasteryTopic = "chain" | "failure" | "mixed";

export type MatMasteryItem = {
  id: string;
  topic: MatMasteryTopic;
  prompt: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

/**
 * Twelve closed-book items: four chain (structure -> processing -> properties
 * -> performance reasoning), four failure (mode diagnosis and the numbers
 * behind it), four cross-cutting the rest of the block. The weighting is
 * deliberate — chaining the weeks and naming the failure mode are the
 * load-bearing skills of Materials 101.
 */
export const MAT_MASTERY_BANK: MatMasteryItem[] = [
  {
    id: "chain-bend",
    topic: "chain",
    prompt:
      "A 4 mm × 6 mm spar section carries a root bending moment of 0.15 N·m. The bending stress is…",
    options: ["≈ 6.3 MPa", "≈ 63 MPa", "≈ 0.63 MPa", "≈ 625 MPa"],
    answer: 0,
    why: "I = bh³/12 = (4)(216)/12 = 72 mm⁴, c = 3 mm. σ = Mc/I = (150 N·mm)(3 mm)/72 mm⁴ = 6.25 N/mm² = 6.25 MPa. The 63 MPa answer forgot to convert N·m to N·mm — dimensions at every joint.",
  },
  {
    id: "chain-hallpetch",
    topic: "chain",
    prompt:
      "A steel yields 200 MPa at 25 µm grain size and 150 MPa at 100 µm. Refine the grains to 6.25 µm and the yield becomes…",
    options: ["≈ 300 MPa", "≈ 250 MPa", "≈ 200 MPa", "≈ 400 MPa"],
    answer: 0,
    why: "σ = σ₀ + k/√d. From the two points: k = 500 MPa·√µm, σ₀ = 100 MPa. At 6.25 µm: 100 + 500/2.5 = 300 MPa. Quartering the grain size (√d halves) adds another 100 MPa — the W12 numbers, chained.",
  },
  {
    id: "chain-lever",
    topic: "chain",
    prompt:
      "In a two-phase field the tie line runs from α at 20% B to β at 80% B. For an alloy at 40% B, the mass fraction of β is…",
    options: ["33%", "67%", "50%", "25%"],
    answer: 0,
    why: "Lever rule: Wβ = (C₀ − Cα)/(Cβ − Cα) = (40 − 20)/(80 − 20) = 1/3 ≈ 33%. The fraction of a phase comes from the opposite arm — 67% is the α fraction, the classic swap.",
  },
  {
    id: "chain-diffusion",
    topic: "chain",
    prompt:
      "Carbon diffuses into steel with D = 1.1×10⁻¹¹ m²/s for 4 hours. The characteristic length 2√(Dt) is…",
    options: ["≈ 0.80 mm", "≈ 0.40 mm", "≈ 0.20 mm", "≈ 1.60 mm"],
    answer: 0,
    why: "t = 14 400 s, Dt = 1.58×10⁻⁷ m², √(Dt) ≈ 0.40 mm, doubled ≈ 0.80 mm — the W13 carburizing number. Diffusion depth grows with √t, so doubling the depth costs four times the furnace hours.",
  },
  {
    id: "fail-fatigue",
    topic: "failure",
    prompt:
      "Basquin exponent b = −0.1. Halving the cyclic stress multiplies the fatigue life by…",
    options: ["≈ 1024×", "≈ 2×", "≈ 10×", "≈ 100×"],
    answer: 0,
    why: "N ∝ σ^(1/b) = σ^(−10). Halving σ gives (1/2)^(−10) = 2^10 = 1024. S-N life is brutally stress-sensitive — a 10% stress cut nearly triples life, which is why the W16 lesson hunts the exponent, not the intercept.",
  },
  {
    id: "fail-fracture",
    topic: "failure",
    prompt:
      "A vessel's operating stress is cut in half at fixed toughness. The critical crack size becomes…",
    options: ["4× larger", "2× larger", "unchanged", "4× smaller"],
    answer: 0,
    why: "a_c = (K_IC/(Yσ√π))² ∝ 1/σ². Half the stress, four times the tolerable crack. Fracture scales on stress squared — small load cuts buy large damage tolerance.",
  },
  {
    id: "fail-creep",
    topic: "failure",
    prompt:
      "A turbine blade at 800°C under steady load stretches slowly for two years, then ruptures with elongated grains at the fracture. The failure mode is…",
    options: ["Creep", "High-cycle fatigue", "Stress-corrosion cracking", "Brittle overload"],
    answer: 0,
    why: "Steady load, high homologous temperature, slow time-dependent strain, no cycling — that is creep by definition. Fatigue needs cycles; overload needs a fast event; SCC needs a corrosive environment plus a susceptible alloy.",
  },
  {
    id: "fail-scc",
    topic: "failure",
    prompt:
      "A stainless bolt in seawater cracks under a sustained load well below yield, with branching cracks. The confirming diagnosis is…",
    options: [
      "Stress-corrosion cracking",
      "Mechanical fatigue",
      "Creep rupture",
      "Ductile overload",
    ],
    answer: 0,
    why: "Sustained tension + corrosive environment + susceptible alloy + branching intergranular cracks = stress-corrosion cracking. Below yield rules out overload; no cycling rules out fatigue; room temperature rules out creep.",
  },
  {
    id: "mix-bonding",
    topic: "mixed",
    prompt: "Diamond is hard and an electrical insulator; copper is softer and conducts. The difference traces to…",
    options: [
      "Covalent network vs metallic bonding",
      "Ionic vs covalent bonding",
      "Grain size",
      "Both being metallic",
    ],
    answer: 0,
    why: "Diamond's directional covalent network resists shear and locks electrons up; copper's metallic sea gives mobile electrons and easy slip. Bonding writes the property pack — the W11 through-line.",
  },
  {
    id: "mix-selection",
    topic: "mixed",
    prompt: "A tie rod must carry a fixed load with minimum mass. Rank candidate materials by…",
    options: ["σ_y/ρ", "ρ/σ_y", "σ_y·ρ", "E alone"],
    answer: 0,
    why: "m = ρAL with A ≥ F/σ_y, so m ≥ ρLF/σ_y — minimize ρ/σ_y, i.e. maximize the specific strength σ_y/ρ. Stiffness alone (E) answers a different requirement; multiplying by ρ rewards heaviness.",
  },
  {
    id: "mix-eutectic",
    topic: "mixed",
    prompt: "In a eutectic reaction, on cooling…",
    options: [
      "One liquid becomes two solids",
      "One solid becomes two solids",
      "Two liquids become one solid",
      "One solid becomes a liquid",
    ],
    answer: 0,
    why: "L → α + β at the eutectic temperature and composition: one liquid, two solid products. One solid becoming two is the eutectoid; the direction on cooling is always toward less disorder.",
  },
  {
    id: "mix-toughness",
    topic: "mixed",
    prompt: "The area under the stress–strain curve up to fracture measures…",
    options: ["Toughness", "Stiffness", "Yield strength", "Elongation"],
    answer: 0,
    why: "∫σ dε is energy per unit volume absorbed before fracture — toughness. Stiffness is the initial slope, yield is a point on the curve, elongation is the strain axis alone. A strong-but-brittle material encloses little area: strength is not toughness.",
  },
];

/** The block gate: 70% clears the mastery check. */
export const MAT_MASTERY_GATE_PCT = 70;

export function masteryPct(correct: number, total: number): number {
  return total === 0 ? 0 : (correct / total) * 100;
}

export function masteryPass(correct: number, total: number): boolean {
  return masteryPct(correct, total) >= MAT_MASTERY_GATE_PCT;
}

/**
 * Missed items that demand a filed correction before Engineering 101:
 * every missed chain-reasoning or failure-diagnosis item. Those two topics
 * are the load-bearing skills of the block.
 */
export function correctionsRequired(missed: MatMasteryItem[]): MatMasteryItem[] {
  return missed.filter((m) => m.topic === "chain" || m.topic === "failure");
}
