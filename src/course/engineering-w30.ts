import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 30 — Capstone integration (capstone week of the
 * Engineering block and of the whole course). These three lessons open the
 * engineering track (indices 1–3). Evidence due: capstone design
 * package + final review. Final gate: a simulation score alone is
 * insufficient — the learner must show a requirement, a model, a test, a
 * mismatch, and a justified revision; the closed-book check closes at 70%
 * with corrections filed for missed full-cycle items.
 *
 * These are not ordinary lessons. They teach and assess the full design
 * cycle: stating demands a design can lose to, predicting before testing,
 * naming the disagreement honestly, and changing one thing for a stated
 * reason. The glider is the integrating artifact.
 */
export const engineeringW30Lessons: Lesson[] = [
  {
    id: "capmethod",
    track: "engineering",
    index: 28,
    title: "The full cycle is the course",
    minutes: 40,
    lede: "Run requirement → model → test → mismatch → justified revision as one discipline, and learn why a simulation score alone can never pass the gate.",
    start:
      "Two engineers finish a spar analysis. The first hands you a converged simulation: 0.46 mm of tip deflection, mesh refined twice, residuals flat. The second hands you the same number — plus a test that measured 0.61 mm, an autopsy of the disagreement, and one change, defended, that closes it. || The first engineer ran a model. The second ran the full cycle: requirement (the demand the design can lose to), model (the prediction, ledgered), test (the measurement with its uncertainty), mismatch (the disagreement, named honestly), justified revision (one change, one reason). A simulation score is a claim about a model. The cycle is a claim about the world. || The capstone gate is built on this distinction: no package passes on simulation alone. Every section must be present — an absent test, an unnamed mismatch, a revision that changes everything at once — and the total must reach 70%. The sections exist because each one is where a different kind of lie hides.",
    use: "Any design you are asked to defend — which is every design that matters. || Write the requirement first, as a demand with a number and a pass/fail line. Build the model to predict the test outcome before the test runs, and ledger the assumptions. Measure with a stated uncertainty so agreement or disagreement means something. When they disagree, autopsy the ledger — assumptions first, arithmetic last. Change one thing, say why that thing and not another, and re-check every margin the change touches. || Stop when all five sections score at least a 1 and the total reaches 70% — and you can name the assumption most likely to be wrong and what would prove it.",
    example:
      "The reference spar: requirement — tip deflection at most 5 mm under the 2.5 g gust. Model — the uniform-beam chain predicts 0.46 mm for 7075-T6. Test — the static rig measures 0.61 ± 0.05 mm. || The mismatch is 33%, and the uncertainty bars do not touch: this is a real disagreement, not noise. The ledger's prime suspect is the root: the model clamps the spar; the build glues it into a socket, and adhesive compliance plus fit-up clearance add a root rotation the beam equation never sees. The revision models the root as a torsional spring in series with the beam, fits the spring from the 0.61 mm, and re-checks the strength margins — which still clear by 50×. || One change, named and defended; the suspects it beat are on the page. That is what 'justified' means.",
    ideas: [
      {
        heading: "The five sections are five hiding places",
        body: "Each section catches a different failure of honesty. The requirement catches designs that cannot lose. The model catches predictions written after the test. The test catches claims with no uncertainty stated. The mismatch catches disagreements averaged away. The revision catches changes that touch five things and explain none of them. A package with all five present has nowhere left to hide — which is the point.",
        formula: "requirement → model → test → mismatch → revision",
      },
      {
        heading: "Predict before you test",
        body: "The prediction is locked before the measurement exists. A model fitted after the fact is a description, not a prediction, and descriptions never fail — which is exactly the problem. The locked-prediction bench enforces the order: write the number, lock it, then face the chain.",
      },
      {
        heading: "The revision is a decision, not a patch",
        body: "Changing the root model to a spring is a decision: it names the suspect (adhesive compliance), rejects the alternatives (E is too well known, the arithmetic checks), and re-verifies what it touched (strength margins still 50×). A revision that cannot say why it changed this and not that is a patch — and patches accumulate into designs nobody understands.",
      },
    ],
    bench: "cappackage",
    prompt:
      "Build your capstone design package: one requirement, one model, one test, one mismatch, one justified revision. || Score each section 0–2 against the rubric and watch the gate verdict — every section must be present, and the total must reach 70%.",
    note: "The package persists in this browser. A weak section scored honestly as a 1 beats a weak section scored as a 2 — the gate checks presence, but the rubric rewards honesty.",
    checks: [
      {
        prompt: "The capstone gate fails a package that…",
        options: [
          "Scores 100% on the simulation but shows no test, mismatch, or revision",
          "Shows a test that disagrees with the model",
          "Revises the model after the test",
          "Files a correction for a missed item",
        ],
        answer: 0,
        why: "Simulation score alone is insufficient — the gate requires all five sections present and a 70% total. A disagreement honestly named is a section scored, not a failure.",
      },
      {
        prompt: "Why lock the prediction before the test?",
        options: [
          "To make the arithmetic harder",
          "A prediction written after the test is a description, and descriptions never fail",
          "The bench requires it for scoring",
          "To save time",
        ],
        answer: 1,
        why: "The lock enforces the order that makes testing real: predict, then measure. Without it you fit the model to the outcome and learn nothing — the reveal is where the learning happens.",
      },
      {
        prompt: "A justified revision…",
        options: [
          "Changes one thing, names why that thing and not another, and re-checks the margins it touched",
          "Changes everything until the numbers match",
          "Adds margin to cover the gap",
          "Blames the measurement",
        ],
        answer: 0,
        why: "One change, defended; the suspects it beat are named; every touched margin is re-verified. Changing everything at once teaches nothing and proves nothing.",
      },
      {
        prompt: "The five sections exist because…",
        options: [
          "Reports need five chapters",
          "Each catches a different failure of honesty — designs that cannot lose, predictions written after the test, claims with no uncertainty, disagreements averaged away, changes that explain nothing",
          "The syllabus says so",
          "Grading is easier in fives",
        ],
        answer: 1,
        why: "The structure is a lie detector, not a template. Every section is where one specific kind of dishonesty hides; a complete package has nowhere left to hide.",
      },
    ],
  },
  {
    id: "glidersynth",
    track: "engineering",
    index: 29,
    title: "The glider, end to end",
    minutes: 50,
    lede: "Run the whole course — requirements to trade study — on the 100 g glider, and watch the full cycle catch what any single week would miss.",
    start:
      "The same 100 g tow-launch glider the materials synthesis ran through its spar chain now runs the full engineering cycle. The requirement: tip deflection at most 5 mm under the 2.5 g gust. The model: the uniform-beam chain — 2.45 N of gust lift, 0.153 N·m at the root, 6.39 MPa of bending stress, 0.46 mm of tip deflection for the 7075-T6 spar. || Around that chain the engineering weeks close in: the error budget says which measurement deserves the better instrument; the margin table prices the insurance; the joint decision names what kills the assembly; the tolerance stack says whether the parts can even be built; the trade study keeps the comparison honest. || And then the test disagrees: 0.61 mm against 0.46 — a moment no single week owns. That is what the cycle is for.",
    use: "A design that must survive a review — which is every design you sign. || State the requirement as a demand that can lose. Chain the model link by link — loads, stress, deflection, allowables — checking dimensions at every joint. Budget the uncertainty and spend the next dollar on the dominant link. Tabulate the margins and name the governing line. Decide the joints and the materials as one decision. Stack the tolerances against the clearance that matters. Run the trade study with the baseline getting no home-field advantage. Then test, name the mismatch, and revise one thing for a stated reason. || Stop when every week has had its say and the binding constraint is named by the chain, not assumed.",
    example:
      "Requirement (W21): tip deflection ≤ 5 mm under the 2.5 g gust — a number, a unit, a pass/fail line. Model (physics W6/W7): σ = 6.39 MPa, δ = 0.46 mm for aluminum; strength margins 53×, so strength does not bind — stiffness does, exactly as the materials synthesis found. || Uncertainty (W22): the gust factor is the least certain input, and the error budget says the next instrument dollar goes to the load cell, not the caliper. Margins (W23): MS = 52 on strength at limit — the insurance is priced, not felt. Joints (W25): the bonded root fitting governs the assembly, not the spar. Tolerances (W26): the socket clearance stacks 0.25 worst-case against 0.20 available — worst-case, because this is a flight part. Trade study (W28): aluminum beats balsa on the stiffness screen that actually binds. || Test (W27): 0.61 ± 0.05 mm. Mismatch: 33%, bars not touching. Revision: the root is a torsional spring, fitted from the measurement, margins re-checked. The design that ships is the revised one — and the package shows all five sections.",
    ideas: [
      {
        heading: "No week owns the design",
        body: "Requirements without margins is a wish list. A model without an error budget is a guess wearing units. Margins without a test are insurance priced on a rumor. The test without the autopsy is theater. Each week is load-bearing, and the design that ships is the one that ran all of them — in order, with the receipts.",
        formula: "σ = M·c/I, δ = w·L⁴/(8·E·I), MS = FoS − 1, RPN = S·O·D",
      },
      {
        heading: "The binding constraint is found twice",
        body: "The materials synthesis found stiffness binding by chaining properties. The engineering cycle finds it again by chaining decisions: the requirement screens balsa, the trade study ranks aluminum, the tolerance stack threatens the socket, the test humbles the model. Two independent chains, one driver. When the chains agree, you can sign.",
      },
      {
        heading: "The test is part of the design",
        body: "The 0.61 mm measurement is not a postscript — it is a design input, planned when the requirement was written (W21's verification method) and budgeted when the instruments were chosen (W22). A design whose test was designed after the model is a design that was never going to learn anything. Plan the test with the requirement, not after the model.",
      },
    ],
    bench: "cappredict",
    prompt:
      "Lock your predictions for the reference design — aluminum tip deflection, balsa tip deflection, and the binding constraint. || Then face the chain's numbers, take the 0.61 mm measurement, and autopsy the disagreement: name the prime suspect.",
    note: "Section 4×6 mm, half-span 250 mm, 2.5 g gust on the 100 g glider. Locked predictions cannot be edited after reveal — that is the point.",
    checks: [
      {
        prompt: "The engineering cycle re-finds the binding constraint as stiffness because…",
        options: [
          "The materials block said so",
          "Strength margins clear 53× while balsa's 11.1 mm sag fails the 5 mm screen — the chain names the driver, twice",
          "Stiffness is always the driver",
          "The test measured it",
        ],
        answer: 1,
        why: "Two independent chains — the property chain and the decision chain — converge on the same driver. That convergence is what lets you sign, not any single week's verdict.",
      },
      {
        prompt: "The error budget says the next instrument dollar goes to…",
        options: [
          "The caliper — dimensions are cheap to measure well",
          "The load cell — the gust factor is the least certain input and owns the uncertainty",
          "More significant figures",
          "A nicer test fixture",
        ],
        answer: 1,
        why: "Leverage × sloppiness = priority. The gust factor is an estimate wearing a number; upgrading the instrument on the dominant link is the only upgrade that moves the total.",
      },
      {
        prompt: "The socket clearance stacks 0.25 mm worst-case against 0.20 mm available. For a flight part you…",
        options: [
          "Ship it — RSS passes",
          "Redesign or loosen — worst-case is the risk posture for flight hardware",
          "Average the methods",
          "Tighten everything",
        ],
        answer: 1,
        why: "The method you choose is the risk you accept. RSS is mercy; worst-case is Murphy's law as arithmetic. Flight hardware is staked on the severe one.",
      },
      {
        prompt: "The 0.61 mm measurement arrives. The design that ships is…",
        options: [
          "The original model — tests have noise",
          "The revised design, with the root modeled as a spring, margins re-checked, and all five sections on the page",
          "A stiffer spar — just add material",
          "Whatever the simulation says now",
        ],
        answer: 1,
        why: "The test is a design input. The mismatch is autopsied, one change is made for a stated reason, the touched margins are re-verified, and the package shows the full cycle. That is the deliverable.",
      },
    ],
  },
  {
    id: "capmastery",
    track: "engineering",
    index: 30,
    title: "The final gate",
    minutes: 45,
    lede: "Sit the 12-question closed-book check for the whole course: 70% to pass, and every missed full-cycle item gets a filed correction before you are done.",
    start:
      "Thirty weeks end the way engineering ends: a closed book, a fixed sitting, and a gate that does not negotiate. Twelve questions — four on the full cycle (requirement, model, test, mismatch, revision), four chaining the weeks' tools on one decision, four cross-cutting the course. || The gate is 70%. That is the floor, not the target: a 70% that includes a missed full-cycle item is not done until the correction is filed, because the cycle is the load-bearing skill of the course and a gap there is a gap in the structure. || The correction is not an apology. For each missed cycle item you write what the right reasoning was, where your reasoning left the cycle, and the one sentence you will carry forward — filed in writing, not just felt.",
    use: "One sitting, closed book, no bench open beside you. || Answer all twelve. Score at least 70%. For every missed full-cycle item, file the correction: the right reasoning, where yours left the cycle, the sentence you carry forward. || You are done when the gate passes and the corrections are filed. Then — and only then — the course is complete.",
    example:
      "Question: the measured deflection is 0.61 mm against a 0.46 mm prediction; first move? || The wrong answers are all tempting: recheck the arithmetic (checked twice), average the two (theology), rebuild stiffer (a patch). The cycle's answer: interrogate the assumption ledger — the root clamp is marked assumed, and adhesive compliance is the prime suspect. || The correction for missing it writes itself: 'I reached for the arithmetic; the cycle reaches for the ledger first. Assumptions before arithmetic.' That sentence is the deliverable of the miss.",
    ideas: [
      {
        heading: "70% is a floor with a condition",
        body: "The gate is 70% and every missed full-cycle item gets a filed correction. A 75% with a missed mismatch item is not done — the cycle is the load-bearing skill, and the correction is where the gap gets closed. The percentage measures coverage; the corrections measure whether the structure holds.",
      },
      {
        heading: "Closed book means owned",
        body: "No bench open beside you, no chain to copy from. If the cycle is real it is in your head: requirement before model, prediction before test, ledger before arithmetic, one change with one reason. The sitting tests whether the thirty weeks became a habit or stayed a reference.",
      },
      {
        heading: "The correction is the last lesson",
        body: "Writing what the right reasoning was, where yours left the cycle, and the sentence you carry forward — that is the course's final mechanism. Every engineer you admire has a private file of misses with sentences attached. This one is the start of yours.",
      },
    ],
    bench: "capreview",
    prompt:
      "Sit the 12-question closed-book check in one sitting. || Score at least 70% — and file a correction for every missed full-cycle item before the course closes.",
    note: "The check runs closed-book: answer from what you own. Corrections persist in this browser with the check.",
    checks: [
      {
        prompt: "The final gate requires…",
        options: [
          "70% and filed corrections for every missed full-cycle item",
          "100% — anything less is failure",
          "70% and nothing else",
          "Filing corrections instead of answering",
        ],
        answer: 0,
        why: "70% is the floor; the corrections close the structural gaps. A missed cycle item without a filed correction leaves the load-bearing skill unrepaired.",
      },
      {
        prompt: "A filed correction contains…",
        options: [
          "An apology and a promise",
          "The right reasoning, where yours left the cycle, and the sentence you carry forward",
          "The correct option letter",
          "A complaint about the question",
        ],
        answer: 1,
        why: "The correction is a mechanism, not a ritual: right reasoning, the exact departure point, the portable sentence. That is what makes the miss stop repeating.",
      },
      {
        prompt: "Closed book matters because…",
        options: [
          "It is harder",
          "It tests whether the cycle became a habit or stayed a reference",
          "Tradition",
          "Benches are unreliable",
        ],
        answer: 1,
        why: "Thirty weeks of tools are worthless if they only exist on the bench. The sitting checks ownership: requirement before model, prediction before test, ledger before arithmetic — from memory.",
      },
      {
        prompt: "You score 83% but missed two full-cycle items. You are…",
        options: [
          "Done — 83 clears 70",
          "Not done — file both corrections first",
          "Done if the misses were hard questions",
          "Not done — retake until 100%",
        ],
        answer: 1,
        why: "The gate has two conditions: 70% and corrections for every missed cycle item. The percentage passed; the structure still has two gaps. File them.",
      },
    ],
  },
];
