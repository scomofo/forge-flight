import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 13 — Defects, diffusion & processing.
 * Materials-track indices 7–9. Evidence due: diffusion profile exercise
 * (diffusion bench). Through-line: structure → processing → properties
 * → performance.
 */
export const materialsW13Lessons: Lesson[] = [
  {
    id: "defects",
    track: "materials",
    index: 7,
    title: "Defects are the material",
    minutes: 35,
    lede: "Explain why a perfect crystal should be ten to a thousand times stronger than any real metal, and name the three defect families that do the actual work.",
    start:
      "In 1926 Frenkel estimated the shear strength of a perfect crystal: slide one atomic plane over another, and the stress needed is about G/2π, where G is the shear modulus — ~13 GPa for iron. Refined models give ~G/30, about 2.7 GPa. Real iron yields at a few hundred MPa or less: 10–1000× lower, depending on purity. || The word: a dislocation is a line defect — an extra half-plane of atoms wedged into the crystal. Moving a dislocation is a small local shuffle, not a whole-plane slide, so the stress it needs is ten to a thousand times smaller. In 1934 Taylor, Orowan, and Polanyi proposed this independently to close exactly Frenkel's gap. || Why the rule has that shape: calling defects 'damage' gets it backwards. They are the machinery that every useful property runs on — strength, hardening, diffusion itself. A perfect crystal would be a curiosity, not an engineering material.",
    use: "Whenever you ask why a metal is soft or strong: check the defect population, not the composition. || Classify by dimension: 0D point defects (vacancies, interstitials), 1D line defects (dislocations), 2D planar defects (grain boundaries, stacking faults). Vacancy site fraction obeys Boltzmann, n/N = exp(−Qv/kT). Dislocation motion is slip; blocked dislocations are strength. || Stop when you can point at a processing step and name the defect it targets — quenching freezes vacancies in, cold work multiplies dislocations, annealing sweeps both out.",
    example:
      "Copper, vacancy formation energy Qv ≈ 0.9 eV. What fraction of sites are empty at 1000 K — and at room temperature? || n/N = exp(−0.9 / (8.617×10⁻⁵ × 1000)) = exp(−10.44) ≈ 2.9×10⁻⁵ at 1000 K. At 300 K: exp(−34.8) ≈ 7.6×10⁻¹⁶. || Heating from room temperature to 1000 K multiplies the equilibrium vacancy population by roughly 4×10¹⁰. Quench from high temperature and you freeze that far-from-equilibrium population into the metal — and it drives diffusion, aging, and precipitation from the inside.",
    ideas: [
      {
        heading: "Perfect is weak",
        body: "Frenkel's whole-plane shear estimate is τ ≈ G/2π (~13 GPa for iron); refined models give ~G/30 (~2.7 GPa). Real yield is 10–1000× lower, depending on purity. The resolution is not a better estimate — it is a different mechanism. Dislocations let a crystal shear one atomic row at a time, like moving a rug by pushing a wrinkle across it instead of dragging the whole rug.",
        formula: "τ_theoretical ≈ G/2π (refined: ~G/30),  τ_measured ≪ τ_theoretical",
      },
      {
        heading: "Vacancies obey Boltzmann",
        body: "The equilibrium vacancy fraction is exp(−Qv/kT): exponential in temperature, so temperature is a dial, not a nudge. A few hundred kelvin moves the population by ten orders of magnitude. Anything quenched from high temperature carries a frozen-in excess — supersaturated vacancies that later condense into loops, assist diffusion, and nucleate precipitates.",
        formula: "n/N = exp(−Qv/kT)",
      },
      {
        heading: "Boundaries pin dislocations",
        body: "A grain boundary is a wall that a gliding dislocation cannot cross without help, so fine grains mean short slip distances and higher strength: Hall–Petch, σy = σ0 + k/√d. Cold work raises strength the other way — by multiplying dislocations until they tangle and block each other. Both come down to the same thing: strength is controlled by how hard it is for dislocations to move.",
        formula: "σy = σ0 + k/√d",
      },
    ],
    bench: "defects",
    prompt:
      "Pick a defect family and read its signature. || Drag the temperature and watch the equilibrium vacancy fraction swing ten orders of magnitude. || Say which defect each step targets: quench, cold work, anneal.",
    note: "Vacancy numbers use copper's 0.9 eV as a classroom value; real Qv runs roughly 0.5–1.5 eV by metal. The lattice drawings are cartoons — a few dozen atoms standing in for 10²³.",
    checks: [
      {
        prompt: "Refined Frenkel-style estimates say a perfect crystal should shear at ~G/30, but real metals yield far below that. Why?",
        options: [
          "Dislocations move at far lower stress than whole-plane shear",
          "Grain boundaries carry most of the load",
          "Vacancies absorb the applied stress",
          "Real crystals have extra-perfect planes",
        ],
        answer: 0,
        why: "A dislocation moves by a small local shuffle — the rug-wrinkle mechanism — so slip happens at stresses ten to a thousand times below whole-plane shear. The gap between G/30 and measured yield is the signature of dislocations, not of experimental error.",
      },
      {
        prompt: "Equilibrium vacancy fraction in copper (Qv = 0.9 eV): 1000 K versus 300 K.",
        options: [
          "About 4×10¹⁰ times larger at 1000 K",
          "About three times larger at 1000 K",
          "Identical — vacancies don't depend on temperature",
          "Larger at 300 K",
        ],
        answer: 0,
        why: "n/N = exp(−Qv/kT): 2.9×10⁻⁵ at 1000 K against 7.6×10⁻¹⁶ at 300 K. The exponential makes temperature a dial with ten orders of magnitude of travel — which is why quenching can freeze in a wildly non-equilibrium population.",
      },
      {
        prompt: "Cold working a metal raises its yield strength because…",
        options: [
          "Dislocation density rises until dislocations tangle and block slip",
          "Vacancies fill in and heal the lattice",
          "The grains melt and re-form smaller",
          "Atomic bonds get stronger under pressure",
        ],
        answer: 0,
        why: "Cold work multiplies dislocations; they intersect, tangle, and pin each other, so further slip needs more stress. That is work hardening — strength bought with ductility, since the same tangles that block slip also block the slip that lets a metal deform gracefully.",
      },
      {
        prompt: "Hall–Petch says σy = σ0 + k/√d. Halving the grain size…",
        options: [
          "Raises the grain-boundary term by √2",
          "Lowers yield strength",
          "Doubles the yield strength exactly",
          "Has no effect on strength",
        ],
        answer: 0,
        why: "The boundary term goes as 1/√d, so halving d multiplies it by √2 ≈ 1.41. Grain boundaries block dislocation glide, and more boundary per volume means shorter free slip — fine grains are strong grains, down to the nanoscale where the mechanism changes.",
      },
    ],
  },
  {
    id: "diffusion",
    track: "materials",
    index: 8,
    title: "Atoms move downhill",
    minutes: 35,
    lede: "State Fick's laws, read diffusion distance as √(Dt), and price a heat treatment in hours.",
    start:
      "Carburize a gear: hang steel in a carbon-rich atmosphere at 950 °C, and carbon atoms walk into the surface. After four hours the hard case is about 0.7 mm deep. Nobody placed those atoms; they diffused. || The word: Fick's first law, J = −D ∂C/∂x — flux runs down the concentration gradient, and the minus sign is the whole content. Fick's second, ∂C/∂t = D ∂²C/∂x². For a constant surface concentration the solution is an error function: (Cs − C)/(Cs − C0) = erf(x / (2√(Dt))). || Why the rule has that shape: distance goes as the square root of time, so the economics are brutal — doubling case depth costs four times the hours. Every carburizing schedule ever written is a negotiation with that square root.",
    use: "Whenever atoms must get somewhere on a schedule: case hardening, homogenization, sintering, dopant drives. || Compute D from Arrhenius, D = D0 exp(−Q/RT); form the length 2√(Dt); read the profile. Check units first: D is m²/s, so √(Dt) is meters — a dimensional check that catches most setup errors. || Stop when you can say 'a 50 K drop costs roughly double the time' and back it with a number, not a feeling.",
    example:
      "Carburize at 950 °C: Cs = 1.1 wt%, C0 = 0.2 wt%. How deep does 0.4 wt% reach in 4 hours? || D = 2.3×10⁻⁵ exp(−148000/(8.314×1223)) ≈ 1.10×10⁻¹¹ m²/s. 4 h = 14400 s, so 2√(Dt) = 0.80 mm. Need (1.1 − 0.4)/(1.1 − 0.2) = 0.778 = erf(z), giving z ≈ 0.86, so x ≈ 0.86 × 0.80 ≈ 0.69 mm. || Four hours at 950 °C buys a 0.7 mm case. Drop to 900 °C and D falls to 5.9×10⁻¹² m²/s — the same profile now costs 7.4 hours. That is the time–temperature trade, priced to the hour.",
    ideas: [
      {
        heading: "Flux runs downhill",
        body: "J = −D ∂C/∂x. No gradient, no flux — no matter how high the concentration is. Atoms do not care about absolute concentration, only about which way is down. The minus sign is the second law of thermodynamics showing up in a materials equation, and every diffusion profile in this course is its consequence.",
        formula: "J = −D ∂C/∂x",
      },
      {
        heading: "Distance is root-time",
        body: "The error-function solution decays over the length 2√(Dt). Double the depth, quadruple the time; ten times the depth, a hundred times the hours. This is why diffusion is a surface treatment on human timescales — carburized cases are millimeters, not centimeters — and why homogenizing a casting takes a furnace, not a lunch break.",
        formula: "x ~ √(Dt)",
      },
      {
        heading: "Temperature buys time",
        body: "D = D0 exp(−Q/RT) is Arrhenius: a 50 K rise near 950 °C nearly doubles D for carbon in austenite. Time–temperature equivalence follows — hold Dt constant and trade furnace temperature against hours.",
        formula: "D = D0 exp(−Q/RT)",
      },
    ],
    bench: "diffprofile",
    prompt:
      "Set temperature, time, and concentrations, and read the case depth off the profile. || Hold Dt constant while dropping the temperature 50 K — watch what happens to the time. || Enter your own case-depth prediction and let the bench grade it.",
    note: "D0/Q values are standard textbook numbers for carbon in iron and titanium. The model is a semi-infinite solid in one dimension with constant surface concentration — honest about what it is, and what a real furnace adds on top.",
    checks: [
      {
        prompt: "Fick's first law is J = −D ∂C/∂x. The minus sign means…",
        options: [
          "Flux runs down the gradient, from high C toward low C",
          "Flux runs up the gradient, toward high C",
          "Concentration decreases with time",
          "D is always negative",
        ],
        answer: 0,
        why: "Atoms move from crowded to empty. The gradient ∂C/∂x points uphill toward higher concentration, so the minus sign turns the flux downhill. No gradient, no flux — however much solute is present.",
      },
      {
        prompt: "A case-hardening spec doubles the required case depth. The furnace time must…",
        options: ["Quadruple", "Double", "Increase by √2", "Stay the same — raise the temperature instead"],
        answer: 0,
        why: "Depth goes as √(Dt), so 2× depth needs 4× the Dt product at fixed temperature. Raising temperature is the other lever — Arrhenius — but at fixed T the square root is non-negotiable.",
      },
      {
        prompt: "Dropping the carburizing temperature from 950 °C to 900 °C…",
        options: [
          "Nearly doubles the time for the same profile",
          "Halves the time",
          "Changes nothing — time depends only on depth",
          "Stops diffusion entirely",
        ],
        answer: 0,
        why: "D falls from 1.10×10⁻¹¹ to 5.90×10⁻¹² m²/s — a factor of 1.86 — so holding Dt constant stretches 4 hours to 7.4. That is time–temperature equivalence with the receipt attached.",
      },
      {
        prompt: "In C(x,t) = Cs − (Cs − C0)·erf(x / 2√(Dt)), the surface x = 0 gives…",
        options: ["Cs, the imposed surface concentration", "C0, the initial concentration", "The average of Cs and C0", "Zero"],
        answer: 0,
        why: "erf(0) = 0, so the second term vanishes and C(0,t) = Cs at all times — that is the constant-surface-concentration boundary condition the solution was built for. Deep inside, erf → 1 and C → C0.",
      },
    ],
  },
  {
    id: "heat-treat",
    track: "materials",
    index: 9,
    title: "Processing is defect engineering",
    minutes: 35,
    lede: "Describe annealing, quenching, and case hardening as deliberate moves in defect populations — and predict which property moves.",
    start:
      "Same steel bar, two histories. One quenched from 850 °C rings hard and snaps; one annealed bends. Composition identical, properties unrecognizable. || The word: annealing heals — recovery, then recrystallization, then grain growth sweep out dislocations and coarsen grains. Quenching freezes — cool so fast that diffusion cannot happen and carbon is trapped in martensite: very hard, very brittle. Tempering reheats gently to trade some of that hardness for toughness. || Why the rule has that shape: structure → processing → properties → performance. Through-hardening, annealing and tempering never touch composition — they only rearrange defects, and the properties follow. Case hardening is the exception, and changes composition only in the skin.",
    use: "When you choose or diagnose a heat treatment: ask which defect population it targets. || Anneal to soften and relieve stress; quench to harden; temper to toughen. Case-harden (carburize, nitride) for a hard skin on a tough core. A TTT diagram plots the time to transform at each hold temperature; the nose is the fastest point. Read the nose: diffusion-controlled transformations at high temperature, suppressed by speed at low. || Stop when you can look at any process step and name the defect move — 'this dissolves precipitates', 'this traps carbon', 'this grows grains' — and say which property pays for it.",
    example:
      "4140 steel, three thermal histories. || Annealed: ~200 HB — soft, machinable, the baseline. Quenched from 850 °C: ~58 HRC — hard enough to scratch glass, brittle enough to fear. Quenched and tempered at 400 °C: ~42 HRC with real toughness — the working compromise. || Same chemistry, three different materials. The performance gap between a gear that lasts and one that spalls is not composition; it is the thermal history written into the defect structure.",
    ideas: [
      {
        heading: "Annealing is forgetting",
        body: "Recovery lets dislocations rearrange and annihilate; recrystallization nucleates fresh strain-free grains; grain growth coarsens them. Stress relieves, ductility returns. But over-annealing coarsens grains past the point of usefulness, and Hall–Petch collects the bill: coarse grains are soft grains. Annealing is controlled forgetting — forget too much and you lose the strength you meant to keep.",
        formula: "recovery → recrystallization → grain growth",
      },
      {
        heading: "Quenching is freezing",
        body: "Cool fast enough and diffusion never gets its say: austenite cannot decompose, so it shears diffusionlessly into martensite with carbon trapped interstitially — hard, brittle, stressed. Quench cracks are what happens when thermal stress beats the fresh martensite's strength. The severity of the quench (water, oil, air) is a dial on how completely you outrun diffusion.",
        formula: "austenite →(no diffusion)→ martensite",
      },
      {
        heading: "Case hardening is controlled diffusion",
        body: "Carburizing writes the diffusion lesson's error-function profile into a gear tooth: carbon in from the surface, hard martensitic case after quench, tough low-carbon core untouched. Nitriding does the same job with nitrogen at lower temperature and no quench. The case depth on the drawing is a diffusion length with a tolerance on it.",
        formula: "case depth x = z·2√(Dt), z = erf⁻¹((Cs−Cx)/(Cs−C0))",
      },
    ],
    bench: "grains",
    prompt:
      "Press Play to anneal. || Watch the grains coarsen and the yield strength fall — Hall–Petch in motion. || Connect it back: over-annealing is the defects lesson's grain boundaries being deleted, one boundary at a time.",
    note: "The grains bench uses a generic Hall–Petch metal, not 4140 — the constants differ by alloy. Hardness numbers above are representative classroom values, not a specification. Check the datasheet before you make anything.",
    checks: [
      {
        prompt: "Quenching hardens steel because…",
        options: [
          "Cooling outruns diffusion, trapping carbon in martensite",
          "The steel absorbs carbon from the quench oil",
          "Grain boundaries melt and re-freeze",
          "Cold water is harder than hot steel",
        ],
        answer: 0,
        why: "Fast cooling denies diffusion the time to decompose austenite into ferrite and carbide. The lattice shears to martensite with carbon trapped interstitially — enormously hard, internally stressed, and brittle until tempered.",
      },
      {
        prompt: "Over-annealing softens a metal partly because…",
        options: [
          "Grains coarsen and Hall–Petch weakens",
          "Vacancies evaporate out of the surface",
          "Dislocations multiply without bound",
          "The metal oxidizes",
        ],
        answer: 0,
        why: "Grain growth deletes grain boundary area, and boundaries are what pin dislocations — σy = σ0 + k/√d falls as d grows. Annealing heals damage, but taken too far it erases the fine structure that made the metal strong.",
      },
      {
        prompt: "Tempering a quenched steel…",
        options: [
          "Trades some hardness for toughness",
          "Increases hardness further",
          "Restores the annealed structure exactly",
          "Removes all carbon from the steel",
        ],
        answer: 0,
        why: "A gentle reheat lets some trapped carbon precipitate and relieves quench stresses. Hardness drops from the as-quenched peak, but brittleness drops faster — the usable engineering compromise lives at the tempering temperature.",
      },
      {
        prompt: "Carburizing gives a hard case on a tough core because…",
        options: [
          "Carbon diffuses in from the surface, so only the skin changes composition",
          "The whole part is heated uniformly",
          "The core is quenched harder than the case",
          "Carbon cannot diffuse in iron",
        ],
        answer: 0,
        why: "The error-function profile is steepest at the surface and decays with depth — millimeters in, the steel is still low-carbon and quenches to tough, not hard, martensite. Diffusion's √t economics are what make the case thin and the core untouched.",
      },
    ],
  },
];
