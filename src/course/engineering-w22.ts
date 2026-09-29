import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 22 — Models, assumptions & uncertainty.
 * These three lessons are engineering-track indices 4–6. Evidence due:
 * error budget for a measurement chain (lesson 2 + 3 bench).
 */
export const engineeringW22Lessons: Lesson[] = [
  {
    id: "modelvalid",
    track: "engineering",
    index: 4,
    title: "Models are tools, not truth",
    minutes: 35,
    lede: "A model is a question-answering machine with a limited territory. State its claim, its assumptions, and the test that would prove it wrong — and never ask it a question outside the territory it was validated in.",
    opening: { mode: "prose", heading: "Start with the physical situation" },
    readFlow: [
      { kind: "example", heading: "Work one case" },
      { kind: "idea", idea: 0, label: "First idea" },
      { kind: "idea", idea: 1, label: "Second idea" },
      { kind: "idea", idea: 2, label: "Third idea" },
      { kind: "move", heading: "When to use it" },
    ],
    start:
      "A model answers a specific question under a specific set of assumptions. It does not automatically remain trustworthy when the operating condition changes. || Define the model's inputs, outputs, assumptions, and validation domain. Outside that domain, the software may still produce a number, but that does not make the number meaningful. || Good model use includes a plan for checking the prediction against reality and a clear statement of what the model does not include.",
    use: "When you are about to decide from a calculation instead of a test — sizing a part, signing off a procedure, trusting a simulation. || Write down what the model claims, the assumptions it needs to be true, and the domain it was validated in. Check each assumption against your case, one by one, out loud. Name the measurement or experiment that would falsify the result. || Stop when the model's domain covers your question and the falsifying test exists and is affordable. If the model has never been checked against anything like your case, stop calculating and go measure. Extrapolating past the last validated case is guessing.",
    example:
      "The Tacoma Narrows design model answered one question: does the deck hold under its steady design wind, far stronger than 64 km/h? The answer was yes, with margin. || The bridge failed in a 64 km/h wind, well below the design wind, from aeroelastic flutter, an oscillation the static model had no vocabulary for. The model answered its own question correctly; it was just never asked the question that mattered. || Validation has to cover the failure mode you fear, not the one you modeled. A model validated for static loads says nothing about dynamics, regardless of how many decimal places it prints.",
    ideas: [
      {
        heading: "Define the model's valid domain",
        body: "Handbook formulas, finite-element runs, spreadsheet empires — each was checked against some set of cases, and that set is the model's territory. The beam formula δ = FL³/3EI is validated for small deflections of prismatic, linear-elastic beams. Aim it at a tapered composite spar deflecting 10% of its length and you've left the territory. The formula will still return a number; it just won't mean anything.",
        formula: "valid(model) ⊆ checked cases",
      },
      {
        heading: "Model assumptions limit what the result can claim",
        body: "Every formula carries silent 'if's: linear elasticity, small angles, steady flow, rigid supports, uniform temperature. The assumption ledger from Week 21 is where those 'if's live, each with a provenance and a confidence. A model result presented without its assumption list is a rumor with units. When a model surprises you, the assumptions are the first place to look — not the arithmetic.",
      },
      {
        heading: "Validate models with evidence, not confidence",
        body: "A model earns trust when a measurement agrees with its prediction within the stated uncertainty, for cases resembling yours. One agreeing test is a hint; agreement across the whole domain is validation. And the comparison needs the uncertainty on both sides — a prediction without an error bar can't agree or disagree with anything.",
        formula: "|prediction − measurement| ≤ u_combined",
      },
    ],
    bench: "sensbench",
    prompt:
      "Pick a formula and set each input's relative uncertainty. || The bars show each input's normalized sensitivity — percent the output moves per percent the input moves — and its share of the output's scatter. || Find which input the beam-deflection formula is most tender to, and say why the exponent 3 is the reason.",
    note: "Sensitivities here are first-order and scale-invariant — they describe the formula's shape, not your particular numbers. This bench shows where the model is most sensitive; only a real measurement can say whether it's true.",
    checks: [
      {
        prompt: "A model validated for static loads is applied to a vibration problem. The correct response is…",
        options: [
          "Use it — the physics is the same physics",
          "Refuse — the new question is outside the validated domain",
          "Use it but add a safety factor of 2",
          "Use it — validation transfers across failure modes",
        ],
        answer: 1,
        why: "Validation covers the cases it was checked against, not the failure mode you fear. The Tacoma Narrows model was fine for statics and blind to flutter. A safety factor does not buy back a missing failure mode.",
      },
      {
        prompt: "Which of these is part of stating a model's claim honestly?",
        options: [
          "The number of significant figures in the output",
          "The assumptions it needs to be true and its validated domain",
          "The software version that ran it",
          "The credentials of the analyst",
        ],
        answer: 1,
        why: "Assumptions and domain are what bound the claim. Significant figures describe precision, not validity; software and credentials are provenance, not a substitute for the domain check.",
      },
      {
        prompt: "A simulation agrees with one test point. You should conclude…",
        options: [
          "The model is validated",
          "One agreeing point is a hint; validation needs agreement across the domain",
          "The model is validated for that exact point only, forever",
          "The test was probably wrong",
        ],
        answer: 1,
        why: "Validation is agreement across the domain you intend to use, within stated uncertainties. A single point can be luck, tuning, or coincidence. It justifies running the next test; it doesn't justify trust.",
      },
      {
        prompt: "Why does a prediction need an uncertainty attached before it can be validated?",
        options: [
          "Regulations require it",
          "Without an error bar it can neither agree nor disagree with a measurement",
          "It makes the report look professional",
          "Uncertainty is only needed for safety-critical work",
        ],
        answer: 1,
        why: "Validation is the comparison |prediction − measurement| ≤ u_combined. No uncertainty on the prediction means the comparison cannot be scored — the model is unfalsifiable, which is the opposite of validated.",
      },
    ],
  },
  {
    id: "errprop",
    track: "engineering",
    index: 5,
    title: "Uncertainty travels with the number",
    minutes: 40,
    lede: "Propagate uncertainties through a calculation two ways — worst-case and root-sum-square — and know which one you're entitled to quote.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "Measurements and model inputs carry uncertainty, whether or not you write it down. Derived results inherit that uncertainty. || For small uncertainties, each input contributes roughly its sensitivity multiplied by its own uncertainty. Combine contributions by worst case when errors could align or the bound must be conservative; use root-sum-square when the errors are independent and random. || State which method you used and why. The arithmetic is only as defensible as the assumptions behind the uncertainty model.",
    use: "Whenever a result is computed from measured inputs — which is to say, whenever a result is computed at all. || List every input with its ±, in consistent units, at the same confidence. Work out how sensitive the output is to each input — ∂f/∂xᵢ analytically, or numerically with a small nudge. Combine: worst-case sum for the guarantee, RSS for the expectation. || Stop when you can state the result as value ± uncertainty with the method named out loud. Never let the ± quietly fall off when the number moves into the next calculation — that is how 50.00 ± 0.03 becomes 50.00, and then becomes a part that does not fit.",
    example:
      "Thrust from a pressure tap and a throat diameter: F = p·A, with p = 10.0 ± 0.1 MPa and d = 50.0 ± 0.1 mm. || A = π(0.025 m)² = 1.9635×10⁻³ m², so F = 19.635 kN. The sensitivities: ∂F/∂p = A contributes 196 N per 0.1 MPa; ∂F/∂d = pπd/2 contributes 79 N per 0.1 mm. Worst case: 196 + 79 = 275 N, ±1.40%. RSS: √(196² + 79²) = 211 N, ±1.08%. || Pressure owns 86% of the variance — the pressure gauge is the whole story. If the number needs tightening, buy the better pressure gauge; the micrometer is already fine, and upgrading it buys almost nothing.",
    ideas: [
      {
        heading: "Every uncertainty value needs a source",
        body: "Uncertainties come from instruments (the datasheet spec), from the setup (thermal drift, alignment, your hand), and from judgment (the 'maybe 0.02' you estimated). All three belong in the budget, labeled by source. An honestly estimated ± beats an omitted one: the omitted one is still there, compounding silently through every downstream calculation.",
      },
      {
        heading: "Choose worst case or RSS based on how the errors behave",
        body: "Worst case assumes every error pushes the same way at once — paranoid, but signable. RSS assumes independent random errors that mostly cancel — realistic for a Tuesday, indefensible if the errors share a cause (same uncalibrated instrument, same temperature drift). Correlated errors do not get the RSS discount. When in doubt about independence, the worst case is the honest quote.",
        formula: "u_y = √(Σ(∂f/∂xᵢ · u_xi)²)",
      },
      {
        heading: "For products, relative uncertainties add in quadrature",
        body: "When y = x₁^a · x₂^b · …, the relative form is clean: (u_y/y)² = Σ(aᵢ·uᵢ/xᵢ)². The exponents are weights — area goes as d², so the diameter's relative error counts double. This is why the thrust example's 0.2% diameter uncertainty punches at 0.4%: the formula squares it before the budget ever sees it.",
        formula: "(u_y/y)² = Σ (aᵢ · uᵢ/xᵢ)²",
      },
    ],
    bench: "errbudget",
    prompt:
      "Pick a measurement chain and set each link's ± with the sliders. || The budget shows the nominal result with worst-case and RSS totals, and names the link that owns the largest variance share. || Answer the three graded questions, then halve the dominant link's uncertainty and read what the upgrade actually buys.",
    note: "Uncertainties here are stated as ± bounds at the same confidence; RSS treats them as independent and random. If two links share an instrument or a temperature drift, they are correlated and the RSS total understates the risk — say so in the budget.",
    checks: [
      {
        prompt: "Worst-case and RSS combinations differ because…",
        options: [
          "Worst case is always wrong",
          "Worst case assumes the errors conspire; RSS assumes they are independent and random",
          "RSS is only for large uncertainties",
          "They are the same; the names are historical",
        ],
        answer: 1,
        why: "Worst case sums the absolute pushes — every error at its worst, same direction. RSS sums squares, which discounts errors on the independence assumption. Same inputs, different story about how errors behave together.",
      },
      {
        prompt: "Two links share one uncalibrated instrument. For the combined uncertainty you should…",
        options: [
          "Use RSS — it is the standard method",
          "Use worst case, or account for the correlation — the errors do not get the RSS discount",
          "Ignore the shared instrument; it cancels out",
          "Average the two methods",
        ],
        answer: 1,
        why: "RSS discounts on independence. A shared instrument makes the errors move together — correlated — so RSS understates the total. Worst case, or an explicit correlation term, is the honest treatment.",
      },
      {
        prompt: "F = p·A with p = 10.0 ± 0.1 MPa and d = 50.0 ± 0.1 mm. The RSS total is about…",
        options: ["±275 N", "±211 N", "±196 N", "±79 N"],
        answer: 1,
        why: "Pressure contributes 196 N, diameter 79 N; RSS = √(196² + 79²) ≈ 211 N (±1.08% of 19.635 kN). ±275 N is the worst-case sum — the number you'd sign for. 211 N is the scatter you'd expect.",
      },
      {
        prompt: "A result is reported as 19.635 kN with no uncertainty. The problem is…",
        options: [
          "Too many significant figures",
          "The ± was dropped, so the number cannot be validated, budgeted, or trusted downstream",
          "Kilonewtons are the wrong unit",
          "Nothing — the nominal is what matters",
        ],
        answer: 1,
        why: "Every computed number inherits its inputs' uncertainties. Reporting the nominal alone breaks validation (|prediction − measurement| needs u), breaks the next calculation's budget, and implies a precision nobody measured.",
      },
    ],
  },
  {
    id: "sensitivity",
    track: "engineering",
    index: 6,
    title: "Sensitivity: where to spend the money",
    minutes: 35,
    lede: "Rank inputs by how much they move the answer, and turn the error budget into a shopping list.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "Sensitivity analysis tells you which inputs actually control the output uncertainty. That is useful when measurement time or budget is limited. || Normalized sensitivity shows the percent change in output caused by a percent change in an input. Combine that leverage with the input's actual uncertainty to estimate its contribution to the result. || Improve the dominant contributors first, then recalculate. Once one source is reduced, another may become the new limiting term.",
    use: "When the uncertainty is too big, or the instrument budget too small, or someone asks 'where would better data actually help?' || Compute each input's normalized sensitivity and its variance share of the RSS total. Sort descending. Price the improvement of the top input against the uncertainty it buys back — a 3× better gauge that halves the total is a purchase; one that trims 2% isn't worth the requisition. || Stop when the dominant input is improved or priced out. Document the residual uncertainty as the honest limit of the measurement — 'this is as tight as this rig gets' is a legitimate result.",
    example:
      "Same thrust rig: p = 10.0 ± 0.1 MPa (1%), d = 50.0 ± 0.1 mm (0.2%). The leverages: S_p = 1, S_d = 2 — the diameter is twice as leveraged, because area squares it. || But leverage is not the bill: variance shares are (1×1%)² vs (2×0.2%)² — 86% pressure, 14% diameter. Halving the pressure uncertainty cuts RSS from 211 N to 126 N; halving the diameter uncertainty instead only reaches 200 N. || Spend where leverage AND sloppiness are both large. Here that is the pressure gauge, and it isn't close — the micrometer's double leverage is wasted on an input that is already tight.",
    ideas: [
      {
        heading: "Combine sensitivity with input uncertainty to set priorities",
        body: "The sensitivity Sᵢ comes from the formula: exponents become leverages (L³ in beam deflection makes length three times as sensitive as load). The actual uncertainty uᵢ/xᵢ comes from the world: how sloppy this input really is. Priority is the product. A huge leverage on a tightly-controlled input contributes almost nothing; a modest leverage on a sloppy input is where the scatter lives.",
      },
      {
        heading: "One-factor-at-a-time lies a little",
        body: "Varying one input while holding the rest frozen misses interactions — inputs whose errors move together. For most engineering formulas the first-order ranking is close enough to spend money by, and a Monte Carlo run (sample everything at once, watch the output's scatter) checks it. Compare like with like: for ± bounds sampled uniformly, the Monte Carlo standard deviation should be about RSS/√3. A big departure from that means the linear approximation is breaking and the ranking needs a second look.",
      },
      {
        heading: "Use the uncertainty budget to decide what to improve",
        body: "An error budget is a table: each link, its nominal, its ±, its variance share, its source. That table is the evidence for this week — it says what was measured, how well, what dominates, and what was decided. File the decision with the table, or the analysis never turns into action.",
        formula: "shareᵢ = (Sᵢ·uᵢ/xᵢ)² / Σ(Sⱼ·uⱼ/xⱼ)²",
      },
    ],
    bench: "errbudget",
    prompt:
      "Reopen the thrust-rig chain from lesson 2. || Halve the dominant link's uncertainty using the upgrade picker and watch the RSS total — then try halving a non-dominant link instead. || State in one sentence where the next dollar goes and what residual uncertainty you would sign for.",
    note: "The upgrade picker halves one link's uncertainty — a stand-in for 'buy the next grade of instrument'. Real quotes beat stand-ins. The habit being built is pricing uncertainty per dollar.",
    checks: [
      {
        prompt: "In δ = FL³/3EI, which input is the most leveraged?",
        options: ["F, with sensitivity 1", "L, with sensitivity 3", "E, with sensitivity −1", "I, with sensitivity −1"],
        answer: 1,
        why: "Normalized sensitivity of a power-law input is its exponent: L³ gives S_L = 3. A 1% length error moves the deflection 3% — the cube is the leverage, which is why length control dominates deflection budgets.",
      },
      {
        prompt: "An input has huge leverage but tiny actual uncertainty. You should…",
        options: [
          "Upgrade it first — leverage is everything",
          "Leave it — priority is leverage times sloppiness, and the sloppiness is tiny",
          "Upgrade it anyway; you cannot be too careful",
          "Remove it from the model",
        ],
        answer: 1,
        why: "Variance share is (Sᵢ·uᵢ/xᵢ)². Enormous Sᵢ times near-zero uᵢ/xᵢ is near-zero share — the scatter lives elsewhere. Money follows the product, not the leverage alone.",
      },
      {
        prompt: "After upgrading the dominant link, the correct next step is…",
        options: [
          "Declare victory — the budget is done",
          "Recompute the ranking; the next bottleneck is now on top",
          "Upgrade the same link again immediately",
          "Halve every remaining uncertainty",
        ],
        answer: 1,
        why: "Variance shares are relative — shrinking the top link promotes the runner-up. The ranking is a moving target, so the budget is recomputed after every change until the residual is acceptable or priced out.",
      },
      {
        prompt: "Your ± bounds are sampled uniformly, and the Monte Carlo standard deviation lands far from RSS/√3. Likely cause?",
        options: [
          "The random seed was unlucky",
          "The model's nonlinearity is breaking the first-order approximation",
          "RSS is always wrong",
          "More Monte Carlo samples are needed — always",
        ],
        answer: 1,
        why: "RSS is first-order: it linearizes at the nominal point. Strong curvature or large uncertainties break that linearization, and the Monte Carlo — which samples the real function — exposes it. The fix is a better model treatment, not more samples of the same disagreement.",
      },
    ],
  },
];
