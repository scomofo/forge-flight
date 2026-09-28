import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 4 — Work, energy & power.
 * These three lessons open the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: energy audit of a
 * simple mechanism (lesson 1 bench).
 */
export const physicsW4Lessons: Lesson[] = [
  {
    id: "work",
    track: "physics",
    index: 10,
    title: "Work and the work-energy theorem",
    minutes: 35,
    lede: "You will compute the work of a force as F·d·cosθ, add works with their signs, and read the net work as the change in kinetic energy.",
    start:
      "A tow truck drags a car 40 meters. The cable pulls at 20° above horizontal with 5,000 N. How much of that pull actually goes into motion? || Work is the energy a force delivers along a displacement: W = F·d·cosθ. Only the component of force along the direction of motion counts. A force at right angles to the motion — the normal force on a rolling cart, the cable's upward tug while the car moves forward — does no work at all. Work is signed: a force opposing the motion does negative work and takes energy away. || The work-energy theorem says the net work on a body equals its change in kinetic energy: W_net = ΔK = ½mv² − ½mv₀². That turns work into a bookkeeping device — you stop asking “what are the forces at each instant?” and start asking “how much energy went in, and how fast is the body now?”",
    use: "When a force acts over a distance and you want the resulting speed — pushes, pulls, drags, braking — or when you need to split a complicated force history into signed contributions. || Resolve each force into the component along the displacement (multiply by cosθ, with θ measured from the direction of motion). Multiply by the distance. Add all the signed works. Set the total equal to ΔK and solve for the unknown — usually a speed. || Stop when the net work equals the change in kinetic energy and every force that moved the body has its line in the ledger. If a force acted but the displacement was zero — holding a weight still — its work is zero; the tired arms are chemistry, not mechanics.",
    example:
      "A 10 kg crate is pushed 5 m across a floor with a horizontal 90 N force. Friction opposes with 30 N. Starting from rest, how fast is it moving? || Applied work: W = 90 × 5 × cos0° = 450 J. Friction's work: W = 30 × 5 × cos180° = −150 J. Net work: 450 − 150 = 300 J. By the theorem, 300 = ½·10·v², so v = √60 ≈ 7.75 m/s. || Notice what we never computed: the acceleration, or how long the push took. Work lets you jump from forces straight to speed, skipping the entire kinematic middle.",
    ideas: [
      {
        heading: "Only the along-component works",
        body: "W = F·d·cosθ is a dot product in disguise: force projected onto displacement, times the distance. At θ = 90° the work is exactly zero — a centripetal force keeping a satellite in orbit does no work, which is why the orbit neither speeds up nor slows down. Holding a heavy bag motionless is zero work in physics no matter how your shoulders feel; the energy your muscles burn never enters the bag.",
        formula: "W = F·d·cosθ",
      },
      {
        heading: "The theorem is an energy ledger",
        body: "W_net = ΔK is Newton's second law integrated over distance instead of time. It is not a new law of nature; it is F = ma with the clock traded for the ruler. Its power is exactly that: when forces vary with position or the motion is messy, the ledger still balances. Positive net work speeds the body up, negative net work slows it down, and zero net work — like the satellite — means constant speed.",
        formula: "W_net = ½mv² − ½mv₀²",
      },
      {
        heading: "Signs are the whole discipline",
        body: "Work is a scalar with a sign, and the sign carries the physics: positive work adds energy, negative work removes it. Friction always does negative work on the sliding body because it always opposes the displacement. Gravity does negative work on the way up and positive work on the way down. A wrong sign is a wrong answer, not a rounding error — the most common mistake in this entire week is cos180° written as cos0°.",
        formula: "W_friction = −f_k·d",
      },
    ],
    bench: "energyaudit",
    prompt:
      "Audit one mechanism: enter the work you put in and the useful work you got out. || The efficiency is the ratio — say where the rest went. || Complete the audit for all three mechanisms, then write the one-sentence audit note.",
    note: "The audit persists in this browser. Useful output can never exceed input — if your numbers say otherwise, the measurement is wrong, not the physics.",
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
    lede: "You will sort forces into conservative and non-conservative, bank energy as gravitational and elastic potential, and predict motion from energy alone.",
    start:
      "A roller coaster climbs 20 m, then drops. Nobody computes the normal force at every point of the track — yet the speed at the bottom is predicted to three figures. || Some forces have perfect memory: gravity and ideal springs store the work done against them as potential energy and return every joule when you come back. These are conservative forces, and for them the work depends only on the endpoints, never the path. Friction is the opposite — a non-conservative force whose work depends on the whole journey and comes back as heat, never as motion. || Potential energy turns “where is it?” into “how fast can it go?” Gravitational: U = mgh. Elastic: U = ½kx². Where only conservative forces act, the sum K + U never changes — energy is conserved, and the future is an arithmetic problem.",
    use: "When heights, stretches, or speeds trade off and you want one from the other — drops, launches, pendulums, springs — without touching a force diagram. || Choose a datum (h = 0) for gravitational potential; it is differences that matter, not the absolute. Write K₁ + U₁ = K₂ + U₂, counting gravitational and elastic potential on both sides. Put any non-conservative work (friction, drag) on the ledger as a loss: K₁ + U₁ + W_nc = K₂ + U₂. || Stop when every joule is named — kinetic, gravitational, elastic, or lost — and the total on the left equals the total on the right. If the numbers do not balance, a term is missing, not the law.",
    example:
      "The coaster crests at 20 m above the dip, starting nearly from rest. What is its speed at the bottom, ignoring friction? || K₁ + U₁ = K₂ + U₂ becomes 0 + mgh = ½mv² + 0. The mass cancels — every mass falls the same way — leaving v = √(2gh) = √(2 × 9.81 × 20) = √392.4 ≈ 19.81 m/s. || That is about 71 km/h, from one line of algebra. Friction would shave it down; the energy equation tells you exactly where to subtract.",
    ideas: [
      {
        heading: "Conservative forces have memory",
        body: "Gravity returns exactly what you lent it: lift a mass h and you bank mgh; let it fall and every joule comes back as speed. Path independence is the test — hike up the switchbacks or winch straight up, the stored mgh is identical. Friction fails the test: drag a crate around a long loop and the heat lost is larger, with nothing banked. Only conservative forces get a potential energy; the rest get a loss column.",
        formula: "U_g = mgh,  U_s = ½kx²",
      },
      {
        heading: "Energy diagrams read the future",
        body: "Plot total energy as a horizontal line and potential energy as a curve: where the line meets the curve, kinetic energy is zero and the body turns around — a turning point. Where the curve dips lowest, the body moves fastest. A pendulum's U-curve is a valley; the bob oscillates between the two points where the total-energy line hits the walls. You can read bounded versus escaping motion off the diagram before writing a single equation.",
        formula: "E = K + U = const,  turning point: K = 0",
      },
      {
        heading: "Mass cancels in free fall",
        body: "v = √(2gh) has no m in it. Galileo's result falls out of energy conservation in one line: mgh = ½mv², and the m was never doing anything. This is why the hammer and the feather — in vacuum — hit together, and why the bench's drop-speed prediction ignores the mass slider. Any theory of gravity has to explain this cancellation; it is not a coincidence of the algebra.",
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
    lede: "You will price energy in watts, compute efficiency as useful over input, and write an energy budget that names every loss.",
    start:
      "Two cranes lift the same steel beam to the same height. One takes a minute, the other ten. The energy delivered is identical; the electric bills are not. || Power is the rate of energy transfer: P = W/Δt, in watts — joules per second. For a force pushing along the motion, P = F·v: the same force at twice the speed costs twice the power. Efficiency is the fraction of input energy that becomes useful output: η = W_useful / W_in. The rest is not destroyed — energy is conserved — it is merely demoted to heat, sound, and deformation you did not want. || An energy budget lists input, useful output, and every loss, and the three must sum to the input. A budget that does not balance is an unfinished measurement, not a broken law.",
    use: "When the question is how fast energy flows or where it went — motor sizing, battery life, machine efficiency, utility bills. || Compute the useful work from the task (mgh for a lift, ½mv² for a launch). Divide by the time for power, or by the input energy for efficiency. Name the losses: friction, resistance heating, air drag, sound, idle draw. || Stop when input = useful + losses, with each loss attached to a physical mechanism. If efficiency exceeds 100%, a measurement is wrong — recheck the input, which is usually where the error hides.",
    example:
      "A hoist lifts 200 kg by 3 m in 12 s. The useful work is 200 × 9.81 × 3 = 5,886 J, so the mechanical power is 5,886 / 12 ≈ 490.5 W — about two-thirds of a horsepower. The motor draws 800 W electrically. || Efficiency: η = 490.5 / 800 ≈ 0.613, or 61.3%. The missing 309.5 W is not lost to physics; it heats the windings, fights gear friction, and hums out of the housing. || Same lift, same energy — but the clock and the bill are set by power, not work. That is why motors are sold in watts and horsepower, never in joules.",
    ideas: [
      {
        heading: "Watts are joules per second",
        body: "Energy is the amount; power is the rate. A 100 W bulb and a 100 W motor move the same energy per second — the bulb just spends it on light and heat. Human sustained output is about 100 W; a horsepower is 746 W, and the name survives because James Watt needed to sell steam engines to mine owners who thought in horses. P = F·v shows the trade directly: push harder or move faster, and the power climbs.",
        formula: "P = W/Δt = F·v,  1 hp = 746 W",
      },
      {
        heading: "Efficiency names the losses",
        body: "η = useful / input is always between 0 and 1, and the gap from 1 is an itemized list: copper losses in windings, friction in bearings and gears, hysteresis, drag, sound. A good electric motor reaches 90%+; a car engine struggles past 35% because most of the fuel's energy leaves as exhaust heat — thermodynamics, not bad engineering. Raising efficiency means attacking the largest loss first, which is why the budget must name them.",
        formula: "η = W_useful / W_in ≤ 1",
      },
      {
        heading: "Budgets close the books",
        body: "Input = useful + losses is conservation of energy with the losses itemized. Every real machine obeys it; a budget that fails to balance has an unmeasured loss, usually heat. This is the same discipline as Week 1's dimensional check: a cheap, mechanical test that catches expensive errors. Designers who cannot write the budget for their machine do not understand their machine.",
        formula: "W_in = W_useful + Σ losses",
      },
    ],
    bench: "dropspeed",
    prompt:
      "Predict the drop speed from height alone, then add an initial speed. || Move the mass slider and watch the prediction ignore it. || Explain in one line why the mass cancels.",
    note: "The predictor uses v = √(v₀² + 2gh) — pure conservation, no friction. Compare with the energy bench's friction-on run to see what the real world subtracts.",
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
