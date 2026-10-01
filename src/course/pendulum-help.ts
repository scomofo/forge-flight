import type { ConceptHelp, ConceptHelpSection, ExampleContext } from "./types.ts";

/** The same candidates feed the animation, visible working and optional explanation. */
export const PENDULUM_UNIT_CANDIDATES = [
  { formula: "T = 2π√(l/g)", working: "√(m ÷ (m/s²)) = √s² = s", units: "s", dimension: "T", possible: true },
  { formula: "T = 2π√(g/l)", working: "√((m/s²) ÷ m) = √(1/s²) = 1/s", units: "1/s", dimension: "T⁻¹", possible: false },
  { formula: "T = 2π·l/g", working: "m ÷ (m/s²) = s²", units: "s²", dimension: "T²", possible: false },
];

export const pendulumUnitSections: ConceptHelpSection[] = [
  {
    heading: "Check seconds before shorthand",
    body: "Replace l with metres and g with metres per second squared. Dividing by m/s² means multiplying by s²/m. The 2π is a supplied, unitless number: it does not affect this unit check, but you cannot drop it when calculating an actual period.",
    table: {
      caption: "Three pendulum candidates checked in metres and seconds",
      columns: ["Candidate", "Unit working (2π is unitless)", "Could give a period?"],
      rows: PENDULUM_UNIT_CANDIDATES.map(row => [row.formula, row.working, row.possible ? "Yes: seconds. Not yet proved." : `No: ${row.units} is not seconds.`]),
    },
  },
  {
    heading: "What the square brackets mean here",
    body: "[l] = L reads: l has the dimension of length. [g] = LT⁻² reads: g has the dimension length divided by time squared. T⁻² = 1/T², just as s⁻² = 1/s². Here the brackets ask what kind of quantity it is, not for its numerical value. M, L and T are dimension labels; the T in the pendulum equation is the period variable. The same letter has two jobs, so read it in context.",
  },
  {
    heading: "Passing this check is not proof",
    body: "Only one of these three candidates has time units. That does not establish its numerical factor: √(l/g), 2π√(l/g) and 5√(l/g) all have the same dimensions. Derivation or measurement must supply the correct factor and test the model. The usual 2π√(l/g) period is a small-angle approximation for an ideal simple pendulum, not an exact prediction for every swing.",
  },
];

export const pendulumExampleContext: ExampleContext = {
  heading: "What the symbols stand for",
  intro: "No lengths or times have to be measured for this check. We are comparing the kinds of quantities produced by three proposed formulas.",
  inputs: [
    { label: "T — period", value: "Time for one complete back-and-forth cycle (s)", origin: "Given", detail: "The answer must have time units, not 1/s or s². A trip from one side to the other is only half a cycle." },
    { label: "l — pendulum length", value: "Length from the pivot to the bob's centre (m)", origin: "Given", detail: "Lowercase l is a length symbol, not the digit 1. The bob is treated as a point mass in this model." },
    { label: "g — gravitational acceleration", value: "Metres per second squared (m/s²)", origin: "Given", detail: "g is acceleration, not a force in newtons. No numerical value of g is needed to check dimensions." },
    { label: "2π — numerical factor", value: "Unitless; π (pi) ≈ 3.14159", origin: "Given", detail: "Included in all three candidates. It changes the numerical result, not the dimensions." },
  ],
  notes: [
    "Notation: [l] = L means length; [g] = LT⁻² means length/time². In the dimension labels, T means time; in a period equation, T is the time for one cycle.",
    "The drawing is schematic, not a timed experiment. The simple-pendulum period assumes a small swing, a light inextensible string, and negligible drag and pivot friction.",
  ],
  working: [
    "l/g has units m ÷ (m/s²) = m × s²/m = s². Taking the square root leaves s, so √(l/g) could describe a time.",
    "g/l has units (m/s²) ÷ m = 1/s². Its square root is 1/s: a rate, not a period.",
    "Without a square root, l/g still has units s². Multiplying by the unitless 2π does not turn s² into seconds.",
    "Keep the first candidate for further checking; reject the other two as period formulas. Correct units are necessary, but they do not prove the numerical factor or model assumptions.",
  ],
};

export const pendulumConceptHelp: Record<string, ConceptHelp> = {
  "pendulum-unit-check": {
    trigger: "Walk through the pendulum unit check",
    title: "Why only one candidate has time units",
    intro: "The period is the time for one full back-and-forth cycle. We can reject two proposed formulas just by replacing the variables with their units. No numerical values or timing experiment are required.",
    sections: pendulumUnitSections,
    caution: "Same dimensions do not guarantee the same unit scale. Metres and feet are both lengths but need a conversion factor. Likewise, matching force-time dimensions alone would not catch a pound-force-second versus newton-second mismatch.",
    sources: [
      { label: "OpenStax: dimensional analysis", url: "https://openstax.org/books/university-physics-volume-1/pages/1-4-dimensional-analysis" },
      { label: "OpenStax: the simple-pendulum model", url: "https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums" },
      { label: "NASA/JPL: the Mars Climate Orbiter unit mismatch", url: "https://www.jpl.nasa.gov/news/mars-climate-orbiter-team-finds-likely-cause-of-loss/" },
    ],
  },
};
