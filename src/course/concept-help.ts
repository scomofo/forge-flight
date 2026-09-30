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
  "youngs-modulus": {
    trigger: "What is Young's modulus?",
    title: "Young's modulus measures elastic stiffness",
    intro: "Young's modulus E tells you how much stress is needed to produce a given elastic strain.",
    sections: [
      { heading: "Hooke's law", body: "In the linear elastic range, σ = Eε." },
      { heading: "High E", body: "A high modulus means the material strains less under the same stress." },
      { heading: "Not strength", body: "A material can be stiff but weak, or flexible but strong. Modulus and yield strength answer different questions." },
    ],
  },
  "stress-strain": {
    trigger: "Stress vs strain?",
    title: "Stress and strain are different quantities",
    intro: "Stress describes the internal load intensity; strain describes the relative deformation.",
    sections: [
      { heading: "Stress", body: "σ = F/A. Units are pascals, usually MPa in structural work." },
      { heading: "Strain", body: "ε = ΔL/L. It is dimensionless because it is a length divided by a length." },
      { heading: "Together", body: "The stress-strain curve shows how the material responds as load increases." },
    ],
  },
  "second-moment-area": {
    trigger: "What is I doing?",
    title: "Second moment of area controls bending stiffness",
    intro: "The second moment of area I measures how far cross-sectional area is distributed from the neutral axis.",
    sections: [
      { heading: "Why distance matters", body: "Area farther from the neutral axis contributes with distance squared, so moving material outward is very effective." },
      { heading: "Rectangle", body: "For a rectangle about its centroidal axis, I = bh³/12. Depth is cubed." },
      { heading: "Design consequence", body: "This is why I-beams and tubes put material away from the middle." },
    ],
    caution: "I is a geometric property in units of length to the fourth power. Do not confuse it with mass moment of inertia.",
  },
  "neutral-axis": {
    trigger: "Where is the neutral axis?",
    title: "The neutral axis is the zero-bending-strain line",
    intro: "In pure bending, one side of the beam stretches and the other compresses. Between them is a line where longitudinal bending strain is zero.",
    sections: [
      { heading: "Stress pattern", body: "Bending stress varies linearly with distance y from the neutral axis through σ = My/I." },
      { heading: "Maximum stress", body: "The largest bending stresses occur at the outer fibers, farthest from the neutral axis." },
    ],
  },
  "factor-of-safety": {
    trigger: "What does factor of safety mean?",
    title: "Factor of safety compares capability with demand",
    intro: "A factor of safety is a ratio between a failure or allowable capacity and the working demand.",
    sections: [
      { heading: "Basic ratio", body: "FoS = capability / demand." },
      { heading: "Allowable form", body: "An allowable can be created by dividing a strength value by the chosen safety factor." },
      { heading: "What it covers", body: "It provides margin for uncertainty in loads, properties, models, and consequences within the failure mode being checked." },
    ],
    caution: "A factor of safety does not automatically cover a different failure mode such as buckling, fatigue, fracture, or corrosion.",
  },
  bernoulli: {
    trigger: "What does Bernoulli really say?",
    title: "Bernoulli relates pressure, speed, and elevation",
    intro: "Along a streamline in steady, incompressible, inviscid flow, pressure, kinetic, and gravitational energy per unit volume trade with each other.",
    sections: [
      { heading: "Equation", body: "p + ½ρv² + ρgh = constant." },
      { heading: "Constriction", body: "If a horizontal flow speeds up through a smaller area, the pressure term must fall in the ideal model." },
      { heading: "Assumptions", body: "Steady, incompressible, negligible viscosity, and no added or removed shaft work along the streamline." },
    ],
    caution: "Do not apply the simple Bernoulli constant across pumps, turbines, large viscous losses, or strongly compressible flow.",
  },
  "phase-diagram": {
    trigger: "How do I read this diagram?",
    title: "A binary phase diagram maps equilibrium phases",
    intro: "Composition is usually on the horizontal axis and temperature on the vertical axis. A point on the map tells you which phases are stable at equilibrium.",
    sections: [
      { heading: "Single-phase field", body: "Inside a single-phase region, only that phase is stable." },
      { heading: "Two-phase field", body: "Use a horizontal tie line to find the compositions of the two coexisting phases." },
      { heading: "What it does not tell you", body: "A phase diagram gives equilibrium, not transformation speed. Cooling rate and diffusion determine whether the structure actually reaches equilibrium." },
    ],
  },
  "lever-rule": {
    trigger: "Why the opposite arm?",
    title: "The lever rule is a mass balance",
    intro: "In a two-phase region, the overall composition is the weighted average of the two phase compositions.",
    sections: [
      { heading: "Method", body: "Draw the tie line. The fraction of one phase is the length of the segment on the opposite side divided by the whole tie line." },
      { heading: "Why", body: "The rule is just the weighted-average composition equation rearranged." },
    ],
    caution: "Do not use the distance to the phase you are solving for. Use the opposite segment.",
  },
  "hall-petch": {
    trigger: "Why do smaller grains strengthen metal?",
    title: "Hall-Petch strengthening",
    intro: "Grain boundaries impede dislocation motion, so reducing grain size often raises yield strength.",
    sections: [
      { heading: "Mechanism", body: "A moving dislocation has to transmit through or around a grain boundary where the lattice orientation changes." },
      { heading: "Tradeoff", body: "More boundaries can help strength but may hurt high-temperature creep or corrosion resistance." },
    ],
  },
  "von-mises": {
    trigger: "What is von Mises doing?",
    title: "Von Mises combines a multiaxial stress state into one yield measure",
    intro: "Ductile metals can yield under combinations of normal and shear stresses even when no single component reaches the uniaxial yield value.",
    sections: [
      { heading: "Purpose", body: "The von Mises equivalent stress converts the combined state into one scalar to compare with a tensile yield allowable." },
      { heading: "Pure tension check", body: "If shear and the other normal stresses are zero, von Mises reduces to the ordinary tensile stress." },
    ],
    caution: "Von Mises is a ductile-yield criterion. It is not a universal fracture or brittle-failure rule.",
  },
  fmea: {
    trigger: "What is FMEA for?",
    title: "FMEA structures failure-risk thinking before release",
    intro: "Failure Modes and Effects Analysis lists ways the design can fail, what each failure causes, why it may occur, and how it might be detected.",
    sections: [
      { heading: "Ratings", body: "Severity, occurrence, and detection are scored to help prioritize attention." },
      { heading: "RPN", body: "A common risk-priority number is S × O × D." },
      { heading: "Real output", body: "The most useful result is the mitigation record: what change reduces the risk and how the ratings change afterward." },
    ],
    caution: "Do not let a moderate RPN hide a catastrophic-severity item. Review severity separately.",
  },
  "cp-cpk": {
    trigger: "Cp vs Cpk?",
    title: "Cp measures spread; Cpk also measures centering",
    intro: "Capability indices compare a process distribution with the specification window.",
    sections: [
      { heading: "Cp", body: "Cp compares specification width with process spread. It assumes the process is centered." },
      { heading: "Cpk", body: "Cpk uses the distance from the mean to the nearer specification limit, so it falls when the process shifts off-center." },
    ],
    caution: "A high Cp does not prove the process is making conforming parts if the mean is badly shifted.",
  },
  "tolerance-stack": {
    trigger: "Worst case or RSS?",
    title: "Two common ways to combine tolerances",
    intro: "Worst-case and root-sum-square tolerance stacks make different promises.",
    sections: [
      { heading: "Worst case", body: "Add the full unfavorable tolerance contribution from every dimension. This protects against all allowed parts landing at their extremes together." },
      { heading: "RSS", body: "Combine independent random tolerances in quadrature. The statistical stack is smaller because random variations are unlikely to align perfectly." },
    ],
    caution: "Use RSS only when the variations are reasonably independent and a statistical assurance level is acceptable.",
  },
  "coefficient-restitution": {
    trigger: "What does e mean?",
    title: "Coefficient of restitution measures rebound",
    intro: "The coefficient of restitution compares relative separation speed after impact with relative approach speed before impact.",
    sections: [
      { heading: "Range", body: "e = 1 is perfectly elastic along the impact line; e = 0 means no rebound along that line." },
      { heading: "Drop test", body: "For a vertical bounce on the same surface, e ≈ √(h_bounce/h_drop)." },
    ],
  },
  "natural-frequency": {
    trigger: "What sets the natural frequency?",
    title: "Natural frequency comes from stiffness and inertia",
    intro: "A system has frequencies at which it prefers to oscillate even without continuous forcing.",
    sections: [
      { heading: "Spring-mass system", body: "ω = √(k/m). More stiffness raises the frequency; more mass lowers it." },
      { heading: "Why it matters", body: "Periodic forcing near a natural frequency can cause resonance." },
    ],
  },
  "thermal-expansion": {
    trigger: "Free growth or thermal stress?",
    title: "Thermal expansion depends on restraint",
    intro: "A temperature change first creates a free thermal strain αΔT. What happens next depends on whether the part is allowed to move.",
    sections: [
      { heading: "Free", body: "ΔL = αLΔT." },
      { heading: "Fully restrained bar", body: "The prevented strain becomes stress with magnitude σ = EαΔT in the simple one-dimensional model." },
    ],
    caution: "Do not add full free expansion and full restraint stress at the same time. They represent different boundary conditions.",
  },

  "material-density": {
  "trigger": "Where did 2700 come from?",
  "title": "Density is a looked-up material property",
  "intro": "2700 kg/m³ is the approximate density of aluminum used for this estimate. It is a given from a material table, not an answer hidden in the geometry.",
  "sections": [
    {
      "heading": "Read the symbol and the unit",
      "body": "ρ (rho) means density. kg/m³ means kilograms per cubic metre: how much mass a chosen volume of material contains. This is mass, not a force in newtons."
    },
    {
      "heading": "Where the number comes from",
      "body": "The Royal Society of Chemistry lists aluminum at 2.70 g/cm³. That is 2700 kg/m³: 1 g is 0.001 kg and 1 cm³ is 0.000001 m³. A particular alloy and temperature can require a different datasheet value."
    },
    {
      "heading": "Three separate steps",
      "items": [
        "Geometry → volume: 80 × 50 × 6 mm = 24,000 mm³ = 2.4 × 10⁻⁵ m³.",
        "Material → density: aluminum ≈ 2700 kg/m³, looked up.",
        "Mass = density × volume: 2700 × 2.4 × 10⁻⁵ = 0.0648 kg = 64.8 g ≈ 65 g."
      ]
    },
    {
      "heading": "Why dimensions are not enough",
      "body": "A steel bracket and an aluminum bracket with the same dimensions have the same volume, but different masses. You need the material property as well as the geometry."
    },
    {
      "heading": "Rough comparison values",
      "items": [
        "Aluminum: about 2700 kg/m³ (2.7 g/cm³).",
        "Steel: about 7850 kg/m³.",
        "Titanium: about 4500 kg/m³.",
        "Fresh water: about 1000 kg/m³."
      ],
      "body": "These are rounded comparison values, not specifications for every alloy, temperature, or fluid composition."
    },
    {
      "heading": "You do not need to memorize these",
      "body": "A worked example should supply a needed property or identify where to look it up. If a number seems to appear from nowhere, first ask whether it is given, calculated, measured, or looked up."
    }
  ],
  "caution": "Match the volume unit to the density unit. Use m³ with kg/m³, or cm³ with g/cm³. Do not multiply 2700 kg/m³ by a volume still expressed in mm³.",
  "sources": [
    {
      "label": "Royal Society of Chemistry: aluminum, 2.70 g/cm³",
      "url": "https://periodic-table.rsc.org/element/13/aluminium"
    },
    {
      "label": "Royal Society of Chemistry: titanium density",
      "url": "https://periodic-table.rsc.org/element/22/titanium"
    },
    {
      "label": "USGS: water density and temperature",
      "url": "https://www.usgs.gov/water-science-school/science/water-density"
    }
  ]
},
};

export function getConceptHelp(id: string) {
  return conceptHelpRegistry[id];
}
