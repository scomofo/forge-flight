import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 17 — Phase diagrams & transformations.
 * These three lessons are materials-track indices 19–21.
 * Evidence due: binary phase-diagram problem set (lesson 1 & 2 bench).
 * Through-line: structure → processing → properties → performance.
 */
export const materialsW17Lessons: Lesson[] = [
  {
    id: "phasediagram",
    track: "materials",
    index: 19,
    title: "Reading a phase diagram",
    minutes: 35,
    lede: "Locating any alloy on a binary phase diagram, naming the phases present at a given temperature, and drawing the tie line that shows what each phase is actually made of.",
    start:
      "A spool of 63/37 solder melts the instant the iron touches it — one temperature, solid to liquid, no in-between. A spool of 50/50 solder goes soft and pasty over a thirty-degree span, smearing before it flows. Same two metals, different ratio, completely different melting behavior — the difference is where each alloy sits on the lead–tin phase diagram. || A binary phase diagram is equilibrium's answer to the two questions a foundry actually controls: what did you mix, and how hot is it. The horizontal axis is composition, in weight percent of one component. The vertical axis is temperature. Every point on that map is a state: which phases are present, and what each one contains. The lines are boundaries where the phase count changes — cross one and something starts to melt, freeze, or precipitate. || The map has its shape because nature minimizes free energy at every composition and temperature, and the lowest-energy arrangement moves as you move. The lens-shaped two-phase field of the copper–nickel system says the two metals dissolve in each other completely — liquid and solid both — but the solid prefers the higher-melting nickel. The diagram never predicts how fast anything happens. It predicts where the system is trying to go.",
    use: "Choosing an alloy, a casting temperature, or a heat-treatment window — anywhere the question is 'what phases am I dealing with.' || Fix the composition: drop a vertical line at your alloy's weight percent. Fix the temperature: draw the horizontal line. Read the field their intersection falls in — that is your phase assemblage. In a two-phase field, extend the horizontal tie line through your point to both boundaries; its ends are the compositions of the two phases, which are generally not your alloy's composition. || Stop when you can name every phase present and the composition of each. If your point sits exactly on a boundary, say which side you mean — the line itself is a transition, not a state.",
    example:
      "A Cu–30 wt% Ni alloy cools slowly from 1400°C. Nothing happens until its vertical line meets the liquidus: T = 1085 + 3.7 × 30 = 1196°C, where the first α solid appears. Freezing finishes at the solidus: T = 1085 + 3.2 × 30 = 1181°C — a 15-degree freezing range, the 'mushy zone' where the casting is neither liquid nor solid. || Halfway through, at 1190°C, the tie line runs from liquidus to solidus: C_L = (1190 − 1085)/3.7 = 28.4 wt% Ni in the liquid, C_α = (1190 − 1085)/3.2 = 32.8 wt% Ni in the solid. The solid is richer in nickel — the higher-melting component — exactly as the lens shape promised. || The alloy is 30% nickel on average, but at 1190°C no phase actually is: the liquid holds 28.4% and the solid 32.8%. Overall composition and phase composition are different numbers. Confusing them is the most common beginner error with these diagrams.",
    ideas: [
      {
        heading: "The axes are the experiment",
        body: "Composition and temperature are the two knobs a melt shop turns: the charge that went into the furnace, and the heat under it. The diagram is the equilibrium destination for every setting of those knobs — not the route, not the speed. Read it as a map of where the alloy wants to be, and note that wanting is not arriving; closing that gap is the subject of the third lesson.",
      },
      {
        heading: "Lines are solubility limits",
        body: "Above the liquidus, all liquid. Below the solidus, all solid. The solvus is the most solute the solid can hold before a second phase precipitates out. Every line answers the same question — how much of B can this phase dissolve at this temperature — and the answer usually shrinks as things cool, which is why precipitation hardens so many alloys.",
        formula: "Sn in Pb: 19.2 wt% at 183°C, ≈2 wt% near room temperature",
      },
      {
        heading: "A tie line is a mass balance waiting to happen",
        body: "In any two-phase field, only the tie-line ends exist as compositions — your alloy's overall composition lies somewhere along the line between them, and where it lies decides how much of each phase you get. The ends are inputs; the fractions are arithmetic. That arithmetic is the entire next lesson.",
        formula: "tie-line ends: C_L and C_α (not C₀)",
      },
    ],
    bench: "phaseset",
    prompt:
      "Run the problem set: for each alloy and temperature, name the phase field, read the tie-line ends off the diagram, and compute the phase fractions. || Predict before you enter — the diagram is drawn for you, but the reading is yours. || Finish all six; the eutectic problem is the one that checks whether you actually read the lines.",
    note: "The diagram is a teaching linearization of Pb–Sn: real boundaries curve, but the reading rules are identical. Cu–Ni numbers use straight-line fits valid only near 20–45 wt% Ni; the real liquidus and solidus curve and meet at 1455°C. Numbers are classroom-grade — good enough to learn the method, not to certify a solder joint.",
    checks: [
      {
        prompt: "Cu–30 wt% Ni at 1190°C sits in…",
        options: [
          "The L + α two-phase field",
          "The all-liquid field",
          "The all-α field",
          "A three-phase eutectic",
        ],
        answer: 0,
        why: "1190°C falls between the solidus (1181°C) and liquidus (1196°C) at 30 wt% Ni — inside the lens. The tie line there runs 28.4 wt% Ni (liquid) to 32.8 wt% Ni (solid).",
      },
      {
        prompt: "The ends of a tie line tell you…",
        options: [
          "The composition of each of the two phases",
          "The mass fraction of each phase",
          "The melting points of the pure metals",
          "How fast each phase is growing",
        ],
        answer: 0,
        why: "A tie line connects the compositions of the two coexisting phases. Fractions come next, from the lever rule — the tie line alone does not give them.",
      },
      {
        prompt: "On slow cooling, the first solid appears in Cu–30 wt% Ni at…",
        options: ["1196°C", "1181°C", "1085°C", "1455°C"],
        answer: 0,
        why: "First solid forms when the alloy's vertical line meets the liquidus: 1085 + 3.7 × 30 = 1196°C. 1181°C is where the last liquid freezes; 1085°C and 1455°C are the pure-metal melting points.",
      },
      {
        prompt: "The line separating the all-liquid field from the two-phase field is the…",
        options: ["Liquidus", "Solidus", "Solvus", "Eutectic"],
        answer: 0,
        why: "Liquidus above, two-phase below. The solidus bounds the all-solid field; the solvus bounds solid solubility; the eutectic is a point and a reaction, not a line.",
      },
    ],
  },
  {
    id: "leverrule",
    track: "materials",
    index: 20,
    title: "The lever rule",
    minutes: 35,
    lede: "Deriving the lever rule from conservation of mass, and computing phase fractions from any tie line — the most-used calculation in alloy metallurgy.",
    start:
      "A paint mixer blends a 30%-pigment base with a 60%-pigment base to hit 40%. How much of each? Nobody counts molecules — the answer falls out of the average. The blend sits one-third of the way from 30 to 60, so it is two-thirds of the 30% base. A two-phase alloy is the same weighted-average problem. || The alloy's overall composition C₀ is the weighted average of the two phase compositions: C₀ = W_L·C_L + W_α·C_α, with W_L + W_α = 1. Solve for W_L and the weights turn into segment lengths: W_L = (C_α − C₀)/(C_α − C_L). The fraction of a phase is the tie-line segment opposite it — from the alloy to the far end — divided by the whole tie line. || It looks like a lever because it is one: the alloy composition is the fulcrum, the phase compositions are the ends, and the fractions balance like weights. The phase whose composition sits farther from the alloy always gets the smaller share — the long arm carries the light weight.",
    use: "Any two-phase field on any binary diagram, whenever someone asks 'how much of each.' || Draw the tie line at your temperature and read its ends, C_left and C_right. The fraction of the left phase is the opposite segment over the whole: W_left = (C_right − C₀)/(C_right − C_left). Check yourself: the two fractions sum to 1, and the phase nearer your composition dominates. || Stop when the fractions sum to one and the dominant phase is the one your alloy sits closest to. If a fraction comes out negative or above one, your point is not between the tie-line ends — re-read the diagram.",
    example:
      "Cu–40 wt% Ni at 1220°C. The tie line: C_L = (1220 − 1085)/3.7 = 36.5 wt% Ni, C_α = (1220 − 1085)/3.2 = 42.2 wt% Ni. || W_L = (42.2 − 40)/(42.2 − 36.5) = 2.2/5.7 = 0.386 — about 39% liquid, 61% solid α. The alloy sits nearer the solid end, so solid dominates, and the arithmetic agrees. || Two divisions, no new measurements. Everything came from the diagram plus conservation of mass — that is all the lever rule ever is.",
    ideas: [
      {
        heading: "Derived, not memorized",
        body: "Start from C₀ = W_L·C_L + W_α·C_α with W_L + W_α = 1. Eliminate W_α: C₀ = W_L·C_L + (1 − W_L)·C_α, so W_L·(C_α − C_L) = C_α − C₀. The lever rule is one line of algebra from the definition of an average — there is nothing to memorize except that mass is conserved.",
        formula: "W_L = (C_α − C₀)/(C_α − C_L), W_α = 1 − W_L",
      },
      {
        heading: "Opposite arm over the whole",
        body: "The mnemonic that never fails: each phase's fraction is the tie-line segment on the far side from it, over the entire tie line. The alloy hangs at the fulcrum C₀; the phase farther away gets less. When the alloy sits dead center, the fractions are 50/50 — the one case you can read without arithmetic.",
      },
      {
        heading: "Mass in, mass out",
        body: "The composition axis is weight percent, so the lever rule returns mass fractions. Volume fractions need densities — liquid and solid rarely match — so '60% solid' means 60% of the mass, not 60% of the casting's volume. Convert explicitly when volume is what the drawing calls for.",
      },
    ],
    bench: "phaseset",
    prompt:
      "Run the problem set again, but predict each fraction from the tie line before you touch the entry boxes. || Say the fulcrum sentence for each one: which phase is nearer, so which dominates. || All six at ±0.03 — the grader is strict because the foundry is stricter.",
    note: "Same diagram, same six problems — the lever rule is the only new tool. If a fraction surprises you, re-draw the tie line; the error is in the reading, not the arithmetic.",
    checks: [
      {
        prompt: "Cu–40 wt% Ni at 1220°C (C_L = 36.5, C_α = 42.2). The liquid fraction is…",
        options: ["0.39", "0.61", "0.50", "0.86"],
        answer: 0,
        why: "W_L = (42.2 − 40)/(42.2 − 36.5) = 2.2/5.7 = 0.386 ≈ 0.39. The alloy sits nearer the solid end, so liquid is the minority — 0.61 is the solid fraction.",
      },
      {
        prompt: "The mass fraction of phase α equals…",
        options: [
          "The tie-line segment from the alloy to the far (β) end, over the whole tie line",
          "The segment from the alloy to the α end, over the whole",
          "The alloy's distance from the pure-α axis",
          "The ratio of the two phase compositions",
        ],
        answer: 0,
        why: "Opposite arm over the whole: the segment from the alloy to the β end, over the full tie line. The nearer α sits to the alloy, the longer that arm and the larger α's share.",
      },
      {
        prompt: "The lever rule returns…",
        options: [
          "Mass fractions",
          "Volume fractions",
          "Mole fractions, always",
          "Grain counts",
        ],
        answer: 0,
        why: "The diagram's axis is weight percent, so mass goes in and mass fractions come out. Volume needs densities; moles need atomic weights.",
      },
      {
        prompt: "If the alloy composition equals one tie-line end exactly, that phase's fraction is…",
        options: ["1 — the alloy is that phase", "0", "0.5", "Undefined"],
        answer: 0,
        why: "The opposite segment spans the whole tie line, so the ratio is 1. Physically you are sitting on the phase boundary: the alloy has exactly that phase's composition.",
      },
    ],
  },
  {
    id: "transformations",
    track: "materials",
    index: 21,
    title: "Transformations",
    minutes: 35,
    lede: "Tracing an alloy cooling through a eutectic — primary crystals, the eutectic reaction, the final microstructure — and how cooling rate rewrites the diagram's story.",
    start:
      "Pour the same bronze into a sand mold and into a water-cooled copper mold and you get two different metals: one soft and coarse-grained, one harder and finer — from the same melt, the same chemistry. The phase diagram did not change. The cooling rate did, and the cooling rate decides how closely the alloy follows the diagram. || A phase transformation is the alloy reorganizing as temperature falls: liquid freezing to solid, one solid splitting into two. The eutectic reaction is the most dramatic: at one fixed temperature and one fixed composition, liquid transforms into two solids at once — L → α + β. The eutectoid is its solid-state twin: γ → α + Fe₃C, the reaction that makes pearlite, the backbone of steel. || The diagram shows equilibrium — the destination the alloy wants. Diffusion is the vehicle, and diffusion needs time. Cool slowly and the alloy arrives: compositions follow the solvus lines, fractions follow the lever. Cool fast and it strands partway: the solid traps the high-temperature composition — coring — and the properties follow the stranded structure, not the diagram's promise.",
    use: "Cooling any alloy through a transformation, or choosing the cooling rate for a casting or heat treatment. || Drop a vertical line at your composition. Walk down in temperature: at each boundary, name what starts to form. At a eutectic, split the remaining liquid into the eutectic microconstituent, and apply the lever rule just above the eutectic temperature for primary versus eutectic fractions. Then ask the rate question: slow enough for diffusion to keep up, or fast enough to freeze the high-temperature state in? || Stop when you can sketch the room-temperature microstructure — which phases, roughly how much of each, in what arrangement — and say what changes if you quench instead.",
    example:
      "Pb–40 wt% Sn cools from 300°C. At the liquidus the first α appears; by just above 183°C the lever rule on the L + α field gives primary α: W_α = (61.9 − 40)/(61.9 − 19.2) = 21.9/42.7 = 0.513 — about 51% chunky primary α dendrites, 49% remaining liquid at the eutectic composition. || At 183°C that liquid undergoes the eutectic reaction: L → α + β, freezing into fine alternating lamellae of lead-rich α and tin-rich β. Just below 183°C the alloy is 51% primary α plus 49% eutectic microconstituent — two morphologies, only two phases (α and β), all from one cooling curve. || The numbers came from the diagram at equilibrium. A fast-cooled casting of the same alloy shows less primary α and a finer, more divorced eutectic — the same destination on the map, but the casting did not get all the way there.",
    ideas: [
      {
        heading: "The eutectic is a fixed point",
        body: "One temperature, one composition, three phases in equilibrium — the phase rule allows no freedom there, so the reaction runs at constant temperature, like a pure metal freezing. All liquid of eutectic composition becomes the two solids simultaneously, in an intimate lamellar mixture, because neither solid can grow without rejecting the other's solute.",
        formula: "L(61.9 wt% Sn) → α(19.2%) + β(97.5%) at 183°C",
      },
      {
        heading: "Coring is frozen history",
        body: "In Cu–Ni the first solid to freeze is nickel-rich and the last is nickel-poor; with slow cooling, solid-state diffusion evens this out as the temperature falls. Quench the casting and diffusion never gets its chance: each dendrite keeps a nickel-rich core and a nickel-poor rim — microsegregation you can etch and see. The cure is a homogenizing anneal: hold hot, and let diffusion finish the job the quench interrupted.",
        formula: "first solid ≈ 1.16 × C₀ (Ni-rich); at equilibrium everything ends at C₀, but a quench leaves the last solid below C₀ (Ni-poor rim)",
      },
      {
        heading: "Iron–carbon runs the world",
        body: "Same ideas, higher stakes. The eutectoid at 0.77 wt% C and 727°C turns austenite into pearlite — alternating ferrite and cementite lamellae, the microstructure behind most structural steel. Below 2.14% carbon you can make steel; above it, cast iron with its own eutectic. And quench austenite fast enough and you skip the diagram entirely: a diffusionless transformation to martensite — the hardest structure steel offers, and the most brittle. Week 15's heat treatments are moves played on this map.",
      },
    ],
    bench: "solidify",
    prompt:
      "Pick an alloy composition and cool it step by step through freezing. || Watch the tie line sweep: the liquid and solid compositions at each temperature, the fractions, the mushy-zone width. || Then flip on coring and compare the dendrite core to its rim — that gradient is what a quench freezes in.",
    note: "Cu–Ni teaching model: linearized liquidus and solidus. Real boundaries curve and real coring needs the Scheil equation; the core-to-rim story is the same.",
    checks: [
      {
        prompt: "Pb–40 wt% Sn just below 183°C contains roughly…",
        options: [
          "51% primary α + 49% eutectic (α + β)",
          "100% eutectic",
          "100% α",
          "Liquid + α",
        ],
        answer: 0,
        why: "Just above 183°C the lever rule gives W_primary-α = (61.9 − 40)/(61.9 − 19.2) = 0.513. The remaining 48.7% liquid sat at the eutectic composition, so it all becomes eutectic α + β.",
      },
      {
        prompt: "The eutectic reaction is…",
        options: [
          "L → α + β at a single temperature and composition",
          "α → β + γ on heating",
          "L → α over a temperature range",
          "The precipitation of β from α on cooling",
        ],
        answer: 0,
        why: "Three phases coexist at the eutectic point — the phase rule leaves zero degrees of freedom, so it runs at fixed T. L → α over a range is ordinary freezing; β coming out of α on cooling is solvus precipitation.",
      },
      {
        prompt: "A quenched Cu–Ni casting shows coring: dendrite cores are…",
        options: [
          "Richer in Ni than the rims — solid diffusion was too slow to homogenize",
          "Poorer in Ni than the rims",
          "Pure nickel",
          "Identical to the rims; coring is a grain-size effect",
        ],
        answer: 0,
        why: "The first solid to form is Ni-rich — the solid prefers the higher-melting component. Slow cooling lets diffusion even it out; a quench freezes the gradient in: rich core, lean rim.",
      },
      {
        prompt: "The iron–carbon eutectoid (0.77 wt% C, 727°C) is the reaction…",
        options: [
          "γ → α + Fe₃C, forming pearlite",
          "δ → γ + liquid",
          "α → γ on heating",
          "Graphite precipitating from liquid",
        ],
        answer: 0,
        why: "Austenite decomposes into ferrite + cementite lamellae — pearlite, the workhorse microstructure of plain-carbon steel. It is the solid-state twin of the eutectic.",
      },
    ],
  },
];
