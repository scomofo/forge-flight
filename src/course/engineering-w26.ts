import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 26 — Manufacturing & tolerances.
 * These three lessons open the engineering track (indices 1–3); the eleven
 * pre-existing engineering lessons follow re-indexed from 4. Evidence due:
 * a tolerance stack (lesson 2 bench) and a process-choice memo (lessons 1/3).
 */
export const engineeringW26Lessons: Lesson[] = [
  {
    id: "processes",
    track: "engineering",
    index: 16,
    title: "How things get made",
    minutes: 35,
    lede: "You will screen manufacturing processes by tolerance capability first, volume economics second, and material compatibility third — and name the price of the winner.",
    start:
      "Send the same bracket drawing to three shops. The machine shop quotes $42 a part and holds ±0.025 mm without thinking. The die caster quotes $8 a part — at ten thousand units, after $12,000 of tooling — and holds ±0.1 mm if you are lucky. The print farm quotes $15 overnight with no tooling and hands you ±0.2 mm of layer lines. The drawing never changed. What the drawing means changed, because each process reads a tolerance as a different promise. || Manufacturing splits into four families: subtractive (milling, turning — cut away what you do not want), casting and molding (pour or press into a cavity), forming (bend and stamp sheet), and additive (grow it layer by layer). Each family has a tolerance it can hold as a matter of routine, a volume where its economics work, and materials it likes. A process that cannot hold your tightest tolerance is not cheap — it is disqualified, unless you price in the secondary operation that gets you there. || You screen by tolerance first because tolerance is the one screen that is physics, not negotiation. Volume economics can be argued with — amortize tooling, accept a slower cycle. A process holding ±0.1 mm cannot be argued into ±0.05. That is why the process choice is a design input, not a purchasing decision made after the drawing is done.",
    use: "When you must choose how a part gets made, or when a shop returns your drawing with 'cannot hold that.' || List the part's material, planned volume, and tightest tolerance. Screen every candidate process: typical tolerance ≤ required tolerance, else it needs a named secondary op with its own cost; then volume — is this the process's sweet spot or are you fighting its economics; then material compatibility. || Stop when one process clears all three screens and you can state its price per part at your volume, tooling amortized, with the rejected processes named and their cause of death written down.",
    example:
      "A 60 mm 6061 aluminum bracket, 500 units, two hole positions at ±0.05 mm, one cosmetic face. || CNC milling holds ±0.025 mm as routine — clears the ±0.05 screen with margin; 500 units sits comfortably in its low-volume sweet spot; aluminum machines beautifully. Die casting holds ±0.1 mm — fails the tolerance screen outright unless you add a ream operation for the holes. FDM printing holds ±0.2 mm — disqualified four times over. || CNC milling wins at roughly $38 a part. The memo records the price honestly: you are paying for cycle time, and the rejects are die casting (tolerance) and FDM (tolerance, surface, strength). No surprises at the quote stage, because the screens were the quote stage.",
    ideas: [
      {
        heading: "Tolerance capability is the first screen",
        body: "Every process has a tolerance it holds as a matter of routine — CNC milling ±0.025 mm, die casting ±0.1 mm, sand casting ±0.5 mm, FDM ±0.2 mm, grinding ±0.005 mm. If the process's typical tolerance is coarser than your tightest requirement, the process is out — or it needs a secondary operation, priced and scheduled like any other step. This screen is physics; the others are economics.",
        formula: "viable ⇒ process_tol ≤ required_tol (else secondary op)",
      },
      {
        heading: "Volume decides the economics",
        body: "Tooling-heavy processes (die casting, injection molding) are ruinous for ten parts and unbeatable for ten thousand; tooling-free processes (CNC, printing) cost the same per part at any volume. The unit cost is tooling divided by volume plus cycle cost — find the crossover and you know which side of it you live on before anyone quotes.",
        formula: "unit cost = tooling / volume + cycle cost",
      },
      {
        heading: "Every process leaves fingerprints",
        body: "Castings need draft angles and leave parting lines; sheet metal has bend radii and springback; printed parts are anisotropic — strong along the layers, weak across them; machined parts carry residual stress and need tool access. Design with the fingerprints, not against them: put the critical faces where the process is strongest and keep the process's weaknesses out of the load path.",
        formula: "design rules = f(chosen process), not the reverse",
      },
    ],
    bench: "procchoice",
    prompt:
      "Screen the nine processes against three part briefs — a 500-unit aluminum bracket, a 20,000-unit housing, a one-off jig. || For each brief, name the winner and every reject with its cause of death. || Write the choice memo and grade it against the rubric.",
    note: "The bench's capability numbers are classroom-grade typical values, not shop guarantees — real shops quote their own numbers. The screening discipline transfers; the numbers get replaced by quotes.",
    checks: [
      {
        prompt: "The first screen when choosing a manufacturing process is…",
        options: [
          "Whether the process can hold the tightest tolerance as a matter of routine",
          "Which process has the lowest quoted unit price",
          "Which process the shop recommends",
          "Whether the process can run the material at all",
        ],
        answer: 0,
        why: "Tolerance capability is physics, not negotiation — a ±0.1 mm process cannot be argued into ±0.05. Price and preference get their turn after the disqualified processes are out.",
      },
      {
        prompt: "Die casting beats CNC milling when…",
        options: [
          "Volume is high enough to amortize the die cost across many parts",
          "The part needs ±0.025 mm tolerances",
          "You only need ten parts",
          "The material is titanium",
        ],
        answer: 0,
        why: "Die casting's economics are tooling divided by volume plus a fast cycle. At high volume the tooling vanishes per part; at low volume it dominates, and titanium is not a die-casting material.",
      },
      {
        prompt: "A process that holds ±0.1 mm is asked to deliver ±0.05 mm. The honest move is…",
        options: [
          "Reject it, or add a priced secondary operation that achieves the tolerance",
          "Accept the quote and hope inspection passes it",
          "Loosen the drawing after the parts arrive",
          "Raise the factor of safety to compensate",
        ],
        answer: 0,
        why: "Hope is not a process plan. Either the process is disqualified or a secondary op — reaming, grinding — is added with its own cost and schedule. Safety factors cover load uncertainty, not manufacturing fantasy.",
      },
      {
        prompt: "FDM-printed parts are anisotropic, meaning…",
        options: [
          "They are weaker across the layer lines than along them, so orient the layers with the loads in mind",
          "They shrink uniformly in all directions as they cool",
          "They cannot be made from engineering plastics",
          "Their tolerances are tighter than machined parts",
        ],
        answer: 0,
        why: "The layer interfaces are the weak planes. A printed bracket loaded across its layers can fail at a fraction of the filament's rated strength — orientation is a design decision.",
      },
    ],
  },
  {
    id: "tolerances",
    track: "engineering",
    index: 17,
    title: "Tolerances and stacks",
    minutes: 40,
    lede: "You will compute worst-case and RSS tolerance stacks, classify fits from limit dimensions, and choose the stack method by the consequence of being wrong.",
    start:
      "In 1908 three Cadillacs were disassembled in England, their parts scrambled in a pile, and reassembled into three cars that then drove 500 miles. Cadillac won the Dewar Trophy not for speed but for interchangeability: parts made to a tolerance band, not a number, fit together no matter which bin they came from. Before that, every machine was hand-fitted — parts were filed until they mated, and no two assemblies were alike. || A tolerance is the allowed band around a nominal dimension: 50 ± 0.1 mm means every part between 49.9 and 50.1 ships. GD&T — geometric dimensioning and tolerancing — is the language that says which variations matter: the position of two holes that must align gets a tight tolerance, the thickness of a cosmetic flange gets a loose one. And variations add: when parts stack in one direction, their tolerances stack with them. || Two ways to add them. Worst-case adds absolutely — every part at its extreme in the same direction — which is Murphy's law as arithmetic. RSS adds in quadrature — the square root of the sum of squares — which is statistics as mercy: independent random variations mostly cancel. Worst-case is the honest answer when failure is expensive; RSS is the honest answer when variations are truly independent and the consequence is a nuisance. Choosing between them is choosing which risk you accept, and the drawing should say which you chose.",
    use: "When parts must assemble, or when a drawing's tolerances look tight and someone must say whether the assembly works. || List every contributor in the stack direction. Compute worst-case = Σ|tᵢ| and RSS = √(Σtᵢ²). Compare each against the available clearance. || Stop when you can name which method your verdict rests on, what happens if you are wrong, and which single tolerance dominates the stack — that is the one to attack first.",
    example:
      "A bracket flange 50 ± 0.10 mm, a spacer 30 ± 0.05 mm, and a cover 20 ± 0.10 mm stack into a 100.20 mm cavity. || Nominal total is 100.00 mm. Worst-case = 0.10 + 0.05 + 0.10 = 0.25 mm, so the stack can reach 100.25 mm — beyond the 100.20 cavity: fails worst-case. RSS = √(0.10² + 0.05² + 0.10²) = √(0.0225) = 0.15 mm, so the statistical stack reaches 100.15 mm — inside the cavity: passes RSS. || If a jammed cover is a shop nuisance, ship on RSS and write that decision down. If the cover is a safety interlock, redesign — loosen nothing, tighten the bracket tolerance or deepen the cavity. The arithmetic is neutral; the consequence picks the method.",
    ideas: [
      {
        heading: "Worst-case is Murphy's law as arithmetic",
        body: "Add every tolerance at its absolute extreme, all in the same direction: T = Σ|tᵢ|. It answers 'what is the worst assembly that can legally ship?' Use it when the consequence of interference is scrap, rework you cannot afford, or a safety function. It is conservative by construction — that is the point.",
        formula: "T_worst = Σ |tᵢ|",
      },
      {
        heading: "RSS is statistics as mercy",
        body: "When variations are independent and centered, they add in quadrature: T = √(Σtᵢ²). Three ±0.1 contributors stack to ±0.17, not ±0.3 — the extremes rarely coincide. But RSS is a loan against statistics: it assumes independence, centered processes, and enough parts for the law of large numbers to show up. Two parts from the same shifted batch are not independent.",
        formula: "T_rss = √(Σ tᵢ²)  — independence required",
      },
      {
        heading: "Fits are stacks with names",
        body: "A hole and a shaft are a two-part stack. Max clearance = biggest hole minus smallest shaft; min clearance = smallest hole minus biggest shaft. Both clearances positive: clearance fit — it always assembles, always has play. Both negative: interference fit — it always presses, needs force or heat. Straddling zero: transition — some assemblies clear, some press. Name the fit before you choose the numbers.",
        formula: "C_max = hole_max − shaft_min;  C_min = hole_min − shaft_max",
      },
    ],
    bench: "tolstack",
    prompt:
      "Set the three stack tolerances with sliders and watch worst-case and RSS totals move against the 100.20 mm cavity. || Answer the three graded questions: the worst-case total, the RSS total, and which method you would stake a safety interlock on. || Persist the stack and grade it against the rubric.",
    note: "The bench grades your arithmetic — the two totals and the verdict logic — not whether worst-case or RSS is 'correct' for your imaginary product. That judgment is the engineering, and it stays yours.",
    checks: [
      {
        prompt: "Three parts at ±0.10, ±0.05, ±0.10 stack. The worst-case total is…",
        options: ["±0.25", "±0.15", "±0.17", "±0.10"],
        answer: 0,
        why: "Worst-case adds absolutely: 0.10 + 0.05 + 0.10 = 0.25. The ±0.15/±0.17 answers are the RSS family — right method, wrong question.",
      },
      {
        prompt: "The RSS total for the same three parts is…",
        options: [
          "±0.15",
          "±0.25",
          "±0.10",
          "±0.30",
        ],
        answer: 0,
        why: "√(0.10² + 0.05² + 0.10²) = √0.0225 = 0.15. RSS is always kinder than worst-case — that kindness is borrowed from statistics and must be repaid with independence.",
      },
      {
        prompt: "RSS stacking is valid only when…",
        options: [
          "The variations are independent and roughly centered on nominal",
          "There are more than ten parts in the stack",
          "Every tolerance is bilateral and equal",
          "The parts are made on the same machine",
        ],
        answer: 0,
        why: "RSS is a statistical claim: independent, centered variations cancel. Parts from one shifted batch, or a process running consistently to one side of nominal, violate the premise — made on the same machine can actually hurt independence.",
      },
      {
        prompt: "A hole 25.00–25.05 mm and a shaft 24.96–25.00 mm make…",
        options: [
          "A clearance fit: max clearance 0.09, min clearance 0.00",
          "An interference fit: the shaft always presses",
          "A transition fit: some assemblies press",
          "A clearance fit with 0.05 max clearance",
        ],
        answer: 0,
        why: "C_max = 25.05 − 24.96 = 0.09; C_min = 25.00 − 25.00 = 0.00. Nothing goes negative, so it always clears or just touches — clearance fit, with 0.09 of slop at the loosest.",
      },
    ],
  },
  {
    id: "dfm",
    track: "engineering",
    index: 18,
    title: "Design for making",
    minutes: 35,
    lede: "You will put tight tolerances only where a named function lives, minimize setups and operations, and defend the process choice in a written memo.",
    start:
      "A drawing crossed a shop floor with ±0.01 mm on a face nobody would ever touch, mate, or seal against. The shop could mill the part in one setup — but not to ±0.01. So they milled it, then ground that one face, then inspected it on the CMM, and the part cost twice what it should have. The tolerance bought nothing; it was vanity with a price tag. Every shop has a drawer of such drawings. || Design for manufacturing means the drawing respects the process: tight tolerances only where a function lives — a stack, a fit, a seal — and generous tolerances everywhere else; standard stock sizes instead of custom; features a standard tool can reach in one setup; uniform wall thickness for molded parts; bend radii the press brake already owns. The cost of a tolerance is nonlinear: halving a tolerance roughly doubles the cost of that feature, because it moves you across a process boundary — from milling to grinding, from one setup to two, from in-process checking to 100% inspection. || That is why the process-choice memo exists. It lists the winner, the rejects with their causes of death, and — crucially — which tolerances are functional and which were relaxed. A year later, when someone asks why the bracket costs what it costs, the memo answers. Without it, the vanity tolerances creep back in one engineering change at a time.",
    use: "When finalizing a drawing, or when a quote comes back shocking and someone must find the money in the design. || For each tolerance on the drawing, ask what function it serves — stack, fit, seal, alignment — and name it. If it serves none, loosen it. Count setups and operations; prefer standard sizes and tools. || Stop when every remaining tight tolerance traces to a named function, the process choice is written down with rejects and reasons, and the quote no longer contains operations that buy nothing.",
    example:
      "The 60 mm 6061 bracket again: the first drawing carried ±0.05 mm on the cosmetic face. || Nothing assembles against the face, seals against it, or aligns to it — its function is looks, and as-milled aluminum looks fine. Loosen the face to ±0.25 mm; keep ±0.05 on the two hole positions that locate the mating part, because those sit in a real stack. || The re-quote drops about 30%: one setup, no grinding, no CMM time on the face. The memo records the functional tolerances (the holes) and the relaxed one (the face), so the next engineer knows which is which.",
    ideas: [
      {
        heading: "Every tolerance is a purchase",
        body: "Tightening a tolerance roughly doubles the cost of the feature it touches — new process, new setup, new inspection. Spend tolerance where it buys function: the hole positions that locate a mating part, the bore that carries a bearing. Everywhere else, the cheapest tolerance that does the job is the right tolerance. Vanity tolerances are the most expensive lines on the drawing.",
        formula: "feature cost ∝ 1 / tolerance  (across process boundaries)",
      },
      {
        heading: "Design for the process you chose",
        body: "Each process has a design dialect: draft angles and uniform walls for casting and molding, bend radii and flat patterns for sheet metal, tool access and setup count for machining, minimum walls and overhang rules for printing. A part drawn in the wrong dialect gets built anyway — badly, slowly, expensively. Learn the winner's dialect before you finalize the geometry.",
        formula: "geometry must satisfy process rules, not just function",
      },
      {
        heading: "The memo is the design",
        body: "The process-choice memo names the winner, every reject with its cause of death, the functional tolerances and why each is tight, and the relaxed ones and why each is loose. It is the only thing standing between your cost-optimized drawing and the slow creep of vanity tolerances through future revisions. Write it before the first quote, not after.",
        formula: "memo = winner + rejects + functional tolerances + relaxed tolerances",
      },
    ],
    bench: "procchoice",
    prompt:
      "Defend the process choice for the high-volume housing brief — the one where tooling amortization flips the winner. || Write the memo: winner, rejects with causes of death, functional vs relaxed tolerances. || Grade it against the rubric.",
    note: "The bench checks that your memo names a winner, justifies it against the screens, and lists rejects with reasons — it cannot judge whether your reasons are wise. Wisdom is not gradable; completeness is.",
    checks: [
      {
        prompt: "A ±0.01 mm tolerance on a face that nothing touches, mates, or seals against is…",
        options: [
          "A vanity tolerance: loosen it, because it buys an extra operation for no function",
          "Good practice: tight everywhere is safe everywhere",
          "Required for the cosmetic appearance",
          "Free, since the machine is already set up",
        ],
        answer: 0,
        why: "The tolerance forces a grinding or inspection operation that serves no function. Tight-everywhere is not safe — it is expensive, and it teaches the shop to ignore your tolerances.",
      },
      {
        prompt: "Halving a tolerance roughly doubles the feature's cost because…",
        options: [
          "It typically forces a process boundary crossing — new process, new setup, new inspection",
          "Material cost doubles with precision",
          "The drawing takes twice as long to dimension",
          "Shops charge a flat precision fee",
        ],
        answer: 0,
        why: "Cost jumps at process boundaries: milling to grinding, one setup to two, sampling to 100% inspection. Within one process the cost curve is gentle; across the boundary it steps.",
      },
      {
        prompt: "The process-choice memo must include…",
        options: [
          "The winner, the rejects with causes of death, and which tolerances are functional vs relaxed",
          "Only the winning process and its quoted price",
          "The full GD&T drawing",
          "A list of approved suppliers",
        ],
        answer: 0,
        why: "The memo's job is to survive future revisions: why this process won, what killed the alternatives, and which tolerances are load-bearing decisions vs vanity. Price alone explains nothing.",
      },
      {
        prompt: "Designing a cast part with zero draft angles and varying wall thickness will…",
        options: [
          "Produce a part that sticks in the die and cools unevenly — the process's rules were ignored",
          "Save tooling cost, since the die is simpler",
          "Improve surface finish",
          "Have no effect on modern casting",
        ],
        answer: 0,
        why: "Draft releases the part from the die; uniform walls cool evenly and avoid shrinkage defects. Ignoring the process's dialect doesn't simplify anything — it manufactures scrap.",
      },
    ],
  },
];
