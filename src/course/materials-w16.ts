import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 16 — Fracture, fatigue & creep.
 * These three lessons are materials-track indices 16–18, following the
 * Week 11–15 lessons at indices 1–15.
 * Evidence due: failure-forensics case report (forensics bench).
 *
 * Through-line, as every week: structure → processing → properties →
 * performance. Here the performance question is the dark one — how parts
 * break, and on what clock.
 */
export const materialsW16Lessons: Lesson[] = [
  {
    id: "fracture",
    track: "materials",
    index: 16,
    title: "Fracture: why cracks run",
    minutes: 35,
    lede: "How cracks concentrate stress, when a crack goes critical, and why a running crack keeps running.",
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "example", heading: "Work one case" },
      { kind: "idea", idea: 0, label: "First idea" },
      { kind: "idea", idea: 1, label: "Second idea" },
      { kind: "idea", idea: 2, label: "Third idea" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "Cracks change the local stress field dramatically, which is why a structure can fail even when the nominal stress looks acceptable. || For blunt geometric features, a stress-concentration factor is often enough. For an actual crack, fracture mechanics uses the stress-intensity factor K, which grows with applied stress and crack size. || Failure occurs when K reaches the material's fracture toughness K_IC. Crack size therefore matters directly: a defect that was harmless earlier can become critical as it grows."
    use: "Whenever a part carries load and might contain a flaw — which is every part. And at every hole, fillet, keyway, and weld toe, where the nominal stress is not the stress the material actually feels. || Multiply the nominal stress by K_t — 3 for a circular hole, worse for sharp notches. For a crack of half-length a, compute K = Yσ√(πa) and compare it against the material's K_IC. Solve for the critical crack size a_c, then ask whether your inspection can reliably find anything near it. || Stop calculating when K sits below K_IC with margin and a_c is comfortably above your detection limit. If a_c is smaller than what you can reliably find, the design has to change — detection alone will not keep the part safe.",
    example:
      "A steel plate carries 200 MPa. Its fracture toughness K_IC is 50 MPa√m, and a crack of 5 mm half-length is found. Acceptable? || K = 1 × 200 × √(π × 0.005) = 200 × 0.1253 = 25.1 MPa√m — half of K_IC, so the crack sits still today. The critical size: a_c = (50/200)²/π = 0.0625/π = 0.0199 m, about 20 mm. || A 5 mm crack leaves a factor of four on size at this stress. But a_c falls as 1/σ², so doubling the stress quarters it to 5 mm. Whatever crack size you are comfortable with has to be recomputed whenever the stress changes.",
    ideas: [
      {
        heading: "Stress concentrations raise the local stress",
        body: "Holes, shoulders, keyways, and weld toes multiply the stress the material feels. A small circular hole in tension carries a stress concentration factor of 3 — the edge of the hole sees three times the nominal stress, by geometry alone, regardless of alloy. Cracks are worse: Inglis's ellipse with the tip radius driven to zero sends K_t toward infinity, which is exactly why the multiplier picture gives way to the stress-intensity picture once a real crack exists.",
        formula: "σ_local = K_t · σ_nominal; K_t ≈ 3 for a circular hole",
      },
      {
        heading: "Crack growth requires enough energy release",
        body: "A crack extends when the elastic strain energy released by its growth exceeds the energy cost of the new surface. That budget gives Griffith's fracture stress, and it falls as the crack lengthens — the theoretical strength of glass is gigapascals, while a scratched window breaks at a sneeze. Worked for glass, E = 70 GPa and γ ≈ 1 J/m²: a 1 μm flaw gives √(2 × 70×10⁹ × 1 / (π × 10⁻⁶)) ≈ 211 MPa; a 1 mm scratch drops it to about 6.7 MPa. The strength of a brittle solid is set by its largest flaw, not by its bonds.",
        formula: "σ_f = √(2Eγ / πa)",
      },
      {
        heading: "Fracture toughness sets the critical crack condition",
        body: "Plane-strain fracture toughness K_IC is the material's resistance to a running crack, measured per ASTM E399. Thin sections show a higher apparent toughness K_c; K_IC is the thickness-independent, conservative value. It does depend on temperature — BCC steels cross a ductile-to-brittle transition where K_IC collapses, which is what broke the Schenectady's hull at the dock. A toughness number without a temperature is a rumor.",
        formula: "K = Yσ√(πa) must stay below K_IC",
      },
    ],
    bench: "forensics",
    prompt:
      "Four broken parts, four histories. For each one: name the failure mode from the fracture surface and the loading — then pick the test that would confirm it. || The surface always testifies first: chevrons point at origins, striations count cycles, dimples confess overload. || Get all four modes right, and write one sentence per case saying what the designer should have done differently.",
    note: "Cases are anonymized and simplified from real failures. Real forensics starts with preserving the fracture surface — every touch after the break destroys evidence.",
    checks: [
      {
        prompt: "A small circular hole in a plate under tension raises the local stress by a factor of…",
        options: ["3", "1.5", "9", "√3"],
        answer: 0,
        why: "The classical stress concentration factor for a circular hole in uniaxial tension is 3 — the hole's edge sees three times the nominal stress. The factor is geometric, not material; no alloy negotiates it down.",
      },
      {
        prompt: "The critical crack size at 200 MPa is 20 mm. At 400 MPa it is…",
        options: ["5 mm", "10 mm", "20 mm", "40 mm"],
        answer: 0,
        why: "a_c = (K_IC/Yσ)²/π scales as 1/σ². Doubling the stress quarters the critical size. Overload plus an 'acceptable' crack is the classic combination that kills.",
      },
      {
        prompt: "Chevron marks on a fracture surface point…",
        options: [
          "Back toward the crack origin",
          "In the direction of crack growth",
          "Toward the thickest section",
          "Nowhere — they carry no information",
        ],
        answer: 0,
        why: "Chevrons and river patterns point back toward where the crack started — the cheapest fractography there is. Find the origin and you usually find the cause: the defect, the corner, the weld.",
      },
      {
        prompt: "A steel that is ductile at 20°C can shatter at −30°C because…",
        options: [
          "It crossed its ductile-to-brittle transition",
          "Cold weakens atomic bonds",
          "Ice forms inside the metal",
          "Yield strength falls in the cold",
        ],
        answer: 0,
        why: "BCC steels have a ductile-to-brittle transition temperature; below it, fracture toughness collapses and cleavage replaces ductile tearing. The Liberty ships' steel passed its tests at room temperature — the ocean was not room temperature.",
      },
    ],
  },
  {
    id: "fatigue",
    track: "materials",
    index: 17,
    title: "Fatigue: death by a thousand cycles",
    minutes: 35,
    lede: "Reading an S-N curve, estimating life with Basquin's law, combining load blocks with Miner's rule — and what the Comet taught us about square windows.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "A component can fail after many repeated loads even when each individual load is below the static yield strength. That is fatigue. || Repeated stress cycles can initiate and grow cracks. Stress concentrations accelerate the process, which is why geometry, surface condition, and small defects matter so much. || Use an S-N curve when the design question is stress level versus number of cycles, and use crack-growth methods when a crack is already present."
    use: "For any part that sees repeated loading: read the S-N curve at your stress amplitude, or compute N = ½(σ_a/σ_f′)¹⸍ᵇ. For mixed loading, add damage fractions with Miner's rule. For the remaining life of a known crack, integrate the Paris law. || Steels show an endurance limit near half the ultimate strength — below it, life is effectively infinite. Aluminum and most non-ferrous metals show none: every cycle costs something, so you design to a finite life and inspect on schedule. || Stop when the Miner sum sits comfortably below 1 with margin for scatter — fatigue data scatters by factors, not percents — and when the inspection interval is a fraction of the crack-growth life from detectable to critical.",
    example:
      "A steel shaft sees fully reversed bending at σ_a = 300 MPa. The material's σ_f′ = 900 MPa and b = −0.1. How long does it live? || N = ½(300/900)^(1/−0.1) = ½(1/3)^(−10) = ½·3^10 = ½·59049 ≈ 29,500 cycles. || Thirty thousand cycles: at 10 Hz that is under an hour; at one pressurization per flight, it is years of service. Same number, different clock — which is why the usage spectrum, not just the stress, decides the design.",
    ideas: [
      {
        heading: "S-N curves relate stress amplitude to fatigue life",
        body: "Wöhler's S-N curves plot stress amplitude against cycles to failure on log-log axes, where Basquin's power law is a straight line. Steels flatten near half the ultimate strength — the endurance limit, below which the curve runs effectively forever. Aluminum keeps falling: no plateau, so every cycle does some damage and you design for a finite life.",
        formula: "σ_a = σ_f′(2N)^b",
      },
      {
        heading: "Paris law models stable fatigue crack growth",
        body: "The Paris law says a crack's growth per cycle goes as the stress-intensity range raised to m — about 3 for metals. Doubling ΔK multiplies the growth rate by eight. Worked: with C = 1×10⁻¹¹ m/cycle (ΔK in MPa√m) and m = 3, a crack at ΔK = 20 MPa√m grows 10⁻¹¹ × 20³ = 8×10⁻⁸ m — 0.08 μm per cycle; at 40 MPa√m, 0.64 μm. The corollary that matters: a crack spends most of its life short, then sprints. Inspection intervals are sized from that sprint — the growth life from a detectable crack to a critical one.",
        formula: "da/dN = C(ΔK)^m",
      },
      {
        heading: "Miner's rule combines damage from different cycle levels",
        body: "Real loading is a spectrum, not a single amplitude. Miner's rule adds up the damage fractions — cycles spent over life available, block by block — and predicts failure at a sum of 1. Spend 100,000 cycles of a 200,000-cycle life and 100,000 of a 400,000-cycle life: 0.5 + 0.25 = 0.75, a quarter of the life left. It ignores sequence effects, and fatigue life scatters by factors of three to ten, so design factors on life that look cowardly are actually calibrated.",
        formula: "Σ(n_i / N_i) = 1 at failure",
      },
    ],
    bench: "snlife",
    prompt:
      "Pick a material and set the stress amplitude; read the Basquin life and check it against the endurance limit. Then spend two load blocks and watch Miner's sum decide. || Drop the amplitude below the steel's endurance limit and watch the life go effectively infinite — then try the same trick on aluminum. || Finish with a Miner sum under 0.7 after spending both blocks, and say in one sentence why the margin is not cowardice.",
    note: "Teaching coefficients, not a fitted alloy: σ_f′ and b are representative, and the bench ignores surface finish, notches, and mean stress — all of which shorten real life. A scratch or a weld toe can skip the crack's birth entirely.",
    checks: [
      {
        prompt:
          "The example's steel (σ_f′ = 900 MPa, b = −0.1) now sees fully reversed σ_a = 400 MPa. What life does Basquin predict?",
        options: ["≈ 1,660 cycles", "≈ 3,330 cycles", "≈ 22,100 cycles", "Effectively infinite"],
        answer: 0,
        why: "2N = (400/900)^(1/−0.1) = (0.444)^(−10) = 2.25¹⁰ ≈ 3,325 reversals, so N ≈ 1,660 cycles. 3,330 stopped at reversals — Basquin counts 2N. 22,100 scaled the 300 MPa life of 29,500 down linearly; with an exponent of −10, a third more stress costs a factor of about 18 in life. Infinite took half of σ_f′ as the endurance limit — that limit is about half the ultimate, and this steel already had a finite life at 300 MPa.",
      },
      {
        prompt: "With a Paris exponent m = 3, doubling the stress-intensity range multiplies the crack growth rate by…",
        options: ["8×", "2×", "3×", "6×"],
        answer: 0,
        why: "Growth goes as (ΔK)³, and 2³ = 8. Small stress increases buy large life penalties — the exponent is the whole story, which is why stress concentration and fatigue are never separate subjects.",
      },
      {
        prompt: "Miner's damage sum reaches 1.0. The correct reading is…",
        options: [
          "Failure is predicted — redesign, derate, or retire",
          "Half the life remains",
          "Only the largest block mattered",
          "The part has reached yield",
        ],
        answer: 0,
        why: "A Miner sum of 1 predicts failure under the assumed spectrum. And because fatigue scatters by factors, a responsible design never aims at 1.0 — it aims well below and inspects.",
      },
      {
        prompt: "An aluminum airframe part has no endurance limit. The design consequence is…",
        options: [
          "Design to a finite life and inspect on schedule",
          "Raise the safety factor on yield",
          "Aluminum cannot be used",
          "Polish the surface and ignore the cycles",
        ],
        answer: 0,
        why: "Without an endurance limit every cycle costs something, so the part gets a rated life and a retirement or inspection schedule — the inspection-and-retirement discipline the Comet inquiry pushed the industry toward.",
      },
    ],
  },
  {
    id: "creep",
    track: "materials",
    index: 18,
    title: "Creep: failure on a slow clock",
    minutes: 35,
    lede: "The three stages of a creep curve, why a fifty-degree rise can erase decades of life, and how Larson-Miller trades time for temperature.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "At elevated temperature, a material can continue to deform slowly under a constant load even when the stress is below the room-temperature yield strength. That is creep. || Diffusion, dislocation climb, and grain-boundary processes become more active as temperature rises. The result is time-dependent strain under sustained stress. || Creep design therefore depends on stress, temperature, and exposure time together. Temperature is especially important because many creep rates depend exponentially on it."
    use: "For any part that lives hot under load: get the secondary (steady-state) creep rate — that is the design number. Use Larson-Miller to map a short hot test onto a long cooler service life. Size the part so the predicted strain stays acceptable for the required life. || P = T(20 + log₁₀ t_r), with T in kelvin and t_r in hours: one parameter collapses time and temperature into a single number. Test hot and short; serve cooler and long. || Stop extrapolating when the time ratio passes about an order of magnitude — deformation mechanisms change, and the parameter interpolates far better than it extrapolates. And remember the grain-size reversal: fine grains are wonderful for room-temperature strength and worse for creep, because boundaries slide.",
    example:
      "A superalloy ruptures after 1,000 h at 800°C. What life does Larson-Miller predict at 700°C? || P = 1073 × (20 + log₁₀ 1000) = 1073 × 23 = 24,679. At 973 K: 20 + log₁₀ t = 24,679/973 = 25.36, so log₁₀ t = 5.36 and t ≈ 2.3 × 10⁵ h — about 26 years. || A hundred-degree drop bought a factor of 230 in life. That is the exponential at work: in creep, temperature moves the answer more than stress does. But it is a 230:1 extrapolation, far past the one-decade rule, so treat 26 years as a hypothesis to confirm with longer tests.",
    ideas: [
      {
        heading: "Creep usually passes through primary, secondary, and tertiary stages",
        body: "Primary creep decelerates as the material strain-hardens; secondary creep settles to a steady rate — the design number, the rate you size against; tertiary creep accelerates as voids and necking take over, ending in rupture. Designing on the secondary rate with a strain budget is the whole discipline, and the curve's horizontal axis is time.",
        formula: "design on ε̇_secondary, the steady-state rate",
      },
      {
        heading: "Diffusion strongly controls high-temperature creep rates",
        body: "Creep is thermally activated: Norton's power law pairs a stress exponent n (typically 3–8) with an Arrhenius term in temperature. With n = 5, 20% more stress multiplies the rate by 1.2⁵ ≈ 2.5. The activation energy Q is large, so modest temperature changes swing the rate by orders of magnitude. This is why a hot spot, not the nominal temperature, usually decides a hot part's life.",
        formula: "ε̇ = Aσⁿe^(−Q/RT)",
      },
      {
        heading: "Larson-Miller: time-temperature equivalence",
        body: "Because temperature enters exponentially, a short test at high temperature is equivalent to a long service at lower temperature — the Larson-Miller parameter makes the trade quantitative. Plot rupture data as P and the scatter collapses onto one master curve. The discipline: interpolate freely, extrapolate one order of magnitude at most, and never trust the parameter past a mechanism change.",
        formula: "P = T(20 + log₁₀ t_r)",
      },
    ],
    bench: "creeplife",
    prompt:
      "Run the hot short test: set the temperature and rupture time, and read off the Larson-Miller parameter. Then dial the service temperature down and watch the predicted life move. || Push the extrapolation past ten-to-one in time and watch the warning appear — then say why the warning exists. || Finish with a service life above 20,000 h from a test of at least 2,000 h, and name the mechanism change that would void your prediction.",
    note: "C = 20 suits most alloys in the teaching range. Real qualification runs multiple temperatures and stresses, checks that one mechanism owns the data, and still applies a factor on life. The bench's warning at ten-to-one extrapolation is industry manners, not physics.",
    checks: [
      {
        prompt: "The design number on a creep curve is the…",
        options: [
          "Secondary (steady-state) rate",
          "Primary rate",
          "Tertiary rate",
          "Rupture strain",
        ],
        answer: 0,
        why: "Secondary creep is the long, steady middle of the curve — the rate the part actually lives at. Primary is transient, tertiary is the sprint to rupture, and rupture strain is a post-mortem.",
      },
      {
        prompt: "Fine grains help room-temperature strength but hurt creep resistance because…",
        options: [
          "Grain boundaries slide at high temperature",
          "Fine grains melt earlier",
          "Dislocations cannot move in fine grains",
          "Oxidation prefers fine grains",
        ],
        answer: 0,
        why: "At creep temperatures, grain boundaries are viscous planes that slide — more boundary area means more sliding. Turbine blades are grown as single crystals precisely to delete the boundaries. Structure → properties, with the arrow flipping sign between regimes.",
      },
      {
        prompt: "The Larson-Miller parameter lets you…",
        options: [
          "Trade a short hot test for a long cooler life",
          "Convert creep strain into fatigue life",
          "Measure K_IC at temperature",
          "Eliminate testing",
        ],
        answer: 0,
        why: "P = T(20 + log t_r) collapses time and temperature into one number, so a short test at 800°C speaks about a longer life at 700°C. Kept within about ten-to-one it interpolates well; past that it is a hypothesis. It organizes testing; it never replaces it.",
      },
      {
        prompt: "Extrapolating a 1,000 h test to 200,000 h of service is risky because…",
        options: [
          "Deformation mechanisms can change across time and temperature",
          "The arithmetic is too hard",
          "Larson-Miller stops working above 500°C",
          "Creep always stops after 10,000 h",
        ],
        answer: 0,
        why: "A mechanism change — dislocation creep giving way to diffusional creep, a precipitate coarsening — moves the master curve without asking. Extrapolation assumes the mechanism you tested is the mechanism that serves.",
      },
    ],
  },
];
