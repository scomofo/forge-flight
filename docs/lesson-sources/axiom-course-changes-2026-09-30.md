# Axiom — course content changes discussed (2026-09-30)

Working notes from a full read-through of the Axiom course (localhost:8092) as a learner. Covers Math (triangles & vectors), Physics, Materials 101, Engineering 101, the shelf job, Manufacturing 101–401, and the first two stages of the Forge & Flight glider lab.

How this file is organized:

1. **Copy edits** — replacement text, ready to paste.
2. **Issues to fix** — inconsistencies and gaps found in the existing content.
3. **Clarity additions** — places the learner got stuck, with the explanation that worked.
4. **Lesson-by-lesson enrichment** — for each lesson, the plain-language additions and a practice problem (with answer) written during the session. Use as a source pool for "Try" sections or expandable "Explain more" panels.

Numbers in section 4 were checked against the page values. Practice problems marked *(assumed values)* use inputs not on the page.

---

## 1. Copy edits (ready to paste)

### 1.1 Degrees and radians — "when to use" (`/learn/math/triangles-vectors`, Second idea)

Current paragraph felt unclear to the learner. Replacement:

> **Use degrees** for drawings, tool settings, and plain triangle trig. **Use radians** whenever a formula multiplies the angle by something, like arc length (s = rθ) or rotation speed. Convert with rad = deg × π/180. Before any trig on a calculator, check its mode: sin 35 in RAD mode is a different angle entirely.

Optional one-line rule to add underneath:

> Quick test: if the angle only goes *into* sin, cos or tan, degrees are fine. If the angle gets *multiplied* by a length or time, convert to radians first.

### 1.2 "This model leaves out" line (bench caveat)

Current: *"The bench triangle is exact geometry. Real cable angles are measured, not set — the bench teaches the decomposition, not the measurement."* — reads as AI-written ("X, not Y" pattern plus em dash).

Options (recommended: **3**):

1. **This model leaves out:** measurement error. The bench triangle uses exact angles. On a real rig, you'd measure the cable angle, and that reading will be off by a degree or two.
2. **This model leaves out:** the fact that real angles aren't exact. The bench sets the angle for you so you can practise splitting a force into parts. In the field, you'd have to measure it, and your answer is only as good as that measurement.
3. **This model leaves out:** messy measurements. Here the angle is given. On a real cable, you'd measure it yourself, and a small error in the angle carries through to the force.

Possible follow-up explanation (the learner asked for it): for a 1,000 lb cable, 30° gives a 500 lb vertical part and 32° gives 530 lb, so a 2° reading error moves the answer about 30 lb.

---

## 2. Issues to fix

### 2.1 Glider lab — static margin copy is backwards / inconsistent (`/mission/glider`, Design tab)

- Current text: *"This shop calls 5% to 25% stable. Ahead of that, the nose wants to keep pitching. Behind it, the glider is sluggish."* "Ahead/behind" is ambiguous, and either reading conflicts with Physics lesson 24, which says below 0.05 is twitchy, negative is unflyable, and far above 0.25 is nose-heavy and mushy.
- At SM = 0.51 (CG too far forward, over-stable) the page shows **"The nose hunts."** "Hunting" suggests oscillation/instability, which is the opposite regime.
- Suggested replacement: *"Below 5%, the glider is twitchy; below zero, it diverges. Above 25%, it is nose-heavy and sluggish."* and for SM > 0.25: *"The nose is heavy. The CG sits too far ahead of the neutral point."*
- Worked numbers for the default design: SM 0.51 × 90 mm chord ⇒ NP ≈ 166 mm from nose. The 0.05–0.25 band is CG ≈ 144–161 mm; a good target is ~152 mm (SM ≈ 0.15).

### 2.2 Opening situations set up but never resolved

These lessons open with a scenario that the page never finishes. Either solve it on the page or supply the missing number.

