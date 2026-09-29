import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 29 — Safety, ethics & communication.
 * These three lessons close out the pre-capstone engineering run (indices 25–27).
 * Evidence due: design review memo (index 27 bench) + standards-reading
 * exercise (indices 25–26 bench).
 */
export const engineeringW29Lessons: Lesson[] = [
  {
    id: "safetyfactor",
    track: "engineering",
    index: 25,
    title: "Safety factors are ethics",
    minutes: 35,
    lede: "Read a factor of safety as a priced statement about uncertainty and consequence — not as a property of the steel — and choose one you can defend.",
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "example", heading: "Work one case" },
      { kind: "idea", idea: 0, label: "First idea" },
      { kind: "idea", idea: 1, label: "Second idea" },
      { kind: "idea", idea: 2, label: "Third idea" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "A factor of safety is not a universal material constant. It is part of the design basis. || Choose it from the applicable standard, uncertainty in loads and strength, inspection and maintenance assumptions, and the consequence of failure. FoS = capability / demand only has meaning when both terms are clearly defined. || Record where the chosen factor came from. An unexplained safety factor is difficult to review and easy to misuse.",
    use: "When you are about to size a part and the spreadsheet is asking for an allowable stress, or when a review asks why this number and not a smaller one. || Name the consequence class: low (property only), moderate (minor injury), high (serious injury), catastrophic (loss of life). Read the factor of safety off that class, adjusted for how well you know the loads and how often the part is inspected. Write the consequence class next to the number, every time. || Stop when the factor of safety, the consequence, and the inspection plan all appear on the same page. A bare number with no consequence attached is a guess, and no reviewer can check a guess.",
    example:
      "A tow-bar lug for a light trailer, demand 12 kN, material yield 250 MPa. || The consequence is moderate — the trailer has a safety chain, so a lug failure means a dropped hitch at low speed, not a runaway trailer; the loads are ordinary highway loads. The class says FoS 2.0. Allowable stress = 250 ÷ 2.0 = 125 MPa. Required area = 12,000 N ÷ 125 MPa = 96 mm². The designer picks 100 mm² and writes 'FoS 2.0, consequence moderate, inspected at each service' on the drawing. || The area is arithmetic. The 2.0 is the ethics: it says 'I do not trust my knowledge of pothole loads enough to bet a highway on 1.4.'",
    ideas: [
      {
        heading: "Define both capability and demand before quoting a factor of safety",
        body: "The capability side carries material scatter, manufacturing variation, and the strength model you chose. The demand side carries load scatter, misuse, and the environment. The factor of safety covers what you cannot see on either side. That is why a well-instrumented, well-inspected part honestly earns a smaller number than a guessed-at one.",
        formula: "FoS = capability / demand · margin of safety MS = FoS − 1",
      },
      {
        heading: "Safety factors reflect uncertainty and consequence, not just material choice",
        body: "Low consequence and well-known loads: 1.5. Moderate: 2.0. High with uncertain loads: 3.0. Catastrophic: 5.0. These are starting points, not verdicts: well-known loads plus scheduled inspection can justify less. An airliner wing carries lives at 1.5 ultimate because its loads are measured and its inspections are mandated. Nor are they material constants — the same alloy gets all four numbers depending on whose life is underneath it. When someone asks 'why 3?', the answer is the consequence class and the inspection plan, never 'that is what we always use.'",
        formula: "FoS ← consequence class × load knowledge × inspection",
      },
      {
        heading: "Document the source and approval for the chosen safety factor",
        body: "A factor of safety that appears in a calculation with no consequence class, no named loads, and no inspection plan is decoration. The review in lesson 3 will reject a package whose safety factors are orphans. Write the three lines: the number, the consequence it prices, and how you will know if reality disagrees.",
        formula: "a defensible FoS = number + consequence + watch plan",
      },
    ],
    bench: "standards",
    prompt:
      "Read the consequence-class table and assign the correct FoS to three scenarios. || Defend one assignment in writing: what consequence and what load knowledge drove it. || Persist and grade against the rubric.",
    note: "The table values are classroom-grade conventions, not a real code. Real codes (ASME, API, Eurocode) set their own numbers — the lesson is the reasoning that produces a number, not the number itself.",
    checks: [
      {
        prompt: "A crane hook and an airliner wing use factors of safety 5 and 1.5. What does the difference say?",
        options: [
          "The wing's loads and inspections are far better known, so less uncertainty needs covering",
          "The wing is made of stronger material",
          "Crane hooks are always badly designed",
          "The wing is less important if it fails",
        ],
        answer: 0,
        why: "The factor of safety covers uncertainty, not material quality. The wing earns the smaller number through measured loads and scheduled inspection; the hook pays the larger number for sloppy loads and rare inspection.",
      },
      {
        prompt: "A designer writes 'FoS = 2.0' with no consequence class, no loads named, and no inspection plan. The review should…",
        options: [
          "Reject it as indefensible — a bare number is not a safety factor",
          "Accept it — 2.0 is the standard number",
          "Double it to be safe",
          "Ignore it — numbers are the reviewer's job",
        ],
        answer: 0,
        why: "A factor of safety is number + consequence + watch plan. 2.0 with no stated reasoning is a guess, and no reviewer can check a guess.",
      },
      {
        prompt: "Which change honestly earns a smaller factor of safety?",
        options: [
          "Instrumenting the loads and scheduling inspections",
          "Switching to a higher-grade alloy with the same uncertainty",
          "Rounding the calculated stress down",
          "Using the same design on a heavier vehicle",
        ],
        answer: 0,
        why: "The factor of safety prices uncertainty. Better load knowledge and inspection genuinely reduce uncertainty. A stronger alloy with the same unknowns earns nothing — the number is about what you don't know, not what the material can take.",
      },
      {
        prompt: "Margin of safety MS = FoS − 1. A part has MS = 0.0. What does that mean?",
        options: [
          "Demand equals capability — the part is at its failure threshold with nothing left to cover uncertainty",
          "The part is infinitely safe",
          "The factor of safety is undefined",
          "The part has a 100% margin",
        ],
        answer: 0,
        why: "MS = 0 means FoS = 1: demand equals capability, so the part sits right at its failure threshold with nothing left for load scatter or model error. Any unmodeled load growth, and the part is over its line. It is not a failure yet, but there is nowhere to hide.",
      },
    ],
  },
  {
    id: "standards",
    track: "engineering",
    index: 26,
    title: "Codes, standards, and the paper trail",
    minutes: 35,
    lede: "Read a standard the way a reviewer does — scope, shall-statements, and evidence — and keep a paper trail that outlives your memory of the project.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "Codes and standards convert accumulated experience into explicit design and verification requirements. || Start with scope and applicability, then identify the normative requirements and referenced documents. In standards language, words such as shall, should, and may have different force, so read them carefully. || For every applicable requirement, identify the evidence that will show compliance. A clause without a verification plan is not yet integrated into the design.",
    use: "When a project says 'comply with' anything, or when you inherit a design and need to know what it was promised. || Read scope first — if your part is outside it, the standard does not apply and citing it is theater. Then list every shall that touches your part. For each shall, write the evidence: the test, the calculation, the inspection. || Stop when every shall has an evidence entry or an explicit waiver with a signature. A shall with no evidence is an unkept promise; the review in lesson 3 treats it as a finding.",
    example:
      "Tow-bar standard §4.2: 'The tow bar shall withstand three times the rated tow load without permanent deformation.' || That is one shall. The evidence: a pull test at 3× rated load, measured for permanent set — or a calculation traceable to a validated model, if the code allows analysis. The 'should be tested at room temperature' in the same paragraph is a should: advice, not a demand. Appendix A's fixture guidance is informative. || The compliance table has one row for the shall with the test report number, and nothing for the shoulds. Mixing them up — treating guidance as demand, or a shall as advice — is how designs fail audits.",
    ideas: [
      {
        heading: "Read requirement words according to the standard's definitions",
        body: "'Shall' is a demand: break it and the design does not comply. 'Should' is a recommendation: break it and you owe an explanation. 'May' is permission. Appendices and guidance are informative unless the shall points at them. Reading a standard is mostly the discipline of not promoting a should to a shall, or demoting a shall to a should.",
        formula: "shall = demand · should = recommendation · may = permission",
      },
      {
        heading: "Connect every applicable requirement to compliance evidence",
        body: "A shall without evidence is a wish with a citation. The compliance table is the standard's shadow: one row per shall, one column for the evidence (test report, calculation, inspection record). When the reviewer asks 'where is §4.2?', the answer is a document number, not a paragraph of reassurance.",
        formula: "compliance = Σ (shallᵢ × evidenceᵢ)",
      },
      {
        heading: "Keep the compliance record with the design",
        body: "You forget the project. The next engineer wasn't in the room. The drawing notes, the calculation references, the assumption ledger entries — that trail is what makes the design maintainable, auditable, and defensible in court. Documentation isn't overhead on the engineering; for the second owner of the design, it's what lets them pick it up and keep going.",
        formula: "design value = hardware + retrievable reasoning",
      },
    ],
    bench: "standards",
    prompt:
      "Classify claims as shall or not-a-shall from two standard excerpts. || Judge whether two compliance claims actually comply, and say why. || Persist and grade against the rubric.",
    note: "The excerpts are written for this course in the style of real standards. The skill — separating shall from should, and shall from evidence — transfers directly to ASME, API, ISO, and company codes.",
    checks: [
      {
        prompt: "A clause reads: 'The vessel shall be hydrotested at 1.5× design pressure. Testing should be witnessed by the inspector.' How many demands are in this clause?",
        options: [
          "One — the hydrotest is a shall; the witnessing is a should",
          "Two — both sentences are demands",
          "Zero — 'should' weakens the whole clause",
          "Three — the pressure, the factor, and the witnessing",
        ],
        answer: 0,
        why: "'Shall' makes the hydrotest a demand. 'Should' makes witnessing a recommendation — wise to follow, but not a compliance failure to skip with justification. Counting sentences instead of verbs is how audits go wrong.",
      },
      {
        prompt: "A designer cites a standard's appendix as the reason a design complies. The reviewer should ask…",
        options: [
          "'Which shall points at this appendix?' — appendices are informative unless a shall invokes them",
          "Nothing — appendices are always binding",
          "For the appendix to be rewritten as a shall",
          "Whether the appendix is printed on company letterhead",
        ],
        answer: 0,
        why: "Guidance becomes binding only when a shall-statement invokes it. An appendix cited on its own authority is commentary, not compliance.",
      },
      {
        prompt: "Why does the course insist every shall gets an evidence entry?",
        options: [
          "Because a shall without evidence is an unkept promise no one can check",
          "Because auditors enjoy paperwork",
          "Because standards require a specific form",
          "Because evidence makes the design stronger",
        ],
        answer: 0,
        why: "Evidence does not change the physics; it changes the checkability. A shall you cannot point evidence at is indistinguishable from a shall you ignored — and the review treats it as ignored.",
      },
      {
        prompt: "Your part falls outside the standard's scope section, but the standard is famous and your boss cites it. The honest move is…",
        options: [
          "Say so in writing: out of scope, so compliance claims are theater — then find what actually governs",
          "Claim compliance anyway for the audit",
          "Rewrite the scope section",
          "Ignore all standards on the project",
        ],
        answer: 0,
        why: "Scope is the standard's own statement of where it applies. Claiming compliance outside scope is theater that will collapse the first time a real failure asks what governed the design.",
      },
    ],
  },
  {
    id: "designreview",
    track: "engineering",
    index: 27,
    title: "The review and the signature",
    minutes: 40,
    lede: "Run a design review like an institution: find the findings, grade their severity, issue a verdict the findings support — and sign it.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "A design review is a structured attempt to find problems while they are still cheap to fix. || The presenter brings the evidence, reviewers challenge the design and assumptions, and the scribe records actionable findings. Grade findings by consequence and by whether they block release. || The final review verdict should follow from the unresolved findings, and the record should show who accepted that disposition.",
    use: "When a design is about to be built, bought, or flown — any point of no return. || The presenter walks the package: requirements, calculations, drawings, assumption ledger. Reviewers file findings against requirements and shalls, each with a severity and a location. The scribe keeps the list. The chair issues the verdict the open findings demand: any open critical is a rejection, any open major is conditional approval at best. || Stop when every finding is addressed or explicitly accepted as a risk with a signature, and the memo — what was reviewed, what was found, why this verdict — is written while the memory is fresh. A review with no written memo did not happen.",
    example:
      "The Week-29 bench hands you a tow-bar package: two sheets, three calculations. || You find six planted issues. The worst: one shear pin carries the full tow load — a single-point failure, severity critical, breaking the 'no single-point failure' requirement. A lug at FoS 1.4 against a 2.0 drawing note — major. No corrosion plan for saltwater service — major. A missing torque value — minor. Mixed units on one sheet — observation. An unstated fatigue-life assumption — major. || The verdict writes itself: open critical, so reject. The memo says what was reviewed, lists the six findings with severities, and states the conditions for re-review. You sign it. The signature is not a formality — it is the moment the review becomes yours.",
    ideas: [
      {
        heading: "Challenge the design and evidence, not the person presenting it",
        body: "Reviews die two ways: politeness that files no findings, and blame that files no second review because nobody brings a design anymore. The working rule is spoken out loud at the start: we are here to break the design while it is still paper. A finding is a gift — it is cheaper than the failure it names.",
        formula: "good review = findings filed + designers return",
      },
      {
        heading: "Finding severity should drive disposition and release decisions",
        body: "Critical: stop — someone could die or the mission is lost. Major: fix before proceeding as drawn. Minor: fix, but it does not gate. Observation: for the record. The verdict is not a vote and not a mood; it is arithmetic on the open findings. An open critical is a rejection no matter how much schedule pressure is in the room.",
        formula: "open critical → reject · open major → conditional · else → approve",
      },
      {
        heading: "Record who accepted the review verdict",
        body: "Hardware can be rebuilt; the memo is what proves the review happened and what it concluded. It names what was reviewed, what was found, and why the verdict follows from the findings. And it is signed — because an unsigned judgment belongs to no one, and a judgment that belongs to no one will be quietly ignored.",
        formula: "review = findings + verdict + signature",
      },
    ],
    bench: "designreview",
    prompt:
      "Review the seeded tow-bar package: flag the planted issues, grade each severity, and ignore the distractors. || Issue the verdict the open findings demand and write the memo. || Sign it, persist it, and grade it against the rubric.",
    note: "Six issues are planted across all four severities, plus three distractors that are not findings. The bench grades recall, severity accuracy, verdict logic, and memo completeness — the same four things a real review chair checks.",
    checks: [
      {
        prompt: "A review finds one open critical finding and the program is behind schedule. The correct verdict is…",
        options: [
          "Reject — an open critical is a rejection regardless of schedule pressure",
          "Approve-with-conditions to protect the schedule",
          "Approve — the finding can be fixed later",
          "Defer the verdict until the schedule recovers",
        ],
        answer: 0,
        why: "The verdict is arithmetic on the open findings, not a negotiation with the calendar. An open critical means the design, as drawn, can kill — schedule pressure is exactly when the rule matters most.",
      },
      {
        prompt: "During a review, the right question to ask about a design choice is…",
        options: [
          "'What breaks this?' — attack the design, never the designer",
          "'Who decided this?'",
          "'How long did this take to draw?'",
          "'Can we approve this today?'",
        ],
        answer: 0,
        why: "The review's job is to break the design while it is still paper. 'Who decided' turns the room into a trial, and then nobody brings a design to the next review.",
      },
      {
        prompt: "A review ends with a verbal 'looks good' and no written memo. What happened?",
        options: [
          "No review happened — without a memo there is no record of what was checked or concluded",
          "A fast, efficient review",
          "An approval with implicit conditions",
          "A review that can be reconstructed from memory later",
        ],
        answer: 0,
        why: "The memo is the product of the review: what was reviewed, what was found, why the verdict follows. Memory fades and people rotate; the unsigned, unwritten review evaporates.",
      },
      {
        prompt: "A finding reads: 'Torque value missing for the four M12 clamp bolts.' The right severity is…",
        options: [
          "Minor — it must be fixed, but it does not gate the verdict",
          "Critical — any missing value is critical",
          "Observation — bolts are standard parts",
          "Major — it blocks approval",
        ],
        answer: 0,
        why: "Severity is about consequence. A missing torque value is a real defect that must be fixed, but it does not threaten the mission or the verdict on its own — that is the definition of minor. Inflating severities trains the team to ignore them.",
      },
    ],
  },
];
