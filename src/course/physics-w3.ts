import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 3 — Forces & free-body diagrams.
 * Week 3 lessons, indices 7–9. Evidence due: free-body diagram
 * portfolio (lesson 3 bench) + friction lab (lesson 2 bench).
 */
export const physicsW3Lessons: Lesson[] = [
  {
    id: "newton",
    track: "physics",
    index: 7,
    title: "Newton's laws and the models they live in",
    minutes: 35,
    lede: "State the three laws as a working contract, compute motion from net force, and name the boundaries where the contract expires.",
    start:
      "When a bus brakes hard, standing passengers lurch forward. Nothing has pushed them toward the front; the bus slowed under their feet while their bodies kept their previous velocity. || Newton's first law describes that tendency. The second law tells us how velocity changes when there is a net force: ΣF = ma. The third law says interactions come in pairs: if A pushes B, B pushes A back with equal magnitude and opposite direction, on a different body. || The practical habit is to choose one body, identify the forces acting on it, add them as vectors, and use ΣF = ma. That is the core calculation for this whole section.",
    use: "Whenever something moves or conspicuously does not — a car accelerating, a bridge standing, a rocket climbing. Also whenever you must decide what the system is: the laws apply to a chosen body, and choosing well is half the work. || Identify the body. List the forces on it and only it — third-law partners live on the other body and do not enter your sum. Add them as vectors to get ΣF, divide by mass, and you have the acceleration; integrate once for velocity, twice for position. Name your frame: the laws hold in inertial frames — frames moving at constant velocity. In a braking bus or a turning car you will measure phantom forces; those are the frame accelerating, not new physics. || Stop applying Newton when the model breaks: speeds near light (relativity takes over) or atomic scales (quantum mechanics). Deformable solids and turbulent fluids still obey Newton; they need richer material and flow models layered on top. For cars, bridges, gliders, and spacecraft in normal flight, Newton is exact enough that the error is in your measurements, not the law.",
    example:
      "A 1200 kg car accelerates from rest to 27 m/s in 9.0 s against 800 N of drag. What force does the engine deliver? || Acceleration is Δv/Δt = 27/9.0 = 3.0 m/s². Net force: ΣF = ma = 1200 × 3.0 = 3600 N forward. The engine must supply that plus the drag it fights: F_engine = 3600 + 800 = 4400 N. || Check by units — newtons throughout — and by size: 4400 N on 1200 kg is under 0.4 g of thrust, a brisk but ordinary car. The third law is visible too: the engine pushes the road backward, and the road pushes the car forward with the same 4400 N.",
    ideas: [
      {
        heading: "No net force means no acceleration",
        body: "In an inertial frame, zero net force means constant velocity. That includes staying at rest. Mass tells you how much acceleration a given net force produces: with the same force, a larger mass accelerates less.",
        formula: "ΣF = 0 ⇒ v = constant (in an inertial frame)",
      },
      {
        heading: "Use ΣF = ma component by component",
        body: "ΣF = ma is a vector equation, so solve it separately along your chosen axes. If the forces are known, it predicts acceleration. If acceleration is measured, the same equation tells you the net force that must have acted.",
        formula: "ΣF = ma, component by component",
      },
      {
        heading: "Third-law pairs act on different bodies",
        body: "If the table pushes up on the book, the book pushes down on the table with equal magnitude. Those two forces do not cancel because they act on different bodies. Keep that distinction in mind when you draw free-body diagrams.",
        formula: "F₁₂ = −F₂₁, on bodies 1 and 2 respectively",
      },
    ],
    bench: "newton",
    prompt:
      "Find the push threshold: lower the push until the state reads At rest, then raise it past the limit. || Watch friction match the push exactly while stuck — static friction is a response, not a fixed value — then cap at μN once sliding. || State the rule the bench enforces, in one sentence.",
    note: "This bench starts every run from rest and treats kinetic friction as μN — the same value as the static limit. Real kinetic friction is usually lower; the incline bench next lesson separates the two.",
    checks: [
      {
        prompt: "A spaceship coasts in deep space, engines off. Its velocity…",
        options: [
          "Stays constant — no net force, no change in motion",
          "Slowly decays as its inertia runs down",
          "Needs a small continuous thrust to maintain",
          "Drops to zero once the engine's push is gone",
        ],
        answer: 0,
        why: "With ΣF = 0, acceleration is zero, so the velocity stays constant. No continuous force is required to maintain motion.",
      },
      {
        prompt: "A 2 kg block and a 4 kg block feel the same 12 N net force. Their accelerations compare as…",
        options: [
          "6 m/s² and 3 m/s² — acceleration is force over mass",
          "6 m/s² for both — the force is the same",
          "3 m/s² and 6 m/s² — heavier means faster",
          "12 m/s² for both — mass cancels",
        ],
        answer: 0,
        why: "a = F/m. The 2 kg block gets 6 m/s² and the 4 kg block gets 3 m/s², so the lighter block accelerates twice as much under the same net force.",
      },
      {
        prompt: "A horse says it cannot pull a cart, since the cart pulls back equally. The error is…",
        options: [
          "The two forces act on different bodies — the road's forward push on the horse is what matters",
          "The cart's pull is weaker because the cart is lighter",
          "Action and reaction cancel only for ropes, not carts",
          "The horse is right; carts move by a different principle",
        ],
        answer: 0,
        why: "The horse's pull on the cart and the cart's pull on the horse are a third-law pair, so they act on different bodies. To decide whether the cart accelerates, sum the forces on the cart alone.",
      },
      {
        prompt: "Newton's laws stop being the right tool…",
        options: [
          "Near light speed or at atomic scales — relativity and quantum mechanics take over",
          "For anything heavier than a car",
          "Whenever friction is present",
          "In orbit, where there is no gravity",
        ],
        answer: 0,
        why: "Newtonian mechanics is not the right approximation near light speed or at atomic scales. Friction and ordinary orbital motion are still well within its usual range.",
      },
    ],
  },
  {
    id: "contact",
    track: "physics",
    index: 8,
    title: "Contact forces: normal, friction, tension, springs",
    minutes: 35,
    lede: "Compute the normal force from the constraint it enforces, apply the two-regime friction model, and treat tension and spring force as force transmitters.",
    start:
      "Set a book on a table and let go. It does not accelerate downward, so the table must be pushing up on it. || That upward contact force is the normal force. Its direction is perpendicular to the surface, and its magnitude comes from whatever is required by the motion constraint. On a level table with no vertical acceleration, that happens to be N = mg. || Friction, tension, and spring force are also interaction forces. Their values depend on the situation, so do not assign them from memory before writing the force balance.",
    use: "Every statics and dynamics problem with touching parts — which is nearly all of them. || Normal force: perpendicular to the surface, magnitude from the constraint (on flat ground N = mg; on an incline N = mg·cosθ; solve ΣF⊥ = 0 in general). Static friction: fs ≤ μs·N, matching the applied push up to the limit, opposing impending slip. Kinetic friction: fk = μk·N, opposing the actual sliding, usually smaller. Tension: uniform throughout an ideal massless string, pulling away from the body along the string. Springs: F = −kx, restoring toward equilibrium. || Stop when every contact has its force named with direction and magnitude rule. If you cannot say which way friction points, ask which way the surfaces would slip without it — friction opposes that.",
    example:
      "A 5.0 kg block rests on a 30° incline. μs = 0.40, μk = 0.30. Does it stay? If not, how fast does it accelerate? || Normal: N = mg·cos30° = 5.0 × 9.81 × 0.866 = 42.5 N. Downslope pull: mg·sin30° = 5.0 × 9.81 × 0.500 = 24.5 N. Static budget: μs·N = 0.40 × 42.5 = 17.0 N — less than 24.5 N, so it slides. Kinetic friction: 0.30 × 42.5 = 12.7 N up the slope; net downslope 24.5 − 12.7 = 11.8 N; a = 11.8/5.0 = 2.36 m/s². || The verdict took four multiplications. Note the asymmetry the bench will make visceral: at 20° the downslope pull is only 16.8 N and the block holds — the same block, the same materials, a different answer from a steeper angle.",
    ideas: [
      {
        heading: "Find the normal force from the motion constraint",
        body: "Do not assume N = mg automatically. Write the force balance perpendicular to the surface. If the object stays in contact with the surface, its perpendicular acceleration is usually zero, and that equation gives the normal force.",
        formula: "N from ΣF⊥ = ma⊥, with a⊥ = 0 for a surface the body stays on",
      },
      {
        heading: "Static friction adjusts; kinetic friction has a set model",
        body: "Static friction can take any value from zero up to μsN, whatever is needed to prevent slipping. Once sliding starts, use fk = μkN in the direction opposite the relative motion. If you are unsure which way friction points, ask which way the surfaces would move relative to each other without it.",
        formula: "fs ≤ μs·N (matches the need); fk = μk·N (opposes the slide)",
      },
      {
        heading: "Ideal strings and springs have simple force rules",
        body: "In the ideal model, a massless string has the same tension throughout. A frictionless pulley changes the direction of that tension. For a linear spring, F = −kx: the force is proportional to displacement and points back toward equilibrium.",
        formula: "T uniform in an ideal string; F = −kx for a spring",
      },
    ],
    bench: "incline",
    prompt:
      "Pick a material pair, raise the incline until the block slips, and read the slip angle. || Convert it to μs with tan θ and compare against the pair's stated value — then push past the angle and watch kinetic friction take the smaller share. || Run all five pairs and state the one rule that mass never changes.",
    note: "The μ values are classroom values, not tribology data — real friction depends on surface finish, humidity, and history. The slip-angle identity μs = tan θ, though, is exact within the model, which is why it is the lab's instrument.",
    checks: [
      {
        prompt: "A 10 kg crate sits on flat ground. The normal force is…",
        options: [
          "98.1 N — the ground supplies whatever cancels the weight",
          "10 N — equal to the mass",
          "Always μs times the weight",
          "Zero, until someone pushes the crate",
        ],
        answer: 0,
        why: "Vertical acceleration is zero, so N = mg = 10 × 9.81 = 98.1 N. The normal force is the constraint's answer, not a property of the crate — and friction's budget scales with it, not with mass directly.",
      },
      {
        prompt: "You push a heavy box with 60 N and it does not move. Static friction is…",
        options: [
          "60 N, opposing the push — it matches the need up to its limit",
          "μs·N regardless of the push",
          "Zero, because nothing is moving",
          "60 N in the direction of the push",
        ],
        answer: 0,
        why: "Static friction is a response: it supplies exactly the 60 N needed to hold, opposing the push. It only caps at μs·N — below the cap, the push sets the value, not the coefficient.",
      },
      {
        prompt: "A block slides down an incline at constant velocity. Kinetic friction equals…",
        options: [
          "The downslope component mg·sinθ — net force is zero at constant velocity",
          "μs·N, the larger static value",
          "Zero, since nothing accelerates",
          "mg, the full weight",
        ],
        answer: 0,
        why: "Constant velocity means a = 0, so ΣF = 0 along the slope: friction must exactly balance mg·sinθ. That balance also tells you μk = tanθ for that slide — the same identity as the slip angle, read in motion.",
      },
      {
        prompt: "Two blocks joined by a massless string hang over an ideal pulley. The tension…",
        options: [
          "Is the same on both sides — the string only redirects it",
          "Is larger on the heavier block's side",
          "Is larger on the lighter block's side",
          "Equals the heavier block's weight",
        ],
        answer: 0,
        why: "A massless string cannot support a net force, so tension is uniform throughout. The pulley changes the direction, not the magnitude — mechanical advantage needs more rope segments, not a magic pulley.",
      },
    ],
  },
  {
    id: "fbd",
    track: "physics",
    index: 9,
    title: "Free-body diagrams: the discipline",
    minutes: 35,
    lede: "Isolate a body, enumerate every force on it and none that are not, and resolve the diagram into solvable equations.",
    start:
      "Most force problems become difficult because the force diagram is incomplete, not because the algebra is advanced. || Start by isolating one body. Draw every force acting on that body: weight, contact forces, tension, spring forces, or any applied push or pull. Then choose axes, resolve components, and write ΣF = ma. || Treat the diagram as part of the solution, not as decoration. Every force term in the equations should correspond to an arrow, and every arrow should appear in the equations.",
    use: "Before any force calculation with more than one force — which is to say, nearly always. || One: isolate — redraw the body alone, disconnected from everything. Two: enumerate — gravity (mg, straight down, always), normal (perpendicular to each contact), friction (parallel to each contact, opposing slip), tension (along each string, away from the body), springs and applied pushes. Three: draw — arrows starting on the body, labeled, roughly to scale. Four: resolve — pick axes (tilt them with the incline when there is one), sum components, set equal to ma. || Stop when the diagram and the equations agree on every force and you can point at each term in ΣF and name its arrow. If an equation has a term with no arrow, or an arrow with no term, the diagram is unfinished.",
    example:
      "Two masses hang over an ideal pulley: m₁ = 3.0 kg, m₂ = 5.0 kg. Find the acceleration and the tension. || Isolate each mass. On m₁: tension T up, weight m₁g down. On m₂: tension T up (uniform string), weight m₂g down. Equations: T − m₁g = m₁a and m₂g − T = m₂a, taking m₂'s descent as positive. Add them: (m₂ − m₁)g = (m₁ + m₂)a, so a = (5.0 − 3.0) × 9.81 / 8.0 = 2.45 m/s². Then T = m₁(g + a) = 3.0 × 12.26 = 36.8 N. || Sanity: a < g (2.45 < 9.81 ✓), and T sits between the weights (29.4 N < 36.8 N < 49.1 N ✓). If a came out larger than g or T outside that bracket, an arrow would be wrong — the diagram, not the arithmetic, would be the suspect.",
    ideas: [
      {
        heading: "One body per diagram",
        body: "Draw the object you are analysing by itself. Forces exerted by other objects appear as arrows on this diagram, but the third-law partner forces belong on those other objects' diagrams. Combining several bodies into one system can be useful later, but do it deliberately.",
        formula: "Each ΣF = ma belongs to exactly one mass",
      },
      {
        heading: "Do not invent forces to explain motion",
        body: "A moving object does not need a forward force simply because it is moving. Put a force on the diagram only if you can identify the interaction producing it. Weight comes from gravity; normal and friction come from contact; tension comes from a string or cable.",
        formula: "Weight = mg ↓ always; everything else needs an agent",
      },
      {
        heading: "Choose axes that simplify the components",
        body: "Horizontal and vertical are not mandatory. On an incline, choosing x along the slope and y perpendicular to it leaves the normal and friction forces aligned with the axes, so only gravity needs to be split into components.",
        formula: "ΣFx = max, ΣFy = may — in whatever axes you chose",
      },
    ],
    bench: "fbdbuilder",
    prompt:
      "Build all three diagrams: place every force the scenario exerts and none it does not. || For each arrow, defend its direction — the bench checks the set, then the directions. || Finish with every scenario green and state the two forces beginners invent most often.",
    note: "The builder scores the force set first and directions second, the way a grader does. Your portfolio saves in this browser — it is evidence, and the rubric is the two questions the bench asks at the end.",
    checks: [
      {
        prompt: "A block slides down a frictionless incline. The correct force set is…",
        options: [
          "Weight and normal force only — no friction, no push along the motion",
          "Weight, normal force, and a forward “force of motion”",
          "Weight and friction, since it slides",
          "Normal force only — weight acts only when falling freely",
        ],
        answer: 0,
        why: "Frictionless means no friction arrow, and motion needs no force to sustain it — the “force of motion” is the classic invented arrow. Weight (mg down) and normal (perpendicular to the surface) are the complete set.",
      },
      {
        prompt: "In the diagram for a book resting on a table, the table's upward push and the book's weight…",
        options: [
          "Are not a third-law pair — the pair of the weight is the book's pull on the Earth",
          "Are a third-law pair that cancel to keep the book still",
          "Cancel because they are equal and opposite on the same body",
          "Prove the normal force equals mg in all situations",
        ],
        answer: 0,
        why: "They act on the same body (the book), so they cannot be a third-law pair — pairs act on different bodies. The weight's partner is the book's gravitational pull on the Earth. They balance here, but on an incline N ≠ mg.",
      },
      {
        prompt: "For a block on an incline, the most useful axis choice is…",
        options: [
          "x along the slope, y perpendicular — only gravity needs resolving",
          "Always horizontal and vertical, by convention",
          "x along the steepest arrow in the diagram",
          "Axes do not matter, so pick at random",
        ],
        answer: 0,
        why: "Tilting the axes with the incline leaves normal and friction each on a single axis; only mg splits into components. Axes are a choice, and the right choice halves the algebra.",
      },
      {
        prompt: "A 5 kg block hangs from a rope, at rest. The rope pulls up with 49 N and gravity pulls down with 49 N. The tension's third-law partner is…",
        options: [
          "The block pulling down on the rope with 49 N",
          "Gravity pulling down on the block",
          "The ceiling pulling up on the rope",
          "There is no partner; the block is in equilibrium",
        ],
        answer: 0,
        why: "Every force has a partner on the other body: the rope pulls the block up, so the block pulls the rope down. Gravity's partner is the block pulling up on the Earth — not the tension, which shares the block as its body.",
      },
    ],
  },
];
