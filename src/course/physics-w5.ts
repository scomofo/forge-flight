import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 5 — Momentum & collisions.
 * Week 5 lessons, indices 13–15. Evidence due: video-analysis
 * collision lab (lesson 1 bench) + restitution analysis (lesson 3 bench).
 */
export const physicsW5Lessons: Lesson[] = [
  {
    id: "impulse",
    track: "physics",
    index: 13,
    title: "Impulse and momentum",
    minutes: 35,
    lede: "Relate force and contact time to a change in momentum, and use impulse to estimate forces in impacts, catches, and launches.",
    opening: { mode: "prose", heading: "Same momentum change, different stopping time" },
    readFlow: [
      { kind: "example", heading: "Compare glove and wall" },
      { kind: "idea", idea: 0, label: "Impulse" },
      { kind: "idea", idea: 1, label: "Signs" },
      { kind: "aside", heading: "Important limit", body: "Average impact force is not peak force. Real contact-force traces usually peak well above the average." },
      { kind: "idea", idea: 2, label: "Peak force" },
      { kind: "move", heading: "Use before/after momentum to audit impact force" },
    ],
    start:
      "If you catch a fast ball and let your hand move backward with it, the stop takes longer than if the ball hits a rigid wall. The momentum change can be the same in both cases, but the average force is not. || Impulse is force accumulated over time: J = F_avgΔt. Momentum is p = mv, and the impulse-momentum theorem says J = Δp. || For a fixed momentum change, increasing the stopping time reduces the average force. That is the basic physics behind airbags, crumple zones, padding, and bending your knees on landing.",
    use: "Whenever a force acts over a time interval and you need the resulting motion — impacts, launches, thrust. Also whenever a textbook quotes a huge force and you suspect the interval: divide the momentum change by the time to audit the claim. || Compute the momentum change Δp = m·(v − v₀) as a signed quantity — direction matters. Estimate or measure the interaction time Δt. Divide: F_avg = Δp/Δt. || Stop when you can say whether the average force is survivable, plausible, or absurd. If the time is unknown, say so and bound it — the force estimate is only as good as the time estimate.",
    example:
      "A 0.15 kg baseball arrives at 40 m/s and the catcher's glove rides back 0.12 s. || Δp = 0.15 × (0 − 40) = −6.0 kg·m/s; the glove supplies +6.0 kg·m/s. F_avg = 6.0 / 0.12 = 50 N — about the weight of a 5 kg bag. || Now stop the same ball against a wall in 0.01 s: F_avg = 600 N. Same momentum change, twelve times the force. Time is the only variable that moved.",
    ideas: [
      {
        heading: "Impulse connects force, time, and momentum",
        body: "Impulse is the area under a force-time curve. If you only need the average force, use J = F_avgΔt. The same impulse is also the momentum change, so before-and-after velocities often let you solve an impact without knowing the detailed force history.",
        formula: "J = F_avg·Δt = Δp = m(v − v₀)",
      },
      {
        heading: "Momentum needs a sign convention",
        body: "Choose a positive direction before you calculate. A ball that rebounds at the same speed has a larger momentum change than a ball that simply stops, because its final velocity has the opposite sign. Write Δp = p_after − p_before with signed velocities.",
        formula: "Δp = p_after − p_before (signed)",
      },
      {
        heading: "Average force is not peak force",
        body: "F_avg = Δp/Δt gives the mean over the contact interval. Real force-time traces usually rise and fall, so the peak force can be much larger than the average. Do not treat an average-force calculation as a peak-load result.",
        formula: "F_peak ≈ 2·F_avg for a triangular pulse",
      },
    ],
    bench: "impactlab",
    prompt:
      "Open the collision footage frame log. || Enter the pre- and post-collision velocities you measure from the frames, and the bench checks each against the tape. || Compute the momentum before and after, name the energy lost, and write down what the tape cannot tell you.",
    note: "The bench treats the frame data as a video-analysis log: you measure positions from frames, differentiate to get velocities, and the bench audits your arithmetic. Positive velocity points right; the collision happens between the logged frames.",
    checks: [
      {
        prompt: "A 0.15 kg ball at 40 m/s is caught over 0.12 s. The average force on the ball is…",
        options: ["6 N", "50 N", "600 N", "0.15 N"],
        answer: 1,
        why: "Δp = 0.15 × 40 = 6.0 kg·m/s, and F_avg = 6.0 / 0.12 = 50 N. 6 N is the impulse, not the force — dividing by the time is the whole point.",
      },
      {
        prompt: "Why does extending the stopping time reduce the average force?",
        options: [
          "The momentum change is smaller",
          "The same Δp is spread over more time, so Δp/Δt falls",
          "Longer stops convert momentum to heat",
          "Friction only acts over long times",
        ],
        answer: 1,
        why: "The momentum change is fixed by the before/after velocities. Time is the only free variable: same Δp over more seconds means a smaller average force.",
      },
      {
        prompt: "A ball bounces straight back at its incoming speed v. The momentum change is…",
        options: ["Zero — the speed is unchanged", "m·v", "2·m·v", "−m·v, a scalar"],
        answer: 2,
        why: "Δp = m·(−v) − m·(v) = −2·m·v. Magnitude 2·m·v: the wall first kills the momentum, then builds it back the other way. Forgetting the sign is the classic error.",
      },
      {
        prompt: "An impulse of 6 N·s could equally be…",
        options: [
          "6 N for 6 s",
          "60 N for 0.1 s",
          "600 N for 1 s",
          "0.6 N for 10 ms",
        ],
        answer: 1,
        why: "60 × 0.1 = 6. Impulse is the product F·Δt, so 6 N for 6 s is 36 N·s. Only the pair whose product is 6 N·s matches.",
      },
    ],
  },
  {
    id: "conserve",
    track: "physics",
    index: 14,
    title: "Conservation and center of mass",
    minutes: 35,
    lede: "Choose the system boundary, decide whether external impulse is negligible, then use momentum conservation and center of mass to describe the motion.",
    opening: { mode: "steps", heading: "Draw the system boundary", labels: ["The interaction", "The condition", "The boundary"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Boundary" },
      { kind: "example", heading: "Two skaters" },
      { kind: "idea", idea: 1, label: "Center of mass" },
      { kind: "idea", idea: 2, label: "Approximation" },
      { kind: "move", heading: "Conserve momentum only over the interval you can defend" },
    ],
    start:
      "Two skaters push apart on nearly frictionless ice. Each one gains momentum, but the total momentum of the two-skater system stays the same. || Momentum is conserved when the net external impulse on the chosen system is negligible. The forces the skaters exert on each other are internal, so they redistribute momentum rather than change the total. || The important step is choosing the system. Include both skaters and their push is internal. Analyse only one skater and the other skater's push is external.",
    use: "Before solving any multi-body problem: draw the boundary and ask whether external forces act during the interval. Recoil, explosions, and collisions are the canonical cases — the interaction is fast, so external forces (friction, gravity over milliseconds) are negligible and the system is effectively isolated. || Add up m·v for everything inside, with signs. Set the total before equal to the total after. Solve for the unknown velocity. || Stop when the accounting balances: the total after must equal the total before to the precision of your data. If it doesn't, either the boundary leaked (an external force acted) or the velocities are wrong.",
    example:
      "A 70 kg skater and a 50 kg skater push apart from rest on frictionless ice; the 70 kg skater glides off at +2.0 m/s. || Total momentum starts at 0, so 0 = 70 × 2.0 + 50 × v₂, giving v₂ = −2.8 m/s. The lighter skater leaves faster, opposite direction. || Check the center of mass: it started stationary and stays stationary. The motion appeared from nowhere only because you were watching one skater instead of the system.",
    ideas: [
      {
        heading: "Choose the system before using conservation",
        body: "Momentum conservation depends on what you include in the system. Internal forces come in third-law pairs and cancel in the total. External forces do not. State the system and the time interval before writing Σp_before = Σp_after.",
        formula: "Σp_before = Σp_after when ΣF_ext = 0",
      },
      {
        heading: "External force controls the center of mass",
        body: "The center of mass is the mass-weighted average position. Internal forces can move the parts around, but they cannot change the motion of the center of mass. Only a net external force can accelerate it.",
        formula: "x_cm = Σ mᵢxᵢ / Σ mᵢ",
      },
      {
        heading: "Momentum conservation is often an approximation",
        body: "Real systems usually have some external force. In a short collision or explosion, the external impulse during the interaction may be small enough to neglect. Over a longer interval, that approximation may fail. State the interval you are analysing.",
        formula: "J_ext ≪ Δp_internal ⇒ isolated is a good model",
      },
    ],
    bench: "cmexplore",
    prompt:
      "Place two masses on the line and find their balance point. || Then fire the firecracker: the fragments scatter, and you check whether the center of mass noticed. || Write down, in one sentence, which forces can move a center of mass.",
    note: "The bench computes the true center of mass from your masses and positions; your job is to predict it, then to predict what an internal explosion does to it. Only external forces accelerate x_cm.",
    checks: [
      {
        prompt: "Two skaters push apart from rest: 70 kg at +2.0 m/s. The 50 kg skater's velocity is…",
        options: ["+2.0 m/s", "−2.8 m/s", "−1.4 m/s", "0 m/s"],
        answer: 1,
        why: "0 = 70 × 2.0 + 50 × v₂ gives v₂ = −140/50 = −2.8 m/s. Lighter means faster, and the sign must oppose — the total has to stay zero.",
      },
      {
        prompt: "An exploding firecracker's fragments fly in all directions. Its center of mass…",
        options: [
          "Stops, because the firecracker is destroyed",
          "Continues on the original trajectory",
          "Accelerates with the fragments",
          "Moves toward the largest fragment",
        ],
        answer: 1,
        why: "The explosion forces are internal. They redistribute momentum among fragments but cannot change the total, so x_cm keeps its pre-explosion motion — the original arc, gravity aside.",
      },
      {
        prompt: "Total momentum of a system is conserved when…",
        options: [
          "No friction acts between the bodies",
          "The net external force on the system is zero",
          "No kinetic energy is lost",
          "Every mass in the system is equal",
        ],
        answer: 1,
        why: "The condition is exactly ΣF_ext = 0. Internal forces always cancel in pairs. Energy loss is irrelevant to momentum conservation — sticky collisions conserve momentum while burning energy.",
      },
      {
        prompt: "A 3 kg mass at x = 0 and a 1 kg mass at x = 8 m. The center of mass is at…",
        options: ["4 m", "6 m", "2 m", "8 m"],
        answer: 2,
        why: "x_cm = (3 × 0 + 1 × 8) / 4 = 2 m. It sits nearer the heavy mass — three-quarters of the way toward the 3 kg side.",
      },
    ],
  },
  {
    id: "collisions",
    track: "physics",
    index: 15,
    title: "Collisions: elastic and inelastic",
    minutes: 35,
    lede: "Use momentum conservation and coefficient of restitution to solve one-dimensional collisions, then check how much kinetic energy was retained.",
    opening: { mode: "prose", heading: "Momentum survives every isolated collision" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Equation one" },
      { kind: "idea", idea: 1, label: "Equation two" },
      { kind: "example", heading: "Elastic versus stick-together" },
      { kind: "idea", idea: 2, label: "Energy check" },
      { kind: "move", heading: "Solve velocities, then inspect the energy loss" },
    ],
    start:
      "A steel ball in a Newton's cradle rebounds very differently from a lump of clay, but both impacts obey momentum conservation when external impulse is negligible. || Kinetic energy is conserved only in an elastic collision. The coefficient of restitution e compares separation speed after impact with approach speed before impact. e = 1 is perfectly elastic; e = 0 means no rebound along the line of impact. || For a one-dimensional two-body collision, momentum conservation plus the restitution relation gives two equations for the two outgoing velocities.",
    use: "For any 1D two-body collision: write momentum conservation, m₁v₁ + m₂v₂ = m₁u₁ + m₂u₂. Add the restitution condition, u₂ − u₁ = e·(v₁ − v₂). Solve the pair for the two unknowns — two equations, two unknowns, done. || Use e = 1 for ideal elastic (billiards, atoms), e = 0 for stick (clay, coupled railcars), and a measured e in between for everything real. || Stop when you have both outgoing velocities and have checked momentum balances. Then compute the kinetic energy lost — it is the check that the collision was what you claimed.",
    example:
      "A 2 kg cart at 4 m/s strikes a 3 kg cart at rest, head-on. Elastic first: u₁ = (2−3)/5 × 4 = −0.8 m/s, u₂ = (2×2)/5 × 4 = 3.2 m/s — the light cart rebounds, the heavy one walks away at 3.2 m/s, and the 16 J of kinetic energy is all still there. || If they stick instead: v = (2 × 4)/5 = 1.6 m/s shared, and the kinetic energy falls to ½ × 5 × 1.6² = 6.4 J. || 9.6 J went to deformation and heat — momentum kept every kg·m/s, energy spent 60% of the budget. Same impact, different e.",
    ideas: [
      {
        heading: "Momentum conservation is the first equation",
        body: "For an isolated collision, total momentum before equals total momentum after whether the collision is elastic or inelastic. That gives one equation. The restitution relation provides the second equation needed to solve for two unknown outgoing velocities.",
        formula: "m₁v₁ + m₂v₂ = m₁u₁ + m₂u₂",
      },
      {
        heading: "Restitution measures rebound speed",
        body: "The coefficient of restitution is the relative separation speed divided by the relative approach speed along the line of impact. It is usually measured. For a vertical bounce from the same surface, e can be estimated from the square root of bounce height divided by drop height.",
        formula: "e = separation speed / approach speed",
      },
      {
        heading: "Missing kinetic energy became another form of energy",
        body: "If kinetic energy decreases in a collision, the energy has been converted into deformation, heat, sound, or other internal energy. Momentum can still be conserved at the same time. Always check the before-and-after kinetic energy after solving the velocities.",
        formula: "K_lost = K_before − K_after ≥ 0",
      },
    ],
    bench: "restitute",
    prompt:
      "Set the masses, the approach, and the restitution. || Predict both outgoing velocities before you press run, then compare your prediction against the solver. || Sweep e from 0 to 1 on the same impact and watch the energy loss die while the momentum never flinches.",
    note: "The bench solves the exact 1D two-body problem: momentum conservation plus the restitution condition. Your prediction is graded against the analytic answer; the readouts show where every joule went.",
    checks: [
      {
        prompt: "2 kg at 4 m/s hits 3 kg at rest, elastic. The 3 kg cart leaves at…",
        options: ["4.0 m/s", "1.6 m/s", "3.2 m/s", "2.4 m/s"],
        answer: 2,
        why: "u₂ = 2·m₁/(m₁+m₂) × v₁ = (4/5) × 4 = 3.2 m/s. The 1.6 m/s answer is the stick-together velocity — same masses, different collision.",
      },
      {
        prompt: "The same carts stick together instead. Kinetic energy lost is…",
        options: ["0 J — momentum is conserved", "6.4 J", "9.6 J", "16 J"],
        answer: 2,
        why: "K before = ½ × 2 × 16 = 16 J; K after = ½ × 5 × 1.6² = 6.4 J; lost = 9.6 J. Momentum conservation never promised the energy back.",
      },
      {
        prompt: "A collision has e = 1. That means…",
        options: [
          "The masses stick together",
          "Kinetic energy is conserved",
          "The approach speed was zero",
          "Momentum is conserved but energy is not",
        ],
        answer: 1,
        why: "e = 1 is the definition of perfectly elastic: separation speed equals approach speed, and the kinetic energy budget closes exactly.",
      },
      {
        prompt: "A real ball dropped from 1.00 m bounces to 0.64 m. Its coefficient of restitution is…",
        options: ["0.64", "0.80", "0.41", "1.00"],
        answer: 1,
        why: "e = √(h_bounce/h_drop) = √0.64 = 0.80, because bounce height goes as v². Using the raw height ratio 0.64 is the square of the answer.",
      },
    ],
  },
];
