import type { Lesson, Track } from "./types.ts";
import { triangleSidesIdea, angleUnitsIdea, vectorComponentsIdea, vectorResultantSections, TRIG_MEASUREMENT_NOTE } from "./trig-help.ts";

export const mathTrack: Track = {
  id: "math",
  index: "00",
  title: "Math",
  course: "Math Runway",
  lede: "A short runway for the math the rest of the course expects: units, algebra, powers, graphs, and triangles. Take the diagnostic first and work only the modules you actually need.",
};

/**
 * The math runway gates the core course at full marks: 4 of 4 on its
 * four-question check. Existing tracks keep the default PASS_AT (3 of 4).
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
    opening: { mode: "prose", heading: "Before the calculator" },
    readFlow: [
      { kind: "example", heading: "Work one first" },
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "aside", heading: "Common mistake", body: "If the unit you meant to remove is still present after multiplying by a conversion factor, stop. The factor is upside down or incomplete." },
      { kind: "idea", idea: 2, label: "Sanity check" },
      { kind: "idea", idea: 1, label: "Scaling" },
      { kind: "move", heading: "Use it this way" },
    ],
    start:
      "The drawing says 240 mm. The stock list is in inches. This is the kind of conversion that seems trivial right up until a factor gets flipped. || Write the conversion as a fraction: 1 in / 25.4 mm. The numerator and denominator represent the same length, so multiplying by the fraction changes the unit without changing the quantity. || Keep the units on the page and cancel them just like algebraic factors. If the unit you are trying to remove is still there at the end, the setup is wrong. Fix that before you calculate.",
    use: "Use this whenever you convert units or scale a quantity by a ratio. || Start with the number and its unit. Multiply by conversion factors arranged so the unwanted units cancel. Keep the units visible on every line. || When only the target unit remains, do a rough size check. For 240 mm, something near 10 inches makes sense. Something near 100 or 6000 does not.",
    example:
      "Supplied reference factors: 1 in = 25.4 mm exactly; 1 kg ≈ 2.20462 lb (rounded). The price is a given for this exercise, not a current quote. Convert 240 mm to inches, then price a 3.2 kg bracket at $4.10 a pound. || 240 mm × (1 in / 25.4 mm) = 9.449 in. And 3.2 kg × (2.20462 lb / 1 kg) = 7.055 lb, so 7.055 lb × ($4.10 / 1 lb) = $28.92. Keep the extra digits until the last line; round only the answer. || Call it 9.4 in and $29. The 3.2 kg only has two digits, so two or three digits is all any answer can honestly claim. In every line the starting unit cancelled and the target unit survived. Flip the factor to (25.4 mm / 1 in) and you get 6096 mm²/in. That still has the dimension of length (L²/L = L), but it is not an answer in inches — do not strip the units and label 6096 as inches. The leftover unit is the giveaway that the factor was upside down, and you'll spot it before any money is involved.",
    ideas: [
      {
        heading: "Keep the unit attached",
        body: "A number without a unit is incomplete. 9.4 inches and 9.4 millimetres are not close to the same thing. Carry the unit through the working so it can act as a check on the setup. In the factor-label method, the unwanted units should cancel and the target unit should be left behind.",
        formula: "240 mm × (1 in / 25.4 mm) = 9.4 in",
        help: [
          {
            trigger: "Why do the units cancel?",
            title: "The factor-label method",
            intro: "Treat units like algebraic factors. A conversion factor is equal to 1, so it can change the label without changing the physical quantity.",
            sections: [
              {
                heading: "What the setup is doing",
                body: "In 240 mm × (1 in / 25.4 mm), millimetres appear once on top and once on the bottom, so they cancel. Inches are left as the answer unit.",
              },
              {
                heading: "Why the direction matters",
                body: "The unwanted unit must appear on the opposite side of the fraction from where it started. If mm remains after the multiplication, flip or rebuild the factor before calculating.",
              },
              {
                heading: "Quick check",
                items: [
                  "240 mm is about a quarter of a metre.",
                  "A metre is about 40 inches.",
                  "So an answer near 10 inches is plausible.",
                ],
              },
            ],
            caution: "Never strip the units off and convert only the number. The units are part of the error check.",
          },
        ],
      },
      {
        heading: "Ratios preserve shape",
        body: "A scale ratio multiplies every length by the same factor k, and that's all it touches directly. Area is length times length, so it picks up k². Volume picks up k³. A 1:8 glider isn't “eight times smaller” in any single sense: its span is 1/8, its wing area 1/64, its mass at the same density 1/512. If the full-size wing is 1.6 m², the model's is 1.6 m² × (1/8)² = 1.6 / 64 = 0.025 m². Forget the exponent and the model comes out impossibly heavy or impossibly fragile.",
        formula: "lengths ×k ⇒ areas ×k² ⇒ volumes ×k³",
        formulaNote: "Here ⇒ means “implies.” k is the same scale factor for every length; area uses two lengths and volume uses three.",
        help: [{ concept: "scaling-notation" }],
      },
      {
        heading: "Do a rough check first",
        body: "Before you trust the exact result, ask what range would make sense. 240 mm is about a quarter of a metre, and a metre is about 40 inches, so the answer should be around 10 inches. That quick check catches a flipped conversion factor or a lost decimal faster than redoing the arithmetic.",
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
        why: "Feet cancel only when ft is on the bottom of the factor. The setup with (1 ft / 0.3048 m) leaves ft²/m. That still has the dimension of length (L²/L = L), but it is not an answer in metres — do not strip the units and call the bare number metres. The leftover unit tells you the setup is wrong before you compute anything.",
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
        why: "With the same material, mass follows volume. Doubling every length multiplies volume by 2³ = 8, so the mass also goes up by a factor of 8.",
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
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "The formula σ = F/A gives stress when you know force and area. In design, you often need to run it backward: the load and allowable stress are known, so what area do you need? || Rearranging a formula is just undoing the operations around the unknown while doing the same thing to both sides. || Do the symbolic rearrangement first. Once the unknown is alone, put the numbers in. That keeps the logic visible and makes the result easier to check.",
    use: "When a formula connects the quantities and you know all but one. || Identify the unknown. Undo what the formula does to it — addition and subtraction first, then multiplication and division, then powers and roots — applying each inverse operation to both sides. Substitute numbers only after the unknown stands alone. || Stop when the unknown is alone on one side. Then substitute, compute once, and check by feeding the answer back into the original form.",
    example:
      "Allowable stress 150 MPa, tensile load 12 kN. What cross-sectional area is required? || A = F/σ = 12,000 N / (150 × 10⁶ N/m²) = 8.0 × 10⁻⁵ m² = 80 mm². A 10 × 8 mm bar lands exactly on the line — take the next size up. || Check by substitution: F/A = 12,000 / (80 × 10⁻⁶) = 150 × 10⁶ Pa = 150 MPa. Putting the answer back into the original form confirms it.",
    ideas: [
      {
        heading: "Treat both sides the same",
        body: "Whatever operation you apply to one side of an equation, apply to the other side as well. That is the whole rule. If a rearrangement goes wrong, check whether one side received an operation the other did not.",
        formula: "a = b  ⇒  a + c = b + c",
        help: [
          {
            trigger: "Why equality is preserved",
            title: "Addition property of equality",
            intro: "If two expressions are equal, adding the same amount to both sides keeps them equal. This is one of the basic rules that lets you solve equations.",
            sections: [
              {
                heading: "What the symbols mean",
                body: "a = b says the two sides have the same value. The ⇒ symbol means “implies”: if the statement on the left is true, the statement on the right must also be true.",
              },
              {
                heading: "Why it works",
                body: "Picture a balanced scale. If both pans weigh the same, adding the same 5 lb weight to each pan keeps the scale balanced. It only tips if you change one side and not the other.",
              },
              {
                heading: "Solve a simple equation",
                items: [
                  "x − 7 = 12",
                  "Add 7 to both sides: x − 7 + 7 = 12 + 7",
                  "Result: x = 19",
                ],
              },
              {
                heading: "Shop example",
                items: [
                  "A 3.25 in part needs a shim to sit flush with a 4.00 in surface.",
                  "3.25 + s = 4.00",
                  "Add −3.25 to both sides: s = 0.75 in",
                ],
              },
              {
                heading: "The larger rule",
                body: "Subtracting is adding a negative. There are matching equality rules for multiplying and dividing both sides by the same nonzero number.",
              },
            ],
            caution: "Division by zero is not allowed. And whatever operation you use, apply it to the entire left and right sides—not just the convenient-looking term.",
          },
        ],
      },
      {
        heading: "Undo the operations in reverse",
        body: "If the unknown has several operations wrapped around it, remove them in reverse order. Undo addition or subtraction, then multiplication or division, then powers or roots as needed. Work one step at a time so you can see exactly what changed.",
        formula: "y = kx² + c  ⇒  x = ±√((y − c)/k)",
        help: [
          {
            trigger: "Run a formula backward",
            title: "Rearranging a formula for the quantity you need",
            intro: "In design, you often know the result you need and have to solve backward for the missing input. The safe way is to isolate the unknown symbolically first, then substitute numbers.",
            sections: [
              {
                heading: "Core idea",
                body: "Stress is σ = F/A. If force F and area A are known, you can calculate stress. But if the load and allowable stress are known, the design question is reversed: what area A is required?",
              },
              {
                heading: "Step 1 — do the same thing to both sides",
                items: [
                  "Start with σ = F/A.",
                  "Multiply both sides by A: σA = F.",
                  "Divide both sides by σ: A = F/σ.",
                ],
              },
              {
                heading: "Step 2 — undo operations in reverse",
                body: "If the unknown is buried under several operations, remove the outer operations first. For y = kx² + c, subtract c, divide by k, then take the square root: x = ±√((y − c)/k).",
              },
              {
                heading: "Step 3 — put the numbers in last",
                body: "Keeping the symbols until the unknown is alone reduces repeated rounding and leaves you with a formula you can reuse for another load case.",
              },
              {
                heading: "Worked design example",
                items: [
                  "Required load: F = 12,000 N.",
                  "Allowable stress: σ = 150 MPa = 150 N/mm².",
                  "A = F/σ = 12,000 / 150 = 80 mm².",
                  "A 10 × 8 mm bar is exactly 80 mm², so it sits right at the limit. In a real design you would normally choose the next suitable size up to provide margin.",
                ],
              },
              {
                heading: "Check the answer",
                body: "Put 80 mm² back into the original formula: 12,000 N / 80 mm² = 150 N/mm² = 150 MPa. The original relationship is satisfied.",
              },
            ],
            caution: "Do not move a term across the equals sign by changing its sign as a memorized trick. Perform the actual inverse operation on both sides; that method still works when the equation gets more complicated.",
          },
        ],
      },
      {
        heading: "Put the numbers in last",
        body: "Keeping the formula symbolic until the unknown is isolated reduces rounding and leaves you with a reusable relationship. A = F/σ is useful for every load case, not only the one in the example.",
        help: [
          {
            trigger: "Why symbols first?",
            title: "Why substitute numbers at the end",
            intro: "Solving symbolically keeps the reasoning visible and makes the result reusable.",
            sections: [
              {
                heading: "Less rounding",
                body: "If you substitute decimal values early, each intermediate step can introduce rounding. Keeping symbols until the last line usually means one numerical calculation and one final rounding step.",
              },
              {
                heading: "Reusable result",
                body: "A = F/σ is not just the answer to one problem. It is a design relationship you can reuse for any load and allowable stress.",
              },
              {
                heading: "Easier checking",
                body: "A symbolic result makes unit and dependency checks easier. From A = F/σ you can immediately see that more force requires more area and a higher allowable stress requires less area.",
              },
            ],
          },
        ],
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
        why: "Divide both sides by m: F/m = a. Division by m undoes multiplication by m — the reverse-order rule in a single step.",
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
    opening: { mode: "steps", heading: "Read this as a decision", labels: ["What you see", "What it means", "What to do"] },
    readFlow: [
      { kind: "move", heading: "The decision routine" },
      { kind: "idea", idea: 0, label: "Criterion 1" },
      { kind: "idea", idea: 1, label: "Criterion 2" },
      { kind: "example", heading: "Decision example" },
      { kind: "idea", idea: 2, label: "Criterion 3" },
    ],
    start:
      "A stiffness calculation supplies I = 2.4 × 10⁻⁹ m⁴, but the CAD tool expects mm⁴. I is the second moment of area: a cross-section geometry property about a chosen axis, not mass or a four-dimensional volume. Its definition weights area (length²) by squared distance (length²), giving length⁴. You can convert it without learning beam design first. || Scientific notation separates the coefficient from the power of ten. Metric prefixes do the same job with names: milli is 10⁻³, kilo is 10³, mega is 10⁶. Changing a prefix and tidying the scientific notation are two different steps. || Raise the conversion factor to the same power as the unit: 1 m⁴ = (1000 mm)⁴ = 10¹² mm⁴. Then 2.4 × 10⁻⁹ × 10¹² = 2.4 × 10³ mm⁴ = 2400 mm⁴. Multiply exponents for a power of a power; add exponents when multiplying powers of ten.",
    use: "When numbers span many orders of magnitude, or a unit change crosses prefixes. || Convert by shifting the exponent: each factor of 10³ moves milli↔unit↔kilo. When multiplying, add exponents; when dividing, subtract. Keep one digit before the decimal point. || Stop when the exponent and the prefix agree — 2.4 × 10³ mm⁴, and never 2.4 × 10⁻⁹ mm⁴ (the old exponent with the new label).",
    example:
      "An aluminum bracket measures 80 × 50 × 6 mm. Estimate its mass. Given: ρ(aluminum) ≈ 2700 kg/m³ (typical, from material tables). ρ is the Greek letter rho and means density: mass per unit volume. This number is looked up, not calculated from the dimensions; you are not expected to memorize it. || Geometry gives the volume: V = 80 × 50 × 6 = 24,000 mm³ = 2.4 × 10⁴ mm³. Since 1 m = 10³ mm, 1 m³ = 10⁹ mm³, so V = 2.4 × 10⁻⁵ m³. The material supplies the density: ρ ≈ 2700 kg/m³. Now use mass = density × volume: m = ρV = (2700 kg/m³)(2.4 × 10⁻⁵ m³) = 0.0648 kg = 64.8 g ≈ 65 g. || The cubic metres cancel and kilograms remain. The dimensions gave us volume; the material table gave us density; their product gave us mass. 65 g is plausible for this small solid bracket. Use the actual alloy datasheet when a precise density matters.",
    exampleHelp: [{ concept: "material-density" }],
    ideas: [
      {
        heading: "Know the common prefixes",
        body: "Milli = 10⁻³, micro = 10⁻⁶, nano = 10⁻⁹, kilo = 10³, mega = 10⁶, and giga = 10⁹. You will see these constantly. Take a given stress of 150 MPa. Mega supplies 10⁶, giving 150 × 10⁶ Pa. Now rewrite 150 as 1.5 × 10²: (1.5 × 10²) × 10⁶ = 1.5 × 10⁸ Pa = 150,000,000 Pa. The extra 10² came from rewriting 150, not from mega. In standard scientific notation the nonzero coefficient has magnitude at least 1 and less than 10.",
        formula: "1 GPa = 10⁹ Pa,   1 mm = 10⁻³ m",
        formulaNote: "Capital M means mega (one million). Lowercase m means milli in a prefix, but m alone is the unit metre. Read the complete unit.",
        help: [{ concept: "scientific-notation-normalize" }],
      },
      {
        heading: "Exponents add under multiplication",
        body: "(a × 10ᵐ)(b × 10ⁿ) = ab × 10ᵐ⁺ⁿ. Division subtracts. For the bracket, 1 mm = 10⁻³ m, so 1 mm³ = (10⁻³)³ m³ = 10⁻⁹ m³. Going the other way, 1 m³ = 10⁹ mm³. The conversion direction matters as much as the cube.",
        formula: "(a × 10ᵐ)(b × 10ⁿ) = ab × 10ᵐ⁺ⁿ",
        help: [
          { concept: "powered-unit-conversion" },
          {
            trigger: "Why add the exponents?",
            title: "Multiplying powers of ten",
            intro: "Powers tell you how many factors of ten are present. When you multiply, you combine those factors, so the exponents add.",
            sections: [
              {
                heading: "Small example",
                body: "10³ × 10² means (10×10×10) × (10×10). That is five factors of ten: 10⁵.",
              },
              {
                heading: "With coefficients",
                body: "(3 × 10⁴)(2 × 10⁻³) = 6 × 10¹ = 60. Multiply the ordinary numbers, then add the exponents.",
              },
              {
                heading: "Units raised to powers",
                body: "If 1 m = 10³ mm, then 1 m⁴ = (10³)⁴ mm⁴ = 10¹² mm⁴. The unit's exponent applies to the conversion factor too.",
              },
            ],
            caution: "A very common mistake is changing m⁴ to mm⁴ but applying only one factor of 10³.",
          },
        ],
      },
      {
        heading: "Scaling changes area and volume faster",
        body: "If every length doubles, area goes up by 2² = 4 and volume by 2³ = 8. A geometrically similar part that is ten times larger in every direction has a thousand times the volume and, at the same density, a thousand times the mass.",
        formula: "L → kL  ⇒  A → k²A,  V → k³V",
        formulaNote: "Reading this line: → means “becomes” here; ⇒ means “implies.” L is length, A is area, V is volume, and k is the length scale factor. With k = 10, lengths grow 10×, area 100×, and volume 1000×. Mass also grows 1000× only if density stays the same.",
        help: [{ concept: "scaling-notation" }],
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
        why: "1 m = 10³ mm, so 1 m⁴ = (10³)⁴ mm⁴ = 10¹² mm⁴ (3 × 4 = 12). Then 2.4 × 10⁻⁹ × 10¹² = 2.4 × 10³ mm⁴ = 2400 mm⁴ (−9 + 12 = 3). The 10¹² option drops the original 10⁻⁹; the 10⁻⁶ option uses the factor only once, −9 + 3 = −6; the unchanged 10⁻⁹ just relabels the number. A smaller unit should give a bigger number, but 10⁻⁶ also passes that rough check: the required factor is specifically 10¹².",
      },
      {
        prompt: "150 MPa in pascals is…",
        options: ["1.5 × 10⁸ Pa", "1.5 × 10⁵ Pa", "1.5 × 10⁶ Pa", "1.5 × 10¹¹ Pa"],
        answer: 0,
        why: "Mega supplies 10⁶: 150 MPa = 150 × 10⁶ Pa. Rewrite 150 = 1.5 × 10², then add exponents: (1.5 × 10²) × 10⁶ = 1.5 × 10⁸ Pa. The extra 10² comes from rewriting 150. Check: 150 million is 150,000,000 Pa. This given stress does not specify any particular alloy’s yield strength.",
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
    opening: { mode: "prose", heading: "Use the example to find the pattern" },
    readFlow: [
      { kind: "example", heading: "Start with the example" },
      { kind: "idea", idea: 0, label: "Underlying rule" },
      { kind: "idea", idea: 1, label: "Pattern" },
      { kind: "idea", idea: 2, label: "What to watch" },
      { kind: "move", heading: "Apply it yourself" },
    ],
    start:
      "A load cell reads 2.1 mV at 10 kg and 10.5 mV at 50 kg. If the sensor is linear, those two points let us build a calibration equation. || Slope is the change in y divided by the change in x. The intercept is the value of y when x is zero. Put them together and you get y = mx + b. || Two points define a line, but they do not prove the real system is linear. A third point is useful because it tells you whether the line actually predicts something it was not fitted to.",
    use: "When paired measurements fall on (or near) a line, or you need to classify a relationship as direct or inverse. || Compute slope from two points: m = Δy/Δx. Find b from one point: b = y − mx. Read new values off the equation, and check that the intercept makes physical sense. || Stop when the line predicts a third, held-back calibration point. If the residuals curve instead of scattering, the relationship is not linear — say so instead of forcing it.",
    example:
      "Calibrate the load cell: (10 kg, 2.1 mV) and (50 kg, 10.5 mV). What weight gives 6.93 mV? || Rise = (10.5 − 2.1) mV = 8.4 mV. Run = (50 − 10) kg = 40 kg, using the two calibration loads. Slope m = 8.4/40 = 0.21 mV/kg. Substitute the first reading: 2.1 = 0.21 × 10 + b = 2.1 + b, so b = 0 mV. Now V = 0.21·W, and W = 6.93/0.21 = 33 kg. || For these supplied readings, b = 0 predicts zero voltage at zero load; that still needs checking on the actual sensor. A real zero-load offset is possible. The 33 kg result is interpolation between our calibration points, not evidence that the line holds outside them.",
    exampleHelp: [
      {
            "trigger": "Where did 50 − 10 come from?",
            "title": "Rise and run use the same two readings",
            "intro": "Those numbers are the loads you calibrated at: 10 kg and 50 kg. They are not extra constants.",
            "sections": [
                  {
                        "heading": "Keep each point together",
                        "items": [
                              "First point: (10 kg, 2.1 mV). Second point: (50 kg, 10.5 mV).",
                              "Rise = second voltage − first voltage = 10.5 − 2.1 = 8.4 mV.",
                              "Run = second load − first load = 50 − 10 = 40 kg.",
                              "Slope = 8.4 mV ÷ 40 kg = 0.21 mV/kg."
                        ]
                  },
                  {
                        "heading": "What that means",
                        "body": "Each extra kilogram raises the reading by 0.21 mV in this fitted model. The 40 kg is the horizontal gap between the points, not the final load."
                  },
                  {
                        "heading": "Reverse both, not just one",
                        "body": "(2.1 − 10.5)/(10 − 50) = (−8.4)/(−40) = 0.21. Reversing just one subtraction changes the sign incorrectly."
                  }
            ]
      },
      {
            "trigger": "Why does b become zero?",
            "title": "Find the voltage left at zero load",
            "intro": "b is the intercept: the voltage the fitted line predicts when the load is zero. Use a known reading to find it; do not guess it.",
            "sections": [
                  {
                        "heading": "Substitute the 10 kg point",
                        "items": [
                              "Start with V = mW + b.",
                              "We know V = 2.1 mV, m = 0.21 mV/kg and W = 10 kg.",
                              "2.1 = 0.21 × 10 + b.",
                              "0.21 × 10 = 2.1, so 2.1 = 2.1 + b.",
                              "Subtract 2.1 from both sides: b = 2.1 − 2.1 = 0 mV."
                        ]
                  },
                  {
                        "heading": "Check with the other point",
                        "body": "b = 10.5 − 0.21 × 50 = 0 mV too. Both calibration readings give the same intercept."
                  },
                  {
                        "heading": "Why the +b disappears",
                        "body": "Adding zero changes nothing, so V = 0.21W + 0 becomes V = 0.21W. The fitted relationship is directly proportional for this example."
                  }
            ],
            "caution": "Real sensors can have zero-load offsets. These two readings give b = 0; they do not prove zero output or linear behavior at every load."
      }
],
    ideas: [
      {
        heading: "Slope tells you the rate of change",
        body: "The units of slope are y-units per x-unit. Here that is millivolts per kilogram, so a slope of 0.21 mV/kg means each additional kilogram changes the signal by 0.21 mV. A negative slope simply means y decreases as x increases.",
        formula: "m = Δy/Δx,   y = mx + b",
        formulaNote: "Δ means change. Here x is load W (kg) and y is voltage V (mV): rise = (10.5 − 2.1) mV and run = (50 − 10) kg. The 10 and 50 are supplied calibration loads. b = V − mW is the voltage left over after subtracting the load-dependent part.",
        help: [
          {
            trigger: "Slope and intercept?",
            title: "Reading y = mx + b",
            intro: "The equation describes a straight line. m tells you how fast y changes as x changes, and b tells you the y-value when x is zero.",
            sections: [
              {
                heading: "Slope m",
                body: "m = Δy/Δx is rise over run. Its units are y-units per x-unit, such as millivolts per kilogram.",
              },
              {
                heading: "Intercept b",
                body: "b is where the line crosses the y-axis. In a sensor calibration, a nonzero intercept can represent an offset that exists even when the true input is zero.",
              },
              {
                heading: "Example",
                items: [
                  "Points (0, 3) and (4, 11)",
                  "m = (11 − 3)/(4 − 0) = 2",
                  "Because x = 0 gives y = 3, b = 3",
                  "The line is y = 2x + 3",
                ],
              },
            ],
            caution: "Two points always define a line; they do not prove the real system is linear. Check additional data when that assumption matters.",
          },
        ],
      },
      {
        heading: "Direct versus inverse",
        body: "Ask what stays the same. In a direct proportion, the ratio y/x stays constant. In an inverse proportion, the product x × y stays constant. Both involve a constant k, but they describe different patterns.",
        formula: "direct: y = kx, constant y/x   ·   inverse: y = k/x, constant x × y",
        formulaNote: "The examples below use positive quantities and k > 0. Do not divide by x = 0. A straight line with a nonzero intercept is not a direct proportion.",
        sections: [
        {
                "heading": "Direct proportion: keep the ratio constant",
                "body": "For y = kx, doubling x doubles y. The line passes through the origin (0, 0), and y/x stays at k for nonzero x. For an ideal spring, F = kx. Here k = 5 N/mm is the supplied spring stiffness, and x is extension from the unloaded length. Use this model only within its linear range.",
                "table": {
                        "caption": "Ideal spring: supplied k = 5 N/mm",
                        "columns": [
                                "Stretch x (mm)",
                                "Force F (N)",
                                "F/x (N/mm)"
                        ],
                        "rows": [
                                [
                                        "2",
                                        "10",
                                        "5"
                                ],
                                [
                                        "4",
                                        "20",
                                        "5"
                                ],
                                [
                                        "8",
                                        "40",
                                        "5"
                                ]
                        ]
                }
        },
        {
                "heading": "Inverse proportion: keep the product constant",
                "body": "For y = k/x, doubling x halves y; x × y stays at k. Our example is a fixed 12 kJ job with constant useful power and no losses. Time = work/power, and 1 kW = 1 kJ/s, so kJ ÷ kW gives seconds. For positive x and k, the curve falls and flattens, approaching—but never reaching—either axis.",
                "table": {
                        "caption": "Fixed work: supplied 12 kJ",
                        "columns": [
                                "Power P (kW)",
                                "Time t (s)",
                                "P × t (kJ)"
                        ],
                        "rows": [
                                [
                                        "2",
                                        "6",
                                        "12"
                                ],
                                [
                                        "4",
                                        "3",
                                        "12"
                                ],
                                [
                                        "6",
                                        "2",
                                        "12"
                                ]
                        ]
                }
        },
        {
                "heading": "The trap: linear does not always mean proportional",
                "body": "The line y = 2x + 3 has a constant slope, but its +3 offset stays put when x doubles. The ratios below change, so it is linear but not a direct proportion. Our fitted load-cell line V = 0.21W is a direct proportion because its intercept is zero: V/W = 0.21 mV/kg for nonzero W.",
                "table": {
                        "caption": "An offset line: y = 2x + 3",
                        "columns": [
                                "x",
                                "y",
                                "y/x"
                        ],
                        "rows": [
                                [
                                        "1",
                                        "5",
                                        "5"
                                ],
                                [
                                        "2",
                                        "7",
                                        "3.5"
                                ],
                                [
                                        "4",
                                        "11",
                                        "2.75"
                                ]
                        ]
                }
        },
        {
                "heading": "Check the shape, then the numbers",
                "items": [
                        "Plot the data. A straight line through the origin suggests direct proportion; check whether y/x is constant for nonzero x.",
                        "A falling curve is only a clue. Check x × y: not every decreasing relationship is inverse.",
                        "For y = k/x, plotting y against 1/x gives a straight line through the origin with slope k. x cannot be zero.",
                        "Real readings scatter. Compare differences against measurement uncertainty and use extra points. A line fitted to a curve can be misleading within the measured range as well as beyond it."
                ]
        }
],
        help: [{ trigger: "How does this show up at a drill press?", title: "Same cutting speed, different drill diameter", intro: "Keep the surface cutting speed fixed and a larger drill must turn more slowly.", sections: [{ heading: "Where the factor comes from", body: "RPM = 12 × SFM/(π × D) ≈ 3.82 × SFM/D when D is in inches and SFM is surface feet per minute. The 12 converts feet to inches, πD is the circumference, and 3.82 is the rounded 12/π—not a material property." }, { heading: "Use the supplied practice speed", items: ["At a given 100 SFM and D = 0.5 in: RPM ≈ 3.82 × 100/0.5 = 764.", "At the same 100 SFM and D = 1 in: RPM ≈ 382.", "Doubling diameter halves RPM because RPM × D stays constant at this cutting speed."] }], caution: "100 SFM is an exercise input, not a recommended speed for every drill or material. Use the tool maker’s guidance for an actual cut." }],
      },
      {
        heading: "Real data will not sit perfectly on the line",
        body: "Measured points usually scatter around the fitted line. What matters is the pattern of the misses. Random-looking residuals are compatible with a linear model; a curve or trend in the residuals suggests the model is missing something.",
      },
    ],
    bench: "slope",
    prompt:
      "Match the dashed line with the slope and intercept sliders. Then classify each three-pair practice set as direct, inverse, or neither, and check the ratio and product before moving on.",
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
        why: "b is the zero-load reading predicted by this fitted line. These example readings give b = 0, so the model predicts no signal at zero load. A real sensor can have an offset; test zero load and additional points rather than treating b = 0 as proof of linearity.",
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
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Name the sides" },
      { kind: "idea", idea: 1, label: "Choose the angle unit" },
      { kind: "example", heading: "Resolve the cable force" },
      { kind: "idea", idea: 2, label: "Combine the pulls" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "A cable pulls a bracket with 500 N at 35° above horizontal. For the next calculation, that angled force is easier to use as a horizontal component and a vertical component. || In a right triangle, sine, cosine, and tangent connect the angle to the side ratios. The ratios do not depend on the triangle's overall size. || Resolve the vector into components first. Later equilibrium and stress calculations are almost always written along chosen axes, so this is a basic move you will keep using.",
    use: "When a force, velocity, or displacement arrives at an angle and the analysis needs axis-aligned pieces. || Draw the right triangle with the vector as the hypotenuse. The adjacent component is magnitude × cos θ, the opposite is magnitude × sin θ. Add vectors by adding their components separately, then recombine with Pythagoras. || Stop when you have (Rx, Ry) — or rebuild the magnitude and check it matches. For one resolved vector, √(Rx² + Ry²) should recover its magnitude. For several vectors, it gives the resultant magnitude, not the sum of their individual magnitudes.",
    example:
      "Resolve the 500 N cable pull at 35° above horizontal. || Fx = 500·cos 35° ≈ 500 × 0.819 = 410 N. Fy = 500·sin 35° ≈ 500 × 0.574 = 287 N. || Check: √(410² + 287²) = √(168100 + 82369) = √250469 ≈ 500 N. The components recombine to the original magnitude, so the split is consistent.",
    exampleHelp: [{ concept: "angle-measurement" }],
    ideas: [
      triangleSidesIdea,
      angleUnitsIdea,
      vectorComponentsIdea,
    ],
    bench: "trig",
    prompt:
      "Set 35° and read off the components of a 500 N pull. Then swing the angle to 0° and 90° and say in one sentence what happens to each component at the extremes.",
    note: TRIG_MEASUREMENT_NOTE,
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
        prompt:
          "Two come-alongs work a seized engine stand across the shop floor: one pulls 500 N along the floor line (0°), the other 300 N at 60° to that line. The resultant pull is…",
        options: [
          "700 N at 21.8° to the floor line",
          "800 N at 30° to the floor line",
          "583 N at 31.0° to the floor line",
          "774 N at 11.2° to the floor line",
        ],
        answer: 0,
        why: "Resolve both pulls along the same axes. The totals are Rx = 650 N to the right and Ry ≈ 260 N up on the diagram. Those are the perpendicular legs of the resultant triangle, giving about 700 N at 21.8° to the floor reference line. Here is where each total and the angle come from.",
        feedbackSections: vectorResultantSections,
        help: [{ concept: "atan2-direction" }],
      },
    ],
    passAt: RUNWAY_PASS_AT,
  },
];
