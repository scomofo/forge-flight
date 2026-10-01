import type { Lesson } from "./types.ts";
import { pendulumUnitSections } from "./pendulum-help.ts";

/**
 * Physics 101, Week 1 — Measurement, units & estimation.
 * These three lessons open the physics track (indices 1–3); the rest of the
 * physics weeks follow from index 4. Evidence due: measurement memo
 * (lesson 2 bench) + dimensional-analysis set (lesson 1 bench and checks).
 */
export const physicsW1Lessons: Lesson[] = [
  {
    id: "measure",
    track: "physics",
    index: 1,
    title: "SI units and dimensions",
    minutes: 35,
    lede: "Use units as an error check: reduce mechanical quantities to M, L, and T, and spot formulas that cannot possibly be right.",
    opening: { mode: "prose", heading: "Start with the failure" },
    readFlow: [
      { kind: "idea", idea: 0, label: "First habit" },
      { kind: "example", heading: "Try it before memorizing" },
      { kind: "idea", idea: 1, label: "What the check catches" },
      { kind: "aside", heading: "Important limit", body: "Dimensional consistency is necessary, not sufficient. A dimensionally correct equation can still have the wrong constant, sign, or physics." },
      { kind: "idea", idea: 2, label: "One more pattern" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "In 1999, the Mars Climate Orbiter was lost after one part of the navigation chain used pound-force seconds and another expected newton-seconds. Both are force-time units, but their scales differ: matching dimensions alone would not catch that conversion error. Units and conversion factors need checking too. || Here is the distinction we need. A dimension tells you what kind of quantity you have: mass, length, time, or some combination of them. A unit tells you how you measured it: kilograms or slugs, metres or feet. In mechanics, we can reduce everything to M, L, and T. Force, for example, is MLT⁻² no matter which unit system you use. || Before you touch the calculator, check the dimensions. If one side of an equation is a length and the other is a time, you are done: something upstream is wrong. If you have a programming background, dimensions behave a bit like types. That analogy is useful, but the practical rule is simpler: mismatched dimensions mean a broken equation.",
    use: "Use this whenever you are about to trust a formula: one you derived, one from a datasheet, or one you only half remember. It is especially useful before a long calculation. || Rewrite each quantity in M, L, and T. When you multiply, add exponents; when you divide, subtract them. Both sides of the equation must match, and anything inside sin, exp, or log must be dimensionless. || Once both sides match, the formula has passed this check. That does not prove it is correct. It only means the units have stopped objecting.",
    example:
      "How long does one complete back-and-forth swing take? That time is the period T, measured in seconds. In the ideal small-angle model, we test combinations of l, the pivot-to-bob length in metres, and g, gravitational acceleration in m/s². No numerical value is required here. || Try the units first. l/g gives m ÷ (m/s²) = m × s²/m = s²; its square root gives s. The flipped ratio g/l gives 1/s², so its square root gives 1/s, a rate. Without any square root, l/g remains s². The factor 2π has no units, so it changes none of those results. || Only √(l/g) has time units among these three candidates. We have ruled out two wrong forms, not proved the survivor. Unit checking cannot determine the factor 2π or show that the small-angle model describes a particular real pendulum.",
    exampleHelp: [{ concept: "pendulum-unit-check" }],
    ideas: [
      {
        heading: "Why SI helps",
        body: "SI gives everyone the same starting point. Mechanics mostly lives on metre, kilogram, and second; units such as newtons, joules, watts, and pascals are built from them. You do not need to love SI. You need to be able to combine two measurements without first wondering what unit convention the other person used.",
        formula: "1 N = 1 kg·m/s²",
        help: [{ concept: "dimensional-analysis", trigger: "How do dimensions help?" }],
      },
      {
        heading: "A fast way to catch nonsense",
        body: "Every term in a sum has to describe the same kind of quantity. You can add one length to another length; you cannot add a length to a time and hope the calculator sorts it out. Start with familiar units such as metres and seconds. Once the cancellation is clear, M, L and T are just shorthand for mass, length and time. Square brackets ask for the kind of quantity, not its number.",
        formula: "[F] = MLT⁻², [E] = ML²T⁻²",
        formulaNote: "[F] means the dimension of force; [E] means the dimension of energy. T⁻² means divided by time squared. Here M, L and T are dimension labels, not measured values.",
        sections: pendulumUnitSections,
      },
      {
        heading: "When the units disappear",
        body: "Sometimes everything cancels. That is not an error. Strain, ΔL/L, is dimensionless because it is one length divided by another. The same idea explains why the argument of eˣ, sin(x), or ln(x) cannot carry units. You will see this again later in quantities such as Reynolds number, where a unitless ratio tells you which physical behaviour to expect.",
        formula: "sin(x), eˣ, ln(x) demand [x] = 1",
      },
    ],
    bench: "dimcheck",
    prompt:
      "Start with one candidate equation and enter the M/L/T exponents on both sides. || If they do not match, do not keep calculating. Identify the mismatch and say what dimension each side actually has. || Work through all four candidates. When you are done, write the rule you would use next time without the checker.",
    note: "This checker only knows mass, length, and time. That is enough for the mechanics in Physics 101. We will bring in other base dimensions when we actually need them.",
    checks: [
      {
        prompt: "The dimension of force is…",
        options: ["MLT⁻²", "ML²T⁻²", "MLT⁻¹", "M²LT⁻²"],
        answer: 0,
        why: "F = ma gives M × LT⁻² = MLT⁻². ML²T⁻² is energy, which is force multiplied by distance. If you got that one, you probably carried one extra L.",
      },
      {
        prompt: "A wave speed v on a string of tension F and mass per length μ. Which form is dimensionally possible?",
        options: ["v = √(F/μ)", "v = √(μ/F)", "v = F/μ", "v = F·μ"],
        answer: 0,
        why: "[F] = MLT⁻² and [μ] = ML⁻¹, so [F/μ] = L²T⁻² and its square root is LT⁻¹, which is a speed. The other options land on the wrong kind of quantity.",
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
        why: "[at²] = LT⁻²·T² = L and [vt] = LT⁻¹·T = L, so the two terms can be added. The ½ is just a pure number and carries no dimensions.",
      },
      {
        prompt: "In the decay e^(−t/τ), the constant τ must have dimension…",
        options: ["T (time)", "T⁻¹", "Dimensionless", "L (length)"],
        answer: 0,
        why: "Anything in an exponential must be dimensionless. Since t has units of time, τ must also have units of time so that t/τ has no units.",
      },
    ],
  },
  {
    id: "sigfigs",
    track: "physics",
    index: 2,
    title: "Significant figures and uncertainty",
    minutes: 35,
    lede: "Report measurements without pretending you know more than the instrument does, and carry that uncertainty through a calculation.",
    start:
      "A digital caliper might show 12.345 mm on the edge of a hand-sawn bracket. The display is happy to give you five digits. The bracket probably is not. || Precision is about repeatability. Accuracy is about closeness to the true value. Significant figures are a shorthand for how many digits you are prepared to defend; uncertainty says the same thing more explicitly with a ± range. || Here is the habit to build: do the calculation with full precision, then report only what the measurement supports. Extra digits can make a weak measurement look stronger than it is, and people tend to trust numbers that look precise.",
    use: "Use these rules whenever a measured number leaves your notebook and enters a calculation, memo, drawing, or report. || For significant figures, multiplication and division are limited by the input with the fewest significant figures; addition and subtraction are limited by decimal place. For uncertainty, products use relative uncertainty and sums use absolute uncertainty, combined in quadrature. Keep the calculator digits while you work and round once at the end. || A good final answer looks like 2.71 ± 0.06 kg/L, not 2.7135 ± 0.0621. The second version is not more informative. It is just more digits.",
    example:
      "A bracket has a mass of 3.20 ± 0.05 kg and a volume of 1.18 ± 0.02 L. We want its density. || The calculator gives ρ = 3.20 / 1.18 = 2.712 kg/L. The relative uncertainties are 1.6% and 1.7%; combine them in quadrature and you get about 2.3%. Applied to the density, that is roughly 0.063 kg/L. || So report 2.71 ± 0.06 kg/L. If you wrote 2.712 ± 0.063, the arithmetic would be fine but the reporting would be poor. The extra digits are not supported by the measurement.",
    ideas: [
      {
        heading: "Precision is not accuracy",
        body: "A scale that reads 70.00 kg every time you step on it is precise. If it is miscalibrated by 5 kg, it is still wrong. Repeated measurements help with random scatter, but they do not fix a systematic offset. If the readings cluster tightly around the wrong value, check the instrument or calibration before you collect more data.",
      },
      {
        heading: "Where to stop writing digits",
        body: "Take 0.00450. It has three significant figures: 4, 5, and the final 0. The leading zeros only locate the decimal point. For multiplication, 12.3 × 4.56 should be reported as 56.1 because 12.3 only gives you three significant figures. For addition, watch the decimal place instead: 12.3 + 4.56 becomes 16.9.",
        formula: "0.00450 → three significant figures",
      },
      {
        heading: "Your inputs set the ceiling",
        body: "A calculation cannot manufacture better measurements. For products, combine relative uncertainties in quadrature; for sums, combine absolute uncertainties. If one input contributes most of the uncertainty, improving a different instrument will barely move the final result. This is useful when you are deciding what actually needs a better measurement.",
        formula: "δ(AB)/AB = √((δA/A)² + (δB/B)²)",
        help: [{ concept: "quadrature" }],
      },
    ],
    bench: "memo",
    prompt:
      "Write the measurement memo as if another student has to reproduce your reasoning without asking you questions. State what you measured and the unit, report value ± uncertainty with sensible digits, justify the instrument, and identify the dominant error source. || Before you submit it, read the rubric once more and make sure each claim can actually be found in the memo.",
    note: "The memo stays in this browser. A useful test is to imagine handing it to someone who was not in the room: could they tell what you measured, how well you know it, and what probably limited the result?",
    checks: [
      {
        prompt: "How many significant figures does 0.00450 have?",
        options: ["Three", "Two", "Five", "Four"],
        answer: 0,
        why: "The leading zeros only locate the decimal point. The 4, 5, and final 0 are significant, so 0.00450 has three significant figures.",
      },
      {
        prompt: "12.3 × 4.56 = 56.088 on the calculator. Honestly reported:",
        options: ["56.1", "56.09", "56.088", "56"],
        answer: 0,
        why: "12.3 has three significant figures, fewer than 4.56, so the product should be reported with three: 56.1. Keep the extra calculator digits only during the working.",
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
        why: "The readings are tightly grouped, so they are precise. They are also about 3.6 °C low, so they are not accurate. More repeats would not remove that systematic offset.",
      },
      {
        prompt: "A = 10.0 ± 0.2 and B = 5.0 ± 0.1 are multiplied. The relative uncertainty of AB is about…",
        options: ["3%", "2%", "1%", "4%"],
        answer: 0,
        why: "Each input contributes about 2% relative uncertainty. Combining them in quadrature gives √(2² + 2²)% ≈ 2.8%, which rounds to about 3%.",
      },
    ],
  },
  {
    id: "fermi",
    track: "physics",
    index: 3,
    title: "Orders of magnitude and Fermi estimation",
    minutes: 35,
    lede: "Turn a question you cannot answer directly into a handful of estimates you can defend, then see whether the result is in the right ballpark.",
    start:
      "At the Trinity test in 1945, Enrico Fermi dropped scraps of paper as the blast wave arrived and used their motion to estimate the explosion's yield. His rough answer was about 10 kilotons; later measurements were around 20. For a back-of-the-envelope estimate, that is remarkably close. || A Fermi estimate works by replacing one hard question with several easier ones. Estimate three to five factors you can at least bound, keep the numbers rough, and multiply. An order of magnitude is simply a factor of ten: 10³ versus 10⁴. || The goal is not a pretty number. It is to find the scale of the answer. If your rough estimate says 10⁴ N and a detailed spreadsheet says 40 N, that disagreement deserves attention before you trust the spreadsheet.",
    use: "Use Fermi estimation early, when you do not yet have enough data for a detailed model, and later as a sanity check on one. || Break the question into factors you can estimate from experience or simple references. One significant figure is usually enough. Being off by a factor of two on an input is acceptable at this stage. Multiply, then compare the result with something familiar. || Stop when you know the order of magnitude and can point to the weakest assumption. If the answer feels wrong, do not add more decimal places. Revisit the assumptions.",
    example:
      "How many piano tuners work in Chicago? Do not guess the final number. Build it. || Suppose there are about 3 million people, or roughly 1.2 million households. Maybe 1 household in 20 has a piano: about 60,000 pianos. If each gets tuned about once a year and one tuner handles roughly 500 jobs a year, 60,000 / 500 gives about 120 tuners. || A directory count is on the order of a hundred. None of our inputs was especially precise, but they were reasonable enough to land us in the right neighbourhood. That is the skill: replace one impossible guess with a few manageable ones.",
    ideas: [
      {
        heading: "Break the question apart",
        help: [{ concept: "fermi-estimate" }],
        body: "A direct guess at “piano tuners in Chicago” has nowhere to stand. Households, piano ownership, tuning frequency, and jobs per tuner are all easier to think about. If one of those still feels impossible to estimate, split it again. The useful part of a Fermi estimate is often the structure you choose before you enter any numbers.",
      },
      {
        heading: "Rough inputs can still give a useful answer",
        body: "Several rough estimates do not automatically make the final answer useless. Some assumptions will be high and others low, and on a logarithmic scale those errors can partly cancel. Do not count on perfect cancellation, though. If several inputs are all biased in the same direction, the result will be biased too. This is estimation, not magic.",
        formula: "log₁₀(ABC) = log₁₀A + log₁₀B + log₁₀C",
      },
      {
        heading: "Get the scale before the detail",
        body: "The difference between 10³ N and 10⁶ N can change the entire design. The difference between 3,000 N and 4,000 N usually does not, at least not this early. Get the scale right first. Precision is worth buying only after you know you are working in the right neighbourhood.",
      },
    ],
    bench: "fermi",
    prompt:
      "Work the bench's Fermi question one factor at a time. Use powers of ten first; tidy coefficients can come later. || When you finish, compare with the reference and identify the assumption you trust least. That is usually the first place to improve if you need a better estimate.",
    note: "Treat the reference as a scale check, not a target to reverse-engineer. A result that is off by a factor of three but built from clear assumptions is more useful than a lucky exact guess.",
    checks: [
      {
        prompt: "The order of magnitude of 2,300 is…",
        options: ["10³", "10⁴", "10²", "2 × 10³"],
        answer: 0,
        why: "2,300 = 2.3 × 10³, so its order of magnitude is 10³. The 2.3 is the coefficient; the order of magnitude is the power of ten.",
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
        why: "Breaking the problem apart gives you smaller quantities you can actually estimate. Some errors may cancel, but shared bias across several assumptions will still carry into the result.",
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
        why: "Fermi used a simple observation and a rough model to get the right scale of the answer. That is exactly the point of a Fermi estimate.",
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
        why: "A difference of more than two orders of magnitude is too large to ignore. Check for a missed load, a unit error, or a bad assumption before trusting either result.",
      },
    ],
  },
];