| Lesson | Gap | Suggested resolution |
|---|---|---|
| Physics · Vectors by components | Survey crew (40 m E, 30 m N; then 25 m W, 10 m N) never solved | Totals (15, 40) m → **42.7 m at ~69° N of E**; walked ~77 m |
| Physics · Work and the work-energy theorem | Tow truck drags 40 m at 20°, but no cable force given | Add a force, e.g. 2,000 N → W = 2000 × 40 × cos20° ≈ **75 kJ** |
| Physics · Static equilibrium | Scaffold painter has no numbers | e.g. 4 m plank, 800 N painter 1 m from left → **600 N / 200 N** |

### 2.3 Shelf job (`/learn/job`) — confirm intended behaviour

Only wood can pass all three screens (26–40 mm; lightest pass 26 mm ≈ 4.8 kg, sag ≈ 4.5 mm, SF ≈ 8). Aluminium, steel and acrylic can never pass (sag needs more thickness than the mass cap allows). This is a good lesson, but consider saying so after a few failed attempts, e.g. *"If no thickness works for a material, the screens have eliminated it."*

### 2.4 Section endings

Manufacturing 101, 201, 301, 401 and the shelf job end with only "Back to the course." Consider a "Next section →" link so learners don't stall at section boundaries.

---

## 3. Clarity additions (where the learner got stuck)

### 3.1 SOH-CAH-TOA (`/learn/math/triangles-vectors`, First idea)

Add the selection rule explicitly: *label opposite/adjacent/hypotenuse relative to θ, then pick the ratio that uses the two sides you have and want.* Worked example that landed: brace at 30°, 24 in run → height = 24 × tan30° ≈ 13.9 in; brace length = 24 ÷ cos30° ≈ 27.7 in.

### 3.2 Degrees and radians (same page)

What helped: "Two units for the same turn, like inches and centimetres"; π rad = 180° as the one fact to remember; definition of a radian (radius laid along the rim ≈ 57°); arc-length example (10 in wheel, 1.57 rad → 15.7 in; using 90 would give 900 in); calculator DEG/RAD warning with sin 35 = 0.574 vs −0.428.

### 3.3 Vector-addition feedback ("Not quite …" for 500 N + 300 N at 60°)

The feedback text was too dense. Suggested expanded version:

| Force | x | y |
|---|---|---|
| 500 N at 0° | 500 | 0 |
| 300 N at 60° | 150 | 260 |
| Total | 650 | 260 |

R = √(650² + 260²) ≈ 700 N, θ = atan2(260, 650) ≈ 21.8°. Distractors: **800 N at 30°** added magnitudes and averaged angles; **583 N** assumed the forces were at 90°; **774 N at 11.2°** swapped sin and cos on the 300 N force. Add one sentence explaining atan2 (tan⁻¹ that handles all quadrants).

### 3.4 Pendulum dimensional-analysis animation (`/learn/physics/measure`)

Add a caption or legend: *[l] = L means "l is a length"; [g] = LT⁻² means metres per second squared; 2π has no units.* Step labels could say what's checked: √(l/g) → s ✔; √(g/l) → 1/s ✘; l/g → s² ✘. Tie the takeaway back to the Mars Climate Orbiter paragraph above it.

---

## 4. Lesson-by-lesson enrichment

Format: **Add** = plain-language explanation that helped; **Practice** = problem → answer.

### Physics

**Orders of magnitude and Fermi estimation**
- Add: log-ruler reading of the animation (each step is one defensible guess); why errors partly cancel; second example: air in a 30×20×6 m shop ≈ 4,000 m³ × 1.2 kg/m³ ≈ 5 tonnes.
- Practice: litres of fuel burned by a city's cars per day (cars × km/day × L/km).

**Vectors by components**
- Add: sign convention; ramp-tilted axes (100 N crate on 30°: 50 N along, 87 N into); dot product as "how much points that way" (200 N rope at 30°, 10 m → 1,730 J).
- Practice: boat 4 m/s N in a 3 m/s E current → **5 m/s at ~37° E of N**.

