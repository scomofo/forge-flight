import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 18 — Metals, ceramics, polymers & composites.
 * These three lessons are materials-track indices 22–24. Evidence due:
 * material family decision under constraints (lesson 3 bench).
 *
 * The block's through-line: structure → processing → properties →
 * performance. Bonding sets the family's property pack; processing moves
 * you inside the pack but never out of it; the job's constraints pick the
 * pack.
 */
export const materialsW18Lessons: Lesson[] = [
  {
    id: "famlook",
    track: "materials",
    index: 22,
    title: "Four families, four property packs",
    minutes: 35,
    lede: "Comparing metals, ceramics, polymers, and composites as property packs — not brand names — and which demand forces each choice, and what it costs.",
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "example", heading: "Work one case" },
      { kind: "idea", idea: 0, label: "First idea" },
      { kind: "idea", idea: 1, label: "Second idea" },
      { kind: "idea", idea: 2, label: "Third idea" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "Material families come with characteristic combinations of stiffness, density, temperature capability, and failure mode. || Metals, ceramics, polymers, and composites occupy different parts of that property space because their bonding and structure differ. Processing can move a material within its family's range, but it cannot erase the family's basic limits. || Start selection with the job's non-negotiable requirements. Those usually narrow the family before you ever choose a specific grade.",
    use: "When a job names its demands — conduct, stay hot, take a hit, be light, be stiff in one direction. || Read each family's envelope at its best edge, and ask which demand kills which family. The survivor is your starting point, not your answer. || Stop when you can name the winner and its price in one sentence: the family, the demand that forced it, and the property you sacrificed. If every family fails a demand, the demand itself is what needs renegotiating.",
    example:
      "A tie rod must be stiff in tension, and mass is the budget. Candidates: steel, aluminum, carbon-fiber composite. || Specific stiffness E/ρ: steel 200/7.85 ≈ 25.5, aluminum 69/2.7 ≈ 25.6, CFRP along the fiber 140/1.55 ≈ 90 GPa per g/cm³. || The two metals tie — aluminum is not stiffer per mass than steel, which surprises everyone once — and the composite wins by 3.5×, but only along the fiber and only if the temperature stays below the matrix's ceiling.",
    ideas: [
      {
        heading: "Bonding helps define each material family's property range",
        body: "Metallic bonding gives mobile electrons and slip planes: conduction plus ductility, in one deal. Ionic and covalent networks give hardness and heat resistance with almost no plasticity: the kiln shelf and the shattered plate are the same physics. Long polymer chains, held to each other by weak secondary bonds, give lightness and stretch at the cost of an early softening temperature. Fiber plus matrix gives a designed direction — strength aimed where the load goes, weakness everywhere else.",
        formula: "metal: ductile + conductive; ceramic: hard + hot + brittle; polymer: light + soft; composite: directional",
      },
      {
        heading: "Improving one property usually affects others",
        body: "Selection errors almost always come from shopping for one property. The stiffness you wanted arrives with the density you didn't; the temperature ceiling arrives with the brittleness. Read the envelope as a bundle — density, modulus, strength, service temperature, failure mode — and distrust any comparison that quotes a single number. A strength quoted without a temperature and a direction is a rumor, not a datum.",
        formula: "specific stiffness E/ρ decides a mass-limited tie; a beam uses E^(1/2)/ρ; never E alone",
      },
      {
        heading: "Processing moves properties within a family",
        body: "Quenching and tempering, cold work, drawing, sintering, layup schedule — processing moves a material around inside its family's envelope, sometimes by factors of two or three. It never moves the envelope itself. That is why the selection order matters: family first (the envelope), processing second (the point). Choosing a grade before the family is choosing a point on the wrong chart.",
        formula: "selection: family → grade → processing; never the reverse",
      },
    ],
    bench: "famcompare",
    prompt:
      "Open the family explorer and put the four envelopes on one axis at a time. || Find the axis where the metals tie and the composite runs away — and the axis where the ceramic stands alone. || Write the one-sentence rule for when you would start with each family.",
    note: "Envelopes use best-edge values: each family is shown at its most flattering. A family that still loses at its best edge has honestly lost.",
    checks: [
      {
        prompt: "Why do aluminum and steel tie on specific stiffness?",
        options: [
          "Aluminum is a weaker metal in every way",
          "Their E/ρ happens to be nearly equal (~25) — Fe, Al, Ti and Mg all cluster there",
          "Steel's extra strength cancels its extra mass",
          "Specific stiffness is not a real quantity",
        ],
        answer: 1,
        why: "E/ρ ≈ 25 GPa per g/cm³ for both: 200/7.85 for steel, 69/2.7 for aluminum. So in tension, aluminum neither saves nor costs mass at equal stiffness; it wins only in bending, where thicker sections pay.",
      },
      {
        prompt: "A part must conduct electricity and be drawn into thin wire. The family is…",
        options: ["Ceramic", "Polymer", "Metal", "Composite"],
        answer: 2,
        why: "Metallic bonding is the pack that contains both mobile electrons and slip systems. Ceramics crack instead of drawing; polymers insulate; composites are built for directional stiffness, not conduction.",
      },
      {
        prompt: "Processing (heat treatment, layup, drawing) can…",
        options: [
          "Move a material outside its family's envelope",
          "Move a material within its family's envelope",
          "Change which family a material belongs to",
          "Remove the family's characteristic failure mode",
        ],
        answer: 1,
        why: "Processing picks the point, not the pack: it can double a strength or aim stiffness in a direction, but steel stays dense and hot-limited, and a composite stays matrix-limited in temperature. The envelope is set by bonding.",
      },
      {
        prompt: "A quoted strength of 1500 MPa, with no temperature or direction given, is…",
        options: [
          "Sufficient to select the material",
          "A rumor — strength needs a temperature and a direction",
          "Conservative, since real parts are weaker",
          "Only meaningful for metals",
        ],
        answer: 1,
        why: "That number could be CFRP along the fiber at room temperature — across the fiber or at 200°C it is a different material. Strength without its conditions is how selection errors start.",
      },
    ],
  },
  {
    id: "dirtemp",
    track: "materials",
    index: 23,
    title: "Direction and temperature",
    minutes: 35,
    lede: "Quantifying anisotropy with the rule of mixtures, the three mechanisms by which temperature kills a material, and designing to the weak direction and the hot limit.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "A material property quoted in a datasheet is only meaningful for the direction and temperature at which it applies. || Composites can be very stiff along the fibers and much less stiff across them. Temperature changes can soften polymers, accelerate creep in metals, or create thermal-shock problems in ceramics. || Check the weak direction and the actual service temperature before using a headline property value.",
    use: "When a part carries load in a known direction or sees sustained heat. || Compute the mixture bounds for the direction you actually load; compare the service temperature against the family's killing mechanism — Tg for polymers, 0.4·Tm for metals under load, thermal shock for ceramics. || Stop when the weak-direction stiffness and the hot-limit strength both clear the demand with margin. If only the brochure direction clears it, you do not have a design.",
    example:
      "A unidirectional CFRP, 60% carbon fiber (Ef = 230 GPa) in epoxy (Em = 3 GPa). It will also see a sudden 500 K temperature drop in service; the backup ceramic option is alumina (E = 300 GPa, α = 8×10⁻⁶/K, tensile strength ≈ 300 MPa). || Voigt: 0.6×230 + 0.4×3 = 139.2 GPa along the fiber. Reuss: 1/(0.6/230 + 0.4/3) ≈ 7.4 GPa across it — a 19:1 ratio. Thermal shock on the alumina, as the one-axis constrained estimate: σ ≈ E·α·ΔT = 300×10³×8×10⁻⁶×500 = 1200 MPa, four times its tensile strength. || The composite is superb in exactly one direction and must never see that drop across its matrix; the ceramic survives steady heat and would not survive the shock at all. Each family names its killing condition.",
    ideas: [
      {
        heading: "Rule-of-mixtures bounds depend on loading direction",
        body: "Voigt (parallel): both phases share the same strain, so the stiff phase carries most of the load and the composite approaches the fiber. Reuss (series): the soft phase takes the strain, so the composite approaches the matrix. Real layups live between the bounds, and the ratio between them — 19:1 in the example — is the honest measure of anisotropy. Wood, drawn wire, rolled sheet, and every composite share this structure: processing aims the strong direction, and the weak direction is the design value.",
        formula: "E∥ = Vf·Ef + Vm·Em;  1/E⊥ = Vf/Ef + Vm/Em",
      },
      {
        heading: "Different families lose performance by different high-temperature mechanisms",
        body: "Polymers: past the glass transition the chains unlock and the modulus collapses — that is the service ceiling, not the melting point. Metals: sustained load above ~0.4·Tm (kelvin) brings creep, slow permanent flow — aluminum sags near 150°C, steels near 450°C. Ceramics: the network holds to white heat, but E·α·ΔT from a sudden temperature change exceeds the flaw-limited strength and the part cracks. Three families, three different ways to die of temperature.",
        formula: "σ_thermal ≈ E·α·ΔT (one-axis constrained estimate);  T_creep ≈ 0.4·T_melt (K)",
      },
      {
        heading: "The envelope edge is the design value",
        body: "Selection uses best-edge envelopes to be fair; design uses worst-case values to survive. The composite's design stiffness is the transverse one unless the load direction is guaranteed. The polymer's design temperature is below Tg with margin, not at it. The metal's design temperature under sustained load is below the creep onset. Margin covers the difference between the test coupon and the part.",
      },
    ],
    bench: "templim",
    prompt:
      "Drag the service temperature from −50°C to 1600°C and watch families die. || Note the temperature and the mechanism for each death — softening, creep, shock. || Write down which family you would trust at 900°C continuous, and what would still kill it.",
    note: "The slider uses continuous-service ceilings. Short excursions buy a little room; sustained load buys none.",
    checks: [
      {
        prompt: "A 60% carbon/epoxy composite is 139 GPa along the fiber. Across the fiber it is about…",
        options: ["139 GPa", "70 GPa", "7 GPa", "230 GPa"],
        answer: 2,
        why: "Reuss bound: 1/(0.6/230 + 0.4/3) ≈ 7.4 GPa. Across the fiber the soft epoxy takes the strain, so the composite is matrix-dominated — a 19:1 anisotropy ratio.",
      },
      {
        prompt: "Alumina taking a sudden 500 K temperature drop sees roughly E·α·ΔT = 1200 MPa of thermal stress (the one-axis constrained estimate). It cracks because…",
        options: [
          "Ceramics cannot survive any temperature change",
          "1200 MPa exceeds its flaw-limited tensile strength (~300 MPa)",
          "Alumina melts at 500 K",
          "Thermal stress only affects metals",
        ],
        answer: 1,
        why: "The network is fine at steady high temperature; the killer is the stress from constrained expansion. With tensile strength near 300 MPa, a 1200 MPa shock stress finds a flaw and runs with it.",
      },
      {
        prompt: "A steel part under sustained load at 500°C is a creep concern because…",
        options: [
          "Steel melts at 500°C",
          "500°C is above ~0.4× steel's melting point in kelvin",
          "All metals creep at any temperature",
          "Creep only happens in polymers",
        ],
        answer: 1,
        why: "Steel melts near 1540°C (1811 K); 0.4×1811 ≈ 724 K ≈ 451°C. Sustained load above that brings slow permanent flow. Below it, creep is negligible on engineering timescales.",
      },
      {
        prompt: "The honest design stiffness of a unidirectional composite is…",
        options: [
          "The fiber-direction value, since fibers carry the load",
          "The transverse (matrix-dominated) value, unless load direction is guaranteed",
          "The average of the two bounds",
          "Whatever the supplier's datasheet headlines",
        ],
        answer: 1,
        why: "Loads rarely arrive exactly along the fiber, and off-axis the matrix dominates. Designing to the brochure direction is how composite parts delaminate in service.",
      },
    ],
  },
  {
    id: "choosefam",
    track: "materials",
    index: 24,
    title: "Choosing under constraints",
    minutes: 35,
    lede: "Separating hard screens from soft tradeoffs, killing families against the screens, ranking the survivors — and stating the price of the winner out loud.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "Material selection works best when hard constraints are separated from preferences. || A hard constraint is a requirement the material must meet: service temperature, minimum stiffness, corrosion resistance, or some other non-negotiable limit. Materials that fail a hard screen are removed before ranking. || After screening, rank the survivors on softer tradeoffs such as mass, cost, manufacturability, or repairability, and state the downside of the final choice.",
    use: "When a part needs a family. || List every constraint — temperature, load, environment, shape, volume, cost. Mark each as screen (violating it kills the part) or tradeoff (it ranks survivors). Apply screens at the families' best envelope edges, so a kill is honest. || Stop when one family stands and you can state its price. If none stand, a constraint must move — and relaxing a screen is a decision someone signs off on, with the consequences named.",
    example:
      "A bracket must hold 50 MPa at 900°C continuous, in air, bolted to a steel frame. || Screens: service temperature ≥ 900°C kills polymers (done by ~250°C), composites (matrix done by ~250°C), and ordinary steels and aluminum (creep by ~450°C) — at their best edges, honestly dead. Strength ≥ 50 MPa at temperature and air-oxidation resistance leave two standing: nickel superalloys and the ceramics, alumina or silicon carbide. || The superalloy survives but costs ~20× steel; ceramic wins on cost and oxidation. Winner: ceramic — and the stated price is brittleness plus thermal-expansion mismatch with the steel frame, so the bracket gets compliant mounts and generous radii. The temperature did the deciding; the design pays the price the family charges.",
    ideas: [
      {
        heading: "Use hard screens before soft tradeoffs",
        body: "A screen is a constraint whose violation is failure: service temperature, a corrosion environment with no coating allowed, a hard mass cap. A tradeoff is a preference among survivors: cost, machinability, supplier base. Apply screens first and tradeoffs second — ranking families before screening them is how a cheap, familiar, wrong material wins. And judge each family at its best envelope edge: if its champion cannot clear the bar, the kill is honest.",
      },
      {
        heading: "State the compromise that comes with the selected material",
        body: "Ceramic buys temperature with brittleness. Composite buys specific stiffness with directionality and a matrix temperature ceiling. Polymer buys cheapness and corrosion resistance with softness and creep. Metal buys ductility and familiarity with mass. The decision document is not finished at the winner's name — it is finished at the sentence that names what was sacrificed and how the design compensates.",
        formula: "decision = winner + the demand that forced it + the price, stated",
      },
      {
        heading: "Process and environment are constraints too",
        body: "A family that cannot be made into the shape, at the volume, on the schedule, is screened out regardless of its properties — ceramics do not take threads well, composites do not take rush orders. And service is a constraint: UV embrittles polymers, salt water pits unprotected metals, thermal cycling loosens everything. The O-ring's cold limit was written down and overridden. Write constraints down, and make waiving one a signed decision.",
      },
    ],
    bench: "famdecision",
    prompt:
      "Take three constrained briefs — a hot bracket, a light stiff panel, a saltwater fastener. || For each: apply the hard screens, watch families die honestly, pick the survivor, and survive its two challenges. || Then write the decision memo: winner, the demand that forced it, and the price — in your own words.",
    note: "The screener judges families at their best envelope edge. If you disagree with a kill, say which constraint you would renegotiate — that is the engineering decision.",
    checks: [
      {
        prompt: "The Challenger O-ring failure is presented here as…",
        options: [
          "A strength failure — the rubber was too weak",
          "A selection failure — the service temperature fell outside the family's envelope",
          "A processing failure — the rings were badly molded",
          "Unavoidable — no material could have sealed that joint",
        ],
        answer: 1,
        why: "The elastomer lost resilience in the cold. The engineers had flagged that temperature limit, and it was overridden. The material was fine inside its envelope; the launch decision put it outside.",
      },
      {
        prompt: "A hard screen differs from a tradeoff in that…",
        options: [
          "Screens are about cost, tradeoffs about performance",
          "Violating a screen is failure; a tradeoff ranks the survivors",
          "Screens apply to metals only",
          "Tradeoffs are decided before screens",
        ],
        answer: 1,
        why: "Service temperature, corrosion with no coating, a mass cap — violate these and the part fails. Cost and machinability choose among the families that survived. Ranking before screening lets a cheap wrong answer win.",
      },
      {
        prompt: "A 900°C continuous bracket in air screens out ordinary steels and aluminum because…",
        options: [
          "Metals melt at 900°C",
          "They creep or soften well below 900°C sustained",
          "Metals cannot be bolted to steel",
          "Ceramics are cheaper",
        ],
        answer: 1,
        why: "Steels creep above ~450°C sustained; aluminum sags near 150°C. Refractory metals oxidize catastrophically in air. Nickel superalloys do clear 900°C — turbine blades live there — but at ~20× the cost of steel, so they pass the screen and lose on the tradeoff.",
      },
      {
        prompt: "A material decision is finished when…",
        options: [
          "The winner is named",
          "The winner, the forcing demand, and the price are all stated",
          "The cheapest survivor is picked",
          "Three families have been screened out",
        ],
        answer: 1,
        why: "Naming the winner without the price — brittleness, directionality, the matrix ceiling — leaves the compensation undone. The decision document ends at the sentence that says what was sacrificed and how the design pays for it.",
      },
    ],
  },
];
