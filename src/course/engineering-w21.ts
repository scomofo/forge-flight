import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 21 — Requirements & design decisions.
 * These three lessons open the engineering track (indices 1–3). Evidence due:
 * requirements packet (lesson 1–2 bench) + assumption ledger (lesson 3 bench).
 */
export const engineeringW21Lessons: Lesson[] = [
  {
    id: "requirements",
    track: "engineering",
    index: 1,
    title: "Requirements that survive contact with reality",
    minutes: 35,
    lede: "Requirements are measurable demands — number, unit, pass/fail — written so a design can actually lose to them. Write them before you fall in love with a shape.",
    opening: { mode: "prose", heading: "A requirement has to be able to fail" },
    readFlow: [
      { kind: "aside", heading: "Quick test", body: "If two reasonable people could disagree about whether the requirement passed, it still needs work." },
      { kind: "idea", idea: 0, label: "Write the demand" },
      { kind: "example", heading: "Turn a vague need into a testable statement" },
      { kind: "idea", idea: 1, label: "Quality check" },
      { kind: "move", heading: "Write requirements before designing" },
      { kind: "idea", idea: 2, label: "Keep tradeoffs visible" },
    ],
    start:
      "A useful requirement has to be specific enough that a design can clearly pass or fail it. || Stakeholder needs often begin as words such as light, robust, quiet, or easy to use. Engineering turns those needs into measurable statements with a quantity, unit, condition, and acceptance limit. || Write the requirements before choosing the design. That makes tradeoffs visible and prevents the solution from quietly redefining the problem."
    use: "When the brief is still a mood and someone needs a spec, or when a design review needs a ground truth to argue against. || Convert each need into a requirement: subject, the verb 'shall', a number, a unit, and a pass/fail criterion. One demand per sentence — no 'and', no 'or'. Mark each one measurable, verifiable, and achievable, or rewrite it until it is. || Stop when every stakeholder need is either a requirement or explicitly discarded in writing. A requirement nobody can verify is a wish; wishes turn into arguments during the worst weeks of the project.",
    example:
      "A bike light brief says 'bright, long-lasting, light'. || You write: (1) 'The light shall output at least 400 lm in high mode.' (2) 'The light shall run at least 3 h in high mode from a full charge.' (3) 'The light shall have a mass of at most 150 g including mount.' Three sentences, three numbers, three ways to fail. || Run each through the quality checker: each names a number and a unit, each makes one demand, none hide behind 'bright'. A concept that weighs 200 g fails requirement 3 on day one — no debate, no taste involved.",
    ideas: [
      {
        heading: "Turn stakeholder needs into measurable requirements",
        body: "A stakeholder hands you a need: 'the phone shouldn't break'. That's a feeling, not a spec. Your job is to convert it into a demand a design can fail: 'the carrier shall hold the phone through a 1 m drop onto concrete with no visible cracking'. The conversion is the engineering — everything downstream, concepts, tests, arguments, stands on how honestly you did this step.",
        formula: "requirement = subject + 'shall' + number + unit + pass/fail",
      },
      {
        heading: "Good requirements are measurable, necessary, feasible, and unambiguous",
        body: "Measurable: a number plus the ruler (unit) — 'at least 400 lm', not 'bright'. Singular: one demand per sentence, because a compound sentence can half-pass. Unambiguous: no adjective doing the real work — 'robust' must be replaced by the number it stands for. Achievable and verifiable: if you cannot name the test that decides pass or fail, it is a wish, not a requirement.",
        formula: "shall · number · unit · one demand · one test",
      },
      {
        heading: "Write requirements before committing to a design",
        body: "Requirements first, concepts second. If you sketch first, the requirements become a description of the sketch — a defense of a shape you already chose. The design-loop bench scores concepts against weighted demands; this is where those demands come from, and why their weights are allowed to change in the open.",
        formula: "needs → requirements → concepts → tests",
      },
    ],
    bench: "reqpacket",
    prompt:
      "Fix the two flawed sample requirements until the checker goes quiet, then write two of your own. || Assign each requirement a verification method and say exactly how the check will run. || Persist the packet and grade it against the 5-item rubric.",
    note: "The checker grades sentence mechanics — measurability, singularity, form — not whether the requirement is the right one for the job. Judgment of the right requirement still belongs to you.",
    checks: [
      {
        prompt: "Which of these is a well-formed requirement?",
        options: [
          "The device shall draw at most 2.0 A from the 5 V rail.",
          "The device should be efficient and user-friendly.",
          "Make the device fast enough for daily use.",
          "The device shall be small and light and cheap.",
        ],
        answer: 0,
        why: "It names a subject, 'shall', a number, a unit, and a pass/fail line. The second hides behind 'efficient' and 'user-friendly' and says 'should' instead of 'shall'; the third is an instruction aimed at the reader; the fourth packs three demands into one sentence.",
      },
      {
        prompt: "A requirement reads 'shall survive drops'. The first thing wrong with it is…",
        options: [
          "It is not measurable — no drop height, surface, or pass criterion",
          "It uses 'shall' instead of 'must'",
          "It is too specific",
          "It names the test method too early",
        ],
        answer: 0,
        why: "Without a height, a surface, and what counts as survival, no test can return pass or fail. 'shall' vs 'must' is style; specificity is the point.",
      },
      {
        prompt: "Why must each requirement make exactly one demand?",
        options: [
          "So each one can pass or fail independently at verification",
          "So the document is shorter",
          "So there are fewer tests to run",
          "Because standards say so",
        ],
        answer: 0,
        why: "A compound requirement can half-pass — 'small and cheap' when it is small but not cheap — and then the team argues about what was agreed. One demand, one verdict.",
      },
      {
        prompt: "A stakeholder says 'the drone must be quiet'. Your best next move is…",
        options: [
          "Convert it: 'shall not exceed 65 dBA at 1 m hover' (or similar), and confirm the stakeholder accepts that number",
          "Write it down verbatim as a requirement",
          "Drop it — noise is not engineerable",
          "Promise 60 dBA without asking",
        ],
        answer: 0,
        why: "Your job is the conversion from mood to measurable demand — and the stakeholder must agree the number captures what they meant. Writing it verbatim preserves the ambiguity; promising a number alone skips their sign-off.",
      },
    ],
  },
  {
    id: "verifyvalidate",
    track: "engineering",
    index: 2,
    title: "Verification versus validation",
    minutes: 35,
    lede: "Verification asks 'did we build the thing right'; validation asks 'did we build the right thing'. Plan both from the requirements, and never let one stand in for the other.",
    start:
      "Verification and validation answer different questions. Verification asks whether the design meets its stated requirements. Validation asks whether those requirements produce something that actually meets the stakeholder's need. || Assign a verification method when the requirement is written: test, inspection, analysis, or demonstration. If you cannot say how a requirement will be checked, the requirement is not finished. || Validation usually needs realistic use or stakeholder feedback, because a perfectly verified design can still solve the wrong problem."
    use: "When you turn a requirements packet into a test plan, or when a review needs to see that nothing is unverified. || Build the verification matrix: one row per requirement, one column naming the method, and a second column saying exactly how — the rig, the instrument, the procedure number. Walk every row and ask: can this test return 'fail'? If the answer is no, the requirement (not the test) is broken. || Stop when every requirement has a method and a how, and at least one row of the matrix is a validation activity — a user trial, a system-level demo — that could falsify the whole packet.",
    example:
      "A USB charger. Requirement: 'the charger shall deliver 5.0 V ± 0.25 V at up to 3.0 A'. || Verification by test: bench supply load, electronic load stepping 0→3 A, calibrated voltmeter at the connector, record at 25 °C and 40 °C ambient. Requirement: 'the enclosure shall be black'. Verification by inspection: compare against the color standard under D65 light. || The first row can fail on the bench. The second fails by eyeball against a standard, not by opinion. And validation is separate: hand the charger to ten users and ask whether their phone charged by morning — the matrix never answers that, which is why you schedule it anyway.",
    ideas: [
      {
        heading: "Choose the verification method when you write the requirement",
        body: "Test is the heavyweight: exercise the article, measure the outcome. Inspection handles the visible: dimensions, markings, finish. Analysis handles the unbuildable: you cannot crash-test every bridge, so you calculate. Demonstration handles the behavioral: power it up and watch. The method is chosen with the requirement because some requirements are untestable — and an untestable requirement is a defect in the spec, discovered cheaply at the desk instead of expensively at the rig.",
        formula: "every requirement → one method + one how",
      },
      {
        heading: "Use a verification matrix to connect each requirement to evidence",
        body: "The verification matrix is a table, one row per requirement, and its completeness is checkable by a machine: no empty method cell, no empty how cell. A review reads the matrix, not your confidence. If a row says 'test' but the how is blank, you have a plan to test, not a test plan.",
        formula: "complete ⇔ ∀ requirement: method ∧ how",
      },
      {
        heading: "Validation can show that the requirement set was wrong",
        body: "Verification can pass 100% and the product still fails in the stakeholder's hands: a phone app that meets every line of its spec and still confuses the people who have to use it. So the plan always includes a validation activity that could kill the requirements themselves: a user trial, a system demo, a flight test. That row of the matrix is the one teams are most tempted to skip, because it can send the requirements back for a rewrite.",
      },
    ],
    bench: "reqpacket",
    prompt:
      "For each requirement in your packet, pick the verification method and write the how — rig, instrument, procedure. || Find one requirement whose method you cannot honestly name, and fix the requirement, not the method. || Re-grade the packet: the rubric demands a complete matrix.",
    note: "Verification methods are named by their standard meaning: test exercises and measures, inspection looks, analysis calculates, demonstration operates. The bench holds you to those definitions.",
    checks: [
      {
        prompt: "Verification and validation differ in that…",
        options: [
          "Verification checks the product against its requirements; validation checks the requirements against the stakeholder's real need",
          "Verification is done by engineers and validation by managers",
          "Verification happens first and validation is optional",
          "They are two words for the same activity",
        ],
        answer: 0,
        why: "The classic formulation: 'did we build the thing right?' versus 'did we build the right thing?'. A product can meet every line of its spec and still fail with its users — that passes the first and fails the second.",
      },
      {
        prompt: "'The bracket shall have a natural frequency above 200 Hz.' The cheapest honest verification method is…",
        options: [
          "Analysis — a modal calculation, since building and shaking every bracket is expensive",
          "Test — shake every bracket on a shaker table",
          "Inspection — look at it",
          "Demonstration — install it and listen",
        ],
        answer: 0,
        why: "Analysis is the method for the unbuildable-at-scale: a finite-element modal run verifies the number. Test is possible but wasteful per unit; inspection cannot see a frequency; demonstration is not a measurement.",
      },
      {
        prompt: "A verification matrix row names the method 'test' but the 'how' cell is blank. That row is…",
        options: [
          "Incomplete — a plan to test is not a test plan",
          "Fine — the method is what matters",
          "A validation row",
          "Ready for sign-off",
        ],
        answer: 0,
        why: "Without the rig, instrument, and procedure, nobody can run the test or reproduce its verdict. The matrix is complete only when method and how are both filled.",
      },
      {
        prompt: "You discover a requirement that no method can verify — 'the device shall feel premium'. You should…",
        options: [
          "Fix the requirement — convert 'premium' into measurable attributes the stakeholder accepts",
          "Assign it 'inspection' and move on",
          "Delete all subjective requirements on sight",
          "Verify it by demonstration with the team",
        ],
        answer: 0,
        why: "Untestable requirements are defects in the spec, not the test plan. Convert the mood into numbers (surface finish, gap tolerances, weight) or admit it is not a requirement. Inspection-by-opinion just relocates the ambiguity.",
      },
    ],
  },
  {
    id: "ledger",
    track: "engineering",
    index: 3,
    title: "The assumption ledger",
    minutes: 35,
    lede: "Every number in your design carries its provenance, its confidence, and the date it stops being an assumption. The ledger keeps them all where you can see them.",
    start:
      "Engineering work is full of assumptions: loads, material properties, interface conventions, environmental conditions, and estimates that are being used before they are fully verified. || An assumption ledger records the claim, where it came from, how confident you are, and what evidence would resolve it. Low-confidence assumptions with weak provenance deserve attention early. || The same record also helps explain later decisions: what was believed at the time, why the design choice followed, and whether the assumption was eventually confirmed."
    use: "From the first number you borrow, through every design review, to the post-mortem. || Write every borrowed number down: the claim, where it came from, how much you trust it, and what test or document would close it. Review the ledger like a punch list — resolve entries by testing or citing the source, and promote the stubborn open ones into risks. || Stop when every load, material property, and interface constant in your analysis traces to a ledger entry — and every open low-confidence entry has a named owner and a date.",
    example:
      "The Orbiter's small-forces file, ledgered honestly: Entry A-1 — 'Trajectory software expects impulse in newton-seconds.' Provenance: interface spec §4.2. Confidence: high. Resolved: yes, both teams signed the page. Entry A-2 — 'Subcontractor delivers telemetry in pound-force seconds; conversion handled.' Provenance: (empty). Confidence: low. Resolved: no. || One glance at the ledger shows the mission's riskiest line. The fix wasn't a cleverer calculation; it was filling in A-2's provenance cell and getting a signature. || The ledger can't prevent assumptions. It makes them visible — and the invisible ones are what kill spacecraft.",
    ideas: [
      {
        heading: "Record the source behind important assumptions and inputs",
        body: "A number without a source is a rumor. Material strength from a datasheet, a load from a similar program, a conversion factor from an email — each gets a ledger entry with the source named. When the number is wrong, provenance tells you who else used it and where the fix propagates. When the number is right, provenance is what lets the next engineer reuse it safely.",
        formula: "claim + source + confidence → resolved or owned",
      },
      {
        heading: "Low-confidence assumptions should drive verification work",
        body: "Low confidence is normal; low confidence with no owner and no date is a risk nobody's managing. Give every entry an owner and a resolution date — the test that will close it, and when. The ledger's statistics — resolution rate, open low-confidence count — show whether the team is resolving things or just writing them down.",
        formula: "low confidence + no owner = risk",
      },
      {
        heading: "Keep the ledger as part of the decision history",
        body: "Design decisions are made under uncertainty and revisited under pressure. The ledger records what you knew, when you knew it, and what you assumed — so a future review can tell 'we decided with the data we had' from 'we never checked'.",
      },
    ],
    bench: "ledger",
    prompt:
      "Open the sample ledger and find the entry that killed the Orbiter. || Add three entries for your own packet's borrowed numbers — loads, properties, interface constants. || Close what you can cite, own what you cannot, and watch the risk count.",
    note: "The ledger tracks claims, not tasks. A claim is resolved when evidence replaces belief: a test result, a cited document, a signed interface — never when you feel better about it.",
    checks: [
      {
        prompt: "The core purpose of an assumption ledger is…",
        options: [
          "To make every borrowed number visible, with its provenance and confidence, so no assumption is invisible",
          "To list all the tasks remaining on the project",
          "To document who is to blame when things fail",
          "To replace testing with paperwork",
        ],
        answer: 0,
        why: "Assumptions are inevitable; invisible assumptions are the dangerous kind. The ledger is a visibility tool, not a task list or a blame record — and it drives testing, it never replaces it.",
      },
      {
        prompt: "A ledger entry claims 'bracket load is 500 N', provenance is empty, confidence is low, and it is unresolved. This entry is…",
        options: [
          "High risk — a low-confidence assumption nobody owns is a risk in disguise",
          "Fine — most early numbers look like this",
          "Resolved — 500 N is a round, sensible number",
          "A verification activity",
        ],
        answer: 0,
        why: "Empty provenance plus low confidence plus unresolved is the Orbiter's A-2 pattern. Give it an owner and a resolution date — a round number is not a resolution.",
      },
      {
        prompt: "When is a ledger entry resolved?",
        options: [
          "When evidence replaces belief — a test result, a cited document, a signed interface",
          "When the engineer feels confident about it",
          "At the design review, automatically",
          "When the project manager approves the schedule",
        ],
        answer: 0,
        why: "Resolution is evidentiary: a measurement, a document, a signature. Feeling better is not evidence, and reviews do not resolve entries by agenda.",
      },
      {
        prompt: "Six months later someone asks why the bracket is aluminum. The ledger answers…",
        options: [
          "Which requirement, which analysis, and which assumptions the choice rested on — and whether they are resolved",
          "Nothing — the ledger is discarded after the review",
          "Only the material cost at the time",
          "The name of the engineer who chose it",
        ],
        answer: 0,
        why: "The ledger is the decision record: it preserves the chain from requirement through analysis and assumption to choice, including the confidence each link carried. That is how engineering consequences stay ownable.",
      },
    ],
  },
];
