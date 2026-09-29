import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 1 — Measurement, units & estimation.
 * These three lessons open the physics track (indices 1–3); the pre-existing
 * physics lessons follow re-indexed from 4. Evidence due: measurement memo
 * (lesson 2 bench) + dimensional-analysis set (lesson 1 bench and checks).
 */
export const physicsW1Lessons: Lesson[] = [
  {
    id: "measure",
    track: "physics",
    index: 1,
    title: "SI units and dimensions",
    minutes: 35,
    lede: "Express any mechanical quantity in SI base units, read a dimension as MᵃLᵇTᶜ, and reject a candidate formula on dimensional grounds alone.",
    start:
      "In 1999 the Mars Climate Orbiter burned up in the Martian atmosphere because one engineering team fed the navigation software pound-force seconds while the software expected newton-seconds. A $125 million spacecraft, lost to a unit nobody converted. || A dimension is what kind of quantity you have — mass, length, time, and their combinations. A unit is which ruler you measured it with — kilograms or slugs, meters or feet. SI fixes seven base dimensions; every mechanical quantity is MᵃLᵇTᶜ for some exponents a, b, c. Force is MLT⁻² whether you call it newtons or pounds. || Think of dimensions as a type system. You cannot add meters to seconds, and any equation that tries is broken at the type level. That makes dimensional analysis the cheapest check in the subject — run it before you compute anything, since no arithmetic repairs a dimensional mismatch.",
    use: "Before you trust any formula — one you derived, one from a datasheet, one you half-remember. Also when the shape of an unknown relationship is all you need: the dimensions often pin down the formula up to a dimensionless constant. || Write every quantity as MᵃLᵇTᶜ. Multiply and divide by adding and subtracting exponents. Demand that both sides match, term by term. The arguments of sin, exp, log, and friends must be dimensionless. || Stop when both sides agree and you can name the dimension of the answer. If they don't agree, stop: no arithmetic rescues a dimensional mismatch.",
    example:
      "A pendulum's period T depends on its length l and gravity g. Three candidates circulate: T = 2π√(l/g), T = 2π√(g/l), T = 2π·l/g. || [l] = L and [g] = LT⁻². For the first: [l/g] = L / LT⁻² = T², and √(T²) = T — a time, matching the period. The second gives √(T⁻²) = T⁻¹, a frequency. The third gives T², a squared time. || Two candidates fail without a single experiment. What dimensions cannot tell you is the 2π: dimensional analysis fixes the shape of a formula, never its dimensionless constant. That part needs theory or measurement.",
    ideas: [
      {
        heading: "SI is a contract, not a preference",
        body: "Seven base units — meter, kilogram, second, ampere, kelvin, mole, candela — and mechanics needs only the first three. Everything else is a combination: the newton is kg·m/s², the joule is N·m, the watt is J/s, the pascal is N/m². The contract's value is not elegance; it is that two strangers' numbers combine without negotiation. The Orbiter died because two teams were not party to the same contract.",
        formula: "1 N = 1 kg·m/s²",
      },
      {
        heading: "Dimensions are a type system",
        body: "Every term in a sum must carry the same dimensions, exactly as every branch of a conditional must return the same type. Checking is mechanical: substitute MᵃLᵇTᶜ for each symbol and do the exponent arithmetic. A surprising share of published errors — and essentially all unit-conversion disasters — are type errors that this check catches in seconds.",
        formula: "[F] = MLT⁻², [E] = ML²T⁻²",
      },
      {
        heading: "Dimensionless is a signal",
        body: "Whenever the dimensions cancel out entirely, pay attention: a dimensionless quantity is a pure number, and pure numbers carry the real physics. Strain is ΔL/L — no units, just a ratio. Arguments of transcendental functions must be dimensionless, which is why decay always looks like e^(−t/τ) with τ a time. Later, dimensionless groups like Reynolds number will decide whole flow regimes.",
        formula: "sin(x), eˣ, ln(x) demand [x] = 1",
      },
    ],
    bench: "dimcheck",
    prompt:
      "Pick a candidate equation and enter the M/L/T exponents for each side. || A mismatch kills the candidate — say which side is wrong and what it actually is. || Clear all four candidates, then write down the one rule the checker enforces.",
    note: "The checker knows mechanics only — mass, length, time. Charge, temperature, and amount of substance are outside its vocabulary, which is fine: every equation in Physics 101 lives in M, L, T.",
    checks: [
      {
        prompt: "The dimension of force is…",
        options: ["MLT⁻²", "ML²T⁻²", "MLT⁻¹", "M²LT⁻²"],
        answer: 0,
        why: "F = ma gives M × LT⁻² = MLT⁻². ML²T⁻² is energy — force times a distance. Confusing the two is a dimensional type error.",
      },
      {
        prompt: "A wave speed v on a string of tension F and mass per length μ. Which form is dimensionally possible?",
        options: ["v = √(F/μ)", "v = √(μ/F)", "v = F/μ", "v = F·μ"],
        answer: 0,
        why: "[F] = MLT⁻² and [μ] = ML⁻¹, so [F/μ] = L²T⁻² and its root is LT⁻¹ — a speed. The second gives T/L, the third gives v²'s dimensions, the fourth is nonsense.",
      },
      {
        prompt: "An equation adds ½at² to vt. Dimensionally…",
        options: [
          "Fine — both terms are lengths",
          "Broken — you cannot add time-squared to time",
          "Fine, but only in SI units",
          "Broken — the ½ carries dimensions",
        ],
        answer: 0,
        why: "[at²] = LT⁻²·T² = L and [vt] = LT⁻¹·T = L. Pure numbers like ½ are dimensionless, and the unit system never matters to a dimensional check — only the dimensions do.",
      },
      {
        prompt: "In the decay e^(−t/τ), the constant τ must have dimension…",
        options: ["T (time)", "T⁻¹", "Dimensionless", "L (length)"],
        answer: 0,
        why: "The exponent must be dimensionless, so [t/τ] = 1 forces [τ] = [t] = T. τ is the time constant: the time for the quantity to fall by a factor of e.",
      },
    ],
  },
  {
    id: "sigfigs",
    track: "physics",
    index: 2,
    title: "Significant figures and uncertainty",
    minutes: 35,
    lede: "Report a measurement with only the digits you can defend, propagate uncertainty through a calculation, and read a specification the way its author wrote it.",
    start:
      "A digital caliper reads 12.345 mm on the edge of a hand-sawn bracket. The display offers five digits; the cut deserves perhaps three. Writing down all five does not make the bracket more precise — it makes the report dishonest. || Precision is how finely you can repeat a reading. Accuracy is how close you are to the truth. Significant figures are the convention that keeps the two from being confused: every reported digit is a digit you claim means something. Uncertainty is the honest version of the same idea — a ± band with a stated meaning, instead of a silent agreement about the last digit. || Extra digits are not extra knowledge. In design they are worse than useless: a fake digit becomes a fake margin, and margins get trusted.",
    use: "Every time you report a measured or computed quantity — a memo, a datasheet line, a lab notebook entry. || Count significant figures: non-zero digits always count, captive zeros count, leading zeros never do, trailing zeros count only with a decimal point. In multiplication and division the answer carries the fewest sig figs of any input; in addition and subtraction it is limited by the least precise decimal place. For uncertainty: relative uncertainties add in quadrature for products, absolute uncertainties add in quadrature for sums. Compute with full precision and round once, at the end. || Stop when the value's last reported digit is the first uncertain one, and the uncertainty itself carries one significant figure — two at most. 2.71 ± 0.06 kg/L. Never 2.7135 ± 0.0621.",
    example:
      "A bracket's mass is 3.20 ± 0.05 kg and its volume 1.18 ± 0.02 L. What is the density, honestly? || ρ = 3.20 / 1.18 = 2.712 kg/L on the calculator. Relative uncertainties: 0.05/3.20 = 1.6% and 0.02/1.18 = 1.7%. In quadrature: √(1.6² + 1.7²) = 2.3%, so the absolute uncertainty is 2.712 × 0.023 = 0.063 kg/L. || Report ρ = 2.71 ± 0.06 kg/L. The inputs had three significant figures, so the value keeps three — and the uncertainty's first digit sits in the second decimal place, which is exactly where the value stops.",
    ideas: [
      {
        heading: "Precision is not accuracy",
        body: "A scale that reads 70.00 kg every time you step on it is precise. If it is miscalibrated by 5 kg, it is precisely wrong. Repeatability is a property of the instrument; truth is a property of the calibration. Random error shrinks when you average; systematic error does not — it hides inside every digit, immune to repetition. When readings cluster tightly around the wrong value, suspect the instrument, not the statistics.",
      },
      {
        heading: "The honest digit",
        body: "Significant figures are a compact way of saying “my knowledge ends here.” 0.00450 has three: the leading zeros are placeholders, the trailing zero after the decimal is a claim. In multiplication the weakest input rules — 12.3 × 4.56 is 56.1, not 56.088, because 12.3 only brought three digits. In addition it is the decimal place that rules: 12.3 + 4.56 = 16.9, because the tenths place is where knowledge ends.",
        formula: "0.00450 → three significant figures",
      },
      {
        heading: "Uncertainty propagates",
        body: "A result is never better than its inputs, and the arithmetic tells you exactly how much worse. For products, relative uncertainties add in quadrature; for sums, absolute ones do. Either way the weakest input dominates: halving one uncertainty while the other stays put barely moves the total. That tells you where to spend money — on the instrument behind the largest term, not the one that is easiest to upgrade.",
        formula: "δ(AB)/AB = √((δA/A)² + (δB/B)²)",
      },
    ],
    bench: "memo",
    prompt:
      "Write the measurement memo: state a measurand with its unit, report value ± uncertainty with honest digits, justify the instrument, and name the dominant error source. || Check every rubric box before you call it done — the memo is evidence, not a draft.",
    note: "The memo persists in this browser. The rubric is the grader: a stranger reading your memo should be able to check every box without asking you anything.",
    checks: [
      {
        prompt: "How many significant figures does 0.00450 have?",
        options: ["Three", "Two", "Five", "Four"],
        answer: 0,
        why: "Leading zeros are placeholders and never count. The digits 4, 5, and the trailing 0 after the decimal point all count — the trailing zero is a claim of knowledge.",
      },
      {
        prompt: "12.3 × 4.56 = 56.088 on the calculator. Honestly reported:",
        options: ["56.1", "56.09", "56.088", "56"],
        answer: 0,
        why: "12.3 has three significant figures — the fewest of any input — so the product keeps three: 56.1. The calculator's extra digits are not measurements.",
      },
      {
        prompt: "A thermometer reads 21.3, 21.4, 21.3, 21.4 °C in a room that is actually 25 °C. The readings are…",
        options: [
          "Precise but not accurate",
          "Accurate but not precise",
          "Both precise and accurate",
          "Neither",
        ],
        answer: 0,
        why: "They repeat tightly (precise) around the wrong value (inaccurate) — a systematic offset, probably calibration. Averaging a hundred more readings will not fix it.",
      },
      {
        prompt: "A = 10.0 ± 0.2 and B = 5.0 ± 0.1 are multiplied. The relative uncertainty of AB is about…",
        options: ["3%", "2%", "1%", "4%"],
        answer: 0,
        why: "√(2%² + 2%²) ≈ 2.8% ≈ 3%. Note it exceeds either input's uncertainty — in a product, uncertainties never cancel.",
      },
    ],
  },
  {
    id: "fermi",
    track: "physics",
    index: 3,
    title: "Orders of magnitude and Fermi estimation",
    minutes: 35,
    lede: "Decompose an unanswerable question into estimable factors, multiply powers of ten, and land within a factor of ten of the truth.",
    start:
      "In 1945 Enrico Fermi stood ten kilometers from the first atomic test, dropped scraps of paper as the blast wave passed, and estimated the yield at 10 kilotons from how far they flew. Instruments later said about 20. He was off by a factor of two — with confetti. || An order of magnitude is a factor of ten: 10³ versus 10⁴. A Fermi estimate decomposes a question nobody can answer directly into three to five factors somebody can bound, estimates each to within a factor of two or three, and multiplies. The arithmetic lives in log space, where small errors stay small. || Most design decisions turn on the exponent, not the digit. Whether a load is 10³ N or 10⁶ N chooses the machine; whether it is 3,000 or 4,000 does not. A Fermi estimate is also a sanity check on detailed calculations: any result that disagrees with it by orders of magnitude has a structural error somewhere.",
    use: "When no data exists yet — sizing a concept, checking a simulation, sanity-checking somebody else's number. || Decompose into factors you can bound from experience. Estimate each to one significant figure; being off by a factor of two either way is fine. Multiply the powers of ten and keep the leading digits loose. Anchor the result against something you know. || Stop at 10^E with a stated band of about ±1 order of magnitude. Then ask whether it survives contact with a known anchor — if not, find which factor lied.",
    example:
      "How many piano tuners work in Chicago? || Three million people is about 1.2 million households; perhaps 1 in 20 owns a piano, giving 60,000 pianos. Pianos get tuned roughly yearly. A tuner does about 2 a day, 250 days a year — 500 tunings per tuner-year. So 60,000 / 500 = 120 tuners. || Directories list on the order of a hundred. Every factor was good to maybe 2×, and four such factors still land within an order of magnitude. That is the whole trick: decomposition converts one impossible guess into several easy ones.",
    ideas: [
      {
        heading: "Decompose, don't guess",
        body: "A direct guess at “piano tuners in Chicago” draws on nothing you know. Four sub-estimates — households, piano ownership, tuning frequency, tuner throughput — each draw on something you actually know: city sizes, how often your acquaintances tune, what a workday holds. The structure is the estimate; the numbers are just filling. If a factor resists bounding, decompose it one level further.",
      },
      {
        heading: "Log space forgives",
        body: "Errors multiply, but in log space they add — and independent over- and under-estimates partly cancel instead of compounding. Four factors each wrong by 2× leave the total wrong by roughly 2–4×, not 16×. That is why Fermi estimates cluster near the truth: the arithmetic absorbs the errors instead of stacking them.",
        formula: "log₁₀(ABC) = log₁₀A + log₁₀B + log₁₀C",
      },
      {
        heading: "The exponent is the decision",
        body: "10³ versus 10⁶ is a different machine, a different budget, a different physics regime. 3×10³ versus 4×10³ is the same design with a different paint color. Estimate the exponent first and spend precision only where the exponent is settled — a refined digit means nothing while the exponent is unknown.",
      },
    ],
    bench: "fermi",
    prompt:
      "Work the bench's Fermi question: set each factor as a power of ten and watch the product assemble. || Land within one order of magnitude of the reference, then name your weakest factor and say why it was weak.",
    note: "The reference answers are anchors, not grades. Being off by a factor of 3 with an honest decomposition beats being exactly right by luck.",
    checks: [
      {
        prompt: "The order of magnitude of 4,800 is…",
        options: ["10³", "10⁴", "10²", "5 × 10³"],
        answer: 0,
        why: "4,800 = 4.8 × 10³ — nearest power of ten is 10³. Order of magnitude names the exponent, not the coefficient.",
      },
      {
        prompt: "Why does decomposing into factors beat one direct guess?",
        options: [
          "Each factor draws on something you know, and errors partly cancel in log space",
          "More steps always means more precision",
          "Multiplication is inherently more accurate than guessing",
          "It eliminates systematic error",
        ],
        answer: 0,
        why: "Structure converts one impossible guess into several bounded ones, and independent factor errors add in log space instead of compounding wildly. Systematic error, shared across factors, is not removed — only bounded.",
      },
      {
        prompt: "Fermi's paper-drop estimate of the Trinity yield was ~10 kt against ~20 kt measured. The lesson is…",
        options: [
          "A rough physical argument can land within a factor of two of the truth",
          "Paper scraps are precision instruments",
          "Blast waves are easy to model exactly",
          "Estimation only works for nuclear weapons",
        ],
        answer: 0,
        why: "The displacement encoded the energy; a simple physical model decoded it to the right order of magnitude. That is what estimation is for — the exponent, fast.",
      },
      {
        prompt: "A detailed calculation says a bracket sees 40 N; your Fermi says ~10⁴ N. You should…",
        options: [
          "Distrust the calculation until the discrepancy is found",
          "Split the difference and design for 5,000 N",
          "Trust the calculation — it has more digits",
          "Redo the Fermi with more significant figures",
        ],
        answer: 0,
        why: "A three-order disagreement means something structural is wrong — a missed load path, a unit slip, a wrong model. More digits on either side cannot fix that; finding the missing factor can.",
      },
    ],
  },
];
