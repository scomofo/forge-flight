import type { Lesson } from "./types.ts";

/**
 * Physics 101, Week 9 — Oscillations, waves & heat.
 * These three lessons are physics-track indices 25–27, after Week 8.
 * Evidence due: resonance investigation (lesson 2 bench) + thermal stress set
 * (lesson 3 bench).
 */
export const physicsW9Lessons: Lesson[] = [
  {
    id: "shm",
    track: "physics",
    index: 25,
    title: "Oscillations and natural frequency",
    minutes: 35,
    lede: "Find a system's natural frequency from its stiffness and mass, predict its motion from any release point, and account for where the energy sits at every instant.",
    start:
      "A spring-mass system and a tuning fork both tend to oscillate at a characteristic frequency set by the system itself. || For a simple spring, the restoring force is F = −kx. The minus sign tells you the force points back toward equilibrium. Combining that with Newton's second law gives m x¨ = −kx and the natural angular frequency ω = √(k/m). || Stiffness and mass set the frequency. The initial displacement and velocity set the amplitude and phase.",
    use: "Whenever something is displaced from a stable equilibrium and released — suspensions, buildings in wind, atoms in a crystal, the balance wheel in a watch. Small oscillations about any stable equilibrium look like F = −kx, which is why this one equation covers so much ground. || Write m·x¨ = −kx. Read ω = √(k/m), then f = ω/2π and T = 1/f. Get amplitude and phase from the initial conditions: x(t) = A·cos(ωt + φ). Track the energy: E = ½kA² total, sloshing between KE = ½k(A² − x²) and PE = ½kx². || Stop when you can state the period, the frequency, and the energy — and check the ledger: for undamped motion the total never changes, kinetic peaks at equilibrium, potential peaks at the extremes.",
    example:
      "A 0.50 kg mass hangs on a spring of stiffness 20 N/m, pulled 0.10 m down and released from rest. || ω = √(20/0.50) = √40 ≈ 6.32 rad/s. The cyclic frequency f = 6.32/2π ≈ 1.01 Hz, so the period T ≈ 0.99 s — about one bounce per second. Energy: E = ½·20·(0.10)² = 0.10 J. At the equilibrium crossing all of it is kinetic: ½·0.50·v² = 0.10 gives v_max = √(0.40) ≈ 0.63 m/s. || One second per bounce, 0.63 m/s through the middle, and all of it came from two numbers — the stiffness and the mass. Double the amplitude to 0.20 m and the frequency would not move: only the energy would, quadrupling to 0.40 J.",
    ideas: [
      {
        heading: "The restoring force points back toward equilibrium",
        body: "F = −kx says the force fights the displacement, always. That opposition is what turns a push into an oscillation instead of a runaway: displaced right, pulled left; displaced left, pulled right. Any stable equilibrium behaves this way for small disturbances — a pendulum at small angles, a molecule vibrating in a solid — which is why the harmonic oscillator is the most reused model in physics.",
        formula: "m·x¨ + kx = 0",
      },
      {
        heading: "Natural frequency depends on stiffness and mass",
        body: "ω = √(k/m) is fixed by the system before you touch it. Stiffen the spring and it hurries; add mass and it dawdles. Your release chooses only how far it swings (amplitude) and where in the cycle it starts (phase). This separation — system sets the rate, you set the swing — is what makes the tuning fork reliable and the car predictable.",
        formula: "ω = √(k/m), f = ω/2π, T = 2π√(m/k)",
      },
      {
        heading: "Energy shifts between kinetic and potential",
        body: "At the extremes the mass is instantaneously at rest and all energy is elastic potential, ½kA². At equilibrium the spring is relaxed and all of it is kinetic, ½mv_max². Between the two the energy pours back and forth, and the total never changes — until damping opens a drain. Follow the energy and you can solve oscillation problems without ever writing the differential equation.",
        formula: "E = ½kA² = ½mv_max²",
      },
    ],
    bench: "shmlab",
    prompt:
      "Set the mass and stiffness, pick a release amplitude, and watch the spring. || Read ω, f, and T from the bench and confirm them against √(k/m) by hand. || Then track one full cycle and write down where the kinetic energy peaks and where the potential does — the bench's energy bars are the evidence.",
    note: "The bench's clock is real seconds, so the period you read is the period you computed. If motion is reduced on your device, the oscillator holds still and the readouts carry the lesson.",
    checks: [
      {
        prompt: "A spring oscillator's mass is doubled, stiffness unchanged. The period…",
        options: [
          "Grows by √2",
          "Doubles",
          "Halves",
          "Does not change — amplitude absorbs it",
        ],
        answer: 0,
        why: "T = 2π√(m/k): mass sits under the square root, so doubling it multiplies the period by √2 ≈ 1.41. Amplitude never appears in the period.",
      },
      {
        prompt: "m = 0.50 kg, k = 20 N/m. The cyclic frequency is about…",
        options: ["1.0 Hz", "6.3 Hz", "0.16 Hz", "40 Hz"],
        answer: 0,
        why: "ω = √(20/0.50) ≈ 6.32 rad/s, and f = ω/2π ≈ 1.01 Hz. 6.3 is the angular frequency in rad/s — the right number in the wrong units, the classic trap.",
      },
      {
        prompt: "At the instant of maximum displacement, the kinetic energy is…",
        options: [
          "Zero — all energy is potential",
          "Maximum — the mass is moving fastest there",
          "Half the total, by symmetry",
          "Equal to the potential energy",
        ],
        answer: 0,
        why: "Maximum displacement means the mass is instantaneously turning around: v = 0, so KE = 0 and the full ½kA² sits in the spring. Kinetic peaks at equilibrium, where displacement is zero.",
      },
      {
        prompt: "Two oscillators share the same k and m but are released from different amplitudes. Their frequencies are…",
        options: [
          "Identical — amplitude sets energy, not frequency",
          "Higher for the larger swing",
          "Lower for the larger swing",
          "Unrelated — every release retunes the system",
        ],
        answer: 0,
        why: "ω = √(k/m) contains no amplitude. The bigger swing carries more energy (E ∝ A²; double A, four times E) at exactly the same rate — the property/system split from the second idea.",
      },
    ],
  },
  {
    id: "reswaves",
    track: "physics",
    index: 26,
    title: "Resonance and waves",
    minutes: 35,
    lede: "Find where a driven system amplifies the drive instead of following it, and read any wave's speed from its frequency and wavelength.",
    start:
      "A periodically forced system can respond much more strongly when the drive frequency approaches its natural frequency. || The steady-state response depends on the frequency ratio r = ω_drive/ω_n and the damping ratio ζ. Near resonance, light damping can produce a large amplification compared with the static deflection. || The two main design levers are straightforward: move the natural frequency away from the forcing frequency, or add damping to reduce the peak response.",
    use: "Whenever a periodic force meets an oscillator — wind on a bridge, an unbalanced rotor, a circuit driven at line frequency. || Compute the ratio r = ω_drive/ω_n and read the magnification off the response curve: near r = 1 with light damping, expect a large multiple of the static response. Fix it by moving ω_n away from the drive (change stiffness or mass) or by adding damping — the only thing standing between the system and a large motion. || Stop when you can name the peak's location and height — and check the flanks: as r → 0 the response tends to the static deflection F₀/k, and as r → ∞ the mass cannot keep up and the response falls.",
    example:
      "A machine with 5% damping (ζ = 0.05) is driven at its natural frequency. || At r = 1 the magnification is 1/(2·0.05) = 10: a 1 mm static deflection becomes 10 mm of motion. Detune the drive to r = 0.8 and the denominator becomes √((1−0.64)² + (2·0.05·0.8)²) = √(0.1296 + 0.0064) ≈ 0.369, so the magnification falls to ≈ 2.7. || A 20% move off the natural frequency cut the response nearly fourfold — which is why staying off resonance is one of the first rules you learn for any structure, and why adding damping is often cheaper than retuning it.",
    ideas: [
      {
        heading: "Resonance occurs near the natural frequency",
        body: "The response peaks where the drive's rhythm matches the system's own: r* = √(1−2ζ²), which is essentially 1 for light damping. Below it the system follows the push; above it the system's inertia wins and the response collapses. The curve's shape is universal — bridges, RLC circuits, and atoms absorbing light all trace the same peak.",
        formula: "X/(F₀/k) = 1/√((1−r²)² + (2ζr)²)",
      },
      {
        heading: "Damping reduces the resonance peak",
        body: "At the peak the response is Q = 1/(2ζ) times the static deflection. Halve the damping and you double the worst case — which is why a lightly damped structure is a liability and why tuned mass dampers hang inside skyscrapers. When you cannot move the frequencies apart, add damping: it is the only term in the denominator that helps exactly where it hurts.",
        formula: "Q = 1/(2ζ)",
      },
      {
        heading: "Wave speed links frequency and wavelength",
        body: "A wave moves a disturbance through a medium while the medium itself only oscillates in place — the rope goes up and down, the pulse travels along. Speed, frequency, and wavelength are locked by v = fλ: raise the frequency at fixed speed and the wavelength must shrink. Pin a string at both ends and only the standing waves fit: f_n = n·v/(2L), the physics of every stringed instrument.",
        formula: "v = fλ,  f_n = n·v/(2L)",
      },
    ],
    bench: "resonancesweep",
    prompt:
      "Sweep the drive ratio r through 1 and record where the amplitude peaks and how high it gets. || Compare the peak's location to r* = √(1−2ζ²) and its height to Q = 1/(2ζ). || Then double the damping and sweep again: the investigation is the record of what the peak did.",
    note: "The curve is the exact steady-state response, not a simulation with noise — the peak you find is the peak the formula predicts. The two checked entries are the evidence for the resonance investigation.",
    checks: [
      {
        prompt: "ζ = 0.05, driven at r = 1. The magnification is about…",
        options: ["10", "20", "5", "1"],
        answer: 0,
        why: "At resonance the magnification is Q = 1/(2ζ) = 1/0.10 = 10. The static deflection gets multiplied tenfold — damping, not stiffness, decides the worst case.",
      },
      {
        prompt: "A 440 Hz tone travels at 343 m/s in air. Its wavelength is about…",
        options: ["0.78 m", "1.28 m", "343 m", "0.44 m"],
        answer: 0,
        why: "λ = v/f = 343/440 ≈ 0.78 m. A concert-A wave is roughly three-quarters of a meter long — the reason low notes need long organ pipes.",
      },
      {
        prompt: "A 0.65 m string carries waves at 260 m/s. Its fundamental frequency is…",
        options: ["200 Hz", "400 Hz", "130 Hz", "169 Hz"],
        answer: 0,
        why: "f₁ = v/(2L) = 260/1.30 = 200 Hz. The string fits exactly half a wavelength — node at each end, antinode in the middle.",
      },
      {
        prompt: "A structure resonates under a drive you cannot move. The most reliable fix is…",
        options: [
          "Push harder to overpower it",
          "Add damping, or move ω_n away from the drive",
          "Add static load to the structure",
          "Run the drive intermittently",
        ],
        answer: 1,
        why: "The response is set by the ratio r and the damping ζ — only those two levers exist. More force scales the disaster up. Dead load adds mass and does shift ω_n, but by an amount you have not designed — retune deliberately or add damping.",
      },
    ],
  },
  {
    id: "thermal",
    track: "physics",
    index: 27,
    title: "Thermal expansion and heat transfer",
    minutes: 35,
    lede: "Size the expansion a temperature swing demands, compute the stress when something refuses to expand, and name the three ways heat moves before you calculate any of them.",
    start:
      "Temperature changes make materials expand or contract. If a part is free to move, the result is a change in length. If the movement is restrained, the result can be a large thermal stress. || Free expansion is ΔL = αL₀ΔT. For a fully restrained bar in one dimension, the corresponding stress magnitude is σ = EαΔT. || Heat can also move by conduction, convection, or radiation. Identify the dominant mode before choosing an equation.",
    use: "Whenever temperature changes on a structure or a part — rails, piping runs, engine components, electronics packaging. || Compute the free expansion ΔL = αL₀ΔT and ask where it goes: joints, bends, bellows. If it has nowhere to go, compute σ = EαΔT and compare against yield — heating a constrained bar puts it in compression, cooling in tension. For heat flow, name the dominant mode first (conduction, convection, radiation), then calculate. || Stop when you can state the gap the joint needs and the stress if the gap were missing — and check the sign: constrained heating compresses, constrained cooling stretches.",
    example:
      "A 10 m steel rail sees a 40 °C summer swing: α = 12×10⁻⁶/°C, E = 200 GPa. || Free, it would grow ΔL = 12×10⁻⁶ × 10 × 40 = 4.8 mm — small enough to ignore on a drawing, large enough to buckle a track that has nowhere to put it. Welded continuously (constrained), the stress is σ = 200×10⁹ × 12×10⁻⁶ × 40 = 96 MPa, compressive. || Against a 250 MPa yield, the weather just consumed 38% of the margin before any train arrived. That is the calculation behind every expansion joint you have ever stepped over.",
    ideas: [
      {
        heading: "Thermal expansion can become significant over long lengths",
        body: "Thermal expansion is millimeters per meter per tens of degrees — easy to dismiss, impossible to ignore at structural scale. α is a material constant (12×10⁻⁶/°C for steel, 23×10⁻⁶ for aluminum), and the expansion is strictly proportional to length and temperature change. Bigger structure, bigger swing, bigger movement: always compute it before deciding it is negligible.",
        formula: "ΔL = αL₀ΔT",
      },
      {
        heading: "Restraining thermal expansion creates stress",
        body: "Prevent the expansion along a bar's axis and the strain αΔT still exists — as stress, σ = EαΔT. That is the one-axis (bar) case; a plate held in both directions sees more, EαΔT/(1−ν). Note what is missing from the formula: length. A 10 cm bolt and a 10 m rail feel the same stress for the same temperature change; only the free movement scales with size. Heating compresses a constrained part, cooling stretches it, and both directions can fail you.",
        formula: "σ = EαΔT (bar, one axis; heating → compression)",
      },
      {
        heading: "Heat transfers by conduction, convection, and radiation",
        body: "Conduction carries heat through material down a temperature gradient — Fourier's law, the reason a metal spoon handle gets hot. Convection carries it with moving fluid — the reason a fan cools you. Radiation needs no medium at all and grows as T⁴ — the reason the sun warms you through vacuum. Name the dominant mode before you reach for an equation; misidentifying the mode is the usual failure, not the arithmetic.",
        formula: "conduction: q = −k∇T; radiation: q = εσT⁴",
      },
    ],
    bench: "thermalstress",
    prompt:
      "Pick a material and a temperature swing, then decide: free or constrained? || Read the free expansion and size the joint gap; switch to constrained and read the stress as a fraction of yield. || Then complete the three-question stress set — the set is the evidence, and every answer is checked against the formulas above.",
    note: "Yield strengths are representative classroom values, not datasheet guarantees — the point is the comparison, not the catalogue. Compression is negative by the tensile-positive convention; the bench reports the magnitude with the direction named.",
    checks: [
      {
        prompt: "A 10 m steel rail (α = 12×10⁻⁶/°C) warms 40 °C. Free expansion is about…",
        options: ["4.8 mm", "48 mm", "0.48 mm", "4.8 cm"],
        answer: 0,
        why: "ΔL = 12×10⁻⁶ × 10 × 40 = 4.8×10⁻³ m = 4.8 mm. Millimeters per meter per tens of degrees — the scale to memorize.",
      },
      {
        prompt: "The same rail welded continuously (E = 200 GPa) sees…",
        options: [
          "96 MPa compression",
          "96 MPa tension",
          "4.8 MPa compression",
          "No stress — welding prevents strain",
        ],
        answer: 0,
        why: "σ = EαΔT = 200×10⁹ × 12×10⁻⁶ × 40 = 96 MPa, and constrained heating compresses. The strain the weld prevents becomes stress instead.",
      },
      {
        prompt: "The thermal stress σ = EαΔT in a constrained bar is independent of…",
        options: [
          "The bar's length",
          "The temperature change",
          "The material's stiffness",
          "The expansion coefficient",
        ],
        answer: 0,
        why: "Length cancels out of the stress — only the free movement ΔL scales with L₀. A bolt and a bridge feel the same stress for the same ΔT.",
      },
      {
        prompt: "A vacuum thermos keeps coffee hot mainly by defeating…",
        options: [
          "Conduction and convection — the vacuum gap removes the medium",
          "Radiation — the only mode that matters",
          "Conduction through the steel walls",
          "Convection inside the coffee",
        ],
        answer: 0,
        why: "No medium, no conduction or convection across the gap — the two modes that need matter. The reflective coating handles the radiation that remains. Name the mode first, then calculate.",
      },
    ],
  },
];
