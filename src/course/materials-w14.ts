import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 14 — Mechanical response.
 * Materials-track indices 10–12. Evidence due: curve-reading practical
 * (readcurve bench) + calculations (toughduct and allowables).
 *
 * Through-line for the block: structure → processing → properties →
 * performance. This week is the properties link made quantitative — the
 * stress–strain curve is where a material's mechanical character is written
 * down, and everything later (selection, design allowables, failure) reads
 * from it.
 */
export const materialsW14Lessons: Lesson[] = [
  {
    id: "readcurve",
    track: "materials",
    index: 10,
    title: "Reading a stress-strain curve",
    minutes: 40,
    lede: "Locate stiffness, yield, ultimate strength, and fracture on a real tensile curve — and keep stiffness, strength, and hardness as three different words.",
    start:
      "A tensile machine pulls a steel bar and records two numbers: the pull per unit area, and the stretch per unit length. The plot of the first against the second is the material's mechanical autobiography. || Engineering stress is σ = F/A₀, load over the original cross-section. Engineering strain is ε = ΔL/L₀, extension over the original length. Both use original dimensions — a simplification you will revisit in the allowables lesson, which makes every curve comparable for now. || The curve has landmarks, and each landmark is a different property. The initial slope is stiffness. The stress where the curve leaves the straight line is where strength starts to matter. The peak is the most stress the bar ever carried. The strain where it ends is how far it went. Confusing any two of these is the most common error in the subject.",
    use: "Someone hands you a tensile curve — a datasheet plot, a lab printout, a paper figure. || Read, in order: the initial slope (E, stiffness), the 0.2%-offset yield (σy, where permanent deformation begins), the maximum (σuts, ultimate tensile strength), and the fracture strain (ductility). Then state each in its own units: E in GPa, strengths in MPa, strain dimensionless. || Stop when you can point at each landmark and name it without reaching for 'strong' as a blanket word. If the curve is a straight line to fracture, say so: that is a brittle material, and yield never happened.",
    example:
      "A 1020 steel bar, 12.5 mm diameter, pulled in tension. The load–extension record bends away from the straight line at 42.9 kN, and the load peaks at 51.5 kN before the bar necks and breaks. || Area A₀ = π/4 × (12.5 mm)² = 122.7 mm². Yield: σy = 42,900 N / 122.7 mm² = 350 MPa. Ultimate: σuts = 51,500 / 122.7 = 420 MPa. The initial slope of the σ–ε plot is 200 GPa — the stiffness, E. || The numbers are 350, 420, 200 GPa: three different quantities, three different landmarks. The 350 is where it stopped springing back. The 420 is the most it ever carried. The 200 GPa is how little it stretched getting there.",
    ideas: [
      {
        heading: "The 0.2% offset is a convention with a reason",
        body: "Many engineering alloys have no sharp yield point — the curve bends gradually, so 'where it leaves the line' is a matter of eyesight. The convention: draw a line parallel to the elastic slope starting at ε = 0.002, and take the intersection as σy. It is arbitrary the way a speed limit is arbitrary: the value matters less than the fact that everyone measures the same thing. On a curve with a sharp yield drop (mild steel), the offset lands within a few percent of the visible knee.",
        formula: "σy = σ at the intersection with σ = E(ε − 0.002)",
      },
      {
        heading: "Stiffness, strength, hardness: three words",
        body: "Stiffness (E) is resistance to elastic stretch — the slope. Strength (σy, σuts) is stress at two landmarks — heights on the curve. Hardness is resistance to surface indentation, a different test entirely; it correlates with strength for steels and not much else. Glass is stiff (E ≈ 70 GPa) and can be strong in the right test, yet it is the opposite of tough. Say which one you mean, every time.",
        formula: "E = σ/ε (elastic) · σy, σuts are stresses · hardness is a surface test",
      },
      {
        heading: "The axes are doing quiet work",
        body: "Strain is dimensionless, so the horizontal axis is pure number — but its scale decides what you see. A ceramic's whole curve lives below ε = 0.002; a polymer's runs past ε = 2. Plot them on shared axes and one of them is invisible. Engineers rescale per material, which is honest as long as you notice. Always read the axis limits before you read the curve.",
        formula: "ε = ΔL/L₀ (dimensionless) — check the axis before trusting the shape",
      },
    ],
    bench: "curveread",
    prompt:
      "Five tensile curves, each with measurement noise. Extract E, the 0.2%-offset yield, UTS, and elongation from each. || Score within tolerance on all four quantities. || Then say which material you would least want in a crash structure, and which landmark decided it.",
    note: "The curves are simulated from real engineering values with ~1% measurement noise — the scatter is the point. Yield extraction lands within a few percent of the book value; that residual is the method's, not yours.",
    checks: [
      {
        prompt: "On a stress–strain curve, Young's modulus is…",
        options: [
          "The highest stress reached",
          "The slope of the initial linear region",
          "The strain at fracture",
          "The area under the whole curve",
        ],
        answer: 1,
        why: "E = σ/ε while the deformation is elastic. The peak is a strength, the fracture strain is a ductility, the area is a toughness — four landmarks, four words.",
      },
      {
        prompt: "Why does the 0.2%-offset construction exist?",
        options: [
          "Because 0.2% is the elastic limit of all metals",
          "Because many alloys yield gradually, so the knee needs an agreed definition",
          "Because strain gauges cannot read below 0.2%",
          "Because it converts engineering stress to true stress",
        ],
        answer: 1,
        why: "With no sharp knee, 'where it leaves the line' is subjective. The offset line gives every lab the same number. It is a convention, and conventions work because they are shared.",
      },
      {
        prompt: "A material shows E = 200 GPa and fractures at 400 MPa with 0.2% strain. It is…",
        options: [
          "Ductile and tough",
          "Stiff and strong in tension, but brittle",
          "Low-stiffness and weak",
          "Impossible — the numbers contradict",
        ],
        answer: 1,
        why: "High slope (stiff), respectable fracture stress (strong in this test), but the curve is a short spike — almost no plastic strain, so the area under it is tiny. Stiff and brittle coexist happily.",
      },
      {
        prompt:
          "An aluminum tensile bar is 10.0 mm in diameter. The load–extension record leaves the straight line at 21.2 kN. What is the engineering yield stress?",
        options: ["≈ 270 MPa", "≈ 67.5 MPa", "≈ 212 MPa", "≈ 1080 MPa"],
        answer: 0,
        why: "A₀ = π/4 × (10.0 mm)² = 78.5 mm², and 21,200 N ÷ 78.5 mm² ≈ 270 MPa (N/mm² is MPa). 67.5 used π × (10 mm)² — the diameter as a radius, four times the area. 212 divided by d² = 100 mm², dropping the π/4. 1080 used π/4 × (5 mm)² — the radius as a diameter, a quarter of the area.",
      },
    ],
  },
  {
    id: "toughduct",
    track: "materials",
    index: 11,
    title: "Ductility and toughness",
    minutes: 35,
    lede: "Quantify how far a material stretches before breaking, integrate the area under its curve, and see why strength and ductility trade against each other.",
    start:
      "Two bars, same cross-section. One is high-strength steel: it carries 1500 MPa and snaps at 3% elongation. The other is mild steel: it yields at 350 MPa and stretches to 36% before breaking. Drop a weight on each. || The high-strength bar absorbs the energy of a tall, thin spike. The mild steel absorbs the energy of a long, broad curve — roughly 140 MJ/m³ versus about 40. The 'weaker' bar absorbs over three times the energy; the 'stronger' one breaks first. || Toughness is the area under the stress–strain curve: stress (force per area) times strain (distance per length) is energy per volume. Ductility is the width of that area. Strength is only its height.",
    use: "You are choosing a material for impact, crash, or anything that must fail gracefully. || Read elongation (or reduction of area) for ductility, and integrate — or estimate — the area under the curve for toughness. Compare candidates by area, not by peak. || Stop when you can rank three materials for a crash structure and defend the ranking with areas, not adjectives.",
    example:
      "Mild 1020 steel versus the same steel cold-worked. Annealed: σy = 350 MPa, elongation 36%, toughness ≈ 141 MJ/m³. Cold-worked: σy = 700 MPa, elongation 8%, toughness ≈ 57 MJ/m³. || Cold work doubled the yield — dislocations piled up and now resist further motion — but it spent the material's capacity to stretch. The area shrank by more than half even though the peak grew. || Processing moved the curve: strength up, ductility down, toughness down. That is the strength–ductility tradeoff, and it is why 'stronger' is not a synonym for 'better'.",
    ideas: [
      {
        heading: "Toughness is an integral",
        body: "Toughness ≈ ∫σ dε from zero to fracture, in MJ/m³ — energy absorbed per unit volume before breaking. A tall thin spike (ceramic: ~0.1 MJ/m³) and a long broad curve (mild steel: ~140 MJ/m³) differ by three orders of magnitude. For quick estimates, the area of a trapezoid under the real curve beats any single number. Impact, crash, and seismic design live in this integral.",
        formula: "toughness = ∫₀^εf σ dε  (energy per volume)",
      },
      {
        heading: "Ductility has two measures",
        body: "Elongation at fracture (εf, percent) is the common one — how much longer the gauge section got. Reduction of area ((A₀−Af)/A₀) measures the neck: it stays meaningful when elongation is distorted by gauge length. Worked: a 50 mm gauge that measures 68 mm after fracture gives %EL = 18/50 = 36%; a 10.0 mm bar (78.5 mm²) whose neck ends at 6.3 mm (31.2 mm²) gives %RA ≈ 60%. Both say the same thing qualitatively: how much plastic flow happened before separation. A material can be ductile in one loading and brittle in another — temperature and notch change the answer.",
        formula: "%EL = (Lf − L₀)/L₀ · 100%    %RA = (A₀ − Af)/A₀ · 100%",
      },
      {
        heading: "The tradeoff is structural, not accidental",
        body: "The mechanisms that raise strength — cold work, precipitation, solid solution — all do it by obstructing dislocation motion. But plastic flow IS dislocation motion. Hindering dislocations raises the stress needed to move them and simultaneously reduces how far they can go. You cannot buy strength with these mechanisms without spending ductility. (Grain refinement is the notable exception — it raises strength and usually toughness.)",
        formula: "strength ↑ via dislocation obstruction ⇒ ductility ↓ (same mechanism)",
      },
    ],
    bench: "propcompare",
    prompt:
      "Eight engineering materials, one table of extracted curve parameters. || Rank them for three jobs: a crash rail, a stiff lightweight panel, a cutting edge. || Each ranking must cite the landmark that decided it — area, slope, or peak.",
    note: "The table values come from the same curve model as the curve-reading lesson's bench, so the numbers are consistent across the week. Annealed copper is in the table: notice what its huge hardening does to the offset-yield reading.",
    checks: [
      {
        prompt: "Toughness is physically…",
        options: [
          "A stress, in MPa",
          "Energy per unit volume, in MJ/m³",
          "A strain, dimensionless",
          "A force, in newtons",
        ],
        answer: 1,
        why: "∫σ dε has units of (force/area)·(length/length) = energy/volume (MJ/m³ — the same dimensions as MPa, which is why it is quoted per volume, not as a stress). It answers 'how much energy did breaking this cost', which is what a crash cares about.",
      },
      {
        prompt: "Cold-working a steel doubles its yield but cuts elongation from 36% to 8%. Its toughness…",
        options: [
          "Doubles, because strength doubled",
          "Stays the same — the tradeoff is exact",
          "Falls, because the area under the curve shrank",
          "Becomes zero — cold-worked steel is brittle",
        ],
        answer: 2,
        why: "The peak grew but the width collapsed; the area (≈57 vs ≈141 MJ/m³) fell by more than half. Cold-worked steel is far from brittle, but it is much less tough.",
      },
      {
        prompt: "Why do strengthening mechanisms tend to reduce ductility?",
        options: [
          "They raise the melting point, which embrittles",
          "They obstruct dislocation motion, and plastic flow is dislocation motion",
          "They introduce porosity",
          "They change the crystal structure to ceramic",
        ],
        answer: 1,
        why: "Strength from cold work, solid solution, or precipitates all works by making dislocations harder to move. Less dislocation motion means less plastic strain before fracture — the same mechanism, both effects.",
      },
      {
        prompt: "A ceramic and a metal have the same ultimate tensile strength. In an impact, the metal is usually safer because…",
        options: [
          "Its modulus is higher",
          "The area under its curve is far larger",
          "Its density is higher",
          "Ceramics cannot carry tension at all",
        ],
        answer: 1,
        why: "Same peak, vastly different width. The metal's plastic region absorbs orders of magnitude more energy. Peak strength alone never predicted impact survival.",
      },
    ],
  },
  {
    id: "allowables",
    track: "materials",
    index: 12,
    title: "From curve to design allowable",
    minutes: 40,
    lede: "Turn a noisy tensile record into E, yield, and UTS, account for scatter, and convert a characteristic strength into a number you are allowed to design to.",
    start:
      "A real tensile record is not the clean curves of the curve-reading lesson. The load cell hums, the extensometer slips a few microns, and the initial slope wobbles. Three bars from the same heat give yield strengths of 342, 358, and 349 MPa. || The extraction procedure is the same — slope for E, offset line for yield, peak for UTS — but now it runs on noisy data, and the answer comes with scatter. You fit the slope through the linear prefix and stop where the points leave the line; you let the offset construction find the crossing. The method's own error is a few percent, and you report it. || Then comes the step the curve alone cannot take: turn the scatter into an allowable. A characteristic value from the low tail of the scatter, divided by a factor of safety. The curve gives you properties; judgment plus statistics gives you an allowable.",
    use: "You have tensile data and a part to size. || Extract E, σy, σuts from the record; estimate the scatter across specimens; pick a characteristic strength that the scatter justifies; divide by the factor of safety the consequence of failure demands. || Stop when you can write: 'Allowable 390 MPa = 585 MPa characteristic / 1.5', and say where each number came from.",
    example:
      "Ti-6Al-4V, three specimens: yield readings 872, 885, 879 MPa. || Mean 879, standard deviation ≈ 6.5 MPa — tight, as befits a controlled alloy. Take a quick low-tail characteristic two standard deviations below the mean, 879 − 2 × 6.5 = 866 MPa, and a factor of safety of 1.5 for a static-strength check: allowable = 866 / 1.5 ≈ 577 MPa (real A/B-basis values need many more specimens and statistical tolerance factors). || The curve said ~880. The design uses 577. The gap between them is scatter, uncertainty, and consequence — and none of those are on the curve.",
    ideas: [
      {
        heading: "Extraction is fitting, not reading",
        body: "On noisy data you do not eyeball the slope — you fit it: least-squares through the origin on the initial linear prefix, stopping where points systematically leave the line. The 0.2% offset then finds its own crossing. Done this way, E lands within ~1% and yield within a few percent of the book values even with 1% measurement noise. The residual error is the method's honesty, not your failure.",
        formula: "E = Σ(εσ)/Σ(ε²) over the linear prefix; σy from σ = E(ε − 0.002)",
      },
      {
        heading: "Engineering stress lies after necking — usefully",
        body: "Engineering stress uses the original area A₀, so after necking begins the curve falls: the load drops even as the true stress in the neck keeps rising. True stress (F/A_actual) and true strain (ln(L/L₀)) keep climbing. For design, engineering stress is the honest choice — your part's cross-section is the original one — but when you read 'strain hardening' in a paper, check which stress they mean. The post-necking fall is bookkeeping: the load drops because the neck's area shrinks faster than the metal hardens. Worked: just before necking at σ_eng = 400 MPa and ε_eng = 0.20, the true stress is 400 × 1.20 = 480 MPa and the true strain ln(1.20) ≈ 0.18.",
        formula: "σ_true = σ_eng(1 + ε_eng),  ε_true = ln(1 + ε_eng)  (to necking)",
      },
      {
        heading: "Allowable = characteristic / factor of safety",
        body: "The factor of safety is priced uncertainty: material scatter, load uncertainty, analysis idealization, and consequence of failure. A footbridge and a spacecraft bracket do not share a factor. And processing moves the whole curve: quench-and-temper raises the landmarks, annealing lowers them — so the allowable belongs to a material and a process together, never to an alloy name alone. Structure → processing → properties → performance, with the bill due at the end.",
        formula: "σ_char ≈ mean − 2s (quick screen) · σ_allow = σ_char / FoS",
      },
    ],
    bench: "allowable",
    prompt:
      "You are given five specimen records from one heat of 6061-T6 with realistic scatter. || Extract the yield of each, compute the mean and the low-tail characteristic value, choose a factor of safety for a stated consequence, and issue the allowable. || Defend the factor — '1.5 because everyone uses 1.5' fails.",
    note: "The five records are generated from the curve-reading lesson's curve model with per-specimen parameter scatter plus measurement noise — the same machinery, now with a heat's worth of variation.",
    checks: [
      {
        prompt: "After necking begins, the engineering stress–strain curve falls while the true curve keeps rising because…",
        options: [
          "The material is getting weaker",
          "Engineering stress divides by the original area, which no longer describes the neck",
          "The load cell is miscalibrated past UTS",
          "Strain hardening reverses after the peak",
        ],
        answer: 1,
        why: "The load drops because the neck's area shrinks faster than the material hardens. True stress = F/A_actual keeps rising. The fall is bookkeeping, not softening.",
      },
      {
        prompt:
          "Five 6061-T6 specimens give a mean yield of 285 MPa with standard deviation 9 MPa. Using the quick low-tail rule (mean − 2s) and a factor of safety of 1.5, what allowable do you issue?",
        options: ["≈ 178 MPa", "≈ 190 MPa", "≈ 184 MPa", "≈ 401 MPa"],
        answer: 0,
        why: "Characteristic = 285 − 2 × 9 = 267 MPa; allowable = 267 / 1.5 = 178 MPa. 190 divided the mean — half the material is weaker than the mean. 184 stepped down only one s, which still leaves about one bar in six below it. 401 multiplied by the factor instead of dividing. And mean − 2s from five bars is a screening estimate: real A- and B-basis values need many specimens and statistical tolerance factors.",
      },
      {
        prompt: "Two specimen sets have the same mean yield, 350 MPa. Set A has σ = 5 MPa, set B has σ = 40 MPa. For the same factor of safety…",
        options: [
          "Both give the same allowable",
          "Set A supports a higher allowable",
          "Set B supports a higher allowable — more data",
          "Scatter does not enter the allowable",
        ],
        answer: 1,
        why: "The characteristic value sits below the mean by a margin the scatter sets. Tighter scatter means the low tail is closer to the mean, so more of the strength is usable.",
      },
      {
        prompt: "Why does the allowable belong to a material *and* a process?",
        options: [
          "Processes change the part's color, which inspectors check",
          "Processing moves the whole stress–strain curve — quenching, cold work, and annealing relocate every landmark",
          "Alloy names are trademarks and cannot appear on drawings",
          "Processes only affect cost, and cost is in the allowable",
        ],
        answer: 1,
        why: "Cold work doubled one steel's yield and more than halved its toughness in the toughness lesson. '1020 steel' names no curve until you say annealed or cold-worked. Structure → processing → properties → performance.",
      },
    ],
  },
];
