import type { Lesson } from "./types.ts";

/**
 * Engineering 101, Week 27 — Experiment design & data.
 * These three lessons are engineering-track indices 19–21.
 * Evidence due: lab report with uncertainty analysis.
 */
export const engineeringW27Lessons: Lesson[] = [
  {
    id: "doeplan",
    track: "engineering",
    index: 19,
    title: "Design the experiment before you run it",
    minutes: 40,
    lede: "Name the independent, dependent, controlled, and nuisance variables of a test, lay out a 2^k factorial plan with randomization, blocking, and center points, and say what each of those defends against.",
    start:
      "Experiments should be planned around the question you need to answer, not around whichever variable is easiest to change first. || Define the independent variables, response variable, controlled variables, and nuisance variables. Then choose a design that can separate the effects you care about. || One-factor-at-a-time tests can miss interactions. Factorial designs are useful when the effect of one variable may depend on another."
    use: "Before you collect a single data point — when the test is still a sketch on paper. Also when a past test failed to answer its question: the failure is usually in this plan, not in the instruments. || List the factors and their two levels. Decide full or half fraction. Name the nuisance variable and block it — run each block with the same conditions. Randomize the run order inside blocks. Add center-point replicates. Write the hypothesis the data could falsify, in numbers. || Stop when a colleague can run your plan without asking you a question, and when you can say what each design choice — randomization, blocking, replication — is defending against.",
    example:
      "Lap-joint shear strength. Factors: glue (A− standard epoxy, A+ toughened epoxy) and cure time (B− 2 h, B+ 24 h). Four corner runs: (−,−), (+,−), (−,+), (+,+). Two center-point replicates at 13 h cure for each glue. The two test rigs drift, so block by rig: run all four corners on each rig (8 corner runs) and compare within rigs. || Say the corner means are: (−,−) 8.0, (+,−) 8.6, (−,+) 8.4, (+,+) 13.0 MPa. Half-effect (coefficient) of glue A: (ȳ_{A+} − ȳ_{A−})/2 = ((8.6 + 13.0)/2 − (8.0 + 8.4)/2)/2 = (10.80 − 8.20)/2 = 1.30 MPa per coded level; the full main effect is 2.60. Cure B coefficient: ((8.4 + 13.0)/2 − (8.0 + 8.6)/2)/2 = (10.70 − 8.30)/2 = 1.20. The additive prediction for (+,+) is 9.50 + 1.30 + 1.20 = 12.00 — but the corner measured 13.0. The extra 1.0 MPa is the interaction, nearly as large as either coefficient: toughened epoxy only pays off with the full cure. || One-factor-at-a-time would have found “glue helps a little” and “cure helps a little” and never seen the interaction that is worth a megapascal. The center points land 0.3 MPa off the corner plane — no strong curvature, the flat model stands.",
    ideas: [
      {
        heading: "One-factor-at-a-time testing can miss interactions",
        body: "A 2^k factorial visits every corner: 4 runs for two factors, 8 for three. The interaction is a difference of differences — how much the effect of glue changes when cure changes. When the world is nonlinear, and it usually is, the interactions live in the corners, and OFAT never visits them.",
        formula: "2^k corners; interaction = Δ(Δy)",
      },
      {
        heading: "Use blocking, randomization, and replication for different sources of variation",
        body: "Blocking answers the nuisance variable you can name: run all conditions on rig A and rig B, and compare within blocks, so rig drift never masquerades as a factor effect. Randomization answers the lurking variable you cannot name: shuffle the run order so no hidden drift lines up with a factor. Replication answers noise: repeated runs let you estimate the error itself, which is what every later significance claim is divided by.",
      },
      {
        heading: "Center points catch curvature",
        body: "Put a few runs at the middle of every factor range. If their mean sits on the plane the corners define, a flat model is honest. If it sits far off, the response curves and the linear model is a lie — the design needs axial points or a quadratic term. Center points are cheap insurance against the most common modeling sin: assuming the world is straight between two points.",
      },
    ],
    bench: "doe",
    prompt:
      "Pick 2–3 factors with two levels each, choose full or half fraction, name a nuisance variable to block, and randomize the run order. || Add center-point replicates and read the plan summary: total runs, what the design can estimate, what the blocks defend against. || Answer the three graded questions, then state the falsifiable hypothesis this plan could kill.",
    note: "The plan table randomizes with a fixed seed so the order is reproducible — re-seed it and the order changes, but the design's properties do not.",
    checks: [
      {
        prompt: "A 2^3 full factorial needs how many corner runs?",
        options: ["8", "6", "4", "9"],
        answer: 0,
        why: "2^3 = 8 corners — every combination of low/high across three factors. 6 would be three factors times two levels — a count of settings, not runs. (OFAT would be 4: a baseline plus one change per factor.)",
      },
      {
        prompt: "Why randomize the run order?",
        options: [
          "To defeat lurking variables you did not name",
          "To reduce the number of runs",
          "To make the factors orthogonal",
          "To estimate curvature",
        ],
        answer: 0,
        why: "Randomization breaks any alignment between run order and hidden drift — a warming lab, a tiring operator. Orthogonality comes from the factorial structure, curvature from center points, run count from the fraction.",
      },
      {
        prompt: "Two test rigs drift against each other. The right defense is…",
        options: [
          "Block by rig",
          "Randomize the rigs away",
          "Replicate until it averages out",
          "Hold rig as a controlled variable",
        ],
        answer: 0,
        why: "A named nuisance variable gets blocked: run each condition on both rigs and compare within blocks. Randomization defends against unnamed drift; you cannot hold two rigs fixed as one, and replication alone leaves rig bias in every mean.",
      },
      {
        prompt: "Center-point replicates land far off the corner plane. This means…",
        options: [
          "The response curves — a flat model is dishonest",
          "The factors have no effect",
          "The experiment failed and must restart",
          "The interaction is zero",
        ],
        answer: 0,
        why: "Center points test the flat-model assumption. Off the plane means curvature: add axial points or a quadratic term. It is a successful detection, not a failed experiment — this is exactly what the points are for.",
      },
    ],
  },
  {
    id: "smallsample",
    track: "engineering",
    index: 20,
    title: "Five readings are data, not noise",
    minutes: 40,
    lede: "Compute the mean, sample standard deviation, and 95% confidence interval of a small sample, screen a suspect point with a Grubbs score, and report a result with honest digits.",
    start:
      "A small set of repeated measurements should be reported with both a central estimate and an uncertainty on that estimate. || The sample standard deviation describes the spread of individual readings. The standard error s/√n describes the uncertainty of the sample mean. For small samples, a confidence interval uses Student's t multiplier rather than a normal-distribution value. || Keep those quantities separate. A narrow standard error does not mean the individual measurements have little scatter."
    use: "Every time n is small — bench tests, destructive tests, flight data you cannot repeat. || Compute with full precision: mean, sample std (n − 1), SE, t for n − 1 degrees of freedom, half-width t·SE. Screen any suspect point with a Grubbs score |x − mean|/s against the critical value — and investigate before you ever delete. Round once, at the end: the uncertainty gets one or two significant figures, the value stops where the uncertainty starts. || Stop when the result reads “value ± interval (95% CI, n = k)”: anyone can carry that number into a margin table without corrupting it.",
    example:
      "Thrust: 19.4, 19.8, 19.5, 19.9, 20.4 kN. || Mean = 99.0/5 = 19.80 kN. Deviations −0.4, 0, −0.3, 0.1, 0.6; squared sum 0.62; s = √(0.62/4) = 0.394 kN. SE = 0.3937/√5 = 0.176 kN. Four degrees of freedom: t = 2.776. Half-width = 2.776 × 0.176 = 0.49 kN. The 20.4 looks high — Grubbs score = 0.60/0.3937 = 1.52, below the n = 5 critical value 1.72. It is not excludable. || Report: 19.80 ± 0.49 kN (95% CI, n = 5). The suspect point stays, with the score and the decision written in the notebook. Deleting it would narrow the band to a lie; the interval above is the honest one.",
    ideas: [
      {
        heading: "Standard deviation describes readings; standard error describes the mean",
        body: "The standard deviation describes how the readings scatter — a property of the process. The standard error describes how far your *average* might be from the truth — a property of the sample size. More firings barely change s but shrink SE by √n. Confusing the two is the most common statistics error in lab reports: plotting s as the error bar on a mean claims the mean is blurrier than it is.",
        formula: "SE = s / √n",
      },
      {
        heading: "Small samples require a larger t multiplier",
        body: "With thirty readings, t ≈ 2.0 and the interval is tame. With five, t = 2.776 — the band is 40% wider, because five points prove less. With two, t = 12.7 and the interval screams that you know almost nothing. The t-distribution is the math's way of charging you for thin evidence. This is why replicate counts are a design decision, not a budget accident.",
        formula: "mean ± t_{n−1} · s/√n",
      },
      {
        heading: "Outliers get a hearing, not an execution",
        body: "The Grubbs score |x − mean|/s measures how far a suspect point sits from its own family, in units of that family's spread. Exceeding the critical value is grounds to *investigate* — a clogged orifice, a mistyped digit — never grounds to delete silently. An excluded point must be named, scored, and justified in the notebook; otherwise the next analyst inherits a dataset whose cleaning they cannot audit.",
        formula: "G = |x − mean| / s",
      },
    ],
    bench: "labreport",
    prompt:
      "Enter the mean, sample standard deviation, and 95% half-width for the rig dataset — graded against the machine's arithmetic. || Score the suspect point with Grubbs and decide: keep or investigate. || Read the strip plot, then write the conclusion the way a margin table can consume it: value ± interval, n, and what you did about the suspect.",
    note: "Tolerances are generous on the value, strict on the method: entering the population std (n in the denominator) fails even if the number looks close.",
    checks: [
      {
        prompt: "Why does the sample standard deviation divide by n − 1?",
        options: [
          "One degree of freedom was spent computing the mean",
          "It makes the arithmetic simpler",
          "It matches the normal distribution",
          "It corrects for rounding error",
        ],
        answer: 0,
        why: "The deviations from the sample mean always sum to zero — one constraint — so only n − 1 are independent. Dividing by n − 1 unbiases the variance estimate. Dividing by n systematically underestimates spread.",
      },
      {
        prompt: "n = 5, s = 0.394 kN. The standard error of the mean is about…",
        options: ["0.18 kN", "0.39 kN", "0.08 kN", "0.79 kN"],
        answer: 0,
        why: "SE = s/√n = 0.394/√5 ≈ 0.18 kN. The standard deviation 0.394 describes the data's scatter; the mean's wobble is smaller by √5. 0.79 would be 2s — a different band entirely.",
      },
      {
        prompt: "A Grubbs score of 1.52 with n = 5 (critical 1.72). The point is…",
        options: [
          "Not excludable — it stays, with the score noted",
          "Excludable — it exceeds 1.5",
          "Excludable — any high point may go",
          "Not excludable, so the experiment reruns",
        ],
        answer: 0,
        why: "1.52 < 1.72: the score does not reach the threshold, so the point stays and the decision is documented. A score above critical would authorize investigation — not silent deletion — and never a rerun on its own.",
      },
      {
        prompt: "Which error bar belongs on a plotted mean?",
        options: [
          "The confidence interval (or SE)",
          "The sample standard deviation",
          "The full data range",
          "The instrument resolution",
        ],
        answer: 0,
        why: "The point plotted is the mean, so its bar must describe the mean's uncertainty: the CI or the SE. Plotting s as the bar answers a question nobody asked — how the raw readings scatter — and makes the mean look blurrier than the data warrant.",
      },
    ],
  },
  {
    id: "honestgraph",
    track: "engineering",
    index: 21,
    title: "Graphs that don't lie",
    minutes: 40,
    lede: "Read a graph's argument before its numbers, linearize a relationship to test it, judge a fit by its residuals, and structure a lab report that convinces a skeptic.",
    start:
      "Graphs can make the same data look very different depending on axis choices, smoothing, and what uncertainty is shown. || Use axes that support the comparison you are making, label uncertainty clearly, and avoid transformations or smoothing that hide important structure. When theory predicts a linearized relation, fit it and inspect the residuals. || A high R² is not enough by itself. A pattern in the residuals usually means the model shape is missing something."
    use: "Whenever a claim rests on plotted data — your report, a vendor's datasheet, a conference slide. Also when you fit any model: the fit is not done when the parameters print, it is done when the residuals pass inspection. || Plot the raw points with stated error bars. Choose the linearization the theory demands. Fit, then plot residuals vs the independent variable and vs the fitted values. Look for curvature, fans, and runs — each has a diagnosis. || Stop when the graph could survive a hostile reading: axes labeled with units, uncertainty shown, residuals inspected, and the conclusion written with the interval attached.",
    example:
      "Pendulum: L = 0.25, 0.50, 0.75, 1.00 m; T² = 1.01, 2.02, 3.03, 4.06 s². || Theory says T = 2π√(L/g), so T² = (4π²/g)·L — plot T² against L and expect a straight line through the origin. Least squares: slope 4.064 s²/m, intercept −0.01 s², R² ≈ 0.99998. g = 4π²/4.064 = 9.71 m/s². Residuals: +0.004, −0.002, −0.008, +0.006 s² — static, no pattern, and the intercept is zero within its own standard error. || The graph argues: the line is straight, it passes through the origin as theory demands, the residuals show no structure. The intercept check is the quiet hero — a nonzero intercept beyond its error would have meant a systematic timing offset, caught by the graph, not by the R².",
    ideas: [
      {
        heading: "Graph choices affect how the data is interpreted",
        body: "Every choice — axis limits, aspect ratio, smoothing, what gets an error bar — is a rhetorical move. Starting a ratio comparison above zero exaggerates differences; heavy smoothing invents trends the data never had. The defense is not “no choices” but stated choices: axes labeled with units, uncertainty drawn and defined, raw points visible under any fit. A graph that could survive a hostile reading is a graph you can stand behind.",
      },
      {
        heading: "Use linearization and residuals to test the model shape",
        body: "If theory predicts a curve, transform the axes until theory predicts a line — T² vs L, log y vs x for exponentials. A line is the one shape the eye judges well. Then the real test: residuals, observed minus fitted, plotted against the independent variable. Static means the model captured the structure. A curve in the residuals means the model is wrong; a fan means the variance grows and the fit's weighting is wrong. R² measures fit, residuals judge it.",
        formula: "residual = y_observed − y_fitted",
      },
      {
        heading: "The report that convinces",
        body: "Question, stated in numbers. Method, detailed enough to repeat — including the design: factors, blocks, replicates. Data, raw and complete, not just the averages. Analysis, with the uncertainty carried through every step. Conclusion, as value ± interval with n, and every assumption named in the ledger. A report missing any layer asks the reader to trust you; a report with all five lets them check you instead.",
      },
    ],
    bench: "labreport",
    prompt:
      "Toggle the strip plot between honest and truncated axes and say which argument each one makes. || Read the pendulum fit: slope, intercept, recovered g, and the residual verdict. || Finish the lab report — conclusion with the interval, the suspect-point decision, and the assumption ledger entry.",
    note: "The pendulum dataset is the lesson's worked case, so every number in the bench has a paper trail back to the text.",
    checks: [
      {
        prompt: "A fit scores R² = 0.999 but the residuals curve smoothly. Verdict?",
        options: [
          "The model is wrong — residuals judge, R² only measures",
          "The fit is excellent — 0.999 settles it",
          "More data would fix the curve",
          "The residuals need smoothing",
        ],
        answer: 0,
        why: "A curved residual pattern is the data saying the model's shape is wrong — R² only measures closeness to whatever shape was fit. Smoothing the residuals would hide the evidence; more data would sharpen the same wrong curve.",
      },
      {
        prompt: "Theory says T² ∝ L. The honest test plot is…",
        options: [
          "T² vs L, demanding a straight line through the origin",
          "T vs L, looking for the curve",
          "T² vs L with the intercept ignored",
          "log T vs log L only",
        ],
        answer: 0,
        why: "Linearizing to T² vs L turns the prediction into the one shape eyes judge well — a straight line — and the zero intercept is part of the prediction: it tests for systematic offset. Log-log would confirm the exponent but throw away the origin test.",
      },
      {
        prompt: "The pendulum intercept is −0.01 s² with a standard error of 0.01 s². This means…",
        options: [
          "Zero within error — no systematic offset detected",
          "A timing error is proven",
          "The slope is unreliable",
          "The data must be re-zeroed",
        ],
        answer: 0,
        why: "−0.01 ± 0.01 just covers zero: the data are consistent with the theoretical origin, which is exactly what the honest graph checks. An intercept beyond its error would have flagged systematic bias — here there is none to fix.",
      },
      {
        prompt: "A report's conclusion should state…",
        options: [
          "Value ± interval, with n and the suspect-point decision",
          "The value, to as many digits as the calculator gave",
          "The value and the R²",
          "The method, so the conclusion is implied",
        ],
        answer: 0,
        why: "The conclusion is the number a margin table will consume: value, interval, sample size, and what happened to the suspect point. Extra digits are dishonest, R² belongs in the analysis, and a method without a stated result asks the reader to do your job.",
      },
    ],
  },
];
