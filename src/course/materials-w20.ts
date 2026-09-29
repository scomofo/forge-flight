import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 20 — Materials synthesis (capstone week of the
 * Materials block). These three lessons are materials-track indices
 * 28–30. Evidence due: closed-book mastery check + Glider Lab II. Block
 * gate: at least 70% on the mastery check, plus a filed correction for
 * every missed chain-reasoning or failure-diagnosis item, before
 * Engineering 101.
 *
 * These are not ordinary lessons. They teach and assess synthesis: tracing
 * every property claim to structure, processing, or test; chaining the
 * whole block into one argument; and finding the binding constraint instead
 * of the "best material".
 */
export const materialsW20Lessons: Lesson[] = [
  {
    id: "matmethod",
    track: "materials",
    index: 28,
    title: "The synthesis method for materials",
    minutes: 40,
    lede: "Keeping an assumption ledger for every materials claim, chaining all nine weeks into one argument, and trusting a limiting case over a finished number.",
    start:
      "A defensible material choice includes the assumptions and evidence behind it, not just the material name. || Handbook properties, load factors, manufacturing assumptions, and environmental conditions all have limits. Synthesis means carrying those limits into the final decision. || Record whether each important input is assumed, derived, or measured. When test results disagree with the prediction, use that record to decide what to investigate first."
    use: "Any problem that needs more than one week's machinery — which is every real problem. || Open the ledger first: for each claim write whether it traces to structure, processing, or test, what breaks if it is false, and which limiting case would expose it. Then chain: structure → processing → properties → performance, each handoff stated in a sentence, dimensions checked at every joint. Then test limits: E → ∞, σ → 0, d → ∞, and demand sane behavior. When prediction and measurement disagree, autopsy the ledger before the arithmetic. || Stop when every claim has a provenance, every joint has a unit check, and you can name the assumption most likely to be wrong and what would prove it.",
    example:
      "Carburizing at 950 °C for 4 h predicts a 0.80 mm diffusion length (W13: 2√(Dt)). || The measured depth, on the same basis, is 0.55 mm. The arithmetic is not wrong — the ledger is: 'furnace held 950 °C' was marked assumed, and the thermocouple read about 60 °C high — the furnace actually held ~890 °C. Arrhenius makes D collapse as the temperature drops, so a small lie in T becomes a large lie in depth. || The disagreement was never in the square root; it was in the assumption nobody wrote down. Write it down next time.",
    ideas: [
      {
        heading: "Record where each important input came from",
        body: "A property number traces to exactly three places: structure (bonding, crystal, defects), processing (what was done to it), or test (what was measured on this part). A number with no provenance is a rumor wearing units. When you catch yourself writing 'steel is strong,' stop and ask which steel, which treatment, which test — the ledger forces the question before the decision.",
      },
      {
        heading: "Check each handoff in the analysis chain",
        body: "A multi-week argument is a supply chain: Week 11's bonding sets Week 18's family, Week 15's treatment sets Week 14's curve, Week 16's toughness sets Week 19's selection. Restate each handoff in a sentence: 'the quench froze zinc and magnesium in solution, so the aged 7075 yields at 505 MPa.' If you cannot say the handoff in words, the chain has a gap in it.",
      },
      {
        heading: "Use limiting cases to test whether the model behaves sensibly",
        body: "Drive the parameters to extremes and demand sane behavior: E → ∞ must drive deflection to zero; σ → 0 must drive the critical crack size to infinity; grain size → ∞ must recover the single-crystal strength σ₀. A model that misbehaves at the limit will not redeem itself at the nominal point. Limit tests cost seconds and they test the model's shape, not its arithmetic.",
      },
    ],
    bench: "matledger",
    prompt:
      "Pick the spar scenario and build its assumption ledger: each claim, whether it traces to structure, processing, or test, what breaks if it is false, and which limiting case would expose it. || Then name the assumption most likely to be wrong, and what would prove it.",
    note: "The ledger persists in this browser. A ledger with three honest 'assumed' entries beats a page of arithmetic with none.",
    checks: [
      {
        prompt: "In a synthesis problem, the first thing you write is…",
        options: [
          "The assumption ledger",
          "The governing equation",
          "The material choice",
          "The numerical answer",
        ],
        answer: 0,
        why: "Claims bound the answer's authority; the equation is only valid inside them. Writing the choice first is how parts get built from handbook numbers nobody traced.",
      },
      {
        prompt: "A number's 'provenance' means…",
        options: [
          "Whether it traces to structure, processing, or test",
          "Which textbook it came from",
          "How many significant figures it has",
          "Whether it is in SI units",
        ],
        answer: 0,
        why: "Provenance is the chain of custody: structure, processing, or test. A textbook citation is not custody — the book's number was measured on someone else's specimen.",
      },
      {
        prompt: "Your predicted diffusion depth is 0.80 mm; the measured depth is 0.55 mm. First move:",
        options: [
          "Interrogate the assumption ledger — especially the furnace temperature",
          "Recheck the diffusion-length arithmetic",
          "Run it longer and average the two depths",
          "Declare diffusion theory useless",
        ],
        answer: 0,
        why: "Disagreement autopsies start with assumptions, not arithmetic: D is exponential in temperature, so a small T error dominates the error budget. Recomputing the same 2√(Dt) returns the same answer.",
      },
      {
        prompt: "A model gives the right nominal deflection but diverges as E → ∞. You should…",
        options: [
          "Distrust the model — limits test the model's shape, not its arithmetic",
          "Use it anyway — the nominal point is what matters",
          "Add a fudge factor at high E",
          "Recompute with more precision",
        ],
        answer: 0,
        why: "A limit failure means the model itself is wrong in that regime; precision cannot fix a wrong shape. The nominal agreement was luck, not validation.",
      },
    ],
  },
  {
    id: "sparsynth",
    track: "materials",
    index: 29,
    title: "The spar, end to end",
    minutes: 50,
    lede: "Running the whole block — requirements to failure checks — on one 4×6 mm spar, and finding that strength is not the constraint.",
    start:
      "The spar trade study combines load, bending, stiffness, allowables, durability, and manufacturing. No material wins every category. || Work through the chain in order: gust load → root moment → stress and deflection → allowable checks → fatigue and fracture → manufacturing route. || The binding requirement may not be the one you expected. Let the calculations identify what actually controls the decision."
    use: "Requirements first: name the loads, the section, and the deflection limit. || Compute the chain link by link — M = (L/2)(s/2) with L the total lift, s the half-span and the lift spread uniformly; σ = Mc/I; δ = w·s⁴/(8EI) with w = L/(2s); allowable = strength/FoS — checking units at every joint. Then run the failure sanity checks: fatigue ratio against long-life fatigue strength, critical crack size against the part's dimensions. Then price each survivor: mass, processing route, what the choice assumes. || Stop when every candidate has a strength margin, a stiffness verdict, a mass, and a named binding constraint — and the call cites its week for every link.",
    example:
      "Gust lift: 2.45 N. Root moment: 0.153 N·m. Section 4×6 mm: I = 72 mm⁴, c = 3 mm, σ = 6.4 MPa. || Allowables: 7075-T6 at 337 MPa (margin 53×), balsa at 17.5 MPa (margin 2.7×), carbon at 800 MPa (margin 125×). Strength is not the constraint — nothing is near yielding. Deflection: balsa 11.1 mm, aluminum 0.46 mm, carbon 0.25 mm against a 5 mm limit. Balsa, the lightest at 0.96 g, fails the stiffness screen; carbon survives at 9.6 g against aluminum's 16.9 g. || The call: carbon wins, and the ledger records why — stiffness killed balsa, mass killed aluminum. Change the deflection limit and the call changes; that is the point.",
    ideas: [
      {
        heading: "Let the calculations identify the binding constraint",
        body: "Compute every margin and let the smallest one name the driver. Here strength margins run 2.7× to 125× while the stiffness screen disqualifies the lightest candidate outright. Assuming the driver — 'it's a strength problem' — optimizes the wrong link; the chain finds it for you.",
        formula: "σ = M·c/I, δ = w·s⁴/(8·E·I) with s = half-span, allowable = strength / FoS",
      },
      {
        heading: "A stiffness requirement can control even when strength easily passes",
        body: "Balsa's 2.7× strength margin next to its 11 mm sag is the whole lesson in one spar: for light, slender structures, E governs and σ_y is along for the ride. This is why the selection indices of Week 19 exist — E/ρ and E^(1/2)/ρ rank what σ_y/ρ cannot. Match the index to the binding constraint or the ranking lies.",
      },
      {
        heading: "Every link cites its week",
        body: "Traceability is the deliverable: loads from the physics block's force balance, the beam from Weeks 6–7 tools, allowables from Week 14, the fatigue and fracture sanity from Week 16, the T6 route from Weeks 13, 15, and 17, the ranking from Week 19. A chain you can audit link by link is a decision you can defend; a number alone is a preference.",
      },
    ],
    bench: "sparlab",
    prompt:
      "Glider Lab II: lock your predictions for the reference spar — root bending stress, tip deflection in balsa and in aluminum, and which constraint binds. || Then face the chain's numbers and autopsy any disagreement: name the suspect assumption.",
    note: "Locked predictions cannot be edited after reveal — that is the point. A wrong prediction with a good autopsy beats a right one you never committed to.",
    checks: [
      {
        prompt: "In the spar chain, the binding constraint turned out to be…",
        options: ["Stiffness", "Strength", "Corrosion", "Cost"],
        answer: 0,
        why: "Strength margins ran 2.7× to 125× — nothing near yielding — while balsa's 11.1 mm deflection failed the 5 mm screen. The screen that kills the lightest option is the binding constraint.",
      },
      {
        prompt: "Doubling the spar's depth (height) changes the bending stress by…",
        options: [
          "Dividing it by 4 — σ ∝ 1/h²",
          "Halving it — σ ∝ 1/h",
          "Dividing it by 8 — σ ∝ 1/h³",
          "Nothing — depth only affects deflection",
        ],
        answer: 0,
        why: "σ = Mc/I with I = bh³/12 and c = h/2 gives σ = 6M/(bh²) — stress falls with the square of depth. Depth is the cheapest stiffness and strength you can buy, which is why spars are deep, not wide.",
      },
      {
        prompt: "The aluminum spar's critical crack size came out ≈ 6.6 m — longer than the spar. This means…",
        options: [
          "Fracture is not the driver at these stresses; other modes decide",
          "The fracture calculation is wrong",
          "The spar will fail by fracture first",
          "K_IC is irrelevant for aluminum",
        ],
        answer: 0,
        why: "At 6.4 MPa operating stress, linear-elastic fracture mechanics says a crack would need to be meters long to run — the part fails by other means first. The limit test (σ → 0 ⇒ a_c → ∞) confirms the model is sane; the conclusion is that fracture doesn't bind here.",
      },
      {
        prompt: "The fatigue check showed the aluminum spar's operating stress at 4% of its long-life (5×10⁸-cycle) fatigue strength. The correct reading is…",
        options: [
          "Effectively infinite life — fatigue doesn't drive this design",
          "The part will fail in fatigue anyway",
          "The spar will crack within a few thousand gusts",
          "The gust factor must be wrong",
        ],
        answer: 0,
        why: "Aluminum has no true endurance limit, but at 4% of its long-life strength the damage per gust is negligible over any realistic service life — fatigue is ruled out as the driver. The check's job was to rule fatigue out, and it did. Not every check needs to find a problem; ruling one out is a result.",
      },
    ],
  },
  {
    id: "matmastery",
    track: "materials",
    index: 30,
    title: "The closed-book mastery check",
    minutes: 60,
    lede: "Twelve questions, one sitting, closed book — four chain, four failure, four mixed. 70% plus corrections opens the gate to Engineering 101.",
    start:
      "The Materials mastery check emphasizes two skills: carrying values correctly from one model to the next, and identifying the governing failure mode. || The question bank also covers bonding, phase diagrams, selection, and mechanical properties, but chain reasoning and failure diagnosis receive extra weight because later engineering work depends on them. || Closed book does not mean memory-only. Re-derive the relationships you need from the principles you have practiced."
    use: "Sit the check in one sitting with no references — twelve questions, every one answered. || 70% (9 of 12) clears the score gate. Then file a corrected solution for every missed chain or failure item: name the error, re-derive the answer, identify the failed instinct. || The gate opens on score plus repairs. Below 70%, retake — and file the corrections regardless, because the repair is the learning.",
    example:
      "You miss the lever-rule item, answering 67% β instead of 33%. || The filed correction: 'Error: I used the near arm — the fraction of a phase comes from the opposite tie-line segment. Re-derivation: Wβ = (40−20)/(80−20) = 1/3. Failed instinct: reading the diagram like a ruler instead of a balance.' || Three sentences, and the mistake is now load-bearing knowledge instead of a forgotten guess. That is what the correction workflow is for.",
    ideas: [
      {
        heading: "The gate requires both the score and the required corrections",
        body: "70% proves breadth; the filed corrections prove the misses are repaired, not merely counted. A missed chain item left uncorrected is a broken handoff you will carry into Engineering 101, where the loads get real. The gate demands both because the course needs both.",
      },
      {
        heading: "Chain questions test whether intermediate results stay consistent",
        body: "Each chain item crosses at least one week boundary: beam mechanics into stress, grain size into strength, phase diagram into fractions, diffusion coefficient into depth. If a handoff is where you stumble, the correction must re-derive the crossing — that is the unit that failed, not the arithmetic.",
      },
      {
        heading: "Failure questions test whether you identify the right mechanism",
        body: "Creep vs fatigue vs stress corrosion is a diagnosis first and a calculation second: steady load plus heat plus time says creep before any Larson–Miller number is computed. Name the mode from the evidence, then let the number confirm. Numbers without a mode are just arithmetic.",
      },
    ],
    bench: "matcheck",
    prompt:
      "Sit the check: twelve questions, one sitting, closed book — four chain, four failure, four mixed. || 70% clears the score gate; then file a corrected solution for every missed chain or failure item. The gate opens on score plus repairs.",
    note: "Your answers, score, and filed corrections persist in this browser. The gate state is always visible — no surprises at the end.",
    checks: [
      {
        prompt: "The block gate to Engineering 101 requires…",
        options: [
          "≥ 70% on the check plus a filed correction for every missed chain/failure item",
          "≥ 70% on the check, nothing else",
          "A filed correction for every missed item regardless of score",
          "100% on the chain items",
        ],
        answer: 0,
        why: "Score proves breadth; corrections prove the load-bearing misses are repaired. 70% alone leaves broken handoffs; corrections alone without the score leave breadth unproven.",
      },
      {
        prompt: "Why are chain and failure items weighted heaviest in the bank?",
        options: [
          "They are the load-bearing skills: chaining weeks and diagnosing modes",
          "They are the easiest to grade",
          "The other weeks matter less",
          "Tradition",
        ],
        answer: 0,
        why: "Everything downstream — every engineering decision in the next block — rests on handing numbers across weeks and naming failure modes. The weighting is the syllabus saying what it values.",
      },
      {
        prompt: "A good filed correction contains…",
        options: [
          "The named error, a re-derivation, and the failed instinct",
          "The correct answer letter",
          "An apology for missing it",
          "A promise to study harder",
        ],
        answer: 0,
        why: "Naming the error and the instinct that produced it is what converts a miss into knowledge. The answer letter alone repairs nothing.",
      },
      {
        prompt: "You score 67% (8 of 12). What happens?",
        options: [
          "Retake the check — and file corrections for the missed chain/failure items regardless",
          "File corrections and move on",
          "Retake only the missed items",
          "The gate opens on effort",
        ],
        answer: 0,
        why: "Below 70% the score gate is not cleared, so the check is retaken. The corrections are filed anyway because the repair is the learning, not a punishment for the score.",
      },
    ],
  },
];
