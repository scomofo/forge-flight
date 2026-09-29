import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 15 — Strengthening & heat treatment.
 * Materials-track indices 13–15.
 * Evidence due: process-to-property design memo (processchoice bench).
 * Through-line: structure → processing → properties → performance.
 */
export const materialsW15Lessons: Lesson[] = [
  {
    id: "strengthen",
    track: "materials",
    index: 13,
    title: "The four ways to make a metal strong",
    minutes: 35,
    lede: "Name the four strengthening mechanisms, say which dislocation obstacle each one installs, and price each one in ductility, cost, and complexity.",
    start:
      "Repeatedly bending a metal can make further plastic deformation harder, even though the alloy chemistry has not changed. || Plastic deformation in metals is carried largely by dislocation motion. Strengthening methods work by making that motion more difficult. || The four mechanisms to know here are grain refinement, work hardening, solid-solution strengthening, and precipitation strengthening. Each raises strength in a different way and comes with tradeoffs."
    use: "A part needs more yield strength than its alloy delivers in the soft condition. || Pick the mechanism whose obstacle fits the alloy and the shop: grain refinement when you control the thermomechanical schedule, work hardening when the part is formed anyway, solid solution when the alloy already carries solutes, precipitation when the alloy has a phase to grow and you can hold a furnace schedule. Name the obstacle, name the price. || Stop when you can say which mechanism is doing the work in a given part and what was traded to buy it. If two mechanisms are active, say which one dominates — they rarely split the credit evenly.",
    example:
      "A 1045 steel bar with 20 μm grains: σ₀ = 110 MPa, k = 0.65 MPa·m^1/2. || σ = 110 + 0.65 / √(20×10⁻⁶) = 110 + 0.65 × 223.6 = 255 MPa. Now refine the grains to 5 μm by controlled rolling: 0.65 / √(5×10⁻⁶) = 0.65 × 447.2 = 291 MPa on top of the 110, for σ = 401 MPa. || Same chemistry, 57% more yield — because a slip plane now runs into a grain boundary every 5 μm instead of every 20. Note what Hall-Petch cannot do: it says nothing about ductility, and below a few tens of nanometres the grains start sliding instead of blocking.",
    ideas: [
      {
        heading: "Strengthening makes dislocation motion harder",
        body: "A perfect crystal would be enormously strong — every bond across a slip plane would have to break at once. Real metals are ten to a thousand times weaker because dislocations let the slip propagate one atomic row at a time, like moving a rug by pushing a wrinkle across it. So the yield strength of a metal measures how hard it is to move its dislocations, and every strengthening mechanism makes that journey harder.",
      },
      {
        heading: "Grain boundaries impede dislocation motion",
        body: "A grain boundary is a wall where the crystal orientation changes: a dislocation arriving there has no slip plane to continue on. Finer grains mean shorter pile-ups of dislocations at each wall, and the pile-up stress concentration is what gives the one-over-root-d law. It is the only mechanism that raises strength while barely touching ductility — and its gain survives an anneal only as long as grain growth is held off.",
        formula: "σ_y = σ₀ + k·d^(−1/2)",
      },
      {
        heading: "Work hardening, solute atoms, and precipitates add obstacles",
        body: "Work hardening tangles dislocations into a forest where they block each other — strong, but ductility collapses and the metal goes anisotropic. Solid-solution atoms distort the lattice and snag passing dislocations — a moderate gain for a small ductility cost, paid in alloying money, with diminishing returns: the gain goes as √c, so doubling the solute from 1% to 2% buys only √2 ≈ 1.41 times the gain, not twice. Precipitates force dislocations to bow between them like a rope around posts — the biggest gain of all, priced in furnace schedule discipline and the danger of overaging past the peak.",
        formula: "Δσ_ss ∝ √c (solute fraction c)",
      },
    ],
    bench: "strengthlab",
    prompt:
      "Open the strengthening explorer. || Set the grain slider to 20 μm and read the Hall-Petch strength; then refine to 5 μm and record the gain. Switch to work hardening, push cold work to 50%, and compare the ductility cost. || Write one sentence for each mechanism naming its obstacle and its price.",
    note: "The explorer's numbers are classroom estimates — right shape, approximate magnitude. They are for choosing mechanisms, not certifying parts.",
    checks: [
      {
        prompt: "Why is a real metal far weaker than a perfect crystal would be?",
        options: [
          "Dislocations let slip propagate one row at a time",
          "Real metals have weaker atomic bonds",
          "Impurities always weaken the lattice",
          "Grain boundaries carry no load",
        ],
        answer: 0,
        why: "A dislocation moves a wrinkle of slip across the plane instead of breaking every bond at once. Strengthening is about obstructing that wrinkle, not about the bond strength.",
      },
      {
        prompt:
          "A low-carbon steel has σ₀ = 70 MPa and k = 0.74 MPa·m^1/2. Its grains measure 25 μm. What yield strength does Hall-Petch predict?",
        options: ["≈ 218 MPa", "≈ 148 MPa", "≈ 74.7 MPa", "≈ 70.1 MPa"],
        answer: 0,
        why: "Convert first: 25 μm = 25×10⁻⁶ m, √ = 0.005 m^1/2, so k/√d = 0.74 / 0.005 = 148 MPa, and σ_y = 70 + 148 = 218 MPa. 148 forgot to add the friction stress σ₀. 74.7 put d in millimetres (√0.025), and 70.1 left it in micrometres (√25) — k is per root metre, so d must be in metres.",
      },
      {
        prompt: "Which mechanism costs the most ductility?",
        options: [
          "Work hardening",
          "Grain refinement",
          "Solid-solution strengthening",
          "Precipitation hardening",
        ],
        answer: 0,
        why: "The dislocation forest that blocks new slip also blocks the slip that ductility needs — elongation routinely falls by two-thirds. Grain refinement is the gentle one; precipitation and solid solution sit in between.",
      },
      {
        prompt: "A copper part needs more strength but must stay weldable and corrosion-proof. Best first lever?",
        options: [
          "Cold work, then anneal only if forming demands it",
          "Quench and temper",
          "Solution treat and age",
          "Normalize from austenite",
        ],
        answer: 0,
        why: "Copper has no martensite to quench, no precipitates to age, and no austenite to normalize from — work hardening is the only lever that needs no alloy change or furnace. But welding will anneal the heat-affected zone and give the gain back, so keep welds out of the strength path. Annealing is the undo button, used sparingly because it erases the gain.",
      },
    ],
  },
  {
    id: "heattreat",
    track: "materials",
    index: 14,
    title: "Heat treatment is processing, not chemistry",
    minutes: 35,
    lede: "Distinguish recovery, recrystallization, and grain growth in an anneal; explain why quenched steel is hard and why it must be tempered; and read a TTT diagram as a race between cooling and transformation.",
    start:
      "A blacksmith heats a chisel to orange, plunges it into oil, and it comes out hard enough to scratch glass — and so brittle that dropping it on the forge floor can crack it. So the smith reheats it gently, far below orange, and the chisel keeps most of its hardness while stopping its habit of shattering. Two heats, opposite purposes, same piece of steel. || Heat treatment rearranges what is already there. Annealing lets the defect structure relax in three acts: recovery (dislocations untangle, strength dips slightly), recrystallization (new strain-free grains nucleate, strength falls hard), grain growth (grains coarsen, and Hall-Petch quietly lowers the yield further). Quenching does the opposite: it cools so fast the carbon cannot escape, trapping it in a distorted lattice called martensite — enormously hard, dangerously brittle. Tempering is the negotiated peace: a modest reheat that trades some hardness back for toughness. || The chemistry never changed. The arrangement did. Processing and alloying are different operations — and two parts with identical mill certificates can have nothing in common mechanically.",
    use: "You hold a part whose strength is wrong — too soft, too brittle, or full of residual stress. || Ask what the microstructure needs: soften and clean it up (anneal past recrystallization), harden it through (quench past the TTT nose, then temper to the toughness you need), or grow obstacles on schedule (solution treat, quench, age to peak hardness). Pick temperature and time from what each stage requires, not from habit. || Stop when you can draw the microstructure before and after on a napkin: defect density, grain size, and phase. If you cannot sketch what changed, you are performing ritual, not heat treatment.",
    example:
      "A 4140 shaft, oil-quenched from 850°C, measures about 58 HRC — and a sharp blow can crack it. || Temper at 400°C for one hour: carbon diffuses just enough to relax the martensite's distortion, fine carbides precipitate, and the hardness settles near 42 HRC with yield around 1300 MPa and 11% elongation. || The temper bought back toughness at a known price in hardness. Untempered martensite rarely survives real service; tempered martensite is what ships. The schedule — temperature and time — is the design variable, and it is chosen, not inherited.",
    ideas: [
      {
        heading: "Annealing progresses through recovery, recrystallization, and grain growth",
        body: "Recovery first: dislocations rearrange and annihilate, residual stress falls, strength barely moves. Recrystallization second: brand-new strain-free grains nucleate and eat the deformed ones — this is where the strength collapses and ductility returns. Grain growth third: big grains eat small ones to reduce boundary area, and the yield drifts down with the square root of the growing diameter. Hold too long at too high a temperature and act three undoes the point of the whole exercise.",
      },
      {
        heading: "Quenching can form hard martensite",
        body: "Cool austenite slowly and carbon diffuses out into soft ferrite and cementite. Cool it fast — past the nose of the TTT diagram before diffusion can act — and the carbon is trapped inside a body-centered-tetragonal lattice it does not fit in. The distortion blocks every dislocation in sight: hardness soars, toughness craters. Tempering lets a little carbon move, a little carbide precipitate, and the lattice relax just enough. The TTT diagram is a map of this race: miss the nose and you get martensite; cross the curves above the nose and you get pearlite; hold below the nose but above Ms and you get bainite.",
        formula: "TTT nose: cool faster than the critical rate → martensite",
      },
      {
        heading: "Aging grows obstacles on a schedule",
        body: "Solution-treat an aluminum alloy to dissolve the copper, quench to trap it in a supersaturated solution, then age — hold at a modest temperature while fine precipitates nucleate and grow. Hardness climbs to a peak as the precipitates reach the size that best blocks dislocations, then falls as they coarsen: overaging. The schedule decides everything: too cold and the precipitates take forever, too hot and they coarsen past the peak before you notice.",
        formula: "Hardness vs aging time: rises to a peak, then overages",
      },
    ],
    bench: "strengthlab",
    prompt:
      "Open the explorer and find the anneal control. || Start from 50% cold work with 20 μm grains, note the strength — then anneal: watch the cold-work contribution vanish (recrystallization) and the grain size grow (grain growth), and read the final yield. || Explain in two sentences which act of annealing did most of the softening and why.",
    note: "Real anneals are specified by temperature, time, and atmosphere — the explorer compresses all three into one button so the mechanism stays visible.",
    checks: [
      {
        prompt: "During recrystallization, what happens to the strength?",
        options: [
          "It falls sharply as new strain-free grains replace deformed ones",
          "It rises as grains refine",
          "It stays flat — only stress changes",
          "It falls slowly and linearly with time",
        ],
        answer: 0,
        why: "Recrystallization wipes out the dislocation forest and replaces deformed grains with soft new ones. That is the big strength drop of an anneal; recovery before it only nibbles.",
      },
      {
        prompt: "Why is quenched steel hard?",
        options: [
          "Carbon trapped in a distorted lattice blocks dislocation motion",
          "Quenching refines the grain size dramatically",
          "The surface oxidizes into a hard shell",
          "Water dissolves the soft phases away",
        ],
        answer: 0,
        why: "Martensite's body-centered-tetragonal lattice is stuffed with carbon that could not diffuse out in time. The distortion pins dislocations almost completely — hence the hardness, and the brittleness.",
      },
      {
        prompt: "On a TTT diagram, cooling that misses the nose and continues below Ms without pause produces…",
        options: [
          "Martensite",
          "Coarse pearlite",
          "Bainite",
          "Spheroidized carbides",
        ],
        answer: 0,
        why: "Missing the nose means diffusion never got its chance — the austenite survives down to the martensite-start temperature (Ms) and shears into martensite. Cross the curves above the nose and you get pearlite; hold below the nose but above Ms and you get bainite.",
      },
      {
        prompt: "An aged aluminum part is past peak hardness and softening. The correct call is…",
        options: [
          "It overaged — re-solution-treat and re-age on a tighter schedule",
          "Age it longer at the same temperature",
          "Quench it again without solution treatment",
          "Cold-work it to recover the peak",
        ],
        answer: 0,
        why: "Overaging coarsened the precipitates past their most effective size; more time only coarsens them further. The fix is to dissolve them again and regrow them properly — there is no shortcut around the schedule.",
      },
    ],
  },
  {
    id: "processchoice",
    track: "materials",
    index: 15,
    title: "Choosing the process",
    minutes: 35,
    lede: "Run the decision sequence — requirement numbers, hard screens, mechanism match, process, verify — and defend a process-to-property choice in a design memo.",
    start:
      "A purchasing manager asks for a bolt that holds 800 MPa and stretches 10% before it breaks, at commodity price, in the millions. The catalog offers a dozen alloys and twice as many tempers. No single number picks the winner: the strongest option is brittle, the cheapest is soft, the toughest is expensive. || Choosing is a sequence. First, write the requirement as numbers: floors for strength and ductility, a ceiling for cost. Second, screen: any alloy-route pair that misses a floor is out before ranking begins — a point outside the window cannot win. Third, match the mechanism to what remains: what obstacle does this alloy actually offer, and what does the shop actually control? Fourth, name the process: temperature, time, deformation. Fifth, verify against the numbers you wrote in step one. || The sequence exists because the alternative is arguing about favorite materials.",
    use: "A part has a strength floor, a ductility floor, and a cost ceiling. || Write the three numbers. Throw out every alloy-route pair that misses any of them. Among the survivors, pick the cheapest process that clears the floors with margin — and name the strengthening mechanism doing the work and what was traded away. || Stop when the memo defends itself: requirement numbers, chosen alloy and route, predicted properties with margin, the mechanism, the trade. If a stranger cannot grade it without asking you anything, it is not done.",
    example:
      "The bolt: 800 MPa yield, 10% elongation. Cold-worked 1045 gives 560 MPa — out at the screen, no matter how cheap. || Solution-aged 2024 gives 345 MPa — not in the same league. Quenched-and-tempered 1045 gives 850 MPa and 12% at 1.9× base cost, but a 1.06 margin is thin. Q&T 4140 gives 1300 MPa and 11% (margin 1.6) at 2.3× base cost (1.6× material plus heat treatment). || The call: pay for 4140's margin and hardenability through the bolt section — oil quench from 850°C, temper near 400°C. The mechanism is tempered martensite; the trade is cost and a heat-treatment schedule the shop must actually hold. Structure (trapped carbon, fine carbides) → processing (quench + temper) → properties (1300 MPa, 11%) → performance (the bolt holds).",
    ideas: [
      {
        heading: "Process selection balances strength, ductility, and cost",
        body: "Every mechanism buys strength with something. Work hardening spends ductility. Precipitation spends process control and money. Grain refinement is the cheapest strength there is, but thermomechanical schedules are not free. Draw the triangle for the part in front of you and mark which corner the job actually pays for — then distrust any option that claims all three.",
        formula: "No free strength: Δσ always has a price",
      },
      {
        heading: "Screens before rankings",
        body: "A hard floor is a guillotine. The 560 MPa cold-worked 1045 does not get partial credit toward an 800 MPa requirement — it is out, and the ranking never sees it. The materials-selection lesson (Screen, then rank) will apply the same discipline one level up: there, whole materials get screened; here, processes are screened. Only survivors get ranked, and they get ranked by what the job values — usually cost, once the floors are cleared.",
      },
      {
        heading: "The through-line, end to end",
        body: "Structure → processing → properties → performance is the chain of custody for every claim in the memo. The obstacle (martensite laths, precipitates, grain boundaries) is the structure. The furnace schedule or the rolling mill is the processing. Yield and elongation are the properties. The bolt holding the joint is the performance. Break any link — claim properties without naming the structure, or name a process without a schedule — and the memo cannot be checked.",
        formula: "Structure → processing → properties → performance",
      },
    ],
    bench: "processmemo",
    prompt:
      "Open the design memo bench and take the structural bolt requirement. || Pick an alloy and a route, read the predicted properties and the verdict, and iterate until a pair clears every floor. Then write the memo: requirement numbers, choice, predicted properties with margin, the mechanism doing the work, and the trade. || Check every rubric box — a stranger must be able to grade the memo without asking you anything.",
    note: "The bench's property numbers are typical handbook values for choosing routes, not certifiable data. Real parts get tested; the memo gets you to the right test.",
    checks: [
      {
        prompt: "Cold-worked 1045 (560 MPa, 6% elongation) against the bolt requirement (800 MPa, 10%). The correct call:",
        options: [
          "Out at the screen — it misses both floors",
          "Acceptable — it is cheap and close on strength",
          "Acceptable if the safety factor is raised",
          "Out, but only because of the elongation",
        ],
        answer: 0,
        why: "A floor is a guillotine: 560 < 800 and 6 < 10, so it fails twice over. Raising the safety factor makes a miss worse, not better. It never reaches the ranking.",
      },
      {
        prompt: "Why does quenched-and-tempered 4140 beat cold-worked 1045 for the bolt?",
        options: [
          "Tempered martensite clears the strength floor while keeping double-digit elongation",
          "It is cheaper per kilogram",
          "Cold work cannot strengthen steel at all",
          "4140 needs no heat treatment",
        ],
        answer: 0,
        why: "1300 MPa with 11% elongation clears both floors with margin; cold work tops out near 560 MPa and spends the ductility. The price is the alloy cost and a real heat-treatment schedule.",
      },
      {
        prompt: "A part needs 250 MPa yield, good formability, and corrosion resistance. The mechanism-first pick is…",
        options: [
          "6061 aluminum, solution-treated and aged to T6",
          "1045 steel, quenched and left untempered",
          "Copper, annealed dead soft",
          "4140 steel, quenched and tempered to full hardness",
        ],
        answer: 0,
        why: "6061-T6 yields ~276 MPa (UTS ~310) with ~12% elongation, welds well, and resists weather — precipitation hardening matched to an alloy that offers it. Untempered 1045 is a brittle warning, and annealed copper yields only ~70 MPa.",
      },
      {
        prompt: "In the memo, the sentence 'the mechanism is tempered martensite' belongs to which link of the chain?",
        options: [
          "Structure — it names the obstacle the processing installed",
          "Processing — it names the furnace schedule",
          "Properties — it states the yield and elongation",
          "Performance — it describes the bolt in service",
        ],
        answer: 0,
        why: "The mechanism is the microstructure doing the work — the structure link. The schedule (quench + temper at 400°C) is processing; the numbers are properties; the holding joint is performance. Keep the links separate and the memo stays honest.",
      },
    ],
  },
];
