import type { ConceptHelp } from "./types.ts";

type RegistryEntry = Omit<ConceptHelp, "trigger"> & { trigger: string };

export const conceptHelpRegistry: Record<string, RegistryEntry> = {
  "equality-addition": {
    trigger: "Explain this",
    title: "Addition property of equality",
    intro: "If two expressions are equal, adding the same amount to both sides keeps them equal. This is one of the basic rules that lets you solve equations.",
    sections: [
      {
        heading: "What the symbols mean",
        body: "a = b says the two sides have the same value. The ⇒ symbol means “implies”: if the statement on the left is true, the statement on the right must also be true.",
      },
      {
        heading: "Why it works",
        body: "Picture a balanced scale. If both pans weigh the same, adding the same weight to each pan keeps the scale balanced.",
      },
      {
        heading: "Simple example",
        items: ["x − 7 = 12", "Add 7 to both sides", "x = 19"],
      },
      {
        heading: "Shop example",
        items: ["3.25 + s = 4.00", "Subtract 3.25 from both sides", "s = 0.75 in"],
      },
    ],
    caution: "Whatever operation you use, apply it to the entire left and right sides. Division by zero is never allowed.",
  },
  "rearrange-formula": {
    trigger: "Run a formula backward",
    title: "Rearranging a formula for the quantity you need",
    intro: "In design, you often know the result you need and solve backward for the missing input. Isolate the unknown symbolically first, then substitute numbers.",
    sections: [
      {
        heading: "Example with stress",
        items: ["Start: σ = F/A", "Multiply both sides by A: σA = F", "Divide by σ: A = F/σ"],
      },
      {
        heading: "Undo operations in reverse",
        body: "If the unknown is buried under several operations, remove the outer operations first. For y = kx² + c: subtract c, divide by k, then take the square root.",
      },
      {
        heading: "Why numbers come last",
        body: "Keeping the symbols until the unknown is isolated reduces repeated rounding and leaves a reusable relationship.",
      },
    ],
    caution: "Do not 'move' terms by memorized sign changes. Perform the actual inverse operation on both sides.",
  },
  "factor-label": {
    trigger: "Why do the units cancel?",
    title: "The factor-label method",
    intro: "Treat units like algebraic factors. A conversion factor is equal to 1, so it changes the unit label without changing the physical quantity.",
    sections: [
      {
        heading: "Example",
        body: "240 mm × (1 in / 25.4 mm): millimetres cancel and inches remain.",
      },
      {
        heading: "Direction check",
        body: "The unit you want to remove must appear on the opposite side of the conversion factor from where it started.",
      },
    ],
    caution: "If the unwanted unit is still present at the end, the setup is wrong even if the calculator result looks plausible.",
  },
  "powers-of-ten": {
    trigger: "Why add the exponents?",
    title: "Multiplying powers of ten",
    intro: "Powers count factors of ten. Multiplication combines those factors, so the exponents add.",
    sections: [
      { heading: "Example", body: "10³ × 10² = 10⁵ because there are five factors of ten." },
      { heading: "With coefficients", body: "(3 × 10⁴)(2 × 10⁻³) = 6 × 10¹ = 60." },
      { heading: "Powered units", body: "If 1 m = 10³ mm, then 1 m⁴ = (10³)⁴ mm⁴ = 10¹² mm⁴." },
    ],
    caution: "When a unit is squared, cubed, or raised to the fourth power, the conversion factor gets the same power.",
  },
  "slope-intercept": {
    trigger: "Slope and intercept?",
    title: "Reading y = mx + b",
    intro: "m tells you how fast y changes as x changes. b tells you the value of y when x is zero.",
    sections: [
      { heading: "Slope", body: "m = Δy/Δx. Its units are y-units per x-unit." },
      { heading: "Intercept", body: "b is where the line crosses the y-axis." },
      { heading: "Example", items: ["Points (0, 3) and (4, 11)", "m = 2", "b = 3", "y = 2x + 3"] },
    ],
    caution: "Two points define a line, but they do not prove the real system is linear.",
  },
  radians: {
    trigger: "Why radians?",
    title: "Radians are the natural angle unit",
    intro: "A radian measures angle using the circle itself: angle = arc length divided by radius.",
    sections: [
      { heading: "Definition", body: "θ = s/r. If the arc length equals the radius, the angle is 1 radian." },
      { heading: "Conversion", body: "2π rad = 360°, so radians = degrees × π/180." },
      { heading: "Why formulas simplify", body: "Because θ = s/r, the arc-length relation becomes s = rθ with no extra conversion constant." },
    ],
    caution: "Check calculator mode before trig. Degrees entered in radian mode give a completely different answer.",
  },
  "delta-symbol": {
    trigger: "What does Δ mean?",
    title: "Delta means change",
    intro: "The uppercase Greek letter Δ means final value minus initial value.",
    sections: [
      { heading: "Examples", items: ["Δx = x₂ − x₁", "Δv = v₂ − v₁", "ΔT = T₂ − T₁"] },
      { heading: "It is not a variable name", body: "Δ tells you to compare two states. The quantity after it tells you what changed." },
    ],
    caution: "Keep the order consistent. Reversing final minus initial flips the sign.",
  },
  summation: {
    trigger: "What does Σ mean?",
    title: "Sigma means sum",
    intro: "The uppercase Greek letter Σ means add all the listed contributions.",
    sections: [
      { heading: "Force example", body: "ΣF means the vector sum of every force acting on the chosen body." },
      { heading: "General pattern", body: "Σxᵢ means x₁ + x₂ + x₃ + ... over the items in the set." },
    ],
    caution: "In mechanics, signs and directions are part of the sum. Do not add magnitudes when directions differ.",
  },
  quadrature: {
    trigger: "Why quadrature?",
    title: "Combining independent uncertainties in quadrature",
    intro: "Independent random uncertainties are usually combined by square-root-of-sum-of-squares rather than simple addition.",
    sections: [
      { heading: "Rule", body: "u = √(u₁² + u₂² + ...)." },
      { heading: "Why not just add them?", body: "Simple addition assumes every error reaches its worst value in the same direction at the same time. Independent random errors do not usually line up that way." },
      { heading: "Example", body: "Two independent 2% relative uncertainties combine to √(2² + 2²)% ≈ 2.8%, not 4%." },
    ],
    caution: "Use worst-case addition when errors may be correlated, bounded guarantees are required, or safety demands the conservative case.",
  },
  "dot-product": {
    trigger: "What is the dot product doing?",
    title: "The dot product measures alignment",
    intro: "The dot product tells you how much one vector points along another.",
    sections: [
      { heading: "Formula", body: "A·B = |A||B|cosφ." },
      { heading: "Perpendicular case", body: "At 90°, cosφ = 0, so the dot product is zero." },
      { heading: "Work example", body: "W = F·d keeps only the component of force along the displacement." },
    ],
  },
  "component-resolution": {
    trigger: "Why sine and cosine?",
    title: "Resolving a vector into components",
    intro: "Components are the vector's signed projections onto your chosen axes.",
    sections: [
      { heading: "From +x", body: "If θ is measured from +x, then x = V cosθ and y = V sinθ." },
      { heading: "Check", body: "Rebuild the magnitude with √(x² + y²). It should match the original vector." },
    ],
    caution: "Sine and cosine swap roles if the angle is measured from a different axis. Draw the triangle first.",
  },
  "newtons-second-law": {
    trigger: "Why ΣF = ma?",
    title: "Newton's second law",
    intro: "The vector sum of the external forces on one body determines that body's acceleration.",
    sections: [
      { heading: "One body at a time", body: "Choose the body, draw only forces acting on it, then sum components along your axes." },
      { heading: "Direction matters", body: "ΣF and a point in the same direction. A negative result means the acceleration is opposite your chosen positive axis." },
    ],
    caution: "Third-law partner forces act on different bodies and do not belong in the same free-body sum.",
  },
  "normal-force": {
    trigger: "Why isn't N always mg?",
    title: "The normal force is a constraint force",
    intro: "The normal force is whatever perpendicular contact force is required by the motion constraint.",
    sections: [
      { heading: "Flat surface", body: "If vertical acceleration is zero and weight is the only other vertical force, then N = mg." },
      { heading: "Incline", body: "For a simple incline with no perpendicular acceleration, N = mg cosθ." },
      { heading: "General method", body: "Write ΣF perpendicular to the surface and solve. Do not memorize N = mg as a universal rule." },
    ],
  },
  "static-friction": {
    trigger: "Why isn't friction always μN?",
    title: "Static friction adjusts to the need",
    intro: "Static friction can take any value from zero up to its maximum μsN.",
    sections: [
      { heading: "Before slipping", body: "Static friction matches the tangential force needed to prevent relative motion, up to the limit." },
      { heading: "At the limit", body: "Only at impending slip does |fs| = μsN." },
      { heading: "After sliding starts", body: "Switch to the kinetic-friction model fk = μkN." },
    ],
    caution: "Do not automatically set static friction equal to μsN in every problem.",
  },
  "dimensional-analysis": {
    trigger: "How does the unit check work?",
    title: "Dimensional analysis as an error check",
    intro: "Both sides of a valid physical equation must describe the same kind of quantity.",
    sections: [
      { heading: "Base dimensions", body: "In mechanics, reduce quantities to mass M, length L, and time T." },
      { heading: "Example", body: "Force has dimension MLT⁻²; energy has ML²T⁻²." },
      { heading: "What it catches", body: "A length cannot equal a time, and terms with different dimensions cannot be added." },
    ],
    caution: "Matching dimensions does not prove an equation is correct. It can still have the wrong constant, sign, or physical model.",
  },
  "significant-figures": {
    trigger: "Why round here?",
    title: "Significant figures and reporting precision",
    intro: "Report only the digits justified by the measurement quality, while keeping extra calculator digits during intermediate steps.",
    sections: [
      { heading: "Multiply or divide", body: "The result is limited by the input with the fewest significant figures." },
      { heading: "Add or subtract", body: "The result is limited by the least precise decimal place." },
    ],
    caution: "More displayed digits do not create more information.",
  },
  "fermi-estimate": {
    trigger: "Why estimate this way?",
    title: "Fermi estimation",
    intro: "Break one hard question into several quantities you can roughly bound, then multiply to find the scale of the answer.",
    sections: [
      { heading: "Goal", body: "You are usually trying to get the order of magnitude, not a precise final value." },
      { heading: "Method", body: "Decompose, use one-significant-figure estimates, multiply, then identify the weakest assumption." },
    ],
    caution: "If the rough estimate and detailed calculation differ by orders of magnitude, investigate before trusting the detailed result.",
  },
};

export function getConceptHelp(id: string) {
  return conceptHelpRegistry[id];
}
