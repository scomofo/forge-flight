import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 6 — Torque, rotation & equilibrium.
 * These three lessons are physics-track indices 16–18, after Week 5.
 * Evidence due: beam reactions and torque problem set (lesson 3 bench).
 */
export const physicsW6Lessons: Lesson[] = [
  {
    id: "torque",
    track: "physics",
    index: 16,
    title: "Torque: force with a lever arm",
    minutes: 35,
    lede: "Compute a moment as τ = rF sin θ, assign its sign by the right-hand rule, and size a wrench from a bolt's torque specification.",
    opening: { mode: "prose", heading: "Distance from the pivot matters" },
    readFlow: [
      { kind: "example", heading: "Can this wrench reach the spec?" },
      { kind: "idea", idea: 0, label: "Lever arm" },
      { kind: "idea", idea: 1, label: "Sign" },
      { kind: "idea", idea: 2, label: "Torque vs energy" },
      { kind: "move", heading: "Take moments about the pivot" },
    ],
    start:
      "A rusted bolt may not move with a short ratchet but breaks loose when you add a longer handle. The applied force may be the same; the lever arm is not. || Torque measures the turning effect of a force about a pivot: τ = rF sinθ. Only the component of force perpendicular to the lever arm contributes. A force directed straight along the handle produces no torque. || Pick a sign convention for clockwise and counterclockwise torque, then add the torques algebraically. The net torque determines the angular acceleration.",
    use: "Whenever a force acts at a distance from a pivot: wrenches, see-saws, door handles, bracket bolts, crane loads. || Identify the pivot. Measure r from the pivot to the force's point of application. Take the component of F perpendicular to r — equivalently rF sin θ, where θ is the angle between the arm and the force. Assign + for counterclockwise, − for clockwise, and sum. || Stop when you can state the net torque with sign and units (N·m). If it is zero, the body has no angular acceleration; if not, you know which way it turns.",
    example:
      "A lug nut calls for 110 N·m. You have a 0.25 m wrench and can pull with 400 N perpendicular to the handle. || τ = rF sin θ = 0.25 × 400 × sin 90° = 100 N·m. Perpendicular means sin θ = 1, the best case. || 100 < 110: you cannot reach spec with this wrench at 90°. Either lengthen the arm or push harder — and note that pulling at 60° would give only 0.25 × 400 × sin 60° ≈ 86.6 N·m, because the lever arm shrinks with sin θ.",
    ideas: [
      {
        heading: "Only the perpendicular component creates torque",
        body: "Torque depends on the perpendicular distance from the pivot to the force's line of action. Increasing that distance increases the torque without changing the force. That is why door handles are placed far from hinges and longer wrenches are easier to use.",
        formula: "τ = rF sin θ (N·m)",
      },
      {
        heading: "Keep the torque signs consistent",
        body: "Choose one rotational direction as positive and keep it throughout the problem. If clockwise and counterclockwise torques oppose each other, they need opposite signs. A quick sketch of the expected turning direction is often the easiest sign check.",
        formula: "Στ = 0 ⇒ no angular acceleration",
      },
      {
        heading: "Torque and energy are not the same quantity",
        body: "Torque and work can both be written in newton-metres, but they represent different quantities. A torque applied to something that does not rotate transfers no mechanical energy. When rotation occurs, rotational power is P = τω.",
        formula: "P = τω — only when it spins",
      },
    ],
    bench: "torquebal",
    prompt:
      "Balance the see-saw: move the 20 kg rider until the net torque reads zero. || Then switch to the wrench tab and find the pull angle that gives exactly half the maximum torque.",
    note: "The bench treats the see-saw as massless and the pivot as frictionless — real boards have weight and pivots have friction, which is why real balance points sit slightly off the ideal.",
    checks: [
      {
        prompt: "A 0.25 m wrench, 80 N applied perpendicular to the handle. The torque is…",
        options: ["20 N·m", "0.2 N·m", "320 N·m", "20 J"],
        answer: 0,
        why: "τ = rF sin θ = 0.25 × 80 × 1 = 20 N·m — newton-meters of torque. No displacement means no energy transferred, so not joules.",
      },
      {
        prompt: "Same wrench and force, but the pull is at 30° to the handle. Now the torque is…",
        options: ["10 N·m", "20 N·m", "17.3 N·m", "40 N·m"],
        answer: 0,
        why: "sin 30° = 0.5, so τ = 0.25 × 80 × 0.5 = 10 N·m — exactly half. The lever arm collapsed to r sin θ.",
      },
      {
        prompt: "Two torques act on a pulley: +40 N·m and −25 N·m. The pulley…",
        options: [
          "Angularly accelerates counterclockwise",
          "Stays still — torques cancel",
          "Angularly accelerates clockwise",
          "Spins at constant speed",
        ],
        answer: 0,
        why: "Net torque is +15 N·m, counterclockwise, so angular acceleration is CCW. Constant speed would need net zero torque (or exactly balanced friction, which isn't given).",
      },
      {
        prompt: "You push straight along the wrench handle, directly toward the bolt. The torque is…",
        options: ["Zero — no perpendicular component", "rF, unchanged", "Negative rF", "Doubled"],
        answer: 0,
        why: "θ = 0 between arm and force, so sin θ = 0. All of the force squeezes the bolt; none of it turns it.",
      },
    ],
  },
  {
    id: "rotation",
    track: "physics",
    index: 17,
    title: "Rotation: kinematics and inertia",
    minutes: 35,
    lede: "Translate between linear and angular motion with the r-map, compute moments of inertia from mass distribution, and predict spin-up under a known torque.",
    opening: { mode: "steps", heading: "Translate linear motion into rotation", labels: ["Angular quantities", "The radius map", "Mass distribution"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Radius map" },
      { kind: "example", heading: "Spin up a cylinder" },
      { kind: "idea", idea: 1, label: "Moment of inertia" },
      { kind: "idea", idea: 2, label: "Offset axis" },
      { kind: "move", heading: "Use τ = Iα after you know the axis" },
    ],
    start:
      "Rotational motion uses the same structure as linear motion, with angular quantities in place of linear ones. || Angle is θ, angular velocity is ω, and angular acceleration is α. For constant α, the kinematic equations have the same form as the linear ones. The radius connects angular and linear motion through s = rθ, v = ωr, and a_t = αr. || Rotational inertia is the moment of inertia I. Unlike mass alone, I depends on how the mass is distributed relative to the axis.",
    use: "Whenever something spins up, spins down, or holds a rate: flywheels, motors, gears, tossed objects. || Map the problem: write the angular quantities, use the r-map to convert any linear data, look up or compute I for the shape, then use τ = Iα exactly as you used F = ma. For composite bodies, add inertias about the same axis; for offset axes, use the parallel-axis theorem. || Stop when ω(t) or θ(t) is stated with units (rad/s, rad) and a sanity check — a 2 kg, 0.5 m-radius disk (I = 0.25 kg·m²) does not reach 100 rad/s from a 1 N·m torque in a second; it reaches 4 rad/s.",
    example:
      "A solid steel cylinder (m = 2 kg, r = 0.10 m) is spun by a constant 0.05 N·m torque for 5 s from rest. || I = ½mr² = 0.5 × 2 × 0.01 = 0.01 kg·m². α = τ/I = 0.05/0.01 = 5 rad/s². After 5 s: ω = αt = 25 rad/s, θ = ½αt² = 62.5 rad — about 10 revolutions. || A hoop of the same mass and radius has I = mr² = 0.02 kg·m² — double — so the same torque gives half the angular acceleration. Mass alone never told you that; distribution does.",
    ideas: [
      {
        heading: "Radius connects angular and linear motion",
        body: "All points on a rigid rotor share the same angular velocity and angular acceleration, but points farther from the axis move faster in linear terms. Use s = rθ, v = ωr, a_t = αr, and a_c = ω²r. Use radians in these relations.",
        formula: "v = ωr, a_t = αr, a_c = ω²r",
      },
      {
        heading: "Moment of inertia depends on mass distribution",
        body: "Moment of inertia weights each mass element by the square of its distance from the axis. Moving mass outward increases I quickly. That is why a hoop has more rotational inertia than a solid disk with the same mass and radius.",
        formula: "I = Σmr²; τ = Iα",
      },
      {
        heading: "Use the parallel-axis theorem for an offset axis",
        body: "Tabulated moments of inertia are often given about the center-of-mass axis. For a parallel axis a distance d away, use I = I_cm + md². This always increases the inertia because the new axis is farther from the mass distribution.",
        formula: "I = I_cm + md²",
      },
    ],
    bench: "rotinertia",
    prompt:
      "Pick a shape and spin it: set a torque and watch the spin-up. || Now switch the shape to a hoop at the same mass and radius and explain, in one sentence, why the angular acceleration changed.",
    note: "The bench applies the torque with no friction and no air drag — real spin-up asymptotes to a terminal rate where applied torque meets resistance. The comparison between shapes is exact; the absolute times are idealized.",
    checks: [
      {
        prompt: "A solid cylinder (m = 2 kg, r = 0.10 m) has moment of inertia…",
        options: ["0.01 kg·m²", "0.02 kg·m²", "0.2 kg·m²", "0.001 kg·m²"],
        answer: 0,
        why: "I = ½mr² = 0.5 × 2 × 0.01 = 0.01 kg·m². The 0.02 answer is the hoop — same mass and radius, mass all at the rim.",
      },
      {
        prompt: "A wheel spins at ω = 20 rad/s. A point at r = 0.5 m has tangential speed…",
        options: ["10 m/s", "40 m/s", "0.025 m/s", "10 rad/s"],
        answer: 0,
        why: "v = ωr = 20 × 0.5 = 10 m/s. Units are m/s — radians are dimensionless in the map, so they vanish from the unit.",
      },
      {
        prompt: "A rod's I about its center is ¹⁄₁₂mL². About one end it is…",
        options: ["⅓mL²", "¼mL²", "½mL²", "¹⁄₁₂mL² — unchanged"],
        answer: 0,
        why: "Parallel axis with d = L/2: ¹⁄₁₂mL² + m(L/2)² = ¹⁄₁₂mL² + ¼mL² = ⅓mL². Moving the axis away always increases I.",
      },
      {
        prompt: "Constant torque 0.05 N·m on I = 0.01 kg·m², from rest, for 5 s. Final ω…",
        options: ["25 rad/s", "5 rad/s", "0.25 rad/s", "125 rad/s"],
        answer: 0,
        why: "α = τ/I = 5 rad/s², and ω = αt = 25 rad/s. The 125 answer is θ = ½αt² = 62.5 rad — angle, not rate.",
      },
    ],
  },
  {
    id: "equilibrium",
    track: "physics",
    index: 18,
    title: "Static equilibrium and beam reactions",
    minutes: 35,
    lede: "Solve for support reactions with ΣF = 0 and Στ = 0, read supports as reaction promises, and choose the moment center that kills an unknown.",
    opening: { mode: "prose", heading: "Force balance is not enough" },
    readFlow: [
      { kind: "move", heading: "The statics routine" },
      { kind: "idea", idea: 1, label: "Support reactions" },
      { kind: "example", heading: "Solve the beam reactions" },
      { kind: "idea", idea: 2, label: "Moment point" },
      { kind: "idea", idea: 0, label: "Equation count" },
    ],
    start:
      "A scaffold plank rests on two supports and a painter stands closer to one end. The support loads are not determined by force balance alone; torque balance matters too. || Static equilibrium requires both ΣF = 0 and Στ = 0. In two dimensions that gives three scalar equations: ΣF_x = 0, ΣF_y = 0, and one moment equation. || Before solving, identify what reactions each support can provide. A pin provides two force components, a roller one, and a fixed support adds a reaction moment.",
    use: "For any structure at rest: bridges, brackets, shelves, crane booms. || Draw the free body (Week 3's discipline). List support reactions per the support type. Write ΣF_y = 0, then Στ = 0 about the point that eliminates the most unknowns — usually one support, so the other reaction drops out of the moment equation. Solve, then check: reactions must sum to the total load, and each must be positive (a negative reaction means your assumed direction was wrong, or the beam lifts off). || Stop when both reactions are found and the check passes. If a reaction comes out negative, flip its assumed direction and say what that means physically.",
    example:
      "A 6 m beam, pin at x = 0, roller at x = 6 m. Loads: 800 N at 2 m, 400 N at 5 m. || Στ about the pin: B_y × 6 = 800 × 2 + 400 × 5 = 3600, so B_y = 600 N. ΣF_y = 0: A_y = 1200 − 600 = 600 N. || Check: 600 + 600 = 1200 = total load ✓. Both positive, so both supports push up. Note the symmetry of the answer is a coincidence of these numbers — move the 400 N load to 4 m and B_y drops to 3200/6 ≈ 533 N.",
    ideas: [
      {
        heading: "Planar equilibrium gives three equations",
        body: "For a rigid body in a plane, equilibrium gives ΣF_x = 0, ΣF_y = 0, and Στ = 0. If the support model introduces more independent reaction unknowns than that, statics alone is not enough to solve them.",
        formula: "ΣF_x = 0; ΣF_y = 0; Στ_A = 0",
      },
      {
        heading: "Support type determines the possible reactions",
        body: "A pin can provide horizontal and vertical reaction forces. A roller provides one reaction normal to its rolling surface. A fixed support can provide both force components and a moment. Use only the reactions the support can physically supply.",
        formula: "pin: 2 · roller: 1 · fixed: 3",
      },
      {
        heading: "Choose a moment point that removes an unknown",
        body: "You can sum moments about any point. Choosing a support point often removes that support's unknown reaction from the moment equation because its lever arm is zero. That usually leaves one unknown to solve directly.",
        formula: "Στ_A = 0 ⇒ B_y·L = Σ F_i·x_i",
      },
    ],
    bench: "beamrxn",
    prompt:
      "Solve the beam: read each problem's loads, compute the two reactions, enter them. || All three problems must pass the ±2% tolerance — the beam problem set is the evidence for this week.",
    note: "The solver assumes a weightless beam, vertical loads only, and ideal supports. Real beams carry self-weight (a uniform load of their own) and real supports settle — both shift the reactions slightly.",
    checks: [
      {
        prompt: "6 m beam, pin at 0, roller at 6 m. 800 N at 2 m, 400 N at 5 m. The roller reaction is…",
        options: ["600 N", "533 N", "800 N", "1200 N"],
        answer: 0,
        why: "Moments about the pin: B_y × 6 = 800×2 + 400×5 = 3600, so B_y = 600 N. The 533 N answer is for the 400 N load at 4 m instead.",
      },
      {
        prompt: "A 6 m beam carries a uniform 200 N/m over its whole length. Each support reaction is…",
        options: ["600 N", "1200 N", "200 N", "300 N"],
        answer: 0,
        why: "Total load 200 × 6 = 1200 N acting at midspan (3 m). By symmetry each support carries half: 600 N. A uniform load is its total, placed at its centroid.",
      },
      {
        prompt: "Your solution gives A_y = −150 N on a simply supported beam. Physically this means…",
        options: [
          "The beam would lift off the left support unless held down",
          "The arithmetic is definitely wrong",
          "The right support carries extra",
          "Equilibrium is impossible",
        ],
        answer: 0,
        why: "A negative upward reaction means the support would have to pull down to keep equilibrium — a plain sawhorse cannot. The beam lifts off unless it is tied down; the math is reporting a real physical outcome.",
      },
      {
        prompt: "Why take moments about the pin support rather than midspan?",
        options: [
          "The pin's unknown reaction drops out of the equation",
          "Moments are only valid about supports",
          "It makes the roller reaction zero",
          "Midspan moments are always larger",
        ],
        answer: 0,
        why: "A force through the moment center contributes no moment, so Στ_A = 0 contains only B_y — one equation, one unknown. Any center is valid; the support just happens to eliminate an unknown.",
      },
    ],
  },
];
