import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 3 — Forces & free-body diagrams.
 * These three lessons open the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: free-body diagram
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
      "A bus brakes hard and the standing passengers lurch forward. Nothing pushed them forward — the bus slowed under their feet while their bodies, obeying an older contract, kept going. || The first law names that contract: a body holds its velocity unless a net force acts. The second quantifies it: net force equals mass times acceleration, ΣF = ma, a vector equation. The third completes it: forces come in pairs — if A pushes B, B pushes A back equally and oppositely, and the two forces act on different bodies. || Inertia is just the definition of mass, measured operationally: the kilogram is the thing that resists acceleration exactly this much. The second law is the equation of motion — everything in mechanics is either this equation or one of its consequences.",
    use: "Whenever something moves or conspicuously does not — a car accelerating, a bridge standing, a rocket climbing. Also whenever you must decide what the system is: the laws apply to a chosen body, and choosing well is half the work. || Identify the body. List the forces on it and only it — third-law partners live on the other body and do not enter your sum. Add them as vectors to get ΣF, divide by mass, and you have the acceleration; integrate once for velocity, twice for position. Name your frame: the laws hold in inertial frames — frames moving at constant velocity. In a braking bus or a turning car you will measure phantom forces; those are the frame accelerating, not new physics. || Stop applying Newton when the model breaks: speeds near light (relativity takes over), atomic scales (quantum mechanics), or deformable, turbulent, relativistic fluids (you need richer models). For cars, bridges, gliders, and spacecraft in normal flight, Newton is exact enough that the error is in your measurements, not the law.",
    example:
      "A 1200 kg car accelerates from rest to 27 m/s in 9.0 s against 800 N of drag. What force does the engine deliver? || Acceleration is Δv/Δt = 27/9.0 = 3.0 m/s². Net force: ΣF = ma = 1200 × 3.0 = 3600 N forward. The engine must supply that plus the drag it fights: F_engine = 3600 + 800 = 4400 N. || Check by units — newtons throughout — and by size: 4400 N on 1200 kg is under 0.4 g of thrust, a brisk but ordinary car. The third law is visible too: the engine pushes the road backward, and the road pushes the car forward with the same 4400 N.",
    ideas: [
      {
        heading: "Inertia defines mass",
        body: "The first law looks like a special case of the second (a = 0 when ΣF = 0), but it is doing deeper work: it defines the frames in which the second law holds, and it gives mass its operational meaning. Mass is the proportionality between net force and acceleration — the thing that makes a loaded truck harder to stop than an empty one. You never measure mass directly; you measure how hard it is to accelerate.",
        formula: "ΣF = 0 ⇒ v = constant (in an inertial frame)",
      },
      {
        heading: "The second law is the equation of motion",
        body: "ΣF = ma is a vector equation — three scalar equations hiding in one symbol. It runs both directions: forces predict motion (given the pushes, find the path), and motion reveals forces (given the path, the net force is m times the observed acceleration). The second direction is how you will later read a crash, a vibration, or a glider's glide path: the acceleration is the force's signature.",
        formula: "ΣF = ma, component by component",
      },
      {
        heading: "Third-law pairs live on different bodies",
        body: "The book pushes down on the table; the table pushes up on the book. Those two forces are equal and opposite, and they never cancel — cancellation requires one body. This is the entire discipline of the free-body diagram, coming next lesson: draw one body, list the forces on it, and leave its partners off the page. The rocket climbs because it throws mass down; the exhaust's push back up is the partner, acting on the rocket.",
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
        why: "First law: with ΣF = 0 the velocity holds indefinitely. Inertia does not run down, and no sustaining force is needed — that intuition is Aristotelian, and Newton replaced it.",
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
        why: "a = F/m gives 12/2 = 6 m/s² and 12/4 = 3 m/s². The same push accelerates the lighter block twice as hard — that ratio is what mass means.",
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
        why: "Third-law pairs never cancel because they act on different bodies. The cart moves because the horse's pull on it exceeds the ground's resistance; the horse moves because the road pushes it forward. Draw one body at a time and the paradox dissolves.",
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
        why: "The contract expires at relativistic speeds and quantum scales. Friction is firmly inside Newton's territory, and orbit is pure Newton — the spacecraft is in free fall, which is why astronauts float.",
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
      "Set a book on a table and let go. It does not fall, so something pushes up with exactly the book's weight — yet the table looks rigid and passive. || That push is the normal force: the table's surface compresses a few micrometers, and electromagnetic repulsion between atoms supplies whatever force the constraint demands. The normal force is not a fixed value; it is whatever is needed to keep the book out of the table, perpendicular to the surface, and it adjusts instantly. || Contact forces are constraints made physical: the normal force enforces “no penetration,” friction enforces “no sliding” up to its limit, tension enforces “the string keeps its length,” and a spring enforces Hooke's law. None of them is a property of the object itself; each is the interaction's answer to the situation.",
    use: "Every statics and dynamics problem with touching parts — which is nearly all of them. || Normal force: perpendicular to the surface, magnitude from the constraint (on flat ground N = mg; on an incline N = mg·cosθ; solve ΣF⊥ = 0 in general). Static friction: fs ≤ μs·N, matching the applied push up to the limit, opposing impending slip. Kinetic friction: fk = μk·N, opposing the actual sliding, usually smaller. Tension: uniform throughout an ideal massless string, pulling away from the body along the string. Springs: F = −kx, restoring toward equilibrium. || Stop when every contact has its force named with direction and magnitude rule. If you cannot say which way friction points, ask which way the surfaces would slip without it — friction opposes that.",
    example:
      "A 5.0 kg block rests on a 30° incline. μs = 0.40, μk = 0.30. Does it stay? If not, how fast does it accelerate? || Normal: N = mg·cos30° = 5.0 × 9.81 × 0.866 = 42.5 N. Downslope pull: mg·sin30° = 5.0 × 9.81 × 0.500 = 24.5 N. Static budget: μs·N = 0.40 × 42.5 = 17.0 N — less than 24.5 N, so it slides. Kinetic friction: 0.30 × 42.5 = 12.8 N up the slope; net downslope 24.5 − 12.8 = 11.8 N; a = 11.8/5.0 = 2.36 m/s². || The verdict took four multiplications. Note the asymmetry the bench will make visceral: at 20° the downslope pull is only 16.8 N and the block holds — the same block, the same materials, a different answer from a steeper angle.",
    ideas: [
      {
        heading: "The normal force solves a constraint",
        body: "You never look up the normal force; you derive it from the condition the surface imposes. On flat ground the vertical acceleration is zero, so N = mg. On an incline the perpendicular direction gives N = mg·cosθ. Press the book sideways into a wall and the wall's normal is your push. Whenever a problem feels stuck, write the constraint first — “the block does not leave the surface” — and the normal force falls out of ΣF⊥ = ma⊥.",
        formula: "N from ΣF⊥ = ma⊥, with a⊥ = 0 for a surface the body stays on",
      },
      {
        heading: "Friction has two regimes and one direction rule",
        body: "Static friction is a budget, not a value: it supplies exactly what is needed to prevent slipping, up to μs·N, and its direction opposes the impending slip. Once the budget is exceeded, kinetic friction takes over at μk·N — typically 70–80% of the static limit — opposing the actual motion and dissipating energy as heat. Both are proportional to the normal force, which is why a heavier block is harder to drag and why the slip angle does not depend on mass.",
        formula: "fs ≤ μs·N (matches the need); fk = μk·N (opposes the slide)",
      },
      {
        heading: "Strings and springs transmit force",
        body: "An ideal string is massless and inextensible, which forces the tension to be the same everywhere along it — pull one end with 50 N and the far end pulls back with 50 N. That uniformity is what makes pulleys useful: they redirect a uniform tension, not amplify it. A spring is the compliant version: F = −kx, with the minus sign doing the real work — the force always points back toward equilibrium, which is why springs oscillate instead of running away.",
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
      "Ask a room of engineering students where a statics problem went wrong and the answer is almost never the algebra. It is a missing arrow, or an arrow that belongs on a different body. || The free-body diagram is the discipline that prevents that: choose one body, draw it alone, and put an arrow for every force acting on it — gravity always, contact forces where things touch, tension where strings pull, applied forces where hands push. Then choose axes, break each arrow into components, and write ΣF = ma (or ΣF = 0 for equilibrium). || The diagram is the analysis: once every force is on the page with a direction, the equations write themselves and the arithmetic is bookkeeping. Professionals draw them for the same reason pilots use checklists — the usual failure mode is a missing arrow, and the ritual exists to catch it.",
    use: "Before any force calculation with more than one force — which is to say, nearly always. || One: isolate — redraw the body alone, disconnected from everything. Two: enumerate — gravity (mg, straight down, always), normal (perpendicular to each contact), friction (parallel to each contact, opposing slip), tension (along each string, away from the body), springs and applied pushes. Three: draw — arrows starting on the body, labeled, roughly to scale. Four: resolve — pick axes (tilt them with the incline when there is one), sum components, set equal to ma. || Stop when the diagram and the equations agree on every force and you can point at each term in ΣF and name its arrow. If an equation has a term with no arrow, or an arrow with no term, the diagram is unfinished.",
    example:
      "Two masses hang over an ideal pulley: m₁ = 3.0 kg, m₂ = 5.0 kg. Find the acceleration and the tension. || Isolate each mass. On m₁: tension T up, weight m₁g down. On m₂: tension T up (uniform string), weight m₂g down. Equations: T − m₁g = m₁a and m₂g − T = m₂a, taking m₂'s descent as positive. Add them: (m₂ − m₁)g = (m₁ + m₂)a, so a = (5.0 − 3.0) × 9.81 / 8.0 = 2.45 m/s². Then T = m₁(g + a) = 3.0 × 12.26 = 36.8 N. || Sanity: a < g (2.45 < 9.81 ✓), and T sits between the weights (29.4 N < 36.8 N < 49.1 N ✓). If a came out larger than g or T outside that bracket, an arrow would be wrong — the diagram, not the arithmetic, would be the suspect.",
    ideas: [
      {
        heading: "Isolate ruthlessly",
        body: "One body, one diagram. The moment two bodies share a sketch, third-law partners sneak onto the same page and cancel in ways that look like physics but are just a bookkeeping mistake. Draw the block alone; draw the hanging mass alone; let the string's tension be the only thing the two diagrams share. Systems can be combined later, deliberately — not by accident.",
        formula: "Each ΣF = ma belongs to exactly one mass",
      },
      {
        heading: "Gravity is the only given",
        body: "Every other force must be earned by contact or by a field you can name. Students invent forces — a “force of motion” pushing the projectile forward, a centrifugal arrow in an inertial frame — because something must explain the movement. Nothing must: motion needs no cause, only changes in motion do. If you cannot point at the agent exerting the force, it does not go on the diagram.",
        formula: "Weight = mg ↓ always; everything else needs an agent",
      },
      {
        heading: "Axes are a choice — tilt them",
        body: "Nothing requires horizontal and vertical axes. On an incline, align x with the slope: then the normal force has no x-component, friction has no y-component, and only gravity needs resolving. The physics is identical; the algebra halves. Choosing coordinates is part of solving, not a formality before it — and the same freedom will later make polar coordinates the right choice for rotation.",
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
