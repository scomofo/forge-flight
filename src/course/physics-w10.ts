import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 10 — Physics synthesis (capstone week of the Physics block).
 * These three lessons open the physics track (indices 1–3). Evidence due:
 * closed-book mastery check + Glider Lab I. Block gate: at least 70% on the
 * mastery check, plus a filed correction for every missed conservation-law or
 * free-body-diagram item, before Materials 101.
 *
 * These are not ordinary lessons. They teach and assess synthesis: choosing
 * assumptions, chaining models across weeks, testing limiting cases, and
 * explaining model-vs-reality disagreement.
 */
export const physicsW10Lessons: Lesson[] = [
  {
    id: "synthmethod",
    track: "physics",
    index: 28,
    title: "The synthesis method",
    minutes: 40,
    lede: "You will write the assumption ledger before you compute, chain models across the whole block, and trust a limiting case over a finished number.",
    start:
      "Two engineers predict a glider's range. The first hands you 261 m. The second hands you 260 ± 30 m, a list of six things she assumed, and the two assumptions most likely to be wrong. || Synthesis is the second engineer: a number is never the deliverable — the number plus its boundaries is. Every formula from Weeks 1 through 9 arrived with an expiry date — inertial frames, small angles, negligible drag, linear elasticity. Synthesis is the discipline of carrying those dates into the calculation instead of leaving them in the chapter. || An unlisted assumption is an uninspected weld. When a prediction meets reality and they disagree, the arithmetic is the last place to look; the ledger is the first.",
    use: "Any problem that needs more than one week's machinery — which is every real problem. || Open the ledger first: for each assumption write what you assume, what breaks if it is false, and which limiting case would expose it. Then chain: each step's output is the next step's input, and you check dimensions at every joint — Week 1 never retires. Then test limits: drive parameters to zero, to infinity, to equality, and demand the answer behave sanely. When prediction and measurement disagree, autopsy the ledger before the arithmetic. || Stop when every joint has a unit check, every extreme has a limit test, and you can point to the assumption most likely to be wrong and say what would prove it.",
    example:
      "Predict how long a 20 m drop takes: t = √(2h/g) = 2.02 s. || Limit tests: g → 0 gives t → ∞ (no gravity, never lands — sane); h → 0 gives t → 0 (no drop, no time — sane). The formula survives its extremes. || The measured time is 2.3 s. The arithmetic is not wrong — the ledger is: 'air drag negligible' fails for a light crate near 20 m/s, where ½ρv²A is a real force. The disagreement was never in the algebra; it was in the assumption nobody wrote down. Write it down next time.",
    ideas: [
      {
        heading: "Assumptions are load-bearing",
        body: "Every model stands on statements you chose not to prove. An assumption ledger makes them visible: the assumption, what breaks if it is false, which limit exposes it. The Mars Climate Orbiter's ledger had a blank line where 'both teams use newtons' should have been. Blanks are the most dangerous entries — audit for what you forgot to assume, not just what you assumed.",
      },
      {
        heading: "Chain at the joints",
        body: "A multi-step solution is a supply chain: each step's output is the next step's input, and a defect anywhere ships downstream. Check dimensions at every joint — MLT⁻² in, MLT⁻² out. When a chain crosses weeks (energy → forces → fluids), restate each handoff in words: 'the tow line's work becomes the release kinetic energy.' If you cannot say the handoff in a sentence, you do not own the chain.",
      },
      {
        heading: "Limits are the cheapest experiment",
        body: "Before computing a single number, push the parameters to extremes and demand sane behavior: θ → 0, m → ∞, v → 0. A formula that misbehaves at the limit will not redeem itself at the nominal point — it is the same formula. Limit tests cost seconds and catch the errors that survive every other review, because they test the model's shape instead of its arithmetic.",
      },
    ],
    bench: "synthledger",
    prompt:
      "Pick the glider scenario and build its assumption ledger: each assumption, whether it is assumed, derived, or measured, what breaks if it is false, and which limiting case would expose it. || Then name the assumption most likely to be wrong — that name is the most valuable line on the page.",
    note: "The ledger persists in this browser. A ledger with three honest 'assumed' entries beats a page of arithmetic with none.",
    checks: [
      {
        prompt: "In a synthesis problem, the first thing you write is…",
        options: [
          "The assumption ledger",
          "The governing equation",
          "The numerical answer",
          "The unit conversion",
        ],
        answer: 0,
        why: "Assumptions bound the answer's authority; the equation is only valid inside them. Writing the equation first is how the Orbiter happened — correct arithmetic inside an unexamined assumption.",
      },
      {
        prompt: "A formula gives the right nominal answer but diverges as θ → 0. You should…",
        options: [
          "Distrust the formula — limits test the model's shape, not its arithmetic",
          "Use it anyway — the nominal point is what matters",
          "Add a fudge factor at small θ",
          "Recompute with more precision",
        ],
        answer: 0,
        why: "A limit failure means the model itself is wrong in that regime; precision cannot fix a wrong shape. The nominal agreement was luck, and luck does not repeat.",
      },
      {
        prompt: "Your predicted range is 261 m; the glider flies 210 m. First move:",
        options: [
          "Interrogate the assumption ledger — especially 'no wind' and the drag estimate",
          "Recheck the arithmetic",
          "Fly it again and average the two flights",
          "Declare the model useless",
        ],
        answer: 0,
        why: "Disagreement autopsies start with assumptions, not arithmetic: the least certain inputs (wind, the cd0 estimate) dominate the error budget. Recomputing the same arithmetic returns the same answer.",
      },
      {
        prompt: "Chaining energy → forces → fluids, the handoff between steps must…",
        options: [
          "Be statable in a sentence, with a unit check at the joint",
          "Use the same symbols throughout",
          "Be re-derived from first principles each time",
          "Skip the intermediate units to save time",
        ],
        answer: 0,
        why: "Each joint is a supply-chain handoff: the output's dimensions must match the next input's, and you should be able to say the handoff in words. Symbol consistency is nice; dimensional consistency is mandatory.",
      },
    ],
  },
  {
    id: "towlaunch",
    track: "physics",
    index: 29,
    title: "Tow launch, worked end to end",
    minutes: 45,
    lede: "You will take one glider from the winch to the landing field, chaining tow energy, force balance, the drag polar, and kinematics — and mark exactly where the model's authority ends.",
    start:
      "A winch tow: the glider climbs the line, the line goes slack at 30 m, and the glider is on its own at 8 m/s. How far does it go? || No single week answers that. The tow is Week 4 (work becomes energy), the release is Week 3 (force balance), the glide is Week 8 (the drag polar), the range is Week 2 (kinematics), and the honest digits are Week 1. Synthesis is refusing to leave any of them out. || Real systems do not respect chapter boundaries. The tow line does not know it is 'an energy problem' — it is just 32.6 joules looking for somewhere to go.",
    use: "When the question spans the block: state the chain up front, then work it link by link. || 1. Tow (Week 4): the line's work becomes KE + PE at release — open the energy account. 2. Release (Week 3): steady glide means forces balance along and across the flight path; the path angle is set by D/L. 3. Polar (Week 8): CL from the wing slope at 4°, CD from parasite plus induced drag, L/D = CL/CD. 4. Range (Week 2): in still air, range = altitude × L/D. 5. Honest digits (Week 1): the least certain input rules the reported precision. || Stop when every joint carries a unit check, the energy account balances, and the final number wears only the digits its weakest input earned.",
    example:
      "The reference glider: 0.10 kg, wing 500 × 90 mm, released at 8 m/s from 30 m. || Tow: KE = ½(0.10)(8²) = 3.2 J, PE = (0.10)(9.81)(30) = 29.4 J — the line did 32.6 J of work. Polar: aspect ratio 5.56, lift slope 4.62 per radian, at α = 4° CL = 0.323; CD = 0.030 + 0.0070 = 0.0370; L/D = 8.71. Trim: v = √(2·0.981/(1.225·0.045·0.323)) = 10.5 m/s. Glide: γ = atan(1/8.71) = 6.5°, D = 0.112 N, L = 0.975 N. Range: 30 × 8.71 = 261 m. || Report 260 ± 30 m: the parasite drag is a ±30% estimate and it owns the error budget. Note the release at 8 m/s sits below the 10.5 m/s trim — the glider spends about 2.4 m of altitude buying the missing speed on the way down. The model's authority ends at the first gust.",
    ideas: [
      {
        heading: "Energy opens the account",
        body: "The tow line does 32.6 J of work and every later step spends from that account: 3.2 J sits in speed, 29.4 J in altitude. Nothing in the glide creates energy — the polar only decides how fast the account drains. When a synthesis confuses you, find the account: who deposited, who withdraws.",
        formula: "W_tow = ½mv² + mgh = 32.6 J",
      },
      {
        heading: "Steady flight is a free-body diagram",
        body: "Unaccelerated glide means ΣF = 0 along and across the flight path: drag = W·sin γ, lift = W·cos γ. The flight-path angle is not chosen — it is set by D/L, which is set by the polar. Week 3's discipline (isolate, enumerate, draw, resolve) works at 10 m/s exactly as it worked on the block.",
        formula: "tan γ = D/L = 1/(L/D)",
      },
      {
        heading: "The polar sets the terms",
        body: "CL comes from the wing's lift slope at the trim angle; CD is parasite drag plus the induced price of making lift. Best L/D is where the two drags trade evenly. Fly faster or slower than the polar's sweet spot and the energy account drains faster — 261 m is a ceiling set by the wing, not a promise.",
        formula: "CD = cd0 + CL²/(π·AR·e)",
      },
    ],
    bench: "gliderlab",
    prompt:
      "Lock your predictions — trim speed, static margin, glide range from 30 m — before the model runs. || Then run it, read the deltas, and write the disagreement autopsy: which model omission most likely owns your largest error.",
    note: "Predictions lock before the reveal. Changing a prediction after seeing the model is not learning — it is editing the past.",
    checks: [
      {
        prompt: "In the tow-launch chain, the drag polar answers…",
        options: [
          "L/D — how far each meter of altitude buys",
          "The release speed",
          "The tow line's work",
          "The flight-path angle, directly",
        ],
        answer: 0,
        why: "The polar gives CL and CD, hence L/D; range = altitude × L/D. The release speed comes from the tow (energy), the work from force × distance, and the path angle follows from L/D.",
      },
      {
        prompt: "Trim speed comes from setting…",
        options: [
          "Lift equal to weight in the lift equation",
          "Thrust equal to drag",
          "Kinetic energy equal to potential energy",
          "The static margin to 10%",
        ],
        answer: 0,
        why: "Trim means L ≈ W: v = √(2W/(ρSCL)). There is no thrust on a glider; KE = PE is a coincidence, not a condition; margin is stability, not speed.",
      },
      {
        prompt: "The glider is released below trim speed. It…",
        options: [
          "Trades altitude for speed until it reaches trim",
          "Stalls immediately",
          "Holds 8 m/s all the way down",
          "Climbs back to release altitude",
        ],
        answer: 0,
        why: "Below trim, lift is short of weight — the nose drops and PE converts to KE. About 2.4 m of altitude buys the missing 2.5 m/s. No stall: 4° is far from the 12° stall angle.",
      },
      {
        prompt: "The range is reported as 260 ± 30 m rather than 261.4 m because…",
        options: [
          "The parasite-drag estimate owns the error budget",
          "The arithmetic only deserves two digits",
          "Glide range is always approximate",
          "The wind is unknown",
        ],
        answer: 0,
        why: "cd0 = 0.030 is a ±30% estimate and it flows straight into L/D and the range. Honest digits follow the weakest input (Week 1) — the arithmetic's precision is irrelevant.",
      },
    ],
  },
  {
    id: "masterycheck",
    track: "physics",
    index: 30,
    title: "The mastery check",
    minutes: 60,
    lede: "You will sit a closed-book check over the whole block, clear 70%, and repair every missed conservation-law or free-body-diagram item before Materials 101 opens.",
    start:
      "The check is closed-book because the job site is: nobody on a flight line lets you look up whether momentum is conserved — either the instinct is in you or it isn't. || Twelve questions, one sitting, no references: four on conservation laws, four on free-body diagrams — those two because they are the load-bearing skills of the entire course — and four cross-cutting the rest of the block. 70% clears the gate. Every missed conservation or FBD item gets a written corrected solution — not a retake, a repair. || The gate is not there to keep you out of Materials 101. It is there to keep a wrong conservation instinct from following you in.",
    use: "When you have finished Weeks 1–9 and the synthesis lessons. || Run the check in one sitting, closed book — derive, don't recall. Score it: 9 of 12 clears 70%. For every missed conservation or FBD item, write the correction: state the error, re-derive the right answer, name the instinct that failed. File each correction in the bench. || Stop when the score clears 70% AND every missed conservation/FBD item has a filed correction. Both conditions — a high score with unrepaired FBD errors still holds the gate.",
    example:
      "You miss the incline item, answering a = g·cos30°. The correction: || Error: resolved the wrong component — cosine is the into-the-plane component, which sets the normal force, not the acceleration. Re-derivation: axes along the plane, downslope weight component mg·sin30°, so a = g·sin30° ≈ 4.9 m/s². Failed instinct: reaching for the familiar cosine without drawing the FBD. || The correction is the learning. A filed correction means the next incline gets the FBD first — which is the habit the gate is actually testing.",
    ideas: [
      {
        heading: "Closed book, open reasoning",
        body: "Formulas you can re-derive are yours; formulas you can only recite are rented. The check rewards derivation: the kinematic equations fall out of a v–t graph, the Atwood tension falls out of two FBDs. If your preparation is 'memorize twelve formulas,' you are preparing for the wrong test.",
      },
      {
        heading: "The gate is weighted on purpose",
        body: "Eight of twelve items probe conservation laws and free-body diagrams because those two skills carry every later block: Materials 101's stress analysis is FBDs plus constitutive laws, and energy methods never leave. The weighting is the syllabus telling you where the load-bearing walls are.",
      },
      {
        heading: "Corrections, not retakes",
        body: "A missed item is a named error with a repaired derivation, filed in your notebook — not a failure to hide or a score to grind. You enter Materials 101 with the repairs, not just the grade. Engineers don't get retakes on flown hardware; they get failure reviews. This is the small version.",
      },
    ],
    bench: "mastery",
    prompt:
      "Sit the check: twelve questions, one sitting, closed book. || Then file a corrected solution for every missed conservation or FBD item — the gate opens on score plus repairs, not score alone.",
    note: "Your score, answers, and filed corrections persist in this browser. The gate state is shown, not hidden — you always know exactly what stands between you and Materials 101.",
    checks: [
      {
        prompt: "The mastery gate opens when…",
        options: [
          "Score ≥ 70% AND all missed conservation/FBD items have filed corrections",
          "Score ≥ 70%",
          "All twelve questions correct",
          "Corrections filed for every missed item",
        ],
        answer: 0,
        why: "Both conditions. A high score with unrepaired FBD errors still holds the gate — and a perfect correction set with a failing score means the sitting didn't happen.",
      },
      {
        prompt: "70% of twelve questions means you need at least…",
        options: ["9 correct", "8 correct", "7 correct", "10 correct"],
        answer: 0,
        why: "8/12 = 66.7%, below 70. 9/12 = 75%. The gate is on the percentage, so 9 is the minimum whole-question score.",
      },
      {
        prompt: "Closed-book means…",
        options: [
          "Derive what you need; recall is not the skill under test",
          "Write nothing down at all",
          "Memorize every formula beforehand",
          "Answer from instinct without checking",
        ],
        answer: 0,
        why: "The test is whether the reasoning is in you, not the symbols. Re-deriving the kinematic equations from a v–t graph during the check is exactly the intended move.",
      },
      {
        prompt: "A good correction for a missed item…",
        options: [
          "Names the error, re-derives the answer, and identifies the failed instinct",
          "States the correct answer",
          "Explains why the question was tricky",
          "Promises to study harder",
        ],
        answer: 0,
        why: "The correction repairs the reasoning chain, not the score. Naming the failed instinct is what keeps the same error from recurring under a different question.",
      },
    ],
  },
];
