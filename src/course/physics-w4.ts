import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 4 — Work, energy & power.
 * Week 4 lessons, indices 10–12. Evidence due: energy audit of a simple
 * mechanism (lesson 3 bench).
 */
export const physicsW4Lessons: Lesson[] = [
  {
    id: "work",
    track: "physics",
    index: 10,
    title: "Work and the work-energy theorem",
    minutes: 35,
    lede: "Compute the work of a force as F·d·cosθ, add works with their signs, and read the net work as the change in kinetic energy.",
    start:
      "A tow truck drags a car 40 m while the cable pulls at 20° above horizontal. Not all of that cable force contributes to the car's forward motion. || Work is force applied through a displacement: W = Fd cosθ. The cosine keeps only the component of force along the displacement. A force perpendicular to the motion does zero work. || The work-energy theorem says the net work on an object equals its change in kinetic energy. That gives you another way to solve motion problems: add the work done by each force, then use W_net = ΔK to find the speed.",
    use: "When a force acts over a distance and you want the resulting speed — pushes, pulls, drags, braking — or when you need to split a complicated force history into signed contributions. || Resolve each force into the component along the displacement (multiply by cosθ, with θ measured from the direction of motion). Multiply by the distance. Add all the signed works. Set the total equal to ΔK and solve for the unknown — usually a speed. || Stop when the net work equals the change in kinetic energy and every force that moved the body has its line in the ledger. If a force acted but the displacement was zero — holding a weight still — its work is zero; the tired arms are chemistry, not mechanics.",
    example:
      "A 10 kg crate is pushed 5 m across a floor with a horizontal 90 N force. Friction opposes with 30 N. Starting from rest, how fast is it moving? || Applied work: W = 90 × 5 × cos0° = 450 J. Friction's work: W = 30 × 5 × cos180° = −150 J. Net work: 450 − 150 = 300 J. By the theorem, 300 = ½·10·v², so v = √60 ≈ 7.75 m/s. || Notice what we never computed: the acceleration, or how long the push took. Work lets you jump from forces straight to speed, skipping the entire kinematic middle.",
    ideas: [
      {
        heading: "Only the component along the motion does work",
        body: "Use the angle between the force and the displacement. If they point the same way, work is positive. If they point opposite ways, work is negative. If they are perpendicular, the work is zero. That sign tells you whether the force is adding kinetic energy or removing it.",
        formula: "W = F·d·cosθ",
      },
      {
        heading: "Net work changes kinetic energy",
        body: "Add the signed work from all forces and set the result equal to the change in kinetic energy. Positive net work increases speed; negative net work decreases it. This is especially useful when you care about speed after a displacement and do not need the elapsed time.",
        formula: "W_net = ½mv² − ½mv₀²",
      },
      {
        heading: "Get the sign from the direction",
        body: "The most common mistake here is using the right magnitude with the wrong sign. Friction on a sliding object usually does negative work because it opposes the displacement. Gravity does negative work as an object rises and positive work as it falls.",
        formula: "W_friction = −f_k·d",
      },
    ],
    bench: "dropspeed",
    prompt:
      "Predict the drop speed from height alone: gravity's work mgh is the net work, so it equals ½mv². || Add an initial speed and watch the ½mv₀² term join the ledger. || Move the mass sliders, then explain in one line why the mass cancels.",
    note: "The predictor uses v = √(v₀² + 2gh) — the work-energy theorem with gravity as the only force doing work, no friction. Next lesson's energy bench turns friction on to show what the real world subtracts.",
    checks: [
      {
        prompt: "A 60 N force pushes a box 3 m at 60° above horizontal. The work is…",
        options: ["90 J", "180 J", "156 J", "0 J"],
        answer: 0,
        why: "W = 60 × 3 × cos60° = 180 × 0.5 = 90 J. Using the full 60 N ignores the projection; 156 J is 180 × cos30°, the wrong angle.",
      },
      {
        prompt: "A crate slides 4 m while kinetic friction of 25 N opposes it. Friction's work:",
        options: ["−100 J", "100 J", "0 J", "−400 J"],
        answer: 0,
        why: "Friction points opposite the displacement, so θ = 180° and W = 25 × 4 × (−1) = −100 J. The sign matters: friction removes energy.",
      },
      {
        prompt: "Net work of 300 J acts on a 10 kg body starting from rest. Its speed:",
        options: ["√60 ≈ 7.75 m/s", "60 m/s", "30 m/s", "√30 ≈ 5.48 m/s"],
        answer: 0,
        why: "300 = ½·10·v² gives v² = 60. The work-energy theorem skips acceleration entirely.",
      },
      {
        prompt: "A satellite in circular orbit: gravity's work over one full orbit is…",
        options: ["Zero", "Positive", "Negative", "Equal to the orbital kinetic energy"],
        answer: 0,
        why: "Gravity is always perpendicular to the displacement along the circle, so cosθ = 0 at every instant. Zero net work means constant speed — which is why the orbit is stable.",
      },
    ],
  },
  {
    id: "potential",
    track: "physics",
    index: 11,
    title: "Potential energy and conservation",
    minutes: 35,
    lede: "Sort forces into conservative and non-conservative, bank energy as gravitational and elastic potential, and predict motion from energy alone.",
    start:
      "A roller coaster climbs 20 m and then drops. You can predict its speed at the bottom without calculating every force along the track. || Gravity and ideal springs are conservative forces: their work can be represented with potential energy. For gravity near Earth's surface, U = mgh. For a spring, U = ½kx². Friction is different because it converts mechanical energy into thermal energy. || If only conservative forces act, K + U stays constant. If friction or another non-conservative force acts, include its work explicitly in the energy balance.",
    use: "When heights, stretches, or speeds trade off and you want one from the other — drops, launches, pendulums, springs — without touching a force diagram. || Choose a datum (h = 0) for gravitational potential; it is differences that matter, not the absolute. Write K₁ + U₁ = K₂ + U₂, counting gravitational and elastic potential on both sides. Put any non-conservative work (friction, drag) on the ledger as a loss: K₁ + U₁ + W_nc = K₂ + U₂. || Stop when every joule is named — kinetic, gravitational, elastic, or lost — and the total on the left equals the total on the right. If the numbers do not balance, a term is missing, not the law.",
    example:
      "The coaster crests at 20 m above the dip, starting nearly from rest. What is its speed at the bottom, ignoring friction? || K₁ + U₁ = K₂ + U₂ becomes 0 + mgh = ½mv² + 0. The mass cancels — every mass falls the same way — leaving v = √(2gh) = √(2 × 9.81 × 20) = √392.4 ≈ 19.81 m/s (four figures kept to track the arithmetic; report about 20 m/s). || That is about 71 km/h, from one line of algebra. Friction would shave it down; the energy equation tells you exactly where to subtract.",
    ideas: [
      {
        heading: "Conservative forces let you define potential energy",
        body: "For a conservative force, the work between two points depends only on the endpoints. That lets us represent the interaction with a potential-energy function. Friction is path-dependent, so instead of assigning it a potential energy, include the work it does as a loss of mechanical energy.",
        formula: "U_g = mgh,  U_s = ½kx²",
      },
      {
        heading: "Turning points occur where kinetic energy reaches zero",
        body: "On an energy diagram, total mechanical energy is fixed while potential energy changes with position. Wherever U reaches the total energy, K must be zero, so the object stops and reverses direction. Where U is lower, more of the total is available as kinetic energy.",
        formula: "E = K + U = const,  turning point: K = 0",
      },
      {
        heading: "Free-fall speed does not depend on mass",
        body: "For a drop from rest with no drag, mgh = ½mv². The mass appears on both sides and cancels, leaving v = √(2gh). Within this model, changing the object's mass does not change its speed after falling through the same height.",
        formula: "v = √(2gh),  independent of m",
      },
    ],
    bench: "energy",
    prompt:
      "Play the drop with friction off, then on. || Watch potential become kinetic, and some become heat. || Change the mass and confirm the speed does not move.",
    note: "The built-in bench drops a mass down a ramp with live energy bars. With friction on, 30% of the lost potential becomes thermal — a teaching fraction, not a measured coefficient.",
    checks: [
      {
        prompt: "A 5 kg book is lifted 2 m at constant speed. The work gravity does:",
        options: ["−98.1 J", "98.1 J", "0 J", "−196.2 J"],
        answer: 0,
        why: "Gravity points down while the displacement is up: W = mgh·cos180° = −5 × 9.81 × 2 = −98.1 J. That energy is now banked as potential, ready to return.",
      },
      {
        prompt: "A spring (k = 400 N/m) is compressed 0.15 m. Stored energy:",
        options: ["4.5 J", "60 J", "30 J", "9.0 J"],
        answer: 0,
        why: "U = ½kx² = 0.5 × 400 × 0.0225 = 4.5 J. Forgetting the ½ is the classic error — the spring force builds up linearly, so the average force is half the final one.",
      },
      {
        prompt: "Which force is non-conservative?",
        options: ["Kinetic friction", "Gravity", "Ideal spring force", "Electrostatic force"],
        answer: 0,
        why: "Friction's work depends on the path taken and dissipates as heat — it cannot be banked and returned. The other three are path-independent and each has a potential energy.",
      },
      {
        prompt: "A pendulum swings through its lowest point. There, the bob's…",
        options: ["Speed is maximum, potential is minimum", "Speed is zero", "Potential is maximum", "Acceleration is zero"],
        answer: 0,
        why: "At the bottom of the U-curve all the energy is kinetic: K is max, U is min. Speed is zero at the turning points, where the energy is all potential.",
      },
    ],
  },
  {
    id: "power",
    track: "physics",
    index: 12,
    title: "Power, efficiency, and energy budgets",
    minutes: 35,
    lede: "Price energy in watts, compute efficiency as useful over input, and write an energy budget that names every loss.",
    start:
      "Two cranes lift the same beam to the same height. One takes a minute and the other takes ten. They do the same amount of work, but not at the same rate. || Power is the rate of energy transfer: P = W/Δt. A watt is one joule per second. When a force acts along the motion, you can also use P = Fv. Efficiency is useful output divided by input. || In a real machine, the difference between input and useful output appears as losses such as heat, sound, friction, and deformation. A complete energy budget should account for all of it.",
    use: "When the question is how fast energy flows or where it went — motor sizing, battery life, machine efficiency, utility bills. || Compute the useful work from the task (mgh for a lift, ½mv² for a launch). Divide by the time for power, or by the input energy for efficiency. Name the losses: friction, resistance heating, air drag, sound, idle draw. || Stop when input = useful + losses, with each loss attached to a physical mechanism. If efficiency exceeds 100%, a measurement is wrong — recheck the input, which is usually where the error hides.",
    example:
      "A hoist lifts 200 kg by 3 m in 12 s. The useful work is 200 × 9.81 × 3 = 5,886 J, so the mechanical power is 5,886 / 12 ≈ 490.5 W (extra figures kept so the budget closes; report about 490 W) — about two-thirds of a horsepower. The motor draws 800 W electrically. || Efficiency: η = 490.5 / 800 ≈ 0.613, or 61.3%. The missing 309.5 W is not lost to physics; it heats the windings, fights gear friction, and hums out of the housing. || Same lift, same energy — but the clock and the motor size are set by power, not work. That is why motors are sold in watts and horsepower, never in joules.",
    ideas: [
      {
        heading: "Power tells you how fast energy is transferred",
        body: "Energy tells you how much work is done; power tells you how quickly it happens. The same task completed in half the time requires twice the average power. For steady motion under a force, P = Fv gives the same idea directly.",
        formula: "P = W/Δt = F·v,  1 hp = 746 W",
      },
      {
        heading: "Efficiency compares useful output with input",
        body: "Efficiency is η = useful output / input, so it must fall between 0 and 1 for an ordinary machine. If your calculation gives more than 100%, check which quantity you put in the numerator and whether you measured the full input.",
        formula: "η = W_useful / W_in ≤ 1",
      },
      {
        heading: "The energy budget has to balance",
        body: "For a real machine, input energy must equal useful output plus losses. If the numbers do not add up, look for an omitted loss or a measurement error. The balance is a practical consistency check, just like checking units.",
        formula: "W_in = W_useful + Σ losses",
      },
    ],
    bench: "energyaudit",
    prompt:
      "Audit one mechanism: enter the work you put in and the useful work you got out. || The efficiency is the ratio — say where the rest went. || Complete the audit for all three mechanisms, then write the one-sentence audit note.",
    note: "The audit persists in this browser. Useful output can never exceed input — if your numbers say otherwise, the measurement is wrong, not the physics.",
    checks: [
      {
        prompt: "A motor does 5,886 J of useful work in 12 s. Its mechanical power:",
        options: ["490.5 W", "70,632 W", "5,886 W", "408 W"],
        answer: 0,
        why: "P = W/Δt = 5,886 / 12 = 490.5 W. Multiplying by time instead of dividing is the common slip — power is energy per unit time.",
      },
      {
        prompt: "A machine takes in 800 W and delivers 490.5 W of useful power. Efficiency:",
        options: ["61.3%", "163%", "38.7%", "80%"],
        answer: 0,
        why: "η = 490.5 / 800 = 0.613. 163% is input over output — impossible, and the giveaway that the ratio is upside down.",
      },
      {
        prompt: "A 60 W bulb runs for 2 hours. Energy used:",
        options: ["432,000 J", "120 J", "7,200 J", "60 J"],
        answer: 0,
        why: "E = P·t = 60 × 7,200 s = 432,000 J (0.12 kWh). Watts times seconds gives joules — the units carry the formula.",
      },
      {
        prompt: "A force of 50 N pushes a cart at a steady 2 m/s. The power delivered:",
        options: ["100 W", "25 W", "2500 W", "0 W, since speed is steady"],
        answer: 0,
        why: "P = F·v = 50 × 2 = 100 W. Steady speed does not mean zero power — it means the 100 W is exactly canceled by friction's −100 W.",
      },
    ],
  },
];
