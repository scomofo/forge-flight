import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 23 — Loads, margins & failure modes.
 * These three lessons are engineering-track indices 7–9. Evidence due:
 * load-path sketch + margin table (lesson 1–2 bench) and an FMEA
 * (lesson 3 bench).
 */
export const engineeringW23Lessons: Lesson[] = [
  {
    id: "loadpath",
    track: "engineering",
    index: 7,
    title: "Follow the load",
    minutes: 35,
    lede: "Trace a force from where it enters a structure to where it leaves, name every member that carries it, and don't design a part until you can draw its load path.",
    start:
      "A load path is the route a force takes through the structure to the supports and ultimately to ground. || Trace that route through every member and interface before sizing individual parts. If the geometry or connection detail changes, the load path may change too, even when the applied external load stays the same. || The useful question at every interface is simple: where does the force go next, and what local part has to carry it?"
    use: "When you are sizing anything that carries force — a bolt, a bracket, a spar, a joint — or when a failure, a repair, or a design change touches a structure. || Sketch the boundary of your part, mark every place force enters and leaves, and list the members in order from entry to exit. For each interface ask: what is the load here, and what was this interface sized for? || Stop when the path is a single unbroken chain to ground and every link has a named load. A path with a gap means some load has no assigned carrier.",
    example:
      "A glider tow hook rated for a 2 kN release load. || You trace: tow rope (2 kN tension) → release hook → lug (2 kN through the pin hole) → two bracket bolts (1 kN shear each) → fuselage frame → longerons to the wing. The path is unbroken and every link sees a known 2 kN or less. || The lug was sized for 2 kN through the hole — check bearing stress against the allowable. The bolts were sized for 1 kN each — check shear. Nobody sizes anything until the list exists — the list tells you what to size.",
    ideas: [
      {
        heading: "Trace the load continuously through the structure",
        body: "Between the point where a load enters and the ground where it leaves, every newton passes through real material. Draw the chain — rope, hook, lug, bracket, frame — and you have the map of everything that must be strong. A member that is not on the map gets no strength budget; a load that is not on the map gets no member at all.",
        formula: "entry → members in order → exit (ground)",
      },
      {
        heading: "Check every interface in the load path",
        body: "Members rarely fail mid-span. They fail at pins, bolts, welds, and every other interface — because the interface is where the load changes hands and where design changes land. When a fabrication shop 'simplifies' a connection, it rewrites the load path. Trace the path again after every change, however minor it looks.",
        formula: "changed interface ⇒ re-traced path",
      },
      {
        heading: "Use free-body diagrams at assembly scale",
        body: "A free-body diagram cuts one part free and lists every force on it. A load path does the same for the whole assembly: cut the structure into members, balance each one, and the reactions of one become the loads of the next. The discipline is identical; only the boundary is bigger.",
        formula: "ΣF = 0 at every link, in order",
      },
    ],
    bench: "loadpath",
    prompt:
      "Order the five load-path stages for the tow-hook lug from load entry to ground. || Fill the four-line margin table: applied and allowable for limit tension, limit bending, ultimate tension, and bearing — the bench computes FoS, MS, and the verdict. || Persist the sketch and table, then grade them against the rubric.",
    note: "The bench grades the arithmetic of your table — FoS, margin, verdicts — not whether you chose the right load cases. Choosing the load cases is the engineering, and it stays yours.",
    checks: [
      {
        prompt: "The Hyatt Regency walkways failed because…",
        options: [
          "A connection change rerouted both decks' load through one nut nobody had sized for it",
          "The steel rods were undersized for the design load",
          "The concrete deck was too heavy for the rods",
          "Corrosion weakened the rods over time",
        ],
        answer: 0,
        why: "The members were fine for the load they were drawn for. The fabricator's change rerouted the upper walkway's load through the lower walkway's box beam — a load path nobody re-traced.",
      },
      {
        prompt: "The first step in sizing a bracket is…",
        options: [
          "Tracing the complete load path from entry to ground",
          "Picking the material",
          "Running a finite-element model",
          "Choosing the bolt diameter",
        ],
        answer: 0,
        why: "Material, models, and bolts all serve the path. Sizing before tracing is precision spent on the wrong member — or on a member that never sees the load.",
      },
      {
        prompt: "Force flows through a structure along…",
        options: [
          "The stiffest available route, member by member to ground",
          "The shortest geometric route regardless of stiffness",
          "The route the designer intended, always",
          "Only the members drawn in the detail view",
        ],
        answer: 0,
        why: "Force follows stiffness, not intent. If a stiff unintended member sits beside the intended path, it picks up load — which is exactly how 'simplified' connections create surprises.",
      },
      {
        prompt: "A load path with a gap in it is…",
        options: [
          "Not a design — some load has no member assigned to carry it",
          "Fine, as long as the members are strong",
          "A reason to raise the factor of safety",
          "Only a problem for dynamic loads",
        ],
        answer: 0,
        why: "A gap means a force with no assigned carrier. Stronger members elsewhere cannot carry a load that has no path to them. Close the gap first.",
      },
    ],
  },
  {
    id: "margins",
    track: "engineering",
    index: 8,
    title: "Margins are priced insurance",
    minutes: 35,
    lede: "Factor of safety and margin of safety: compute them from applied and allowable loads, keep limit and ultimate loads distinct, and read a margin table the way a reviewer does — worst line first.",
    start:
      "Margins compare available capability with applied demand. They are only meaningful when the load case, allowable, and failure mode are clearly defined. || Factor of safety is capability divided by demand. Margin of safety is FoS − 1. In regulated fields, limit and ultimate loads may also have precise definitions that come from the applicable standard. || Build a margin table across the relevant load cases and failure modes. The governing line is the smallest acceptable margin, not the average."
    use: "When a part is sized, or when you inherit a part and must decide whether it is good enough. || For each governing load case: applied (the honest worst the part sees), allowable (yield for the limit row, ultimate strength for the ultimate row), FoS = allowable/applied, MS = FoS − 1. Keep limit and ultimate in separate rows — different allowables, different factors. || Stop when every row has MS ≥ 0 and the thinnest rows are the ones you understand best. A negative margin anywhere means a redesign.",
    example:
      "A tow-hook lug: 100 mm² cross-section, limit load 12 kN in tension. || Applied limit stress = 12 000 N / 100 mm² = 120 MPa. 6061-T6 yields at 276 MPa, and limit load must not yield, so FoS = 276/120 = 2.30, MS = 1.30. Ultimate load = 12 × 1.5 = 18 kN, applied 180 MPa against the 310 MPa ultimate strength: FoS = 1.72, MS = 0.72. || The ultimate row governs with MS 0.72: the 1.5 factor raised the load more than the step from 276 to 310 MPa raised the allowable. It passes. A reviewer reads the worst line first; yours is fine.",
    ideas: [
      {
        heading: "Keep factor of safety and margin of safety distinct",
        body: "FoS = allowable / applied tells you how many times over the part is. MS = FoS − 1 tells you the spare capacity as a fraction. MS = 0 means the design exactly consumes the allowable; MS < 0 means it fails the case. Report margins: a margin of 0.72 says 'seventy-two percent spare' in a way a factor of 1.72 doesn't.",
        formula: "FoS = allowable / applied;  MS = FoS − 1",
      },
      {
        heading: "Limit is 'must not bend'; ultimate is 'must not break'",
        body: "Limit load is the worst service expectation: the structure carries it with no permanent deformation. Ultimate is limit times the factor — 1.5 in aircraft practice — and the structure must not fracture under it. They are different rows with different allowables: yield governs the limit row, ultimate strength governs the ultimate row.",
        formula: "ultimate = 1.5 × limit  (aircraft convention)",
      },
      {
        heading: "The lowest margin controls the design",
        body: "A margin table with ten rows at MS 0.8 and one row at MS −0.02 is a failed design with a good average. Reviewers read the minimum, not the mean. When you add margin, add it to the governing line — thickening a member that is already at MS 1.2 buys nothing.",
        formula: "table verdict = min over rows of MS",
      },
    ],
    bench: "loadpath",
    prompt:
      "Take the tow-hook margin table to completion: four load cases, applied and allowable per case, computed FoS/MS/verdicts. || Find the governing line and say whether it is the case you understand best. || Persist the table and grade it against the rubric.",
    note: "The bench checks your arithmetic against the machine's — FoS, MS, and verdicts from your applied/allowable entries. It cannot check that your applied loads are honest. That check is the reviewer's, and eventually the test rig's.",
    checks: [
      {
        prompt: "Allowable 200 MPa, applied 160 MPa. FoS and MS are…",
        options: [
          "FoS 1.25, MS 0.25",
          "FoS 0.80, MS −0.20",
          "FoS 1.25, MS 1.25",
          "FoS 40, MS 39",
        ],
        answer: 0,
        why: "FoS = 200/160 = 1.25. MS = FoS − 1 = 0.25 — twenty-five percent spare capacity.",
      },
      {
        prompt: "Limit load 8 kN, ultimate factor 1.5. The ultimate load is…",
        options: ["12 kN", "8 kN", "5.3 kN", "9.5 kN"],
        answer: 0,
        why: "Ultimate = limit × factor = 8 × 1.5 = 12 kN. The structure must not break at 12 kN, and must not permanently deform at 8 kN.",
      },
      {
        prompt: "A margin table shows MS values of 0.8, 0.5, and −0.02. The design…",
        options: [
          "Fails — one negative margin anywhere is a redesign",
          "Passes — the average margin is healthy",
          "Passes — the negative row is only 2% over",
          "Needs a higher ultimate factor on the good rows",
        ],
        answer: 0,
        why: "The table's verdict is its minimum. A negative margin means that load case exceeds the allowable — no averaging, no rounding away.",
      },
      {
        prompt: "Why does margin cost mass and money?",
        options: [
          "Spare capacity means more material or a stronger alloy than the bare minimum",
          "Factors of safety require expensive testing",
          "Margins are only legal in certified aircraft",
          "Thin margins need cheaper materials",
        ],
        answer: 0,
        why: "Margin is physical: a part at MS 0.5 carries 50% more structure than the minimum that would just pass. That material has mass and cost, so margin is bought — deliberately, and unevenly.",
      },
    ],
  },
  {
    id: "fmea",
    track: "engineering",
    index: 9,
    title: "Design against what you fear",
    minutes: 35,
    lede: "Run a failure-modes-and-effects analysis: list how each part can fail, score severity, occurrence, and detection, and spend your design effort where the risk priority number is highest.",
    start:
      "FMEA is a structured way to identify failure modes before the design is frozen. || For each mode, record the effect, likely cause, severity, occurrence, and detection rating. The risk-priority number S × O × D can help organize attention, but the individual severity rating still matters even when the product is not the largest. || The real value is the mitigation record: what change reduces the risk, who owns it, and what the new ratings look like after the change."
    use: "When a subsystem's design is taking shape and the failure modes are still cheap to prevent — never after the tooling is cut. || List the functions, then for each: how can it fail, what happens, why. Score severity, occurrence, detection 1–10; compute RPN = S·O·D. Attack the highest RPNs with mitigations that lower occurrence (redundancy, derating) or improve detection (tests, inspections, sensors). || Stop when the top RPNs are acceptable and every mitigation has an owner. A row with no mitigation is a risk the team has chosen to accept — write that choice down.",
    example:
      "The glider tow release: failure mode 'fails to release under load'. || Effect: the glider cannot separate from the tow plane — severity 9. Cause: spring corrosion after a wet season — occurrence 3. Detection: the preflight pull-test would probably catch a weak spring, detection 5. RPN = 9 × 3 × 5 = 135. || Mitigation: a redundant release spring and a documented spring-replacement interval, plus a load-cell release check at each annual inspection — occurrence drops to 1, detection to 2. New RPN = 9 × 1 × 2 = 18. The delta of 117 is the case for the second spring, in numbers.",
    ideas: [
      {
        heading: "Use severity, occurrence, and detection to structure the risk discussion",
        body: "Three 1–10 scores multiply into a risk priority number up to 1000. Severity is the effect's gravity — a 10 is loss of life or the mission. Occurrence is the cause's likelihood. Detection is your chance to catch it first, and note the inversion: 10 means it will slip through unseen. Multiply, rank, attack the top.",
        formula: "RPN = S × O × D  (1–10 each, higher is worse)",
      },
      {
        heading: "Mitigate by occurrence or detection",
        body: "Severity is usually fixed — physics decides how bad the effect is. So you buy risk down two ways: make the cause rarer (redundancy, derating, better materials) or make the failure easier to catch (tests, inspections, sensors, interlocks). Recompute the RPN after each mitigation; the delta proves the change earned its cost.",
        formula: "ΔRPN = RPN_before − RPN_after",
      },
      {
        heading: "The mitigation record matters more than the score alone",
        body: "An FMEA's value is the conversation it forces: naming the failure mode the team was politely not mentioning, while the drawing can still change. Run it early, keep it alive through design changes, and treat a row with no mitigation as an accepted risk with its name written down — not a row you forgot.",
        formula: "unmitigated row = accepted risk, in writing",
      },
    ],
    bench: "fmea",
    prompt:
      "Pick the tow-release subsystem and complete three failure-mode rows: mode, effect, cause, S/O/D, mitigation, and the after-scores. || Rank by RPN, attack the top row, and show the delta. || Persist the FMEA and grade it against the rubric.",
    note: "The bench multiplies your scores and ranks your rows — it cannot tell you whether your severity 9 should have been a 10. Calibration of the scores is judgment, and it stays yours.",
    checks: [
      {
        prompt: "Severity 9, occurrence 3, detection 5. The RPN is…",
        options: ["135", "17", "27", "45"],
        answer: 0,
        why: "RPN = 9 × 3 × 5 = 135. High severity with middling occurrence and detection — exactly the profile that deserves a mitigation.",
      },
      {
        prompt: "In FMEA scoring, a detection score of 10 means…",
        options: [
          "The failure will almost certainly slip through undetected",
          "Detection is guaranteed",
          "The failure is detected ten times",
          "The design has ten sensors",
        ],
        answer: 0,
        why: "The detection scale is inverted: 10 means you will not catch it before it matters. Low detection capability raises the RPN — which is why adding a test or inspection lowers risk.",
      },
      {
        prompt: "Which mitigation lowers an RPN?",
        options: [
          "Adding a redundant release spring (lowers occurrence)",
          "Painting the part red",
          "Writing a longer description of the failure",
          "Raising the severity score",
        ],
        answer: 0,
        why: "Only changes to occurrence or detection move the RPN — severity is set by physics. Redundancy makes the cause rarer; the other options change nothing the arithmetic sees.",
      },
      {
        prompt: "The most important time to run an FMEA is…",
        options: [
          "Before the design freezes, while changes are cheap",
          "After production starts, to document what shipped",
          "During the accident investigation",
          "Only when a regulator requires it",
        ],
        answer: 0,
        why: "An FMEA's product is a design change, and changes are cheap only before tooling is cut and parts are ordered. Run it then.",
      },
    ],
  },
];
