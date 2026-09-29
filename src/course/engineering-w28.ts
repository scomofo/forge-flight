import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 28 — Iteration & optimization.
 * These three lessons are engineering-track indices 22–24. Evidence due:
 * a trade study with documented convergence.
 *
 * The week's argument: decisions are comparisons, comparisons need numbers,
 * numbers need sweeps, and sweeps need a stopping rule you wrote down
 * before you started.
 */
export const engineeringW28Lessons: Lesson[] = [
  {
    id: "tradestudy",
    track: "engineering",
    index: 22,
    title: "Trade studies: comparison, kept honest",
    minutes: 40,
    lede: "Compare design alternatives against explicit, weighted criteria, find the dominated ones you can reject without argument, and learn how much the weights can move before the winner changes.",
    start:
      "In 1961–62, NASA had to decide how to get astronauts to the Moon and back. One option: build the whole lander to carry everything (direct ascent, simple mission, enormous rocket). Another: split the ship, leave the heavy descent stage behind (lunar orbit rendezvous, complex mission, much smaller rocket). The debate was fierce and tribal — until the numbers were laid out side by side: mass to the Moon, development risk, schedule. Laid out that way, lunar orbit rendezvous won on the numbers, not on volume of argument. || A trade study is that comparison made formal: a set of alternatives, a set of criteria, each criterion weighted by how much it matters, each alternative scored on each criterion. The score is a sum of weighted, normalized ratings. Normalization matters because raw numbers lie — grams and dollars and days do not share a scale — so each criterion is stretched to 0..1 between the worst and best observed, and the best observed gets 1. || You do it this way because the alternative is the corridor argument, where the loudest engineer wins. A written trade study lets the winner change when the weights change, in the open, which is the only way a team can disagree productively about what matters.",
    use: "When you have two or more real candidates and must pick one — materials, concepts, processes, suppliers — and someone (including future you) will ask why the loser lost. || List the alternatives, fix the criteria with a direction (more is better, or less), score every alternative on every criterion from data or honest estimates, normalize each criterion 0..1, weight by importance, and rank. Then check for dominance: if an alternative is at least as good on everything and better on something, it dominates — the dominated one is rejected without touching the weights. || Stop when the winner is robust: nudge the weights and see how far they move before the ranking flips. If one weight twitching flips the winner, the study is telling you the decision isn't settled — defend the weights in writing or admit the study doesn't discriminate.",
    example:
      "A tow-hook bracket for the glider: CNC aluminum (the incumbent, flown last season), CFRP layup, printed nylon, steel weldment — scored on mass (less is better), cost (less), stiffness (more), lead time (less), confidence (more). || Masses run 45 to 160 g, so printed nylon's 60 g normalizes to 0.87 while steel's 160 g normalizes to 0; costs 25 to 220 dollars, nylon's 25 normalizes to a full 1. Weighted 0.30 / 0.25 / 0.20 / 0.15 / 0.10, the totals are nylon 0.694, aluminum 0.632, steel 0.505, CFRP 0.500. || Nylon wins — not because it is the best material, but because the brief rewards cheap and fast and light, and nylon is the best at cheap and fast. Change the brief (weight stiffness at 0.5) and the winner changes, in the open — which is the point of running it this way.",
    ideas: [
      {
        heading: "Normalize before you weigh",
        body: "A gram, a dollar, and a day are not commensurable, so raw scores cannot be summed. Min-max normalization maps each criterion's observed range to 0..1 — best observed becomes 1, worst becomes 0, direction decided by whether more or less is better. Only normalized scores may be weighted and added; everything else is numerology.",
        formula: "score_i = (worst − x_i)/(worst − best)  (min direction)",
      },
      {
        heading: "Dominance is a free rejection",
        body: "If alternative A is at least as good as B on every criterion and strictly better on at least one, A dominates B — and B is rejected regardless of the weights. No argument about values can save a dominated option. Check for dominance first; it shortens the study and removes the options nobody can defend.",
        formula: "A ≥ B on all, A > B on one ⇒ B is out",
      },
      {
        heading: "The baseline gets no home-field advantage",
        body: "The incumbent design — 'what we did last time' — always scores well on confidence and lead time, because it exists. That is real information, not bias, so it earns its scores honestly on those criteria and takes its lumps on mass, cost, or performance. Score the baseline on the same scale as everything else; a study that protects the incumbent isn't a comparison at all — it's a justification for a decision it already made.",
        formula: "same scale, same normalization, no protected rows",
      },
    ],
    bench: "tradestudy",
    prompt:
      "Run the tow-hook bracket trade study: set the five criterion weights with the sliders. || Read the normalized scores, the ranking, the dominance verdict, and how far each weight can move before the winner flips — then push confidence's weight until nylon falls and say what that tells you. || Persist the study as a decision record with the winner, the rejects, and the weight that would flip it.",
    note: "The bench grades the arithmetic of the study — normalization, totals, dominance — not whether your scores were honest. Honest scoring is the engineering; the bench checks that the machinery is sound.",
    checks: [
      {
        prompt: "Why must criterion scores be normalized before weighting?",
        options: [
          "Raw units (grams, dollars, days) are not commensurable, so raw scores cannot be summed meaningfully",
          "Normalization makes every alternative score 1",
          "Weights only work on integers",
          "The spreadsheet requires it",
        ],
        answer: 0,
        why: "A sum of grams and dollars is meaningless. Min-max normalization puts every criterion on a 0..1 scale (best observed → 1), so the weighted sum compares like with like.",
      },
      {
        prompt: "Alternative A dominates alternative B when…",
        options: [
          "A is at least as good on every criterion and strictly better on at least one",
          "A has the highest total score",
          "A is cheaper than B",
          "A was scored by the senior engineer",
        ],
        answer: 0,
        why: "Dominance is weight-independent: no possible weighting can rescue B, so B is rejected before weights are even discussed. A high total under one weighting is not dominance.",
      },
      {
        prompt: "The incumbent design should be scored…",
        options: [
          "On the same criteria and scale as every other alternative",
          "With a bonus for being proven",
          "Only on cost, since it already exists",
          "Last, after the winner is picked",
        ],
        answer: 0,
        why: "The incumbent's real advantages (confidence, lead time) earn scores on those criteria like everything else. A protected row makes the study a justification, not a comparison.",
      },
      {
        prompt: "A winner that flips when one weight twitches is…",
        options: [
          "Not a decision yet — the study is telling you the ranking is fragile and the weights need justification",
          "The correct answer, because weights are exact",
          "Proof the criteria are wrong",
          "A sign to add more alternatives",
        ],
        answer: 0,
        why: "Weights are judgments, not measurements. If a small change in one judgment flips the outcome, you must either defend that judgment in writing or admit the study does not discriminate — both honest, both useful.",
      },
    ],
  },
  {
    id: "paramsweep",
    track: "engineering",
    index: 23,
    title: "Parametric sweeps: vary one thing",
    minutes: 40,
    lede: "Sweep one design variable across its range, read the response curve for optima and cliffs, and know exactly what one-at-a-time sweeping cannot see.",
    start:
      "A wind-tunnel engineer testing a wing does not change the angle of attack, the flap setting, and the airspeed all at once — because when the lift changes, she needs to know which knob did it. She holds everything fixed, walks one variable across its range, and plots the response. That is a parametric sweep, and it is the cheapest experiment in engineering: one variable moves, everything else is frozen, and the curve tells the story. || The curve you get back has a vocabulary. Where it bottoms out is an optimum; where it bends hardest is a knee, often the good-enough point; where it jumps is a cliff — a discontinuity where the physics changed regime, like a beam that buckles or a flow that separates. You read the sweep for all three before you touch the design. || Sweeping is honest only about one variable at a time. Variables interact — the best flap setting depends on the angle of attack — and a one-at-a-time sweep is blind to interactions. So you sweep to find the neighborhood, then probe the interactions around it, and you say so in the write-up.",
    use: "When one variable dominates the design — depth of a beam, diameter of a shaft, thickness of a panel — and you need the response curve, not a single answer. || Freeze every other input, step the variable across its full plausible range in equal steps, compute the response at each step, and plot response versus variable. Mark pass/fail against the requirement and read the curve: optimum, knee, cliff. || Stop sweeping when the curve's story is stable — more points just redraw the same curve. The sweep's job is the shape of the answer, not its sixth decimal.",
    example:
      "A 1 m aluminum cantilever carrying 200 N at its tip must deflect no more than 2 mm; beam depth is the variable, width fixed at 40 mm. || Sweeping depth from 20 to 80 mm: at 20 mm the tip sags 35.7 mm; at 40 mm, 4.46 mm; at 52 mm, 2.03 mm — still failing; at 53 mm, 1.92 mm — passing. Mass rises linearly with depth, so the smallest passing depth wins: 53 mm at 5.72 kg. || The curve is an inverse cube — deflection falls as 1/h³ — which is why the first millimeters of added depth buy enormously and the last buy almost nothing. The sweep shows where each millimeter stops paying for itself.",
    ideas: [
      {
        heading: "Read the curve's vocabulary",
        body: "A sweep returns a curve, and curves have three features that matter: the optimum (the bottom of the bowl, if there is one), the knee (where the slope collapses and extra input stops buying much output), and the cliff (a discontinuity where the regime changes — buckling, separation, yielding). Find all three before you pick a design point; the requirement usually picks it for you.",
        formula: "response = f(one variable); read: optimum, knee, cliff",
      },
      {
        heading: "One at a time is a lens, not the world",
        body: "Freezing everything else is what makes a sweep readable — and what makes it blind. If two variables interact, the optimum of one depends on the setting of the other, and a one-at-a-time sweep can walk straight past the true optimum. Sweep to find the neighborhood, then vary the suspect pair together around it. The write-up names which interactions were checked and which were assumed absent.",
        formula: "sweep ⇒ neighborhood; interaction check ⇒ the point",
      },
      {
        heading: "The step size is a decision",
        body: "Too coarse and you step over the knee or the cliff; too fine and you compute a hundred points that all say the same thing. Refine around the interesting region — the pass/fail boundary, the knee — and leave the boring regions coarse. A good sweep spends its points where the curve is changing, not where it is flat.",
        formula: "refine where |slope| is large or the requirement bites",
      },
    ],
    bench: "sweepconv",
    prompt:
      "Sweep the cantilever's depth from 20 to 80 mm and watch deflection and mass. || Step the resolution finer around the pass/fail boundary until the minimal passing whole-mm depth is pinned — the bench tracks your iteration history. || Declare the stopping point: the depth, the deflection, the mass, and why further refinement buys nothing.",
    note: "The beam model is Euler-Bernoulli with a fixed width and tip load — it ignores shear deflection, the beam's own weight, and buckling. The stopping-rule machinery is the point; the beam is just the vehicle.",
    checks: [
      {
        prompt: "In the beam sweep, why is 53 mm the answer rather than 60 mm?",
        options: [
          "53 mm is the smallest depth meeting the 2 mm limit, and mass grows with depth — deeper buys nothing",
          "60 mm is structurally unsafe",
          "Odd numbers are preferred in design",
          "The sweep only went to 60 mm",
        ],
        answer: 0,
        why: "Deflection falls as 1/h³ while mass rises linearly with h. Once the requirement is met, extra depth is dead mass — the requirement, not the knee, sets the design point.",
      },
      {
        prompt: "A one-at-a-time sweep is blind to…",
        options: [
          "Interactions between variables — the optimum of one can depend on another's setting",
          "The response at the swept variable's endpoints",
          "Whether the requirement is met",
          "The units of the response",
        ],
        answer: 0,
        why: "Freezing everything else is what makes the curve readable and what hides interactions. Sweeps find the neighborhood; interaction checks around it find the point.",
      },
      {
        prompt: "You should refine the sweep's step size…",
        options: [
          "Where the curve is changing fast or near the pass/fail boundary",
          "Uniformly everywhere, always",
          "Only at the cheapest end of the range",
          "Never — the first step size is final",
        ],
        answer: 0,
        why: "Points are spent where the curve has something to say. Flat regions need few points; the knee, the cliff, and the requirement boundary deserve the density.",
      },
      {
        prompt: "A cliff in a sweep response means…",
        options: [
          "The physics changed regime at that point — buckling, yielding, separation — and the model may not cross it honestly",
          "The computation failed",
          "You have found the optimum",
          "The variable is at its limit",
        ],
        answer: 0,
        why: "Discontinuities mark regime changes. The curve's formula often does not apply on both sides of a cliff — buckling replaces bending, separated flow replaces attached — so the sweep flags it rather than smoothing over it.",
      },
    ],
  },
  {
    id: "convergence",
    track: "engineering",
    index: 24,
    title: "Convergence: knowing when to stop",
    minutes: 35,
    lede: "Write a stopping rule before you iterate, recognize diminishing returns in the iteration history, and treat the schedule as a real constraint on perfection.",
    start:
      "Every iterative design process ends the same two ways: the answer stops changing, or the money runs out. The professional version of the first is convergence — the relative change between iterations falls below a tolerance you chose in advance. The professional version of the second is the schedule: iteration N+1 is only justified if it is expected to change the decision. || Diminishing returns are the signature of a converging process. The refinement history of the minimal passing depth ran 60 → 54 → 53 mm: each refinement moved the answer less. When the last few iterations each move the answer by less than your tolerance — say 5% — you have converged, and further iteration is precision nobody will use. || The stopping rule is written before the iterating starts, not when you are tired. 'Stop when the relative change is under 5% for two consecutive refinements' is a rule; 'stop when it feels right' is a mood. And sometimes the honest call is to stop unconverged — the schedule fired — and write down that the answer is approximate, by how much, and what would change it.",
    use: "When you are iterating anything — mesh refinement, parameter sweeps, design loops, test campaigns — and each round costs time or money. || Before the first iteration, write the stopping rule: the tolerance, how many consecutive iterations must meet it, and the budget cap. Log every iteration's answer and the relative change; stop when the rule trips or the budget dies. || Stop documenting when the declaration is written: the final answer, the convergence evidence, and — if you stopped on budget — what is still unconverged and who owns the risk.",
    example:
      "Refining the beam-depth sweep around the pass/fail boundary: coarse steps said the answer is near 53 mm; a 1 mm refinement checked 52 (2.03 mm, fail) and 53 (1.92 mm, pass). || The iteration history of the minimal passing depth: 60 → 54 → 53 mm; relative changes 11%, then 1.9%. At a 5% tolerance, two consecutive sub-tolerance changes have not quite happened — one more refinement at 0.5 mm would only decide whether 52.5 or 53.0 mm, a distinction the fabrication tolerance swallows. || The call: stop at 53 mm, document that the last change was 1.9%, and note that the ±0.5 mm stock-extrusion tolerance on the bar's depth dominates any further refinement. The schedule constraint and the physics agree.",
    ideas: [
      {
        heading: "The stopping rule is written first",
        body: "Convergence is not a feeling; it is a comparison: the relative change of the last few iterations against a tolerance you chose before iterating. Write the tolerance, the number of consecutive iterations that must meet it, and the budget cap. An iteration process without a stopping rule is a process that ends when someone gets tired — which is also a stopping rule, just an unexamined one.",
        formula: "|xₙ − xₙ₋₁| / |xₙ| < tol, n consecutive times",
      },
      {
        heading: "Diminishing returns are data",
        body: "Each iteration buying less than the last is not failure; it is the signature of convergence. Plot the change per iteration: when the curve flattens, the process is telling you the remaining uncertainty is below what the next decision can use. The beam's 1/h³ curve means depth refinements buy ever less deflection — the physics, not your patience, sets the stopping point.",
        formula: "Δₙ₊₁ < Δₙ, repeatedly ⇒ converging",
      },
      {
        heading: "The schedule is a constraint, not an excuse",
        body: "Sometimes the budget dies before the tolerance trips. That is legitimate — schedules are real constraints — but stopping unconverged is a decision with an owner: write what is still approximate, bound how wrong it can be, and name who carries the risk. 'We stopped at 5% unconverged because the build slot was Friday' is engineering. 'We just stopped' is not.",
        formula: "stop on budget ⇒ document the unconverged remainder",
      },
    ],
    bench: "sweepconv",
    prompt:
      "Return to your sweep iteration history. || Set a convergence tolerance and watch the bench test each refinement against it — then spend the remaining budget on one more refinement and read whether it changed anything. || Write the stopping declaration: converged or budget-stopped, the evidence, and what dominates further precision.",
    note: "Convergence of the sweep is about the design answer, not the simulation: a converged sweep of a wrong model is a precisely wrong answer. Model validity was Week 22's lesson; this week assumes you checked.",
    checks: [
      {
        prompt: "A sound stopping rule is…",
        options: [
          "Written before iterating: a tolerance, how many consecutive iterations must meet it, and a budget cap",
          "Decided when the engineer feels the answer is good enough",
          "Always 'iterate ten times'",
          "Whatever fits in the meeting",
        ],
        answer: 0,
        why: "Stopping on feeling is an unexamined stopping rule. The written rule makes the stop auditable — and makes 'we stopped on budget' an owned decision instead of drift.",
      },
      {
        prompt: "The depth history 60 → 54 → 53 mm gives relative changes of 11%, then 1.9%, against a 5% tolerance. This means…",
        options: [
          "Diminishing returns — the process is converging and the next refinement likely buys little",
          "The process is diverging",
          "The tolerance was set wrong",
          "Iteration should restart from scratch",
        ],
        answer: 0,
        why: "Shrinking relative changes are the signature of convergence. Whether you stop now depends on the consecutive-iterations part of your rule — but the trend is the process telling you it is nearly done.",
      },
      {
        prompt: "If the schedule forces you to stop before convergence…",
        options: [
          "Document what remains approximate, bound the error, and name who owns the risk",
          "Present the last iteration as final without comment",
          "Delete the iteration history",
          "Blame the schedule in the meeting",
        ],
        answer: 0,
        why: "Budget-stopped is a legitimate engineering call only when it is explicit: the unconverged remainder, its bound, and its owner are part of the deliverable.",
      },
      {
        prompt: "Further refinement is pointless when…",
        options: [
          "The expected change is smaller than the fabrication or measurement tolerance that will swallow it",
          "The answer has more than three significant figures",
          "The computer is slow",
          "The plot looks smooth",
        ],
        answer: 0,
        why: "Precision beyond what the shop or the instrument can hold is theater. The ±0.5 mm stock-extrusion tolerance on the bar's depth dominating a 0.5 mm refinement question is the physical reason to stop.",
      },
    ],
  },
];
