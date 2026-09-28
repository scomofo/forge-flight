import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 7 — Elasticity & simple structures.
 * These three lessons head the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: predict-then-measure
 * beam deflection (lesson 2 bench and checks).
 */
export const physicsW7Lessons: Lesson[] = [
  {
    id: "elastic",
    track: "physics",
    index: 19,
    title: "Stress and strain",
    minutes: 35,
    lede: "You will read stress as force per area and strain as stretch per length, connect them through Hooke's law, and size a bar from δ = FL/AE.",
    start:
      "A crane picks up a two-ton steel beam on a cable no thicker than your thumb. The cable stretches — every loaded material stretches, steel included — and the engineer who sized it did not guess. She divided. || Stress, σ, is force spread over area: σ = F/A. Strain, ε, is stretch relative to length: ε = ΔL/L. The first is what the material feels; the second is how it answers. Strain has no units — it is a ratio, the dimensionless signal Week 1 taught you to respect. || Internal force has to go somewhere. It distributes over the cross-section, so a thicker cable feels less stress for the same load. That is the whole reason cables, columns, and bones are sized by area, not by vibes: double the diameter and the stress falls by four.",
    use: "Whenever you size a member for axial load — cable, column, tie rod. || Compute the stress σ = F/A, compare it to what the material is allowed (more on that next lesson), then compute the stretch δ = FL/AE and check it is acceptable. Force, length, area, modulus — all four have to be in SI before the arithmetic. || Stop when the stress is under the allowable and the stretch is within whatever the job tolerates. A cable that holds but stretches a meter is a design failure with extra steps.",
    example:
      "A 10 mm diameter steel rod, 2 m long, hangs a 15 kN load. Does it hold, and how much does it stretch? || Area A = π(0.005)² = 7.85×10⁻⁵ m². Stress σ = 15000 / 7.85×10⁻⁵ = 1.91×10⁸ Pa = 191 MPa. Mild steel yields around 250 MPa, so the stress is under yield with room to spare. Stretch δ = FL/AE = 15000 × 2 / (7.85×10⁻⁵ × 200×10⁹) = 1.91×10⁻³ m. || 191 MPa — the rod holds. 1.91 mm of stretch on a 2 m rod — a strain of about 0.001, one part in a thousand. Steel feels rigid because the modulus is enormous, not because it does not stretch.",
    ideas: [
      {
        heading: "Stress is internal force per area",
        body: "Cut the bar mentally and ask what holds the two halves together: internal forces, spread over the cross-section. σ = F/A in pascals — newtons per square meter. A megapascal is one newton per square millimeter, which is why MPa is the working unit: a 10 mm rod at 191 MPa carries about 15 kN, numbers you can hold in your head.",
        formula: "σ = F/A, 1 MPa = 1 N/mm²",
      },
      {
        heading: "Strain is relative, not absolute",
        body: "A 2 mm stretch means nothing until you know the length it stretched over. ε = ΔL/L is dimensionless — the same 0.001 strain is 2 mm on a 2 m rod and 2 μm on a 2 mm shim. That is why the dimensionless strain, not the absolute stretch, is what the material's behavior is written in.",
        formula: "ε = ΔL/L (dimensionless)",
      },
      {
        heading: "Hooke's law is the material's voice",
        body: "In the elastic range, stress and strain are proportional: σ = Eε, where E, Young's modulus, is the material's stiffness — 200 GPa for steel, 69 for aluminum, about 10 for wood along the grain. Combine with the definitions and the geometry and material separate cleanly: δ = FL/AE. F and L are your design, A is your sizing, E is your material choice.",
        formula: "δ = FL/AE",
      },
    ],
    bench: "stressstrain",
    prompt:
      "Pick a material, a diameter, and a load. || Find the load where the stress first crosses yield — that boundary is the whole story of the elastic range. || Write down the stress, the strain, and the safety factor at your working load.",
    note: "Teaching yield values, not code allowables. Uniform axial stress, no notch, no bending — the idealizations the formulas assume.",
    checks: [
      {
        prompt: "A 20 kN force pulls a bar of cross-section 100 mm². The stress is…",
        options: ["200 MPa", "20 MPa", "2 MPa", "2000 MPa"],
        answer: 0,
        why: "σ = F/A = 20000 N / 100 mm² = 200 N/mm² = 200 MPa. One megapascal is one newton per square millimeter.",
      },
      {
        prompt: "A 2 m rod stretches 1.91 mm. Its strain is…",
        options: ["0.000955", "0.955", "1.91", "0.00191 m"],
        answer: 0,
        why: "ε = ΔL/L = 0.00191 m / 2 m = 0.000955. Strain is dimensionless — no units, just a ratio.",
      },
      {
        prompt: "Two identical steel rods, one twice the diameter. Under the same pull, the thicker rod's stress is…",
        options: ["One quarter", "One half", "The same", "Double"],
        answer: 0,
        why: "Area scales with diameter squared: (2d)² = 4d², so σ = F/4A. Double the diameter, quarter the stress — area is the sizing lever.",
      },
      {
        prompt: "δ = FL/AE says that for a fixed force and material, doubling the length and halving the area…",
        options: [
          "Quadruples the stretch",
          "Doubles the stretch",
          "Leaves the stretch unchanged",
          "Halves the stretch",
        ],
        answer: 0,
        why: "δ ∝ L/A: twice the length and half the area multiply to 2 × 2 = 4. The formula separates design (F, L), sizing (A), and material (E) into independent levers.",
      },
    ],
  },
  {
    id: "bending",
    track: "physics",
    index: 20,
    title: "Bending",
    minutes: 35,
    lede: "You will see why a beam bends the way it does, read the second moment of area as shape's leverage, and use δ = FL³/3EI as a scaling law before you trust it as a number.",
    start:
      "Stand on a diving board and it sags. The top surface stretches, the bottom surface squeezes, and somewhere in the middle a layer does nothing at all. || Bending is differential stretch: strain varies through the depth, tension on the convex side, compression on the concave side, zero at the neutral axis. The second moment of area, I = ∫y²dA, measures how far the material sits from that axis — material far from the middle counts quadratically, because it is both more strained and has more leverage. || That is why floor joists are deep, not wide, and why an I-beam puts almost all its steel in the flanges. Depth is the cheap lever: for a rectangle, I = bh³/12, and that cube is the whole game.",
    use: "When you need a beam's stiffness before you trust any single number: read the formula as a scaling law. || Deflection scales with L³ — double the span, eight times the sag. It scales inversely with h³ — double the depth, one-eighth the sag. It scales inversely with E — the material lever, the weakest of the three. || Stop trusting the number when the beam stops being slender or the deflection stops being small: δ beyond about a tenth of the span means the linear formula is leaving its range. Scaling laws survive; precise digits do not.",
    example:
      "A steel ruler cantilevers 300 mm off a desk: 25 mm wide, 2 mm thick, 5 N at the tip. How far does it droop? || I = bh³/12 = 0.025 × (0.002)³/12 = 1.67×10⁻¹¹ m⁴. δ = FL³/3EI = 5 × (0.3)³ / (3 × 200×10⁹ × 1.67×10⁻¹¹) = 0.0135 m. || 13.5 mm of droop — about a twentieth of the span, inside the formula's honest range. Now halve the thickness to 1 mm: I falls by eight, so δ rises eightfold to about 10.8 cm, and the small-deflection assumption is broken. The scaling law warned you; the precise number was never the point.",
    ideas: [
      {
        heading: "Bending is differential stretch",
        body: "Axial load stretches every fiber equally. Bending stretches fibers in proportion to their distance from the neutral axis — the side away from the load goes into tension, the near side into compression. The stress at a fiber is σ = My/I: linear through the depth, maximum at the outer faces, zero where it costs you nothing to remove material.",
        formula: "σ = My/I",
      },
      {
        heading: "I is shape's leverage",
        body: "The second moment of area is not an area and not a moment of inertia — it is the cross-section's geometric resistance to bending, in m⁴. The y² inside the integral is the whole design lesson: moving material away from the neutral axis pays quadratically, which is why hollow tubes and I-sections dominate structures. Two sections of equal area can differ tenfold in I.",
        formula: "I = ∫y²dA, rectangle: bh³/12",
      },
      {
        heading: "δ = FL³/3EI is a scaling law first",
        body: "For a cantilever with a tip load, the tip deflection packs every lever into one expression: force linear, length cubed, modulus and shape in the denominator. Use it to compare designs — deeper, shorter, stiffer — before you use it to predict a number. And check δ/L afterwards: past ~0.1, the linear theory that produced the formula no longer describes the beam.",
        formula: "δ = FL³/3EI (cantilever, tip load)",
      },
    ],
    bench: "beamdefl",
    prompt:
      "Choose a material, a section, a length, and a load. Write down your predicted tip deflection before you measure. || Compare: the error, not the agreement, is the lesson. || Name the dominant source of the gap.",
    note: "The 'measurement' is simulated with named, deliberate bias — support compliance plus material scatter — so the error has something to teach. Slender beams, small deflections: check δ/L.",
    checks: [
      {
        prompt: "A cantilever's span doubles, everything else fixed. Tip deflection…",
        options: ["Grows 8×", "Grows 4×", "Grows 2×", "Is unchanged"],
        answer: 0,
        why: "δ ∝ L³: 2³ = 8. Span is the most violent lever in the formula — the reason long beams get deep fast.",
      },
      {
        prompt: "A rectangular beam's depth doubles, width fixed. Its bending stiffness (EI)…",
        options: ["Grows 8×", "Grows 4×", "Grows 2×", "Grows 16×"],
        answer: 0,
        why: "I = bh³/12: depth cubed. That is why joists stand tall and I-beams put steel in the flanges — depth is the cheap stiffness.",
      },
      {
        prompt: "In a sagging beam, the top fibers are in…",
        options: ["Tension", "Compression", "Shear only", "Nothing — the top is unstressed"],
        answer: 0,
        why: "The convex side stretches: sagging puts the top in tension and the bottom in compression, with the neutral axis unstressed between them.",
      },
      {
        prompt: "Your predicted 4.2 mm deflection measures 4.9 mm. The honest response is…",
        options: [
          "Diagnose the gap — supports, load position, material scatter",
          "Round both to 5 mm and move on",
          "Assume the formula is wrong",
          "Assume the measurement is wrong",
        ],
        answer: 0,
        why: "Predict-then-measure exists for the gap. Clamp rotation, load placement, and E scatter are the usual suspects — the error budget is the engineering.",
      },
    ],
  },
  {
    id: "fos",
    track: "physics",
    index: 21,
    title: "Factor of safety",
    minutes: 35,
    lede: "You will distinguish ultimate from allowable, name what a safety factor actually covers, and practice the predict-then-measure discipline that keeps structures honest.",
    start:
      "Every bridge you drive over was designed to hold several of you at once — not because engineers are timid, but because the world is uncertain. || The factor of safety is n = (load that breaks it) / (load you allow). The allowable stress is the ultimate divided by n, and everything gets sized against the allowable, never the ultimate. A cable with 45 kN ultimate strength and n = 3.75 carries 12 kN, and the 33 kN of unused capacity is not waste. || It is not waste because it covers four specific unknowns: loads are guesses (that truck might be overloaded), materials vary (that heat of steel is not the test coupon), models are approximate (the support is not perfectly fixed), and consequences are asymmetric (a bracket failing ruins a day; a bridge failing ruins lives).",
    use: "When you commit to a size: divide the ultimate by the chosen n, then size against the allowable. || Pick n from the uncertainty and the consequence — ~1.5 where weight is everything and knowledge is deep (aircraft), 3–4 for ordinary structures, higher where failure is catastrophic or loads are wild guesses. || Stop when the margin covers the unknowns, not when the number feels brave. Oversized margins cost mass and money; undersized ones cost the structure. The factor is a decision, not a decoration.",
    example:
      "A hoist cable has an ultimate tensile strength of 45 kN and must lift 12 kN, day after day. What is the factor of safety, and what stress is the cable allowed? || n = 45/12 = 3.75. If the cable's cross-section is 60 mm², the ultimate stress is 45000/60 = 750 MPa and the allowable is 750/3.75 = 200 MPa — the working stress must stay under 200 MPa. || 3.75 on the load, 200 MPa allowable on the stress. The same n, two languages. The cable is sized by the allowable; the 45 kN ultimate is a fact about the world, not a target.",
    ideas: [
      {
        heading: "Allowable is ultimate divided by humility",
        body: "No one knows the exact load, the exact strength of this particular piece, or the exact truth of the model. The factor of safety is the admission, priced in. It does not cover a different failure mode — buckling, fatigue, and corrosion each get their own analysis — it covers the unknowns inside the mode you analyzed.",
        formula: "σ_allow = σ_ultimate / n",
      },
      {
        heading: "Margins have a price",
        body: "n = 10 on everything is not safer engineering, it is heavier and more expensive engineering — and weight is itself a load. Aircraft fly at n ≈ 1.5 because every kilogram costs fuel forever; they earn it with testing, inspection, and deep knowledge. The factor is negotiated against uncertainty, knowledge, and consequence — never copied blindly.",
        formula: "n ≈ 1.5 (aircraft) · 3–4 (structures)",
      },
      {
        heading: "Predict, then measure",
        body: "The discipline that makes margins honest: write the predicted number down before you test. A prediction of 4.2 mm against a measurement of 4.9 mm is not a failure — the 17% gap is where the education lives. Clamp compliance, load placement, material scatter: each suspect you rule out is knowledge the next design inherits. Agreement teaches nothing; the gap teaches everything.",
        formula: "error % = (predicted − measured) / measured × 100",
      },
    ],
    bench: "beamdefl",
    prompt:
      "Run the deflection bench again, but this time decide the load from a target factor of safety first. || Size the beam so the bending stress stays under the allowable, then predict and measure the deflection. || Report n, the allowable stress, and your prediction error.",
    note: "Same bench, engineer's question: the deflection is the serviceability check, the stress against the allowable is the strength check. A beam can pass one and fail the other.",
    checks: [
      {
        prompt: "Ultimate load 45 kN, working load 12 kN. The factor of safety is…",
        options: ["3.75", "2.75", "0.27", "57"],
        answer: 0,
        why: "n = ultimate / working = 45/12 = 3.75. It is a ratio of loads, not a percentage and not a guess.",
      },
      {
        prompt: "A safety factor of 3 on a part whose failure would be catastrophic is…",
        options: [
          "A starting point — the consequence may demand its own analysis",
          "Automatically sufficient",
          "Excessive — 1.5 is the standard everywhere",
          "Meaningless without knowing the material",
        ],
        answer: 0,
        why: "n covers unknowns inside the analyzed failure mode. Catastrophic consequence demands asking which modes were analyzed at all — buckling, fatigue, corrosion each need their own check.",
      },
      {
        prompt: "Why don't aircraft use n = 10 like a cautious bridge?",
        options: [
          "Weight is itself a load — margin costs fuel and payload",
          "Aircraft materials are weaker",
          "Regulations forbid it",
          "Aircraft never experience unexpected loads",
        ],
        answer: 0,
        why: "Every kilogram of margin flies forever. Aircraft earn n ≈ 1.5 with testing, inspection, and deep knowledge of their loads — the factor is negotiated, not maximized.",
      },
      {
        prompt: "A beam's deflection passes span/250 but its stress exceeds the allowable. The beam…",
        options: [
          "Fails — strength and stiffness are separate tests",
          "Passes — deflection is the harder test",
          "Passes if the overload is brief",
          "Fails only if it visibly yields",
        ],
        answer: 0,
        why: "Serviceability (sag) and strength (stress vs allowable) are independent gates. Passing one never excuses failing the other.",
      },
    ],
  },
];
