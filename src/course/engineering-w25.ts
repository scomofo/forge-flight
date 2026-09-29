import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 25 — Materials selection in a system.
 * These three lessons are engineering-track indices 13–15.
 * Evidence due: joint/material decision record (lesson 1 + 3 bench).
 */
export const engineeringW25Lessons: Lesson[] = [
  {
    id: "indicescontext",
    track: "engineering",
    index: 13,
    title: "The index picks the material; the joint picks the design",
    minutes: 35,
    lede: "Watch an Ashby index crown a winner — and then let the joint disqualify it. The system property is the minimum of the member and its connections.",
    start:
      "A pull-rod for a tow rig. Minimum mass, must carry 20 kN in tension, and the ends have to attach to steel clevises. Strength sizes this rod, so run the strength index σ/ρ with the bench's numbers: steel 47, aluminum 102, quasi-isotropic CFRP 375 MPa per g/cm³. CFRP wins by a landslide — more than three and a half times aluminum's strength per kilogram, and eight times steel's. || But CFRP cannot take a thread, and it cannot be welded to a steel clevis. The rod ends become a second design problem: bond the carbon to a metal end fitting, or bolt through a reinforced hole. Take a single-lap epoxy bond with a classroom allowable shear of 15 MPa. Bond area needed: 20,000 N / 15 MPa = 1,333 mm². On a 25 mm wide strap that is 53 mm of bond length — doable, inspectable, and now the most failure-prone 53 mm on the whole rig. || The index ranked the ideal material; the joint re-ranked the design. So select a material-plus-joint for the assembly, never a material alone — and quote the system by its weaker half.",
    use: "When a selection study hands you a winner and you need to check whether the winner survives contact with assembly. || Run the index to make the shortlist, then force each candidate through its joints: can it be joined to its neighbors, by what process, with what efficiency, at what cost? || Stop when the decision names the joint explicitly — 'CFRP' alone leaves the hardest part of the design undecided.",
    example:
      "The tow-hook bracket: bracket ties a trailer coupler to a steel hitch receiver, outdoor, salt spray. || Ashby says CFRP (lightest), then aluminum, then steel. The joint says: CFRP cannot be TIG welded to the steel receiver, a bolted hole in CFRP needs a bonded metal insert, and carbon's galvanic potential (+0.25 V) against steel (−0.60 V) in salt spray is a 0.85 V gap — the steel inserts would sacrifice themselves. Aluminum welds to nothing here either (dissimilar to steel), so it bolts on with isolation. Steel welds to steel at 100% efficiency with no galvanic question. || The record reads: steel wins on the joint, not the index. The two losers are named with their causes of death.",
    ideas: [
      {
        heading: "Indices rank ideals; joints rank assemblies",
        body: "An Ashby index assumes the part is free — free to be the optimal shape, free of neighbors. Real parts have ends, and ends have joints. A welded steel part carries ~100% of its base strength through the joint; a bolted composite part may carry 50–60% through a hole that concentrates stress threefold. Multiply the index by the joint efficiency before you crown anyone.",
        formula: "system merit = joint efficiency × member merit",
      },
      {
        heading: "Every joint is a second material",
        body: "The bondline, the weld metal, the fastener — each is its own material with its own properties, its own temperature limit, its own failure mode. An epoxy lap joint with 15 MPa allowable shear is a structural element in its own right, with an allowable an order of magnitude below the aluminum it joins. Design the joint as a part, not as an afterthought.",
        formula: "bond area = P / τ_allow",
      },
      {
        heading: "The interface is where selections die",
        body: "Dissimilar metals invite galvanic cells. Different expansion coefficients lock in stress with every temperature swing. A material that can't be welded, threaded, or bonded to its neighbor can't be built into this assembly. Screen on joinability before you optimize on properties.",
        formula: "select(material + joint + process), never material alone",
      },
    ],
    bench: "jointrecord",
    prompt:
      "Run the tow-hook brief: pick a bracket material and a joint method. || Read the interface verdict — name what dies and why. || Write the decision record with the rejected options and their causes of death.",
    note: "The verdicts use classroom-grade numbers (15 MPa bond shear, handbook-typical galvanic potentials). They are honest enough to choose with and too coarse to certify with — the bench says which is which.",
    checks: [
      {
        prompt: "An index ranks CFRP first for a pull-rod, but the rod must bond to steel clevises. What is the honest system number to quote?",
        options: [
          "The weaker of the rod's strength and the joint's strength — the joint usually governs",
          "The rod's tensile strength, since the index already accounted for mass",
          "The average of the rod and joint strengths",
          "The rod's strength times a 1.5 safety factor",
        ],
        answer: 0,
        why: "A chain is its weakest link. CFRP's ~600 MPa gives a rod far stronger than 20 kN needs; the bonded joint at 15 MPa allowable over its area is what sizes the design. Quoting the member strength alone is how joints get under-designed.",
      },
      {
        prompt: "Why does the lesson say to screen on joinability before optimizing on properties?",
        options: [
          "A material that cannot be joined to its neighbors is not a candidate, however good its index",
          "Joining is always more expensive than the material",
          "Welding is the only acceptable joint",
          "Properties don't matter once the joint is chosen",
        ],
        answer: 0,
        why: "Optimization among candidates that cannot be built is wasted work — and worse, it produces a 'winner' that fails at assembly. Joinability is a hard screen, like temperature limit or corrosion.",
      },
      {
        prompt: "A 20 kN load on a single-lap epoxy bond (τ_allow = 15 MPa) needs how much bond area?",
        options: [
          "1,333 mm²",
          "300 mm²",
          "20,000 mm²",
          "75 mm²",
        ],
        answer: 0,
        why: "A = P/τ = 20,000 N / 15 N/mm² = 1,333 mm². On a 25 mm strap that is 53 mm of bond length — a concrete, checkable number, not 'enough glue'.",
      },
      {
        prompt: "Steel welds to the steel receiver at ~100% efficiency while CFRP needs bonded inserts. What does the decision record gain by naming the losers?",
        options: [
          "It records why the index winner died, so the decision survives review and the reasoning is reusable",
          "It makes the document longer",
          "It proves composites are useless",
          "Nothing — only the winner matters",
        ],
        answer: 0,
        why: "A decision without its rejected options is an assertion. The record's value is the causes of death: the next engineer with a similar brief starts from your reasoning, not from zero.",
      },
    ],
  },
  {
    id: "interfaces",
    track: "engineering",
    index: 14,
    title: "Interfaces: bolts, welds, and glue",
    minutes: 35,
    lede: "Size the three great joint families — mechanical, fusion, adhesive — and check the two silent killers: thermal mismatch and galvanic corrosion.",
    start:
      "Three ways to move 3 kN across a lap joint. A bolt: one M8 through 4 mm aluminum plate, single shear. Bearing stress on the plate: 3,000 N / (8 mm × 4 mm) = 93.8 MPa. Shear stress in the bolt: 3,000 N / 50.3 mm² = 59.7 MPa. The hole concentrates stress, but the joint is inspectable and removable. || A weld: TIG on 6061-T6 keeps ≈70% of base strength through the heat-affected zone — the weld is full-strength only if you designed for 70%. A bond: epoxy at 15 MPa allowable needs 200 mm² of lap — no holes, no heat, but peel will kill it before shear does, and 120 °C softens the whole scheme. || Then the silent killers. Bolt steel to aluminum and swing the temperature 80 °C: Δα = 11e-6/°C gives σ = 68,900 × 11e-6 × 80 ≈ 61 MPa as a one-axis estimate — about a fifth of 6061-T6's 276 MPa yield, cycling with the weather every day (a bolted lap relieves part of it by slipping; a weld relieves none). Bolt carbon fiber to aluminum in salt air: graphite sits at +0.25 V, aluminum at −0.75 V, a full volt of galvanic drive — the aluminum fastener becomes the sacrificial anode.",
    use: "When two parts meet and you must choose how they meet. || Pick the family by disassembly, inspection, and temperature needs; size it by its own arithmetic (bearing/shear, HAZ efficiency, bond area); then run the two compatibility checks — thermal mismatch stress and galvanic gap — in the service environment. || Stop when the joint has a strength number, a mismatch number, and a named answer for corrosion. A joint with no corrosion answer will get one from the field, eventually.",
    example:
      "The dock railing: rails bolted to posts, constant salt spray, twenty-year life. || Bearing and shear size the bolt in one line of arithmetic. The galvanic check: 304 stainless (−0.10 V) against 6061 aluminum (−0.75 V) is a 0.65 V gap in saltwater — high risk, aluminum loses. Against GFRP (non-conductive) there is no cell at all. Thermal: aluminum on stainless, Δα = 6e-6/°C, is ≈25 MPa (one-axis estimate) over a 60 °C swing — below the screening line, noted, not driving. || The joint decision: stainless-to-stainless bolts, or GFRP rails on stainless posts with isolated fasteners. Aluminum rails die in the record with 'galvanic' as the cause.",
    ideas: [
      {
        heading: "Three families, three arithmetics",
        body: "Bolts: bearing stress P/(d·t) on the plate, shear P/A on the shank — the hole is a stress concentration you pay for with inspectability. Welds: the heat-affected zone keeps a fraction of base strength (70% for TIG 6061-T6, 100% for steel) — size the member for the HAZ, not the catalog yield. Adhesives: shear area P/τ over a large lap — generous in shear, treacherous in peel, gone by 120 °C.",
        formula: "σ_bearing = P/(d·t)  ·  τ_bolt = P/A  ·  A_bond = P/τ_allow",
      },
      {
        heading: "Thermal mismatch is a load",
        body: "Two materials, one temperature swing, different expansions — something has to give, and what gives is stress: σ = E·Δα·ΔT in the softer member, the one-axis estimate (full biaxial constraint adds a factor 1/(1−ν)). A steel bolt in an aluminum cleat over 80 °C gives ~61 MPa — about a fifth of 6061-T6's 276 MPa yield, cycling every day the sun shines; a bolted lap slips and relieves part of it, a weld relieves none. Treat ΔT as a load case with the same seriousness as the mechanical load.",
        formula: "σ = E · Δα · ΔT  (one-axis estimate)",
      },
      {
        heading: "Galvanic corrosion is a battery you built",
        body: "Dissimilar conductive metals in an electrolyte are a battery, and the anode dissolves. The drive is the potential gap: carbon fiber (+0.25 V) against aluminum (−0.75 V) is a full volt — in salt spray the aluminum sacrifices itself. Defense is isolation (sleeves, sealant), a closer couple, or making the replaceable (sacrificial) part the anode. And mind the area ratio: a small anode feeding a large cathode fails fast.",
        formula: "risk ∝ potential gap × environment severity",
      },
    ],
    bench: "jointstrength",
    prompt:
      "Size a bolted lap for a 3 kN load — pick diameter, thickness, shear planes. || Compare the same load through a weld and a bond. || Find which check governs: bearing, shear, or the joint efficiency.",
    note: "Bearing allowables assume proper edge distance (e ≥ 2d); the bench flags the assumption rather than hiding it.",
    checks: [
      {
        prompt: "M8 bolt, 3 kN, 4 mm plate, single shear. Which stresses result?",
        options: [
          "Bearing ≈94 MPa on the plate, shear ≈60 MPa in the bolt",
          "Bearing ≈60 MPa, shear ≈94 MPa",
          "Bearing ≈38 MPa, shear ≈24 MPa",
          "Both ≈150 MPa",
        ],
        answer: 0,
        why: "Bearing = 3000/(8×4) = 93.8 MPa; shear = 3000/(π·8²/4) = 3000/50.3 = 59.7 MPa. Two different areas, two different stresses — the joint has to pass both.",
      },
      {
        prompt: "A TIG weld in 6061-T6 keeps ≈70% of base strength. What does that mean for sizing?",
        options: [
          "Size the member for 70% of the catalog yield at the weld — the HAZ is the member there",
          "Welds are always full strength",
          "Add 30% more weld passes",
          "Use a bigger electrode",
        ],
        answer: 0,
        why: "The heat-affected zone is a different material with lower strength. Designing to the catalog yield at a weld is designing to a strength that isn't there.",
      },
      {
        prompt: "Steel bolt in aluminum cleat, 80 °C swing. The locked-in stress is ≈61 MPa. Why does this matter?",
        options: [
          "It is about a fifth of 6061-T6's yield and cycles daily — it adds to every mechanical load and can drive fatigue",
          "It only matters above 200 °C",
          "Thermal stress relaxes immediately",
          "Aluminum has no yield strength",
        ],
        answer: 0,
        why: "σ = E·Δα·ΔT = 68,900 × 11e-6 × 80 ≈ 61 MPa, the one-axis estimate. It never appears on the load diagram, but the material feels it — a silent mean stress on top of every cycle.",
      },
      {
        prompt: "CFRP part bolted with aluminum fasteners in salt air. The verdict is…",
        options: [
          "High galvanic risk — graphite (+0.25 V) vs aluminum (−0.75 V) is a 1.0 V gap; the aluminum sacrifices itself. Isolate or change the couple.",
          "No risk — composites don't corrode",
          "Low risk — salt air is dry enough",
          "Only the CFRP is at risk",
        ],
        answer: 0,
        why: "Composites don't corrode, but they are noble cathodes. The aluminum fastener is the anode in a 1.0 V cell — it dissolves. Real airframes sleeve and seal every metal fastener in carbon structure.",
      },
    ],
  },
  {
    id: "systemdecision",
    track: "engineering",
    index: 15,
    title: "The materials decision as a system decision",
    minutes: 35,
    lede: "Weigh properties against cost, schedule, risk, and repairability — and write the decision record that lets the choice survive its critics.",
    start:
      "Back to the tow-hook bracket. Three honest candidates. CFRP: lightest, stiffest per kilogram, index winner — and the joint needs bonded steel inserts, the layup needs a qualified shop, the lead time is six weeks, and one stone chip in the wrong place starts a delamination you cannot see. Aluminum 6061-T6: bolts to the steel receiver with isolated fasteners, weldable to itself, any shop can cut it, two-day turnaround. Steel 1018: heaviest by far, cheapest by far, welds to the receiver at full efficiency, every welder on earth can do it. || Now the columns the property table doesn't have: part cost (CFRP 8×, aluminum 2×, steel 1×), lead time (weeks vs days vs days), inspection (ultrasound vs visual vs visual), repairability (replace vs weld vs weld), risk (new process vs routine vs routine). The mass requirement says 'at most 4 kg' — all three pass. Nothing in the requirements pays for CFRP's lightness. || So steel wins — not on any property index, but as the best system: the joint is trivial, the cost is trivial, the risk is trivial, and no requirement rewards the mass saved. Write that down, with the losers and their causes of death, and the decision survives review. Without the record it's just 'we picked steel' — and 'we picked steel' never wins an argument with 'but composites are better'.",
    use: "When the selection study is done and someone has to sign. || List the candidates that survived the hard screens (properties, joints, environment). Score them on the soft columns: cost, schedule, supply risk, inspection, repair. Check that some requirement actually rewards the winner's advantage — lightness nobody asked for is not an advantage. || Stop when the record names the winner, the rejected options with causes of death, the joint plan, and the risks you are accepting. An unwritten decision gets argued again the moment it's inconvenient.",
    example:
      "The avionics enclosure: needs EMI shielding and a lid that opens for service. || Nylon is cheapest and lightest — and non-conductive, so it cannot shield; the joint requirement (openable lid) kills adhesive. Stainless shields and bolts beautifully but weighs 3× the aluminum and costs more to machine. Aluminum 6061 bolts, shields, machines easily, and every shop stocks it. || Decision: 6061-T6 case and lid, bolted with captive fasteners, chromate conversion for the mild environment. Rejected: nylon (no shielding, lid must open), stainless (mass and cost buy nothing the requirements reward). The record is one page, and it ends the discussion.",
    ideas: [
      {
        heading: "Properties are columns; the decision has more columns",
        body: "The database gives you E, yield, density, cost per kilogram. The decision also needs lead time, process maturity, inspection method, repairability, and supply risk — none of which are material properties. A material that is perfect on paper and six weeks away is not available; availability is a property of the system, not the datasheet.",
        formula: "decision = properties + joints + cost + schedule + risk",
      },
      {
        heading: "Advantages nobody pays for are not advantages",
        body: "CFRP saves 2 kg on a bracket with a 4 kg limit. Nobody — no requirement, no customer, no physics — pays for those 2 kg. An advantage no requirement rewards doesn't count, and one that costs 8× with added process risk is a bad trade. The requirements packet from Week 21 is the judge: if the win isn't in the packet, it isn't a win.",
        formula: "value = advantage × requirement weight (zero weight → zero value)",
      },
      {
        heading: "Write the record or lose the argument",
        body: "The decision record is short: the brief, the candidates, the hard screens, the joint plan per interface, the soft-column scoring, the winner, the rejected with causes of death, the risks accepted. It exists so the reasoning is re-usable and the decision survives review: 'we picked steel' invites re-litigation; the record settles it.",
        formula: "record = brief + candidates + screens + joints + winner + rejects + risks",
      },
    ],
    bench: "jointrecord",
    prompt:
      "Pick a brief and configure every part and interface. || Score the soft columns — cost, schedule, risk — against the requirements. || Write the one-page decision record: winner, joint plan, rejected options with causes of death, risks accepted.",
    note: "Soft-column scores are your judgment, not the bench's — the bench checks that you made them explicitly, not what values you chose.",
    checks: [
      {
        prompt: "CFRP saves 2 kg on a bracket with a 4 kg mass limit, at 8× the cost and a new process. The engineering verdict is…",
        options: [
          "The lightness buys nothing the requirements reward — it is not an advantage here, and the cost/risk is real",
          "Always pick the lightest material",
          "Cost doesn't matter in engineering",
          "New processes are always worth the risk",
        ],
        answer: 0,
        why: "Value is advantage times requirement weight. With no requirement rewarding the saved mass, CFRP's win is decorative while its cost, lead time, and inspection burden are concrete.",
      },
      {
        prompt: "Why does the decision record name the rejected options?",
        options: [
          "So the reasoning is reusable and the decision survives review — the next engineer starts from your causes of death",
          "To embarrass the losing materials",
          "Because standards require three options",
          "It doesn't; only the winner matters",
        ],
        answer: 0,
        why: "Without the rejects, 'we picked steel' re-litigates against 'but composites are better' forever. The causes of death are the durable engineering knowledge.",
      },
      {
        prompt: "Nylon is cheapest for the avionics enclosure but non-conductive. It dies because…",
        options: [
          "The EMI shielding requirement is a hard screen, and the openable lid rules out adhesive — the joint and the requirement kill it, not the price",
          "Nylon is too expensive",
          "Nylon is too heavy",
          "Plastics are never allowed",
        ],
        answer: 0,
        why: "Hard screens kill before soft columns rank. Shielding is a requirement, not a preference; a non-conductive shell cannot meet it at any price.",
      },
      {
        prompt: "A material is perfect on the datasheet but six weeks away with one qualified supplier. In the decision it is…",
        options: [
          "A schedule and supply risk that may disqualify it — availability is a system property",
          "Still the winner — datasheets decide",
          "Disqualified only if it is also heavy",
          "Fine, because rush fees always exist",
        ],
        answer: 0,
        why: "The decision has columns the datasheet doesn't: lead time, process maturity, supply risk. A part that cannot arrive is not a candidate, however good its properties.",
      },
    ],
  },
];
