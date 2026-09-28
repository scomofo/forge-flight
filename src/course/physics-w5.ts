import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 5 — Momentum & collisions.
 * These three lessons open the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: video-analysis
 * collision lab (lesson 1 bench) + restitution analysis (lesson 3 bench).
 */
export const physicsW5Lessons: Lesson[] = [
  {
    id: "impulse",
    track: "physics",
    index: 13,
    title: "Impulse and momentum",
    minutes: 35,
    lede: "You will trade force against time: the same momentum change can be a hammer blow or a gentle catch, and impulse is the ledger that records the trade.",
    start:
      "Catch a fastball barehanded and you pull your hand back with the ball; catch it against a brick wall and something breaks. The ball's velocity changes by the same amount either way. What differs is how long the change takes. || Impulse J = F_avg · Δt is force accumulated over time. Momentum p = m·v is the thing that accumulation changes: J = Δp, the impulse-momentum theorem. Stretch the stop from 10 ms to 120 ms and the average force falls by a factor of twelve, for the same Δp. || The wall does not cheat the physics — it spends the same impulse in a tenth of the time, so the force is ten times larger. Crumple zones, airbags, and bent knees are all the same trick: buy time.",
    use: "Whenever a force acts over a time interval and you need the resulting motion — impacts, launches, thrust. Also whenever a textbook quotes a huge force and you suspect the interval: divide the momentum change by the time to audit the claim. || Compute the momentum change Δp = m·(v − v₀) as a signed quantity — direction matters. Estimate or measure the interaction time Δt. Divide: F_avg = Δp/Δt. || Stop when you can say whether the average force is survivable, plausible, or absurd. If the time is unknown, say so and bound it: the force is only as honest as the time.",
    example:
      "A 0.15 kg baseball arrives at 40 m/s and the catcher's glove rides back 0.12 s. || Δp = 0.15 × (0 − 40) = −6.0 kg·m/s; the glove supplies +6.0 kg·m/s. F_avg = 6.0 / 0.12 = 50 N — about the weight of a 5 kg bag. || Now stop the same ball against a wall in 0.01 s: F_avg = 600 N. Same momentum change, twelve times the force. Time is the only variable that moved.",
    ideas: [
      {
        heading: "Impulse is the time-side of Newton's second law",
        body: "F = ma already contains impulse if you integrate it: ∫F dt = m·Δv = Δp. The theorem is not a new law; it is the second law with time as the independent variable instead of distance. That is why it handles impacts so cleanly — you rarely know the force profile of a crash, but you often know the time and the before/after velocities.",
        formula: "J = F_avg·Δt = Δp = m(v − v₀)",
      },
      {
        heading: "Momentum is a vector, so signs are physics",
        body: "A ball that bounces straight back at the same speed did not have zero momentum change — its Δp is 2·m·v, twice the magnitude of stopping it. Getting the sign wrong here is the single most common error in collision problems: draw the axis, write both velocities with their signs, then subtract. The algebra of impulse problems is bookkeeping, and bookkeeping fails silently on unsigned numbers.",
        formula: "Δp = p_after − p_before (signed)",
      },
      {
        heading: "Average force is a lower bound on peak force",
        body: "F_avg = Δp/Δt tells you the mean over the interval, but real impacts spike. For a roughly triangular force profile the peak is twice the average; for sharper profiles it is worse. When someone quotes an average deceleration as survivable, double it before you agree — the peak is what breaks bones and parts.",
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
        prompt: "Why does extending the stopping time reduce the peak force?",
        options: [
          "The momentum change is smaller",
          "The same Δp is spread over more time, so Δp/Δt falls",
          "Longer stops convert momentum to heat",
          "Friction only acts over long times",
        ],
        answer: 1,
        why: "The momentum change is fixed by the before/after velocities. Time is the only free variable: same Δp over more seconds means less force per second.",
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
    lede: "You will draw the system boundary first and compute second: momentum is conserved when the net external force is zero, and the center of mass ignores everything internal.",
    start:
      "Two skaters stand facing each other on ice and push apart. Neither was moving; now both glide away in opposite directions. No one pulled them from outside — so where did the motion come from? || Total momentum is conserved when the net external force on the system is zero. The skaters' push is internal: it redistributes momentum between them but creates none. The center of mass of the two-skater system never moved at all. || The trick is the boundary. Include both skaters and the push is internal — momentum conserved. Include only one skater and the other's push is external — momentum not conserved. Every conservation argument starts with saying what is inside the line.",
    use: "Before solving any multi-body problem: draw the boundary and ask whether external forces act during the interval. Recoil, explosions, and collisions are the canonical cases — the interaction is fast, so external forces (friction, gravity over milliseconds) are negligible and the system is effectively isolated. || Add up m·v for everything inside, with signs. Set the total before equal to the total after. Solve for the unknown velocity. || Stop when the accounting balances: the total after must equal the total before to the precision of your data. If it doesn't, either the boundary leaked (an external force acted) or the velocities are wrong.",
    example:
      "A 70 kg skater and a 50 kg skater push apart from rest on frictionless ice; the 70 kg skater glides off at +2.0 m/s. || Total momentum starts at 0, so 0 = 70 × 2.0 + 50 × v₂, giving v₂ = −2.8 m/s. The lighter skater leaves faster, opposite direction. || Check the center of mass: it started stationary and stays stationary. The motion appeared from nowhere only because you were watching one skater instead of the system.",
    ideas: [
      {
        heading: "The boundary decides what is conserved",
        body: "Conservation of momentum is a conditional statement: if ΣF_external = 0, then dp_total/dt = 0. It is not a magic property of collisions; it is Newton's third law summed over a chosen set of bodies, with the internal pairs canceling. Choose the system so the interaction you care about is internal, and the conservation law does the solving for you.",
        formula: "Σp_before = Σp_after when ΣF_ext = 0",
      },
      {
        heading: "Center of mass moves like the total mass would",
        body: "x_cm = Σm·x / Σm is the balance point of the system, and it moves at constant velocity whenever the net external force is zero — regardless of how violently the parts rearrange themselves. A firecracker's fragments scatter, but their center of mass keeps the original parabolic arc. Internal forces cancel in pairs; they cannot accelerate the whole.",
        formula: "x_cm = Σ mᵢxᵢ / Σ mᵢ",
      },
      {
        heading: "Fast and isolated beats slow and leaky",
        body: "Real systems are never perfectly isolated — friction and gravity always act. The conservation approximation works when the interaction is brief and the internal forces are huge compared to the external ones: a millisecond collision, a sudden explosion. Over seconds, friction eats momentum and the accounting fails. State the interval your conservation claim covers, and distrust it outside that interval.",
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
          "All forces are internal",
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
    lede: "You will sort collisions by what survives: momentum always does, kinetic energy only sometimes — and the coefficient of restitution measures exactly how much.",
    start:
      "A Newton's cradle clicks for a minute; a lump of clay dropped on the floor thuds once and stops. Both are collisions — masses, velocities, contact. One returns nearly all its kinetic energy; the other spends it on deformation and heat. || Momentum is conserved in both, because during the brief impact the internal contact forces dwarf everything external. Kinetic energy is conserved only in the elastic case. The coefficient of restitution e = (separation speed)/(approach speed) measures the elasticity: e = 1 is perfectly elastic, e = 0 is perfectly inelastic (they stick). || The clay and the cradle obey the same momentum equation. They differ only in e — one number that decides how much motion survives the hit.",
    use: "For any 1D two-body collision: write momentum conservation, m₁v₁ + m₂v₂ = m₁u₁ + m₂u₂. Add the restitution condition, u₂ − u₁ = e·(v₁ − v₂). Solve the pair for the two unknowns — two equations, two unknowns, done. || Use e = 1 for ideal elastic (billiards, atoms), e = 0 for stick (clay, coupled railcars), and a measured e in between for everything real. || Stop when you have both outgoing velocities and have checked momentum balances. Then compute the kinetic energy lost — it is the check that the collision was what you claimed.",
    example:
      "A 2 kg cart at 4 m/s strikes a 3 kg cart at rest, head-on. Elastic first: u₁ = (2−3)/5 × 4 = −0.8 m/s, u₂ = (2×2)/5 × 4 = 3.2 m/s — the light cart rebounds, the heavy one walks away at 3.2 m/s, and the 16 J of kinetic energy is all still there. || If they stick instead: v = (2 × 4)/5 = 1.6 m/s shared, and the kinetic energy falls to ½ × 5 × 1.6² = 6.4 J. || 9.6 J went to deformation and heat — momentum kept every joule of its own accounting, energy spent 60% of the budget. Same impact, different e.",
    ideas: [
      {
        heading: "Momentum conservation is the non-negotiable",
        body: "In an isolated collision, Σm·v before equals Σm·v after — always, elastic or not. It is the one equation you get for free. The second equation is the restitution condition, which is really a material property wearing a physics costume: it summarizes everything the collision does to kinetic energy in one measured number.",
        formula: "m₁v₁ + m₂v₂ = m₁u₁ + m₂u₂",
      },
      {
        heading: "e measures what the hit gives back",
        body: "e = (u₂ − u₁)/(v₁ − v₂): relative speed after over relative speed before, along the line of impact. A tennis ball on concrete is e ≈ 0.8; steel on steel approaches 0.95; clay is 0. It is measured, not derived — drop the ball, measure the bounce height, and e = √(h_bounce/h_drop), since height goes as v².",
        formula: "e = separation speed / approach speed",
      },
      {
        heading: "Lost kinetic energy has an address",
        body: "Energy never vanishes; 'lost' means converted — to heat, sound, and permanent deformation. The perfectly inelastic collision maximizes the loss for given masses: the pair keeps only the kinetic energy of the center-of-mass motion, ½(m₁+m₂)v_cm². That minimum surviving energy is why coupling railcars is violent and billiards is not.",
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
