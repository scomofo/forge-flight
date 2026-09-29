import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 8 — Fluids & flight fundamentals.
 * These three lessons open the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: glider model
 * pre-lab (lesson 3 bench) and force balance.
 *
 * The glider sandbox already in the repo (src/forge/sim) supplies the lift,
 * drag, and static-margin closed forms; these lessons teach the physics that
 * makes its verdicts intelligible, and the pre-lab predicts with the same
 * formulas Glider Lab evaluates.
 */
export const physicsW8Lessons: Lesson[] = [
  {
    id: "pressure",
    track: "physics",
    index: 22,
    title: "Pressure and buoyancy",
    minutes: 35,
    lede: "Compute pressure as force per unit area, find the pressure at any depth in a fluid at rest, and say exactly why a steel ship floats.",
    start:
      "Lie on a bed of nails and you walk away; step on one nail and it goes through your foot. Same weight, different area. || Pressure is force per unit area, p = F/A. In a fluid at rest it pushes equally in every direction, and it grows with depth: p = p₀ + ρgh, where p₀ is the pressure at the surface. A fluid is anything that flows — water, air, mercury — and at rest it cannot sustain a shear, so the only thing it can do to a surface is push straight into it. || The depth term is just stacked weight. The fluid at depth h must hold up the column of fluid above it, and that weight per unit area is ρgh — the pressure at any depth is the weight of the column above.",
    use: "Whenever you need the force on a submerged surface, the load on a dam face, a manometer reading, or whether an object floats. || Compute ρgh for the gauge pressure — gauge, because the atmosphere pushes on both sides of most real problems and cancels. Add atmospheric pressure only when absolute pressure is actually asked for. Multiply by area when you need force. For floating: compare average density to fluid density, not material to fluid. || Stop when you can state gauge versus absolute without hesitation, and point to the weight that a given pressure is supporting.",
    example:
      "Ten meters down in fresh water, what pushes on you? || p = ρgh = 1000 × 9.81 × 10 = 98,100 Pa — about 98 kPa gauge, roughly one more atmosphere. Your eardrums feel it because the water above is heavy, not because the water is 'pressurized' in some mysterious way. || Now the steel ship. A hull displacing 2.0 m³ of seawater feels a buoyant force of ρgV = 1025 × 9.81 × 2.0 = 20,100 N — enough to support just over two tonnes of ship. The steel never floats; the displaced water does the lifting. Average density is what matters: a ship is mostly air wearing a steel skin.",
    ideas: [
      {
        heading: "Pressure is force per area",
        body: "The SI unit is the pascal: one newton per square meter. A sharp knife cuts because the same force lands on a tiny area. Fluids at rest push normal to every surface — no sideways component, because a fluid at rest cannot sustain shear. That single fact is why dams are thick at the bottom and why your eardrums are a depth gauge.",
        formula: "p = F/A, 1 Pa = 1 N/m²",
      },
      {
        heading: "Hydrostatic pressure grows linearly with depth",
        body: "p = p₀ + ρgh. The ρgh term is the weight of the fluid column above, per unit area — nothing more. Gauge pressure drops p₀ and measures only the excess over atmosphere, which is what most instruments and most problems actually want. In mercury, thirteen times denser than water, the same pressure needs thirteen times less column: that is why barometers are short.",
        formula: "p = p₀ + ρgh",
      },
      {
        heading: "Buoyancy is displaced weight",
        body: "Archimedes' principle: the buoyant force equals the weight of the fluid the object pushes aside, F_b = ρ_fluid·g·V_displaced. An object floats when its average density — total mass over total volume, air pockets included — is below the fluid's. Steel ships, concrete canoes, and hot-air balloons are all the same trick: enclose enough nothing to bring the average down.",
        formula: "F_b = ρgV_displaced; floats if ρ_avg < ρ_fluid",
      },
    ],
    bench: "hydro",
    prompt:
      "Set the fluid and the depth, read the gauge pressure, and name the weight it represents. || Then set an object density against a fluid and predict float or sink before the bench tells you. || Finish with the ship sentence: why does steel float?",
    note: "Pressures here are gauge — above atmosphere. The float test uses average density, which is why the slider is the object's average, not its material.",
    checks: [
      {
        prompt: "The gauge pressure 10 m down in fresh water is closest to…",
        options: ["98 kPa", "9.8 kPa", "980 kPa", "1.0 kPa"],
        answer: 0,
        why: "p = ρgh = 1000 × 9.81 × 10 = 98,100 Pa ≈ 98 kPa. One atmosphere is ~101 kPa, so ten meters of water is roughly one more atmosphere — divers feel this in their ears.",
      },
      {
        prompt: "A dam's face feels more total force at the bottom than the top because…",
        options: [
          "Pressure grows with depth, so the lower band carries more",
          "Water is denser at depth",
          "The bottom is thicker concrete",
          "Atmospheric pressure only acts at the surface",
        ],
        answer: 0,
        why: "p = p₀ + ρgh grows linearly with depth, so force per unit area is larger deeper. Density is effectively constant in the water column, and atmospheric pressure acts on the whole face including the dry side.",
      },
      {
        prompt: "A steel ship floats because…",
        options: [
          "Its average density, air included, is below water's",
          "Steel is less dense than water",
          "The hull shape creates lift",
          "Surface tension holds it up",
        ],
        answer: 0,
        why: "Steel is ~7.8× denser than water and never floats by itself. The ship floats because the hull encloses air, bringing the average density of the whole vessel below water's — Archimedes cares about displaced volume, not material.",
      },
      {
        prompt: "An object of average density 800 kg/m³ floats in water. The submerged fraction is…",
        options: ["80%", "20%", "100% — it sinks", "50%"],
        answer: 0,
        why: "Floating means weight equals buoyant force: ρ_obj·V·g = ρ_water·V_sub·g, so V_sub/V = 800/1000 = 0.8. The object rides with 80% underwater — this is also why icebergs show roughly a tenth of themselves.",
      },
    ],
  },
  {
    id: "movingfluids",
    track: "physics",
    index: 23,
    title: "Moving fluids: continuity and Bernoulli",
    minutes: 35,
    lede: "Use continuity to find speeds in a constriction, apply Bernoulli where its assumptions hold, and name the places where the textbook story breaks down.",
    start:
      "Put your thumb over a garden hose and the water jets farther. You did not add a pump; you narrowed the exit. || In steady flow, mass cannot pile up inside a pipe: what flows in must flow out. So A·v is constant along the pipe — halve the area, double the speed. That is continuity: mass conservation for a steady flow. Bernoulli's equation goes one step further: along a streamline in steady, incompressible, inviscid flow, p + ½ρv² + ρgh is constant — pressure energy, kinetic energy, and elevation energy trading with each other, per unit volume. || Where the pipe narrows, the fluid speeds up, and something must have pushed it — that something is a pressure drop. Bernoulli is the ledger that says the push came from the pressure term.",
    use: "Venturi meters, pitot tubes, carburetors, any steady flow that changes section. || First check the four assumptions: steady, incompressible, inviscid, and all on one streamline. Then write the constant: p₁ + ½ρv₁² + ρgh₁ = p₂ + ½ρv₂² + ρgh₂. Solve for the unknown — usually a pressure from two speeds. || Stop when you can recite the four assumptions and name one real situation where each fails: a pump (not the same streamline energy — work is added), honey (viscous), a transonic wing (compressible), gusty flow (unsteady).",
    example:
      "A horizontal water pipe narrows from 10 cm to 5 cm diameter. Water enters at 1.0 m/s. || Area scales with diameter squared, so the throat area is a quarter of the inlet: continuity gives v₂ = 4 × 1.0 = 4.0 m/s. Bernoulli (same elevation): p₁ − p₂ = ½ρ(v₂² − v₁²) = 0.5 × 1000 × (16 − 1) = 7,500 Pa. || The throat runs 7.5 kPa below the inlet pressure — a Venturi meter reads flow rate from exactly this drop. And the honesty check: this says nothing about why wings lift. The popular 'equal transit time' story — air over the top travels farther in the same time, so it speeds up — is false; measurements show the top air arrives at the trailing edge before the bottom air. Lift comes from the wing turning the airflow downward. Bernoulli describes the resulting pressure field accurately — it just doesn't explain where the downward turn comes from.",
    ideas: [
      {
        heading: "Continuity is mass conservation",
        body: "Steady flow means the mass inside any section is unchanging, so ρAv is the same at every cross-section — and for incompressible flow, Av alone. Narrow the pipe and the fluid must speed up; there is nowhere else for the mass to go. This is the whole content of the thumb-on-the-hose trick, and it needs no energy argument at all.",
        formula: "A₁v₁ = A₂v₂ (steady, incompressible)",
      },
      {
        heading: "Bernoulli, with its assumptions attached",
        body: "p + ½ρv² + ρgh = constant along a streamline — energy per unit volume, conserved because nothing in the ideal model adds or removes it. The four assumptions are the price of admission: steady, incompressible, inviscid, one streamline. Across a pump or a turbine the constant changes (work crosses the boundary); in a boundary layer viscosity eats the budget; near Mach 1 density stops being constant.",
        formula: "p + ½ρv² + ρgh = const",
      },
      {
        heading: "The equal-transit story is wrong",
        body: "Textbooks used to claim the air over a wing must travel a longer path in the same time as the air below, forcing it faster and — by Bernoulli — to lower pressure. There is no physical law requiring equal transit time, and experiment contradicts it. The honest account: a wing turns airflow downward (Newton's third law pushes back up), and the resulting pressure field — which Bernoulli describes fine — integrates to lift. Bernoulli correctly relates pressure and speed; it just doesn't say why the air speeds up in the first place.",
      },
    ],
    bench: "venturi",
    prompt:
      "Narrow the throat and watch the speed rise and the pressure fall — then break each assumption in turn. || For each broken assumption, say in one sentence why the Bernoulli number can no longer be trusted. || Finish able to state when a Venturi meter can't be trusted.",
    note: "The bench computes the ideal Bernoulli answer and separately flags the broken assumptions. A flagged answer is not approximately right — it is outside the theory.",
    checks: [
      {
        prompt: "Water at 2 m/s enters a pipe that narrows to half its diameter. The exit speed is…",
        options: ["8 m/s", "4 m/s", "2 m/s", "1 m/s"],
        answer: 0,
        why: "Area scales with diameter squared: half the diameter is a quarter the area, so continuity (Av = const) gives v₂ = 4 × v₁ = 8 m/s. Diameter ratios fool people who forget the square.",
      },
      {
        prompt: "In the Venturi throat the pressure is lower because…",
        options: [
          "The pressure drop paid for the fluid's extra kinetic energy",
          "Fast fluid is 'thinner'",
          "The walls squeeze the pressure out",
          "Bernoulli only applies to gases",
        ],
        answer: 0,
        why: "p + ½ρv² is constant along the streamline (horizontal pipe), so the rise in ½ρv² at the throat comes directly out of the pressure term. Energy is conserved; pressure is one of its accounts.",
      },
      {
        prompt: "Bernoulli does NOT apply across a pump because…",
        options: [
          "The pump adds energy, so the Bernoulli constant changes",
          "Pumps make flow unsteady by definition",
          "Water is compressible in pumps",
          "Pressure is undefined inside a pump",
        ],
        answer: 0,
        why: "Bernoulli's constant is conserved only when nothing adds or removes energy along the streamline. A pump does work on the fluid, so p + ½ρv² + ρgh jumps across it — that jump is the pump's whole job.",
      },
      {
        prompt: "The 'equal transit time' explanation of lift is wrong because…",
        options: [
          "No law requires the top and bottom air to reunite at the trailing edge",
          "Bernoulli's equation is incorrect",
          "Wings are symmetric top and bottom",
          "Air is compressible at all speeds",
        ],
        answer: 0,
        why: "Nothing forces the two streams to arrive together — and measurements show the upper air gets there first. Bernoulli correctly relates the pressure and velocity fields, but the velocity field itself comes from the wing turning the flow, not from a transit-time constraint.",
      },
    ],
  },
  {
    id: "lift",
    track: "physics",
    index: 24,
    title: "Lift, drag, stall, static margin",
    minutes: 40,
    lede: "Predict a glider's stall speed from its wing loading, read a lift curve up to and past stall, and compute the static margin that decides whether the glider flies itself.",
    start:
      "Throw two paper airplanes: one nose-heavy, one tail-heavy. The nose-heavy one glides; the tail-heavy one tumbles. Same paper, same air — the difference is where the weight sits. || Lift and drag both scale with the dynamic pressure q = ½ρv², the wing area S, and a dimensionless coefficient that packs in all the geometry: L = qS·C_L, D = qS·C_D. C_L grows with angle of attack until the airflow lets go of the wing — stall — and then it falls. Static margin is the stability number: (x_NP − x_CG) divided by the mean chord, where x_NP is the neutral point and x_CG the center of gravity, both measured from the nose. Positive means a nose-up gust creates a nose-down restoring moment. || q is the kinetic energy per unit volume of the air you are flying through — it is the only speed scale in the problem, which is why every aerodynamic force goes as v². Stability, by contrast, is geometry alone: it does not depend on speed at all.",
    use: "Sizing a wing, checking a design's stability number, reading Glider Lab's verdicts instead of taking them on faith. || Compute wing loading W/S — the single number that sets stall speed. Compute v_stall = √(2W/(ρS·C_Lmax)): below this speed, level flight is impossible at any angle of attack. Compute the static margin and demand roughly 0.05–0.25: below 0.05 the glider is twitchy, negative is unflyable, far above 0.25 it is nose-heavy and mushy. || Stop when you can predict the stall speed from wing loading alone and call stable/marginal/unstable from the margin without touching a simulator.",
    example:
      "A balsa glider: mass 0.25 kg, wing area 0.06 m², C_Lmax 1.1. || Stall speed: v = √(2 × 0.25 × 9.81 / (1.225 × 0.06 × 1.1)) = √(4.905 / 0.08085) = √60.67 ≈ 7.79 m/s. Fly slower than ~7.8 m/s and no angle of attack will hold it up — the wing simply cannot make enough lift. Static margin: neutral point 0.30 m from the nose, CG at 0.27 m, mean chord 0.12 m → SM = (0.30 − 0.27)/0.12 = 0.25, right at the top of the stable band. || Now the force balance at cruise. At 9 m/s with C_L = 0.6: q = ½ × 1.225 × 81 = 49.6 Pa, L = 49.6 × 0.06 × 0.6 = 1.79 N against a weight of 2.45 N — short. The glider must fly faster or at a higher angle of attack; the numbers say so before the bench does.",
    ideas: [
      {
        heading: "Dynamic pressure is the only speed scale",
        body: "q = ½ρv² has units of pressure — it is the kinetic energy per unit volume of the airstream. Every aerodynamic force is q times an area times a dimensionless coefficient, which is why doubling speed quadruples the forces. Coefficients C_L and C_D carry the geometry and the angle of attack; q carries the flight condition. Separate them and the numbers stay small and honest.",
        formula: "L = qS·C_L, D = qS·C_D, q = ½ρv²",
      },
      {
        heading: "Stall is flow separation, not engine failure",
        body: "C_L climbs roughly linearly with angle of attack — then the airflow lets go of the upper surface, the wing stops turning air downward efficiently, and lift falls while drag spikes. The glider model's teaching polar does exactly this: linear to a 12° stall, then a straight decay. Past stall, pulling back harder makes things worse. Recovery is always the same: lower the nose, get the flow reattached, trade altitude for speed.",
        formula: "v_stall = √(2W / (ρS·C_Lmax))",
      },
      {
        heading: "Static margin is the stability number",
        body: "The neutral point is where the wing-plus-tail lift effectively acts; the CG is where the weight acts. If the CG sits ahead of the neutral point, a nose-up disturbance increases lift behind the CG and pushes the nose back down — restoring. Static margin = (x_NP − x_CG)/MAC measures that lever arm in chord lengths. The Glider Lab wants 0.05–0.25: enough authority to self-correct, not so much the glider plows nose-down through every gust.",
        formula: "SM = (x_NP − x_CG) / MAC",
      },
    ],
    bench: "gliderprelab",
    prompt:
      "Predict the stall speed and the stability verdict for the given glider — on paper, before touching a slider. || Then set the model to match and compare: where did your prediction miss, and which input drove the miss? || Write the force balance: at your chosen cruise, does lift carry the weight, what is the margin, and what would you change?",
    note: "The pre-lab uses the same lift, drag, and static-margin formulas Glider Lab evaluates — your predictions are checked against the model you will meet in the lab, not a simplified copy.",
    checks: [
      {
        prompt: "A glider's wing loading W/S doubles at the same C_Lmax. Stall speed…",
        options: [
          "Increases by √2",
          "Doubles",
          "Stays the same",
          "Halves",
        ],
        answer: 0,
        why: "v_stall = √(2(W/S)/(ρ·C_Lmax)) — stall speed goes as the square root of wing loading. Doubling the loading multiplies stall speed by √2 ≈ 1.41. Heavy, small-winged aircraft land hot for exactly this reason.",
      },
      {
        prompt: "Past the stall angle, increasing angle of attack…",
        options: [
          "Decreases lift and increases drag",
          "Increases lift further — the curve never bends",
          "Decreases both lift and drag",
          "Has no effect until the wing inverts",
        ],
        answer: 0,
        why: "Stall is flow separation: the wing stops turning air downward, so C_L falls off its linear climb while separated flow drives C_D up. Pulling back past stall trades lift for drag — the opposite of what the pilot wanted.",
      },
      {
        prompt: "A glider has its CG behind its neutral point. It is…",
        options: [
          "Unstable — disturbances grow instead of correcting",
          "More stable — the tail has more authority",
          "Unaffected — CG position only matters for weight",
          "Stable but slower",
        ],
        answer: 0,
        why: "Static margin = (x_NP − x_CG)/MAC goes negative, so a nose-up gust creates a nose-up moment — the disturbance amplifies. This is unflyable without active control, which is why the CG must sit ahead of the neutral point.",
      },
      {
        prompt: "At double the airspeed, with the same angle of attack, drag…",
        options: ["Quadruples", "Doubles", "Stays the same", "Halves"],
        answer: 0,
        why: "D = qS·C_D and q = ½ρv² — drag scales with v². Same for lift: this is why the force balance is so sensitive to speed, and why the stall-speed prediction matters more than any coefficient tweak.",
      },
    ],
  },
];
