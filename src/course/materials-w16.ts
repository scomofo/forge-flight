import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 16 — Fracture, fatigue & creep.
 * These three lessons open the materials track (indices 1–3); the seven
 * pre-existing materials lessons follow re-indexed from 4.
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
    lede: "You will compute the stress at a notch, the crack size that turns critical, and say why a crack, once running, does not stop.",
    start:
      "In January 1943 the Liberty ship Schenectady sat at calm anchorage in Portland, Oregon — and broke in two. No storm, no collision. A crack started at a sharp hatch corner and ran the length of the welded hull in minutes. The steel met its specification. || What changed was the processing: rivets had been replaced by welding, so the hull was one continuous plate and a crack no longer stopped at a plate edge — and the North Atlantic winter pushed the steel below its ductile-to-brittle transition. Structure (BCC iron), processing (welded continuous hull), properties (toughness collapses in the cold), performance (the ship breaks at anchor). || A crack is a stress concentrator with no radius. Every sharp corner multiplies the local stress — and once a crack exists, the stress field at its tip is described not by a multiplier but by the stress intensity K. K grows as the crack grows. That is why cracks run: growth feeds the driver of growth.",
    use: "Whenever a part carries load and might contain a flaw — which is every part. And at every hole, fillet, keyway, and weld toe, where the nominal stress is not the stress the material actually feels. || Multiply the nominal stress by K_t — 3 for a circular hole, worse for sharp notches. For a crack of half-length a, compute K = Yσ√(πa) and compare it against the material's K_IC. Solve for the critical crack size a_c, then ask whether your inspection can reliably find anything near it. || Stop calculating when K sits below K_IC with margin and a_c is comfortably above your detection limit. If a_c is smaller than what you can reliably find, you do not have an inspection plan — you have a hope.",
    example:
      "A steel plate carries 200 MPa. Its fracture toughness K_IC is 50 MPa√m, and a crack of 5 mm half-length is found. Acceptable? || K = 1 × 200 × √(π × 0.005) = 200 × 0.1253 = 25.1 MPa√m — half of K_IC, so the crack sits still today. The critical size: a_c = (50/200)²/π = 0.0625/π = 0.0199 m, about 20 mm. || A 5 mm crack has a factor of four on size — but watch the scaling: double the stress and a_c quarters to 5 mm. The call is never 'small crack, fine'; it is 'critical size 20 mm at this stress, and the margin evaporates as σ².'",
    ideas: [
      {
        heading: "K_t: the nominal stress is a fiction",
        body: "Holes, shoulders, keyways, and weld toes multiply the stress the material feels. A small circular hole in tension carries a stress concentration factor of 3 — the edge of the hole sees three times the nominal stress, by geometry alone, regardless of alloy. Cracks are worse: Inglis's ellipse with the tip radius driven to zero sends K_t toward infinity, which is exactly why the multiplier picture gives way to the stress-intensity picture once a real crack exists.",
        formula: "σ_local = K_t · σ_nominal; K_t ≈ 3 for a circular hole",
      },
      {
        heading: "Griffith: cracks run on an energy budget",
        body: "A crack extends when the elastic strain energy released by its growth exceeds the energy cost of the new surface. That budget gives Griffith's fracture stress, and it falls as the crack lengthens — which is why the strength of a brittle solid is set by its largest flaw, not by its bonds. The theoretical strength of glass is gigapascals; a scratched window breaks at a sneeze. The flaw is the strength.",
        formula: "σ_f = √(2Eγ / πa)",
      },
      {
        heading: "K_IC: toughness as a material property",
        body: "Plane-strain fracture toughness K_IC is the material's resistance to a running crack, measured per ASTM E399. It depends on thickness (thin sections get plane-stress help) and on temperature — BCC steels cross a ductile-to-brittle transition where K_IC collapses, which is what sank the Schenectady's hull at anchor. A toughness number without a temperature is a rumor.",
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
    lede: "You will read an S-N curve, estimate life with Basquin's law, combine load blocks with Miner's rule, and say what the Comet taught about square windows.",
    start:
      "In 1954 two de Havilland Comets — the world's first jet airliners — broke up in flight within months of each other. The wreckage showed cracks starting at the corners of the square cabin windows. The structure had passed every static proof test; the loads that killed it were far below yield. || Each pressurization was a load cycle: the fuselage inflated and deflated like a balloon, and every cycle grew the cracks a little. Below a threshold the damage per cycle is microscopic — but cycles are counted in the thousands, and damage accumulates. And the windows were square: a square corner is a stress concentrator, K_t again, the same villain as the first lesson. || Fatigue is why parts die below their rated strength. The design question changes from 'is the stress below yield?' to 'how many cycles at this stress — and what does the S-N curve say?'",
    use: "For any part that sees repeated loading: read the S-N curve at your stress amplitude, or compute N = ½(σ_a/σ_f′)¹⸍ᵇ. For mixed loading, add damage fractions with Miner's rule. For the remaining life of a known crack, integrate the Paris law. || Steels show an endurance limit near half the ultimate strength — below it, life is effectively infinite. Aluminum and most non-ferrous metals show none: every cycle costs something, so you design to a finite life and inspect on schedule. || Stop when the Miner sum sits comfortably below 1 with margin for scatter — fatigue data scatters by factors, not percents — and when the inspection interval is a fraction of the crack-growth life from detectable to critical.",
    example:
      "A steel shaft sees fully reversed bending at σ_a = 300 MPa. The material's σ_f′ = 900 MPa and b = −0.1. How long does it live? || N = ½(300/900)^(1/−0.1) = ½(1/3)^(−10) = ½·3^10 = ½·59049 ≈ 29,500 cycles. || Thirty thousand cycles: at 10 Hz that is under an hour; at one pressurization per flight, it is years of service. Same number, different clock — which is why the usage spectrum, not just the stress, decides the design.",
    ideas: [
      {
        heading: "S-N and the endurance limit",
        body: "Wöhler's S-N curves plot stress amplitude against cycles to failure on log-log axes, where Basquin's power law is a straight line. Steels flatten near half the ultimate strength — the endurance limit, below which the curve runs effectively forever. Aluminum keeps falling: no plateau, no free lunch, every cycle debits the account.",
        formula: "σ_a = σ_f′(2N)^b",
      },
      {
        heading: "Paris: most of life is crack growth",
        body: "The Paris law says a crack's growth per cycle goes as the stress-intensity range raised to m — about 3 for metals. Doubling ΔK multiplies the growth rate by eight. The corollary that matters: a crack spends most of its life short, then sprints. Inspection intervals are sized from that sprint — the growth life from a detectable crack to a critical one.",
        formula: "da/dN = C(ΔK)^m",
      },
      {
        heading: "Miner's rule and honest scatter",
        body: "Real loading is a spectrum, not a single amplitude. Miner's rule adds up the damage fractions — cycles spent over life available, block by block — and predicts failure at a sum of 1. It ignores sequence effects, and fatigue life scatters by factors of three to ten, so design factors on life that look cowardly are actually calibrated.",
        formula: "Σ(n_i / N_i) = 1 at failure",
      },
    ],
    bench: "snlife",
    prompt:
      "Pick a material and set the stress amplitude; read the Basquin life and check it against the endurance limit. Then spend two load blocks and watch Miner's sum decide. || Drop the amplitude below the steel's endurance limit and watch the life go effectively infinite — then try the same trick on aluminum. || Finish with a Miner sum under 0.7 after spending both blocks, and say in one sentence why the margin is not cowardice.",
    note: "Teaching coefficients, not a fitted alloy: σ_f′ and b are representative, and the bench ignores surface finish, notches, and mean stress — all of which shorten real life. A scratch or a weld toe can skip the crack's birth entirely.",
    checks: [
      {
        prompt: "A steel S-N curve flattens at roughly half the ultimate strength. That plateau is the…",
        options: ["Endurance limit", "Yield strength", "Proportional limit", "Creep threshold"],
        answer: 0,
        why: "Below the endurance limit, a steel can survive effectively infinite cycles — the S-N curve goes horizontal. It is the only free lunch in fatigue, and aluminum does not get one.",
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
        why: "Without an endurance limit every cycle costs something, so the part gets a rated life and a retirement or inspection schedule — the damage-tolerance philosophy the Comet disasters created.",
      },
    ],
  },
  {
    id: "creep",
    track: "materials",
    index: 18,
    title: "Creep: failure on a slow clock",
    minutes: 35,
    lede: "You will sketch the three stages of a creep curve, feel why a fifty-degree rise can erase decades of life, and trade time for temperature with Larson-Miller.",
    start:
      "A turbine blade in a jet engine spins at ten thousand rpm in gas at 900°C. It does not melt — its melting point is far higher — and the centrifugal stress sits well below yield. Yet over thousands of hours the blade lengthens, millimeter by millimeter, until it rubs the casing. || At high temperature the atoms are mobile enough that the crystal flows under stresses that would be perfectly elastic at room temperature. Vacancies diffuse, dislocations climb, grain boundaries slide. The blade is not failing the way a tensile bar fails; it is failing the way warm glass sags — on a clock measured in years. || Creep is failure with a time axis. The design question is not 'what stress breaks it?' but 'what combination of stress, temperature, and time breaks it?' — and temperature enters exponentially, which makes it the loudest knob in the room.",
    use: "For any part that lives hot under load: get the secondary (steady-state) creep rate — that is the design number. Use Larson-Miller to map a short hot test onto a long cooler service life. Size the part so the predicted strain stays acceptable for the required life. || P = T(20 + log₁₀ t_r), with T in kelvin and t_r in hours: one parameter collapses time and temperature into a single number. Test hot and short; serve cooler and long. || Stop extrapolating when the time ratio passes about an order of magnitude — deformation mechanisms change, and the parameter is an interpolation tool wearing an extrapolation costume. And remember the grain-size reversal: fine grains are wonderful for room-temperature strength and worse for creep, because boundaries slide.",
    example:
      "A superalloy ruptures after 1,000 h at 800°C. What life does Larson-Miller predict at 700°C? || P = 1073 × (20 + log₁₀ 1000) = 1073 × 23 = 24,679. At 973 K: 20 + log₁₀ t = 24,679/973 = 25.36, so log₁₀ t = 5.36 and t ≈ 2.3 × 10⁵ h — about 26 years. || A hundred-degree drop bought a factor of 230 in life. That is the exponential at work: in creep, temperature moves the answer more than stress does.",
    ideas: [
      {
        heading: "The creep curve's three acts",
        body: "Primary creep decelerates as the material strain-hardens; secondary creep settles to a steady rate — the design number, the rate you size against; tertiary creep accelerates as voids and necking take over, ending in rupture. Designing on the secondary rate with a strain budget is the whole discipline. The curve is strain versus time, and time is the axis everyone forgets.",
        formula: "design on ε̇_secondary, the steady-state rate",
      },
      {
        heading: "Diffusion sets the clock",
        body: "Creep is thermally activated: Norton's power law pairs a stress exponent n (typically 3–8) with an Arrhenius term in temperature. The activation energy Q is large, so modest temperature changes swing the rate by orders of magnitude. This is why a hot spot, not the nominal temperature, usually decides a hot part's life.",
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
      "Run the hot short test: set the temperature and rupture time, and read off the Larson-Miller parameter. Then dial the service temperature down and watch the predicted life move. || Push the extrapolation past ten-to-one in time and watch the warning appear — then say why the warning exists. || Finish with a service life above 100,000 h from a test under 3,000 h, and name the mechanism change that would void your prediction.",
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
        why: "P = T(20 + log t_r) collapses time and temperature into one number, so a thousand-hour test at 800°C speaks about decades at 700°C. It organizes testing; it never replaces it.",
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
