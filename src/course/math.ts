import type { Lesson, Track } from "./types.ts";

export const mathTrack: Track = {
  id: "math",
  index: "00",
  title: "Math",
  course: "Math Runway",
  lede: "The tools, repaired first. Ratios and units, algebra, powers, graphs, and triangles — the moves every later check assumes you can make. Take the diagnostic; keep only the modules it assigns you.",
};

/**
 * The math runway gates the core course at 80%: on a four-question check
 * that means 4 of 4. Existing tracks keep the default PASS_AT (3 of 4).
 */
const RUNWAY_PASS_AT = 4;

export const mathLessons: Lesson[] = [
  {
    id: "ratios-units",
    track: "math",
    index: 1,
    title: "Ratios, units, and the factor-label method",
    minutes: 35,
    lede: "Convert units without dropping factors of ten, scale quantities by ratio, and use the units to check your own work.",
    start:
      "The drawing says 240 mm. The stock list prices by the inch, and the mill's digital readout (DRO) shows inches. Somewhere between the drawing and the invoice, millimeters have to become inches — in the right direction. || A unit factor is a conversion written as a fraction: 25.4 mm / 1 in. Top and bottom are the same length, so the fraction equals one — multiplying by it changes the unit, not the quantity. (25.4 is exact: the inch is defined that way. Most other factors, like 2.20462 lb per kg, are rounded.) || Units multiply and cancel the same way numbers do. If the old unit is still in your setup at the end, the setup is wrong. Fix it before you trust the number.",
    use: "Any time a quantity has to change units — or a recipe, a drawing, or a load has to scale by a ratio. || Write the starting quantity with its unit attached. Choose factors that cancel each unit you don't want. Do it on every line, not just the first — most mistakes creep in on the lines people skip. || Stop when the only unit left is the one you asked for, then check the size roughly. 9.4 inches is the neighborhood. If you get about 6100, you went the wrong way through the factor. If you get 94, you slipped a decimal.",
    example:
      "Convert 240 mm to inches, then price a 3.2 kg bracket at $4.10 a pound. || 240 mm × (1 in / 25.4 mm) = 9.449 in. And 3.2 kg × (2.20462 lb / 1 kg) = 7.055 lb, so 7.055 lb × ($4.10 / 1 lb) = $28.92. Keep the extra digits until the last line; round only the answer. || Call it 9.4 in and $29. The 3.2 kg only has two digits, so two or three digits is all any answer can honestly claim. In every line the starting unit cancelled and the target unit survived. Flip the factor to (25.4 mm / 1 in) and you get 6096 mm²/in, which is meaningless — you'll spot the mistake before any money is involved.",
    ideas: [
      {
        heading: "Units are part of the number",
        body: "A bare number is a rumor. “9.4” could be inches or millimeters, and those differ by a factor of 25. So every quantity in this course carries its unit from the first line to the last. The unit is what tells you the setup is pointed the right way. The factor-label method is just that discipline written out: arrange the multiplications so the unwanted units cancel, and whatever unit is left is your answer's unit.",
        formula: "240 mm × (1 in / 25.4 mm) = 9.4 in",
      },
      {
        heading: "Ratios preserve shape",
        body: "A scale ratio multiplies every length by the same factor k, and that's all it touches directly. Area is length times length, so it picks up k². Volume picks up k³. A 1:8 glider isn't “eight times smaller” in any single sense: its span is 1/8, its wing area 1/64, its mass at the same density 1/512. If the full-size wing is 1.6 m², the model's is 1.6 m² × (1/8)² = 1.6 / 64 = 0.025 m². Forget the exponent and the model comes out impossibly heavy or impossibly fragile.",
        formula: "lengths ×k ⇒ areas ×k² ⇒ volumes ×k³",
      },
      {
        heading: "Estimate before you compute",
        body: "A calculator will happily give you six digits of a wrong answer. Before you trust it, round everything to one digit and do it in your head. 240 mm is about a quarter of a meter, a meter is about 40 inches, so the answer should land near 10 inches. 9.4 passes. 94 doesn't, and neither does 6100. Estimation is the cheapest error detector you have, and it works on every formula in this course.",
      },
    ],
    bench: "units",
    prompt:
      "Convert three shop quantities — a length, a mass, and a pressure — with the factor chain. Write out each setup on paper first, so the starting unit cancels before you touch the calculator.",
    note: "The bench converter only handles length. The method is the same for mass, force, pressure, and anything else: the unit you want to get rid of goes on the bottom of the factor.",
    checks: [
      {
        prompt: "240 mm is how many inches?",
        options: ["9.45 in", "94.5 in", "0.945 in", "6100 in"],
        answer: 0,
        why: "240 / 25.4 = 9.45. 6100 in is what you get if you multiply by 25.4 instead of dividing — the factor was flipped. 94.5 and 0.945 are the right digits with the decimal moved, a dropped factor of ten. A rough estimate (a quarter meter is about 10 inches) rules all three out.",
      },
      {
        prompt: "Which setup correctly converts 5 ft to meters?",
        options: [
          "5 ft × (0.3048 m / 1 ft)",
          "5 ft × (1 ft / 0.3048 m)",
          "5 ft + 0.3048 m",
          "5 ft × (3.2808 ft / 1 m)",
        ],
        answer: 0,
        why: "Feet cancel only when ft is on the bottom of the factor. The second choice leaves ft²/m, which isn't a real unit — that tells you the setup is wrong before you compute anything.",
      },
      {
        prompt: "A glider flies at 1:8 scale. The full-size span is 4.0 m. The model's span is…",
        options: ["0.50 m", "0.25 m", "32 m", "2.0 m"],
        answer: 0,
        why: "Lengths scale by k = 1/8, so 4.0 / 8 = 0.50 m. The 1/64 and 1/512 factors apply to area and volume, not to lengths.",
      },
      {
        prompt: "Every linear dimension of a steel bracket doubles. Its mass changes by a factor of…",
        options: ["2", "4", "8", "16"],
        answer: 2,
        why: "Mass follows volume when density is constant, and volume scales as k³: 2³ = 8. Scaling something up is never as simple as it sounds.",
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
  {
    id: "algebra",
    track: "math",
    index: 2,
    title: "Algebra as a design tool",
    minutes: 40,
    lede: "Isolate any unknown in a formula, substitute numbers once the symbols are sorted, and check the answer by putting it back.",
    start:
      "σ = F/A gives stress from load and area. The shop usually asks the reverse: the load is fixed and the allowable stress is fixed — what area do you need? The relationship is the same; the unknown moved. || Rearranging a formula means undoing the operations around the unknown, in reverse order, doing the identical thing to both sides. || The formula does not change either way. Algebra just picks which quantity you solve for, without rewriting the relationship.",
    use: "When a formula connects the quantities and you know all but one. || Identify the unknown. Undo what the formula does to it — addition and subtraction first, then multiplication and division, then powers and roots — applying each inverse operation to both sides. Substitute numbers only after the unknown stands alone. || Stop when the unknown is alone on one side. Then substitute, compute once, and check by feeding the answer back into the original form.",
    example:
      "Allowable stress 150 MPa, tensile load 12 kN. What cross-sectional area is required? || A = F/σ = 12,000 N / (150 × 10⁶ N/m²) = 8.0 × 10⁻⁵ m² = 80 mm². A 10 × 8 mm bar lands exactly on the line — take the next size up. || Check by substitution: F/A = 12,000 / (80 × 10⁻⁶) = 150 × 10⁶ Pa = 150 MPa. Putting the answer back into the original form confirms it.",
    ideas: [
      {
        heading: "Same operation, both sides",
        body: "An equation is a balance. Adding, subtracting, multiplying, or dividing one side tips it; doing the identical thing to the other side keeps it level. Everything in algebra rests on this one rule. When a step feels illegal, it is almost always because one side got special treatment.",
        formula: "a = b  ⇒  a + c = b + c",
      },
      {
        heading: "Unwrap in reverse",
        body: "The unknown is usually buried under layers: added constants, multiplied coefficients, exponents. Peel them in the reverse of the order of operations — undo addition and subtraction first, then multiplication and division, then powers and roots. Each peel is one inverse operation applied to both sides, and after each peel the equation is still true.",
        formula: "y = kx² + c  ⇒  x = ±√((y − c)/k)",
      },
      {
        heading: "Substitute late",
        body: "Waiting until the last step means one rounding instead of five, and it leaves a reusable result: A = F/σ answers every load, not just 12 kN. The symbols also show their work, and the units check themselves.",
      },
    ],
    bench: "rearrange",
    prompt:
      "For each of the three bench formulas, solve for every unknown in turn: write the rearranged form on paper first, then confirm it against the bench readout.",
    note: "The bench does the arithmetic. Your job is the rearrangement — the bench only confirms that the symbols landed where you said they would.",
    checks: [
      {
        prompt: "From F = ma, acceleration a equals…",
        options: ["F/m", "m/F", "F·m", "F − m"],
        answer: 0,
        why: "Divide both sides by m: F/m = a. Multiplication by m undoes division by m — the reverse-order rule in a single step.",
      },
      {
        prompt: "From P = F/A, the force F equals…",
        options: ["P·A", "P/A", "A/P", "P + A"],
        answer: 0,
        why: "Multiply both sides by A. Force is pressure times area — and the units agree: (N/m²)(m²) = N.",
      },
      {
        prompt: "y = 2x² and y = 72. The positive root for x is…",
        options: ["6", "36", "12", "−6"],
        answer: 0,
        why: "x² = 36, so x = ±6; a length takes the positive root. Note the order: divide by 2 first (undo the multiplication), then take the root (undo the square).",
      },
      {
        prompt: "Why substitute numbers only after the unknown stands alone?",
        options: [
          "The calculator requires it",
          "One rounding, a reusable formula, and a checkable result",
          "Symbols are harder to misread than digits",
          "It makes the final answer larger",
        ],
        answer: 1,
        why: "Early substitution rounds at every step and answers one instance. Late substitution rounds once and leaves A = F/σ behind for the next load.",
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
  {
    id: "powers",
    track: "math",
    index: 3,
    title: "Powers and scientific notation",
    minutes: 30,
    lede: "Move between prefixes, powers of ten, and scientific notation without friction, and predict how area and volume respond to size changes.",
    start:
      "A deflection calculation hands you 2.4 × 10⁻⁹ m⁴. The CAD tool wants mm⁴. The significant digits are fine; the scale needs moving. || Scientific notation splits a number into its digits (a, between 1 and 10) and its scale (10ⁿ). Prefixes — milli, micro, kilo, mega — are the same idea with names. || Powers of ten are unit factors in disguise: 10³ mm = 1 m says exactly what 25.4 mm = 1 in says. The exponent just counts the zeros so you do not have to.",
    use: "When numbers span many orders of magnitude, or a unit change crosses prefixes. || Convert by shifting the exponent: each factor of 10³ moves milli↔unit↔kilo. When multiplying, add exponents; when dividing, subtract. Keep one digit before the decimal point. || Stop when the exponent and the prefix agree — 2.4 × 10³ mm⁴, and never 2.4 × 10⁻⁹ m⁴ with the wrong label.",
    example:
      "An aluminum bracket measures 80 × 50 × 6 mm. Estimate its mass. || Volume = 80 × 50 × 6 = 24,000 mm³ = 2.4 × 10⁴ mm³. Since 1 m = 10³ mm, 1 m³ = 10⁹ mm³, so V = 2.4 × 10⁻⁵ m³. Mass = 2700 kg/m³ × 2.4 × 10⁻⁵ m³ = 6.48 × 10⁻² kg ≈ 65 g. || A 65-gram bracket is plausible; a 65-kilogram one means the exponent slipped somewhere. The estimate and the calculation agree.",
    ideas: [
      {
        heading: "Prefixes are powers with names",
        body: "Milli = 10⁻³, micro = 10⁻⁶, nano = 10⁻⁹, kilo = 10³, mega = 10⁶, giga = 10⁹. Engineering lives in these six. Convert between them by shifting the exponent in steps of 3: 150 MPa = 150 × 10⁶ Pa = 1.5 × 10⁸ Pa. The digits stay the same — only the exponent moves.",
        formula: "1 GPa = 10⁹ Pa,   1 mm = 10⁻³ m",
      },
      {
        heading: "Exponents add under multiplication",
        body: "(a × 10ᵐ)(b × 10ⁿ) = ab × 10ᵐ⁺ⁿ. Division subtracts. This is why the bracket's volume needed care: mm³ to m³ is not 10³, it is (10³)³ = 10⁹. The exponent triples because the unit is cubed — the most common prefix slip in the shop.",
        formula: "(a × 10ᵐ)(b × 10ⁿ) = ab × 10ᵐ⁺ⁿ",
      },
      {
        heading: "Scale laws are exponent laws",
        body: "Double every length (k = 2): area goes ×4, volume ×8. These are the k²/k³ rules from the ratios lesson, now visible as exponent arithmetic. A part ten times longer in every direction has a thousand times the mass, so scaling up means rechecking everything that mass touches.",
        formula: "L → kL  ⇒  A → k²A,  V → k³V",
      },
    ],
    bench: "powers",
    prompt:
      "Set k = 2 and record what happens to side, area, volume, and mass. Then set k = 0.5. Write the general rule before the bench confirms it.",
    note: "The bench cube is aluminum at 2.7 g/cm³. The scaling rule does not care about the material — k² and k³ are pure geometry.",
    checks: [
      {
        prompt: "2.4 × 10⁻⁹ m⁴ expressed in mm⁴ is…",
        options: ["2.4 × 10³ mm⁴", "2.4 × 10⁻⁶ mm⁴", "2.4 × 10⁻⁹ mm⁴", "2.4 × 10¹² mm⁴"],
        answer: 0,
        why: "1 m = 10³ mm, so 1 m⁴ = (10³)⁴ = 10¹² mm⁴. 2.4 × 10⁻⁹ × 10¹² = 2.4 × 10³. The exponent multiplies by the power of the unit.",
      },
      {
        prompt: "150 MPa in pascals is…",
        options: ["1.5 × 10⁸ Pa", "1.5 × 10⁵ Pa", "1.5 × 10⁶ Pa", "1.5 × 10¹¹ Pa"],
        answer: 0,
        why: "Mega is 10⁶: 150 × 10⁶ = 1.5 × 10⁸. Keeping one digit before the point is the convention, not a rule of nature — but everyone follows it.",
      },
      {
        prompt: "Every dimension of a part triples. Its volume changes by…",
        options: ["3×", "6×", "9×", "27×"],
        answer: 3,
        why: "k³ = 27. Lengths ×3, areas ×9, volumes ×27 — the exponent matches the dimension of the thing being measured.",
      },
      {
        prompt: "(3 × 10⁴) × (2 × 10⁻³) equals…",
        options: ["6 × 10¹", "6 × 10⁷", "5 × 10¹", "6 × 10⁻¹²"],
        answer: 0,
        why: "Multiply the digits (3×2 = 6), add the exponents (4 + (−3) = 1). 6 × 10¹ = 60.",
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
  {
    id: "graphs",
    track: "math",
    index: 4,
    title: "Graphs and proportional reasoning",
    minutes: 35,
    lede: "Read slope and intercept from a line, distinguish direct from inverse proportion, and turn two calibration points into a working instrument.",
    start:
      "A load cell reads 2.1 mV with 10 kg on it and 10.5 mV with 50 kg. Two points determine a line, and that line turns every future voltage into a weight. || Slope is rise over run — how many units of y each unit of x buys. Intercept is the value of y when x is zero. Together they are the whole line: y = mx + b. || A straight line means the rate never changes. Where the relationship really is linear, two points are enough. Where it is not, more points will not help — you need a different model.",
    use: "When paired measurements fall on (or near) a line, or you need to classify a relationship as direct or inverse. || Compute slope from two points: m = Δy/Δx. Find b from one point: b = y − mx. Read new values off the equation, and check that the intercept makes physical sense. || Stop when the line predicts the calibration points back. If the residuals curve instead of scattering, the relationship is not linear — say so instead of forcing it.",
    example:
      "Calibrate the load cell: (10 kg, 2.1 mV) and (50 kg, 10.5 mV). What weight gives 6.93 mV? || m = (10.5 − 2.1)/(50 − 10) = 8.4/40 = 0.21 mV/kg. b = 2.1 − 0.21×10 = 0. So V = 0.21·W, and W = 6.93/0.21 = 33 kg. || The zero intercept is a good sign — no load, no signal. And 33 kg sits between the calibration points, where interpolation is safest. Extrapolating far past 50 kg would be a claim the data does not support.",
    ideas: [
      {
        heading: "Slope is a rate with units",
        body: "m = Δy/Δx carries units of y per x — here millivolts per kilogram, which is the point: each kilogram buys 0.21 mV. Steeper line, more y per x; negative slope, y falls as x rises.",
        formula: "m = Δy/Δx,   y = mx + b",
      },
      {
        heading: "Direct versus inverse",
        body: "Direct proportion, y = kx, is a line through the origin: double x, double y. Inverse proportion, y = k/x, is a hyperbola: double x, halve y. Fixed work at varying power (time = work/power) is inverse; Hooke's law (F = kx) is direct. Check which shape you have before fitting, or you will fit a line to a curve.",
        formula: "direct: y = kx   ·   inverse: y = k/x",
      },
      {
        heading: "Noisy data, honest lines",
        body: "Real points scatter. A calibration line should split the difference so the misses look random — some above, some below, no curve. If the residuals arc, the line was the wrong model. Two points define a line exactly; three or more tell you whether a line was the right idea.",
      },
    ],
    bench: "slope",
    prompt:
      "Match the dashed calibration line with the slope and intercept sliders. Then deliberately break the match and describe what each slider does to the line in one sentence.",
    note: "The bench line is exact. Real calibration data scatters around the line — the bench is the idealization the noisy data is judged against.",
    checks: [
      {
        prompt: "Through (0, 3) and (4, 11), the slope is…",
        options: ["2", "3", "8", "1/2"],
        answer: 0,
        why: "(11 − 3)/(4 − 0) = 8/4 = 2. Rise 8 over run 4.",
      },
      {
        prompt: "The load-cell line is V = 0.21·W. A reading of 6.93 mV means…",
        options: ["33 kg", "3.3 kg", "330 kg", "0.21 kg"],
        answer: 0,
        why: "W = V/m = 6.93/0.21 = 33. The units work: mV ÷ (mV/kg) = kg.",
      },
      {
        prompt: "A fixed amount of work done at twice the power takes…",
        options: ["half the time", "twice the time", "the same time", "four times the time"],
        answer: 0,
        why: "time = work/power is inverse proportion: double the denominator, halve the result.",
      },
      {
        prompt: "The load-cell calibration has intercept b = 0. That means…",
        options: [
          "No load gives no signal",
          "The cell is broken",
          "The slope must be zero",
          "Calibration was unnecessary",
        ],
        answer: 0,
        why: "b is the reading at zero load. Zero is what an honest zero should read — it supports the linear model.",
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
  {
    id: "triangles-vectors",
    track: "math",
    index: 5,
    title: "Geometry, triangles, and vectors",
    minutes: 45,
    lede: "Resolve a force into components with sine and cosine, move between degrees and radians, and add vectors the way equilibrium demands.",
    start:
      "A cable pulls a bracket with 500 N at 35° above the horizontal. The bolt does not feel “500 N at an angle” — it feels a horizontal shear trying to slide the bracket and a vertical tension trying to lift it. || In a right triangle, sine, cosine, and tangent are three fixed ratios: opposite over hypotenuse, adjacent over hypotenuse, opposite over adjacent. For a given angle they never change, which is what makes them dependable. || Components convert one diagonal demand into two axis-aligned demands — the exact form that equilibrium, stress, and every later check are written in.",
    use: "When a force, velocity, or displacement arrives at an angle and the analysis needs axis-aligned pieces. || Draw the right triangle with the vector as the hypotenuse. The adjacent component is magnitude × cos θ, the opposite is magnitude × sin θ. Add vectors by adding their components separately, then recombine with Pythagoras. || Stop when you have (Rx, Ry) — or rebuild the magnitude and check it matches. If √(Rx² + Ry²) is not the original magnitude, a component is wrong.",
    example:
      "Resolve the 500 N cable pull at 35° above horizontal. || Fx = 500·cos 35° ≈ 500 × 0.819 = 410 N. Fy = 500·sin 35° ≈ 500 × 0.574 = 287 N. || Check: √(410² + 287²) = √(168100 + 82369) = √250469 ≈ 500 N. The components add back to the original, so the split is consistent.",
    ideas: [
      {
        heading: "SOH CAH TOA, without mystique",
        body: "Sine = opposite/hypotenuse, cosine = adjacent/hypotenuse, tangent = opposite/adjacent — three fixed ratios. sin 30° = 0.5 means that in any 30° right triangle, the opposite side is exactly half the hypotenuse. Pick the ratio that connects the side you know with the side you want.",
        formula: "sin θ = opp/hyp,   cos θ = adj/hyp,   tan θ = opp/adj",
      },
      {
        heading: "Degrees and radians",
        body: "A full circle is 360° or 2π radians — two labels for the same turn. Convert with rad = deg × π/180. Physics formulas (arc length, angular velocity) want radians; shop drawings speak degrees. And before any trig on a calculator, check its mode: 35 in radian mode is a different triangle.",
        formula: "π rad = 180°,   s = rθ (θ in radians)",
      },
      {
        heading: "Vectors add head to tail",
        body: "Place vectors tip-to-tail and the resultant runs from the first tail to the last tip. In components it is bookkeeping: Rx = Ax + Bx, Ry = Ay + By, then R = √(Rx² + Ry²) and θ = atan2(Ry, Rx). Equilibrium is the statement that the components sum to zero.",
        formula: "Rx = ΣAx,   Ry = ΣAy,   R = √(Rx² + Ry²)",
      },
    ],
    bench: "trig",
    prompt:
      "Set 35° and read off the components of a 500 N pull. Then swing the angle to 0° and 90° and say in one sentence what happens to each component at the extremes.",
    note: "The bench triangle is exact geometry. Real cable angles are measured, not set — the bench teaches the decomposition, not the measurement.",
    checks: [
      {
        prompt: "sin 30° equals…",
        options: ["0.5", "√3/2 ≈ 0.866", "1", "0"],
        answer: 0,
        why: "The 30-60-90 triangle: the side opposite 30° is half the hypotenuse. Worth memorizing alongside sin 45° = √2/2.",
      },
      {
        prompt: "The cable's horizontal component (500 N at 35°) is…",
        options: ["500·cos 35° ≈ 410 N", "500·sin 35° ≈ 287 N", "500·tan 35° ≈ 350 N", "500 N"],
        answer: 0,
        why: "Horizontal is adjacent to the 35° angle: adjacent = hypotenuse × cos. The sine gives the vertical piece.",
      },
      {
        prompt: "180° expressed in radians is…",
        options: ["π", "2π", "π/2", "360"],
        answer: 0,
        why: "π rad = 180° by definition. 2π is the full circle.",
      },
      {
        prompt: "A displacement vector has components (3, 4) m. Its magnitude is…",
        options: ["5 m", "7 m", "12 m", "25 m"],
        answer: 0,
        why: "√(3² + 4²) = √25 = 5. The 3-4-5 triangle shows up everywhere — worth recognizing on sight.",
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
];