**Reading motion graphs**
- Add: ladder table (slope goes down x→v→a, area goes up); central difference explained; signed area out-and-back example (displacement 0, distance 100 m); curvature reading.
- Practice: forklift v–t flat at 2 m/s for 4 s, then ramps to 0 over 2 s → **10 m, −1 m/s²**.

**Constant acceleration and projectiles**
- Add: equation-picker table (which variable you don't need); braking example (25 m/s at 5 m/s² → 62.5 m); symmetry; 30°/60° same range; when 45° fails.
- Practice: bolt rolls off a 1.2 m bench at 2 m/s → lands **≈1.0 m** away.

**Newton's laws**
- Add: choose-the-body habit; trailer hitch example (2,000 kg at 1.5 m/s², 300 N rolling resistance → 3,300 N); why third-law pairs don't cancel; frames.
- Practice: hoist with 500 kg engine: steady lift **4,905 N**; accelerating 1 m/s² up **5,405 N**.

**Contact forces**
- Add: normal force ≠ mg table (ramp, pushing down, pulling up); static friction "matches you up to a limit" table; 20° check (16.8 N pull < 18.4 N limit → holds).
- Practice: 20 kg box, μs 0.5, μk 0.3: 80 N push → **doesn't move, friction 80 N**; 120 N → **slides, a ≈ 3.1 m/s²**.

**Free-body diagrams**
- Add: force checklist table; "who's pushing?" test with common invented forces; full example (40 kg crate, 200 N rope at 30°, μk 0.3 → N = 292 N, a ≈ 2.1 m/s²).
- Practice: 10 kg box on smooth 30° ramp held by rope → **T ≈ 49 N, N ≈ 85 N**.

**Work and the work-energy theorem**
- Add: cos θ table; zero-work cases; braking distance ∝ v² (1,500 kg car, 7,500 N: 20 m/s → 40 m, 40 m/s → 160 m); work vs Newton chooser.
- Practice: 2 kg toolbox at 3 m/s, 4 N friction → slides **2.25 m**.

**Potential energy and conservation**
- Add: datum choice; mass cancels; conservative vs non-conservative; coaster with 20 kJ friction loss → 17.7 m/s; spring launcher (k 800 N/m, 0.1 m, 50 g → 8.2 m).
- Practice: pendulum at 2 m/s at the bottom rises **≈0.20 m**.

**Power, efficiency, and energy budgets**
- Add: units table (kW, hp, kWh); P = Fv tractor example (20 kN at 2 m/s = 40 kW ≈ 54 hp); chained efficiencies (0.85 × 0.90 × 0.95 = 73%); motor sizing (same lift in 6 s → ~1,600 W input).
- Practice: conveyor lifting 50 kg bags 2 m, 10/min, motor 250 W → **≈164 W useful, ≈65%**.

**Impulse and momentum**
- Add: safety-gear examples (airbags, knees, shock-absorbing lanyards); hammer as the reverse (0.5 kg at 10 m/s stopped in 1 ms → 5,000 N); rebound doubles Δp; peak ≈ 2× average.
- Practice: 80 kg jumper landing at 4 m/s: stiff legs 0.02 s → **16,000 N**; bent knees 0.2 s → **1,600 N** (body weight excluded).

**Conservation and center of mass**
- Add: boundary table (internal vs external); CM example (70 kg at 0, 50 kg at 3 m → 1.25 m); recoil (4 kg rifle, 10 g at 800 m/s → 2 m/s); "conserved over which interval" with car-crash example.
- Practice: 80 kg worker steps off a 40 kg boat at 2 m/s → boat **4 m/s backward**.

**Collisions: elastic and inelastic**
- Add: e = 0.5 worked case (0.4 and 2.4 m/s, 8.8 J kept); bounce test e = √(h/H); patterns (equal masses swap velocities).
- Practice: 1,000 kg loader at 2 m/s couples with a 3,000 kg trailer → **0.5 m/s, 1,500 J lost (75%)**.

**Torque**
- Add: wrench length needed (110 ÷ 400 = 0.275 m); ft·lb conversion; seesaw balance; torque ≠ energy; P = τω (300 N·m at 3,000 rpm ≈ 94 kW).
- Practice: seized bolt needs 300 N·m, push 500 N → bar **≥0.6 m**.

**Rotation: kinematics and inertia**
- Add: linear↔angular translation table; tractor-tire rim speed; flywheel mass at the rim; parallel-axis example (disk on 0.2 m offset axle → 9× I).
- Practice: grinder wheel 1 kg, r 0.1 m, 0.5 N·m → **I = 0.005, α = 100 rad/s², 3 s to 300 rad/s, rim 30 m/s**.

**Static equilibrium and beam reactions**
- Add: support-type table; negative reaction meaning (trailer tongue weight with load behind the axle); statically indeterminate note.
- Practice: 3 m shelf, 150 N plank weight + 300 N box 1 m from left → **275 N left, 175 N right**.

**Stress and strain**
- Add: MPa = N/mm² shortcut; stiffness vs strength table (high-strength steel has the same E); aluminium version of the rod (5.5 mm stretch).
- Practice: 12 mm steel rod, 3 m, 20 kN → **≈177 MPa, 2.65 mm**.

**Bending**
- Add: joists on edge (~38× stiffer than flat); ruler on edge ~156× stiffer; scaling table; don't drill at the root's outer face.
- Practice: cantilever droops 4 mm → 1.5× longer **13.5 mm**; 2× deeper **0.5 mm**; aluminium **≈11.6 mm**.

**Factor of safety**
- Add: what FoS doesn't cover (buckling, fatigue, corrosion); typical-n table including rigging; use rated working-load limits; predict-then-measure error %.
- Practice: chain breaks at 60 kN, n = 4 → **15 kN WLL**, lifts an 11.8 kN engine; 10 mm rod at n = 3 → **≈6.5 kN**.

**Pressure and buoyancy**
- Add: units table (psi, bar, atm); 10 m ≈ 1 atm; gauge vs absolute with tire example; tank-bottom force.
- Practice: 200 L sealed drum (20 kg) → **≈1,960 N buoyancy, 180 kg payload**.

**Moving fluids: continuity and Bernoulli**
- Add: Bernoulli as an energy budget table; Venturi uses (carburetor, sprayer eductor); tank drain v = √(2gh); four assumptions with real failure examples; lift myth.
- Practice: 20 mm hose at 2 m/s into a 5 mm nozzle → **32 m/s, ~38 L/min, ~510 kPa**.

**Lift, drag, stall, static margin**
- Add: q table; stall as angle not engine; cruise check (needs ~10.5 m/s or C_L ≈ 0.82); AR and induced drag; static-margin behaviour table.
- Practice: mass ×2 → stall **≈11.0 m/s**; CG 0.29 → **SM 0.08**; CG 0.31 → **SM −0.08 (unstable)**.

**Oscillations and natural frequency**
- Add: amplitude doesn't change frequency (tuning fork); energy sloshing table; suspension and machine-mount examples.
- Practice: 80 N/m spring with 0.5 kg → **≈2.0 Hz**; 100 kg seat at 1 Hz → **k ≈ 3,950 N/m**.

**Resonance and waves**
- Add: swing analogy; Q table (1%, 2.5%, 5% damping); washing machine passing through resonance; isolation above r ≈ 1.4; v = fλ with a 440 Hz example.
- Practice: compressor mounts 10 Hz, ζ 0.05: 1,800 rpm → **r = 3, ≈0.13×**; 600 rpm → **r = 1, 10×**.

**Thermal expansion and heat transfer**
- Add: rule of thumb (1.2 mm per 10 m per 10 °C for steel); prairie −40 to +35 °C swing; shrink fits, welding distortion, mixed-metal bolting; symbol-reuse warning (σ, ε).
- Practice: 20 m steel pipe, −30 → +30 °C → **14.4 mm free / 144 MPa locked**; shrink-fit bearing 50 mm bore +0.05 mm → **≈83 °C rise**.

**The synthesis method**
- Add: example ledger table for the 20 m drop; ramp limit check (θ = 0 and 90°); wrench-drop chain (energy → momentum → force ≈ 2,000 N).
- Practice: limit-check R = v² cos(2θ)/g at θ = 0 → gives v²/g instead of 0, so it's wrong (should be sin).

**Tow launch, worked end to end**
- Add: five-link chain table with handoff sentences; "why range = height × L/D" (glide-ramp picture); range band from cd0 ±30% (210–345 m).
- Practice: release from 40 m → **≈42.4 J, ≈348 m best guess, ~280–460 m band**.

**The mastery check**
- Add: "derive, don't recall" table; limit check that catches g·cos30°; three-part correction template; self-review list.

### Materials 101

**The four bonds** — Add: "what is free to move?" framing; shop examples (steel bends, inserts chip, plastic sags). Practice: aluminium / SiC / candle wax → metallic / covalent network / secondary.

**Why properties travel together** — Add: marble-in-a-valley analogy (depth → melting, steepness → E); tungsten trade-off (filaments, TIG electrodes); graphite directional table. Practice: graphite vs diamond; sagging dashboard part → secondary bonds between chains.

**Reading a material from its bonding** — Add: mistake-cause table; processing preview (bend a wire, quench, stretch a bag strip). Practice: three mystery descriptions → metallic / polymer / covalent molecular (sulfur).

**Crystal structures** — Add: sharing-rule table; BCC steel brittle in prairie cold (hitch pins, Titanic); heat-treat summary. Practice: BCC iron, r = 124 pm → **a ≈ 286 pm, 2 atoms, ρ ≈ 7.9 g/cm³**.

**Grains, texture, and anisotropy** — Add: rug-wrinkle analogy for dislocations; bend sheet across the rolling direction; forged wrenches follow grain flow. Practice: Hall–Petch at 50 μm → **≈171 MPa**; 10 μm → **≈258 MPa**.

**Amorphous solids and microscopes** — Add: marbles vs crate analogy; window-glass myth; fracture-reading table including beach marks. Practice: −35 °C sparkly pin break / fibrous cup-and-cone / beach marks → brittle / ductile / fatigue.

**Defects are the material** — Add: step-by-step exp(−Q/kT); processing → defect table; annealing copper tubing. Practice: copper at 600 K → **≈2.7×10⁻⁸**; work-hardened wire → anneal.

**Atoms move downhill** — Add: food-colouring analogy; why carburize; inverse-erf as a lookup; unit check. Practice: 1.0 mm case at 950 °C → **≈8.4 h**; 0.69 mm at 1,000 °C → **≈2.3 h**.

**Processing is defect engineering** — Add: HB/HRC context; quench-severity table; temper colours. Practice: chipping chisel → temper; machining hard part → anneal, re-harden; wearing gear → case harden; welded frame → stress relieve.

**Reading a stress-strain curve** — Add: why the curve falls after necking; stiffness/strength/hardness table; axis-scale table. Practice: 10 mm Al bar, 21.2 / 24.4 kN → **270 / 311 MPa, ε_y ≈ 0.004**.

**Ductility and toughness** — Add: area ≈ average stress × fracture strain; ROPS and tow straps; why strengthening costs ductility. Practice: Al 270/310 MPa at 12% → **≈35 MJ/m³**; %EL 12%; %RA ≈ 44%.

**From curve to design allowable** — Add: step-by-step standard deviation; true vs engineering stress. Practice: 342/358/349 MPa → **mean ≈350, s ≈8.0, char ≈334, allowable ≈167 MPa (FoS 2)**; true stress at 420 MPa, 0.25 → **525 MPa, 0.22**.

**The four ways to make a metal strong** — Add: mechanism table with real examples; welding 6061-T6 overages the HAZ. Practice: 1045 at 10 μm → **≈316 MPa**; 1 → 4% solute → **2× gain**; T6 bracket / cold-drawn rod / brass → precipitation / work hardening / solid solution.

**Heat treatment is processing, not chemistry** — Add: TTT race table (pearlite, bainite, martensite); T4 vs T6; icebox rivets. Practice: soft after quench → too slow; over-aged → weak; over-annealed → past recovery.

**Choosing the process** — Add: why pay for 4140's margin and hardenability; memo template. Practice: bracket ≥300 MPa, ≥15%, ≤1.5× → **annealed 1020 only, margin ≈1.17**.

**Fracture: why cracks run** — Add: round corners; drill stop holes; glass scoring; Schenectady; detection limit. Practice: hole at 100 MPa → **~300 MPa**; 5 mm crack at 300 MPa → **K ≈ 37.6, a_c ≈ 8.8 mm**.

**Fatigue** — Add: paperclip; Comet windows; Paris "slow then sprint"; design takeaways. Practice: 250 MPa → **≈183,000 cycles**; Miner sum **≈0.61**.

**Creep** — Add: 0.4 Tm rule with lead pipes and plastic shelves; single-crystal blades. Practice: 750 °C → **≈13,000 h (≈ one decade)**; +10% stress (n = 5) → **≈1.6×**.

**Reading a phase diagram** — Add: overall vs phase composition as the classic mistake; 60/40 vs 63/37 solder. Practice: Cu–40Ni → **1,233 / 1,213 °C; at 1,220 °C L ≈36.5%, α ≈42.2%**.

**The lever rule** — Add: grain-moisture blending analogy; seesaw tie-in. Practice: Cu–30Ni at 1,190 °C → **≈64% liquid, 36% solid**.

**Transformations** — Add: eutectic meaning; microconstituent vs phase; coring and homogenizing; iron–carbon summary. Practice: Pb–50Sn → **28% primary α**; Pb–61.9Sn → **100% eutectic**; Pb–70Sn → **23% primary β**.

**Four families, four property packs** — Add: beam index √E/ρ (Al beats steel ~1.7× for beams). Practice: furnace lining / bus bar / chemical tank / bike tube → ceramic / metal / polymer / composite.

**Direction and temperature** — Add: springs in parallel vs series; borosilicate vs soda-lime glass. Practice: 50% glass/epoxy → **37.5 / 5.8 GPa (~6.5:1)**; 100 K shock → **~63 vs ~21 MPa**.

**Choosing under constraints** — Add: price-of-each-family table; thermal mismatch on the 900 °C bracket; Challenger O-ring. Practice: outdoor hopper liner → **UV-stabilized PE**, price: low stiffness and creep.

**Screen, then rank** — Add: three-line index derivation; wood beats aluminium as a beam and everything as a panel. Practice: indoor trailer floor panel → **wood (E^⅓/ρ ≈ 3.6)**.

**Corrosion is a design load** — Add: galvanizing as a sacrificial anode; protection table (break the cell). Practice: copper to galvanized pipe → dielectric union; scratched fence post; Al rivets in steel → bad idea.

**Embodied impacts and repair** — Add: bolt-on wear parts. Practice: 50,000 km → **steel 165 MJ vs Al 400 MJ**; break-even **≈207,000 km**; recycled Al wins everywhere.

**The synthesis method for materials** — Add: thermocouple check (890 °C → 0.55 mm matches). Practice: 4140 measured 50 HRC instead of 42 → ledger lines for temper temperature and time.

**The spar, end to end** — Add: link-by-link chain. Practice: 4 × 8 mm balsa → **δ ≈ 4.7 mm, ≈1.3 g, beats carbon**; 0.3 mm limit → only carbon.

**The closed-book mastery check** — Add: failure-diagnosis cheat sheet; chain-crossing checklist.

### Engineering 101

**Requirements** — Practice: rewrite "tough enough for farm use," "easy to remove pin," "quiet compressor" as shall-statements.
**Verification vs validation** — Add: TIDA table. Practice: verification matrix for those three plus a field-trial validation row.
**The assumption ledger** — Practice: trailer ledger (payload / steel yield / −40 °C).
**Models are tools** — Add: model-territory table from earlier lessons; FEA still needs a test. Practice: tongue-weight spreadsheet model card; not valid for pothole braking.
**Uncertainty** — Add: vector analogy for RSS. Practice: σ = F/A with 2% + 2×1% → **RSS 2.8% (±5.4 MPa), worst 4%**.
**Sensitivity** — Practice: beam-droop budget → **E and h each 37%, RSS ≈4.9%**.
**Follow the load** — Add: Hyatt Regency walkway. Practice: trailer cargo load path to ground.
**Margins** — Practice: 80 mm² lug → **MS 0.84 / 0.38**; minimum area **58 mm²**; welded 6061 lowers both allowables.
**FMEA** — Add: don't let RPN hide severity. Practice: coupler latch **180 → 30**; tire **120 → 60**.
**Bending My/I** — Add: stiffness check (40×40×3 Al tube sags ~41 mm). Practice: 50×50×3 → **≈72 MPa, ≈20 mm, 1.52 kg/m**.
**Buckling and torsion** — Add: K table; shaft example (25 mm, 200 N·m → 65 MPa, 3.7°/m). Practice: braced pole **≈11.6 kN**; 2 m pole **≈1.64 kN**.
**Combined loading** — Practice: 25 mm shaft → **σ_vm ≈214 MPa, fails**.
**Index vs joint** — Practice: joint-efficiency merits (CFRP 206, Al 71, steel 47); epoxy overlap for 30 kN on 40 mm → **50 mm**.
**Interfaces** — Add: joint-family comparison table. Practice: 10 mm bolt, 6 mm plate, 5 kN → **83 MPa bearing, 64 MPa shear**; AL/CU wiring connectors.
**System decision** — Practice: workbench edge → **40×40×3 steel (≈14 mm sag)**.
**How things get made** — Practice: die cast + secondary op vs CNC → **crossover ≈460 parts** *(assumed values)*.
**Tolerances and stacks** — Practice: ±0.05 parts → **100.15 passes**; clearance fit; bearing press fit.
**Design for making** — Practice: hitch-bracket tolerance review.
**Design the experiment** — Practice: paint-adhesion 2² → **interaction +1.0**; block by painter.
**Five readings** — Practice: clamp forces → **12.4 ± 0.8 kN**, Grubbs 1.69 (keep).
**Graphs that don't lie** — Practice: ruler δ vs F slope → **E ≈200 GPa**.
**Trade studies** — Practice: stiffness weight 0.5 → **Al 0.707 vs CFRP 0.688 (not robust)**.
**Parametric sweeps** — Practice: widen instead of deepen → **~90 mm, ≈9.7 kg vs 5.7 kg**.
**Convergence** — Practice: mesh 180/205/214/217/218 → **converged at 218 MPa**.
**Safety factors are ethics** — Practice: shelf / hoist hook / walkway sign class and FoS; hook area **200 mm²**.
**Codes and standards** — Practice: coupler excerpt → two compliance rows (§5.1, §5.3).
**The review** — Practice: −0.05 MS frame rail → **critical → reject**.
**Full cycle** — Practice: half-load root-spring prediction **≈0.305 mm**.
**Glider end to end** — Add: lesson-number mapping for the W-week labels. Practice: review findings → **conditional approval**.
**Final gate** — Add: Engineering self-review list.

**Shelf job** — See §2.3. Answer: **wood, 26 mm**.

### Manufacturing 101

**The act** — Practice: cooling-channel shaft / 10k L-brackets / hitch receiver / one-off gear → add / deform / join / cut.
**The chip** — Add: power = u × removal rate (1.25 kW at 100 m/min). Practice: 6 mm width → **1,500 N**; 2 kW → **≈160 m/min**; Al u ≈ 700 *(assumed)* → **210 N**.
**Springback** — Add: σy/E table including mild steel; springs-flat limit (~130 mm radius for 1 mm Al). Practice: 1 mm mild steel → **≈5°**; 2 mm Al → **≈8°**.
**Freeze last** — Add: hot spots; thin sections give fine grains. Practice: 200×100×30 plate → **V/A ≈10.3, D > 62 mm, 80 mm riser ≈1.7× later**.
**Beside the weld** — Add: HAZ-by-material table; heat-input formula. Practice: 24 V, 200 A, 300 mm/min, η 0.8 → **≈0.77 kJ/mm**.
**The spread** — Add: Cpk → scrap table; re-centre vs reduce spread. Practice: 25.00 ± 0.08, mean 25.03, σ 0.02 → **Cp 1.33, Cpk 0.83**.
**The stack** — Add: RSS needs centred processes (shared drift adds linearly). Practice: 4 × ±0.15 into ±0.40 with 0.04 drift each → **≈0.46, fails**.

### Manufacturing 201

**Roll gap force** — Add: small work rolls with backup rolls. Practice: R 200, w 300, Y 150 MPa, Δh 3 → **≈1.1 MN** *(assumed values)*.
**Taylor tool life** — Add: parts-per-edge table. Practice: 120 m/min → **≈12.9 min**; 60 min life → **≈88 m/min**.
**Pattern shrinkage** — Add: machining stock before the shrink scale. Practice: 150 mm iron (1%) → **151.5 mm**; 300 + 3 mm steel (2%) → **≈309.1 mm** *(typical shrink values)*.
**Weld bow** — Add: distortion-control practices. Practice: **4.5 mm / 1.1 mm / 8.5 mm**.
**3-2-1 locating** — Add: locators vs clamps; three-legged stool. Practice: 3-1-1 → 1 left; 4-2-1 → 0 with one wasted; 3-2-0 → 1 left.

### Manufacturing 301

**Bonus tolerance** — Add: position ⌀ = 2√(Δx² + Δy²); RFS default. Practice: 8.15 mm hole, Δ(0.06, 0.07) → **⌀0.18 passes ⌀0.25 at MMC, fails RFS**.
**Surface factor** — Add: shot peening, Marin factors. Practice: 220 MPa axle → **machined MS 0.09; forged −0.32**.
**Heat input** — Practice: 22 V, 180 A, 250 mm/min, η 0.8 → **≈0.76 kJ/mm**; 0.5 kJ/mm → **360 mm/min**.
**First-pass yield** — Practice: 20 × 98% → **67%**; remove 5 steps or improve all to 98.5% → **both ≈74%**.
**Printed layers** — Practice: 15 MPa L-bracket → **upright FoS 1.33 fails; flat 2.67 passes**.

### Manufacturing 401

**Bottleneck** — Add: relief options (parallel machine, move work, buffer). Practice: 35/50/40/25 s → **72/h; parallel at 50 s → 90/h**.
**Tooling ÷ count** — Practice: vs CNC $25 → **crossover ≈430**; per good part at 82% → **≈8.78**.
**DFA** — Add: DFA separate-part criteria. Practice: 9 → 5 parts → **84 → 52 s, ≈89 h/yr at 10k**.
**Scrap** — Practice: 15 at 90% → **16.67**; with rework → **≈15.75**.
**Takt** — Add: tie bottleneck ≤ takt and yield together. Practice: 450 min, 90 parts → **5 min takt; 6 min station 15 short**.

### Forge & Flight glider lab (Brief + Design)

- Add: constraints-vs-current table; hand mass check (28.8 + 9.7 + 3.8 = 42.3 g at 160 kg/m³).
- Fix: static-margin copy (§2.1).
- Suggested learner moves once SM passes: wing 4 → 3 mm (~7 g lighter, sag ×2.4 ≈ 4 mm); tail/fuselage changes move NP; predict before dragging.
- Remaining tabs (Materials, Simulate, Make, Test, Review) not yet reviewed (locked until the brief is accepted).
