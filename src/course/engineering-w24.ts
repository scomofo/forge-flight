import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 24 — Beams, columns & shafts.
 * These three lessons are engineering-track indices 10–12. Evidence due:
 * component sizing calculation set (sizebeam bench) plus the section explorer
 * (sections bench). Pure sizing logic lives in ./mechanics.ts.
 */
export const engineeringW24Lessons: Lesson[] = [
  {
    id: "bending",
    track: "engineering",
    index: 10,
    title: "Bending: the stress is My/I",
    minutes: 35,
    lede: "Compute the peak stress in a beam from the bending moment and the section modulus, and choose sections that put material where the stress lives.",
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "example", heading: "Work one case" },
      { kind: "idea", idea: 0, label: "First idea" },
      { kind: "idea", idea: 1, label: "Second idea" },
      { kind: "idea", idea: 2, label: "Third idea" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "In beam bending, stress varies through the depth of the section. It is zero at the neutral axis and largest at the outer fibers. || Use σ = My/I, or σ = M/S when the section modulus S = I/y_max is known. || Cross-section shape matters because material placed farther from the neutral axis increases I and S much more effectively than material near the middle.",
    use: "When you need a beam, bracket, or spar to survive a known bending moment without yielding. Also when comparing candidate sections — S per kilogram is the honest score. || Find the maximum bending moment M (for a cantilever with tip load P at length L, M = P·L at the wall). Get the section modulus S for your section (I/c, tabulated or computed). Divide: σ = M/S. Compare against the allowable — yield divided by your factor of safety. || Stop when the margin of safety MS = σ_allow/σ − 1 is positive for every load case, and you have checked that the section you tabulated is the section you can actually buy.",
    example:
      "A workbench edge: a 40×40×3 mm aluminum square tube, cantilevered 1.2 m, with a 500 N load at the tip — someone leaning hard. || The moment at the wall is M = 500 × 1.2 = 600 N·m. The tube's section modulus is S = 5.10×10⁻⁶ m³, so σ = 600 / 5.10×10⁻⁶ = 117.7 MPa. Take the allowable as 6061-T6's 276 MPa yield (a factor of safety of 1 for a workbench), and the margin is 276/117.7 − 1 = 1.35 — comfortable. A solid 40×40 bar would read only 56 MPa, but at 4.32 kg/m against the tube's 1.20 kg/m, the tube delivers 1.7× the section modulus per kilogram. || The tube passes with margin at about a quarter of the mass — you don't need the heavier bar.",
    ideas: [
      {
        heading: "Use section modulus to turn moment into peak bending stress",
        body: "The bending stress formula σ = My/I says stress grows linearly from the neutral axis. The section modulus S = I/y_max collapses the geometry into one number, so sizing a beam is one division and one comparison against the allowable. Every beam table in every steel catalog is, at heart, a table of S.",
        formula: "σ = M/S,  S = I/y_max",
      },
      {
        heading: "Material farther from the neutral axis contributes more to bending resistance",
        body: "Because stress scales with y, the fibers near the neutral axis contribute almost nothing to strength while costing full mass. That is why efficient bending sections are hollow or I-shaped: flanges far apart, web just thick enough to hold them there and carry shear.",
        formula: "S per kg is the score",
      },
      {
        heading: "Check both stiffness and strength",
        body: "Deflection is governed by EI — the second moment times the elastic modulus. Strength is governed by S·σ_allow. A deep section can be stiff yet weak (thin flanges that yield early) or strong yet floppy. Check both: a beam that survives the stress but sags past its service limit still fails the requirement.",
        formula: "stiffness ~ EI,  strength ~ S·σ_allow",
      },
    ],
    bench: "sections",
    prompt:
      "Pick the rect-tube section and set 40×40×3 mm. || Read S and the mass per meter, then switch to the solid rectangle of the same outer size and compare S per kilogram. || Name which section wins per kilogram and say where its material sits relative to the neutral axis.",
    note: "Section data are computed from the closed-form geometry in mechanics.ts — no tabulated catalog values. Real catalog sections (rolled I-beams, extrusions) add fillets and tolerances that shift I by a few percent.",
    checks: [
      {
        prompt: "A cantilever beam carries tip load P at length L. The peak bending moment is…",
        options: ["P·L, at the wall", "P·L/2, at midspan", "P/L, at the tip", "P·L, at the tip"],
        answer: 0,
        why: "The moment grows linearly from zero at the free tip to P·L at the fixed wall — that is where the stress peaks and where the section must be checked.",
      },
      {
        prompt: "Doubling the depth h of a rectangular section (width fixed) changes the section modulus S by…",
        options: ["×4", "×2", "×8", "Unchanged"],
        answer: 0,
        why: "S = b·h²/6, so it goes as h². Depth is the cheapest strength there is — which is exactly why beams are deep and thin, not square.",
      },
      {
        prompt: "A beam's computed stress is 118 MPa and the allowable is 276 MPa. The margin of safety is…",
        options: ["1.34", "0.43", "2.34", "158 MPa"],
        answer: 0,
        why: "MS = allowable/applied − 1 = 276/118 − 1 = 1.34. A margin is a ratio minus one, not a difference — 158 MPa is the unused stress, not the margin.",
      },
      {
        prompt: "For the same mass per meter, a hollow tube beats a solid bar in bending because…",
        options: [
          "Its material sits farther from the neutral axis, raising S",
          "Hollow sections have a higher elastic modulus",
          "The neutral axis moves to the outer fiber",
          "Tubes cannot buckle locally",
        ],
        answer: 0,
        why: "Stress is σ = My/I, so material at large y does the work. The tube puts its mass where y is large. The modulus is a material property, unchanged by shape, and thin tubes absolutely can buckle locally.",
      },
    ],
  },
  {
    id: "buckle",
    track: "engineering",
    index: 11,
    title: "Buckling and torsion: slender failure",
    minutes: 35,
    lede: "Check columns against Euler buckling — a failure that strikes far below yield — and check shafts against torsional shear and twist.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "A slender column can fail by buckling long before the compressive stress reaches the material's yield strength. || Euler buckling gives P_cr = π²EI/L_e², where the effective length depends on the end conditions. Because length is squared in the denominator, small changes in unsupported length can strongly affect the critical load. || Treat buckling as a separate failure mode from material yielding and check both.",
    use: "When anything carries compression over a long, slender run — struts, legs, pushrods — and when anything transmits torque — shafts, axles, drive tubes. || Compute the slenderness: effective length over radius of gyration. Apply Euler: P_cr = π²EI/L_e², and check the buckling stress against yield — Euler only applies while the column is still elastic at P_cr. For torsion: shear stress τ = T·r/J on the outer fiber, twist φ = T·L/(G·J) along the length. || Stop when the lowest of the compressive-yield load and the buckling load clears your required load with margin, and when both the torsional stress and the twist angle meet their limits.",
    example:
      "A tent pole: 25 mm outer diameter, 2 mm wall aluminum tube, 1.5 m long, pinned at both ends, E = 68.9 GPa. || I = 9.63×10⁻⁹ m⁴, so P_cr = π² × 68.9×10⁹ × 9.63×10⁻⁹ / 1.5² = 2910 N. The buckling stress is 2910 / 1.445×10⁻⁴ = 20.1 MPa — against a 276 MPa yield the tube would crush at about 40 kN, nearly fourteen times this load, but it buckles first, always. A 70 kg camper (686 N) gets a factor of 4.24 against buckling. || Now clamp the base and free the top: K goes 1.0 → 2.0, L_e doubles, and P_cr quarters to 727 N — barely above the camper. Same tube, same load, different ends, different verdict. End conditions are not a detail.",
    ideas: [
      {
        heading: "Euler buckling is very sensitive to effective length",
        body: "P_cr falls as 1/L_e², so doubling the effective length quarters the capacity. That quadratic is why long columns are treacherous and why bracing a column at midspan — halving L_e — quadruples its buckling load. When a slender design feels fragile, the fix is usually shorter effective length, not more material.",
        formula: "P_cr = π²EI / L_e²",
      },
      {
        heading: "Torsion mirrors bending",
        body: "Bending has σ = My/I; torsion has τ = Tr/J, with J the polar (torsional) moment. Twist φ = TL/GJ is the torsional twin of beam deflection. The outer fiber carries the peak shear, so — again — hollow circular sections dominate: a tube's J per kilogram is superb, and the circle has no corners to concentrate stress.",
        formula: "τ = T·r/J,  φ = T·L/(G·J)",
      },
      {
        heading: "Check each plausible failure mode and use the governing one",
        body: "A real component has several ways to fail — yield, buckle, twist too far — and it will find the cheapest one. Size against each independently and let the minimum govern. The tent pole's compressive strength was 40 kN on paper; its buckling load was 2.9 kN. The minimum governs.",
        formula: "P_allow = min(P_yield, P_cr) / FoS",
      },
    ],
    bench: "sizebeam",
    prompt:
      "Choose the column case. Set the 25 mm / 2 mm aluminum tube at 1.5 m, pinned-pinned. || Read the buckling load and the buckling stress, and say which is lower — this or the crush load. Then switch the ends to fixed-free. || Report the new buckling load and the factor by which it changed.",
    note: "Euler assumes a perfectly straight, centrally loaded, elastic column. Real columns have crookedness and load eccentricity that cut capacity — the bench's note says the Euler value is an upper bound, and codes apply knockdowns.",
    checks: [
      {
        prompt: "A 2 m pinned-pinned column buckles at 10 kN. The same column, 4 m long, buckles at…",
        options: ["2.5 kN", "5 kN", "10 kN", "20 kN"],
        answer: 0,
        why: "P_cr ∝ 1/L². Doubling the length quarters the load: 10/4 = 2.5 kN.",
      },
      {
        prompt: "Changing a column's ends from pinned-pinned to fixed-fixed changes the Euler load by a factor of…",
        options: ["4× higher", "2× higher", "Unchanged", "4× lower"],
        answer: 0,
        why: "K drops from 1.0 to 0.5, so L_e halves and P_cr ∝ 1/L_e² quadruples. End fixity is worth more than extra material.",
      },
      {
        prompt: "A shaft's torque doubles. The peak torsional shear stress…",
        options: ["Doubles", "Quadruples", "Halves", "Stays the same"],
        answer: 0,
        why: "τ = Tr/J is linear in T. (Doubling the diameter would cut the stress by 8×, since J ∝ d⁴ and r ∝ d.)",
      },
      {
        prompt: "A column's Euler buckling stress comes out above the material's yield strength. You should…",
        options: [
          "Size by compressive yield instead — Euler no longer applies",
          "Use the Euler value anyway; it is conservative",
          "Increase the length to bring buckling back below yield",
          "Ignore it; yielding always governs",
        ],
        answer: 0,
        why: "Euler assumes elastic behavior. Past yield the tangent modulus collapses and the real buckling load falls below the Euler value — the Johnson/column-curve regime takes over, and compressive yield is the honest check.",
      },
    ],
  },
  {
    id: "combined",
    track: "engineering",
    index: 12,
    title: "Combined loading: add, then judge",
    minutes: 35,
    lede: "Superpose bending and torsional stresses on a shaft, judge the plane-stress state with von Mises, and iterate a diameter to a passing design.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "Real parts often carry more than one type of load at the same time. In the linear-elastic range, the stress contributions from those loads can be superposed at a point. || For ductile yielding under a multiaxial stress state, the von Mises equivalent stress provides a scalar value that can be compared with a uniaxial allowable. || Superposition and von Mises each have assumptions. Use them only while the material and deformation remain within the regime they were derived for.",
    use: "When a component sees bending plus torsion (shafts), axial plus bending (eccentric columns), or any multiaxial state you must clear against a uniaxial allowable. || Compute each stress component at the critical point — for a solid shaft, σ = 32M/πd³ and τ = 16T/πd³ on the outer fiber. Combine with von Mises. Compare against the allowable and iterate the size until the margin is positive. || Stop when the equivalent stress clears the allowable with margin at the worst point, and you have confirmed the worst point is actually the outer fiber (for shafts, it is — both σ and τ peak there together).",
    example:
      "A steel drive shaft: bending moment 200 N·m, torque 300 N·m, allowable 150 MPa. || Guess a diameter from d³ = 32·√(M² + ¾T²)/(π·σ_allow): √(200² + 0.75·300²) = 328, so d³ = 32 × 328/(π × 150×10⁶) = 2.23×10⁻⁵ and d = 28.1 mm — round up to a stock 30 mm. Check: σ = 32×200/(π×0.03³) = 75.5 MPa, τ = 16×300/(π×0.03³) = 56.6 MPa, σ_vm = √(75.5² + 3×56.6²) = 124 MPa. || 124 < 150 clears with MS = 0.21. Note the bending-only size would have been d = 23.9 mm — the torque forced about four extra millimeters. Combined loading always costs something; the criterion tells you exactly how much.",
    ideas: [
      {
        heading: "Superposition requires linear elastic behavior",
        body: "Stresses add point-by-point only while the material stays linear elastic and deflections stay small. Past yield, or in contact and large-deflection problems, superposition doesn't apply and the sum is wrong. Check linearity first, add second.",
        formula: "σ_total = Σσ_i  (elastic only)",
      },
      {
        heading: "Use von Mises to compare a multiaxial state with a tensile allowable",
        body: "Yielding is driven by distortional energy — the part of the stress state that changes shape rather than volume. Von Mises extracts exactly that into one scalar. For pure shear it predicts yield at 0.577× tensile; for the shaft's bending-plus-torsion it weights the shear at √3. Use it for ductile metals; brittle materials want a different criterion.",
        formula: "σ_vm = √(σ_x² − σ_xσ_y + σ_y² + 3τ_xy²)",
      },
      {
        heading: "Sizing is iteration with a stopping rule",
        body: "Closed forms like the shaft-diameter equation give a starting guess, not a purchase order. Round to stock sizes, re-check the real stress state, confirm the margin, and confirm the failure mode you sized against is still the governing one. The calculation set is the evidence that the loop closed.",
        formula: "guess → round up → re-check → margin > 0",
      },
    ],
    bench: "sizebeam",
    prompt:
      "Choose the shaft case. Set M = 200 N·m and T = 300 N·m. || Enter a diameter and read the von Mises stress against the 150 MPa allowable — find the smallest whole-millimeter diameter that passes. || Report that diameter, the von Mises stress, and the margin.",
    note: "The shaft formulas assume a solid circular section with bending and torsion peaking at the same outer fiber. Keyways, shoulders, and splines concentrate stress — real shafting multiplies by a stress-concentration factor the bench does not include.",
    checks: [
      {
        prompt: "On a shaft's outer fiber, bending gives σ_x = 75 MPa and torsion gives τ_xy = 57 MPa. The von Mises stress is closest to…",
        options: ["124 MPa", "132 MPa", "96 MPa", "75 MPa"],
        answer: 0,
        why: "σ_vm = √(75² + 3×57²) = √(5625 + 9747) = √15372 ≈ 124 MPa. The shear contributes at √3 weight — ignoring it and quoting 75 MPa is the classic under-design.",
      },
      {
        prompt: "Superposition of stresses is valid when…",
        options: [
          "The material is linear elastic and deflections are small",
          "The loads are applied simultaneously",
          "The stresses are all below ultimate, not just yield",
          "The section is circular",
        ],
        answer: 0,
        why: "Linearity is the license: each load's stress field must be independent of the others. Past yield the fields interact and the sum is fiction.",
      },
      {
        prompt: "Doubling a solid shaft's diameter changes its von Mises stress under fixed M and T by…",
        options: ["÷8", "÷4", "÷2", "Unchanged"],
        answer: 0,
        why: "Both σ = 32M/πd³ and τ = 16T/πd³ go as 1/d³, so the von Mises stress — homogeneous of degree one in the components — also falls by 8×.",
      },
      {
        prompt: "Your sized shaft passes von Mises with MS = 0.21, but the twist over its length is 6°. You should…",
        options: [
          "Grow the diameter or shorten the span — the twist limit is a requirement too",
          "Ship it; stress is the only real failure mode",
          "Reduce the torque rating instead of resizing",
          "Add a keyway to stiffen it",
        ],
        answer: 0,
        why: "Strength passing doesn't excuse a violated serviceability limit — 6° of windup mistimes gears and excites vibration. A keyway concentrates stress rather than adding stiffness.",
      },
    ],
  },
];
