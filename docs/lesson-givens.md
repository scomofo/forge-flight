# Give the learner the inputs

The Math Runway bracket example formerly introduced 2700 kg/m³ only when
multiplying volume by density. A student could reasonably think that this
number should have emerged from the preceding algebra.

## The repaired example

- **Given geometry:** a solid rectangular aluminum bracket, 80 × 50 × 6 mm.
- **Looked-up material property:** ρ(aluminum) ≈ 2700 kg/m³, a typical density.
- **Calculated volume:** 24,000 mm³ = 2.4 × 10⁻⁵ m³.
- **Calculated mass:** m = ρV = 0.0648 kg = 64.8 g ≈ 65 g.

The written case supplies density before using it. The animated figure now
has a separate **Density (given)** step before **Mass**, a persistent density
label in its final frame, and the same optional explainer as the worked case.
The help explains rho, kg/m³, unit cancellation, typical-versus-datasheet values,
and why the number is looked up rather than derived from dimensions.
No quiz answers, IDs, scores, or 4/4 Math Runway thresholds are changed.

## Authoring rule for later lessons

At a number's first use, say whether it is **given**, **calculated**, **measured**,
or **looked up**. Define a new symbol before expecting the learner to use it.
Supply necessary inputs in the main explanation; reserve popovers for optional
depth, not missing information required to understand the worked example.

Material properties such as density, modulus, yield strength and friction
coefficients are not universal conversion constants. State the material,
units and conditions, give the classroom approximation, and identify the
source to use when exact values matter.

## Property references

- [Royal Society of Chemistry: aluminum](https://periodic-table.rsc.org/element/13/aluminium)
  lists density as 2.70 g/cm³; conversion gives 2700 kg/m³.
- [Royal Society of Chemistry: titanium](https://periodic-table.rsc.org/element/22/titanium)
  supports the rounded comparison of about 4500 kg/m³.
- [USGS: water density](https://www.usgs.gov/water-science-school/science/water-density)
  explains both the approximately 1000 kg/m³ classroom value and its variation.

All comparison values in the help are approximate; they are not design
specifications for a particular alloy or fluid composition.


## Course-wide audit implementation (G01–G35, C01–C03)

This pass addresses the September 30 audit against
`4e6d6879db8293ed288fecf8bbfe57369a8db16b`.

### Visible input context

`src/course/example-context.ts` supplies context for **55 lessons**, including
related capstone lessons that share the same reference data. `ExampleInputs`
renders it before the worked example and, when present, before the independent
animated figure. Untouched lessons keep their existing layout. Tables scroll
inside their own keyboard-focusable region rather than widening the page.

The origin labels distinguish **Given**, **Reference**, **Assumed**,
**Calculated**, and **Measured example**. Hypothetical measurements are not
reported as experiments performed by the author. Essential values remain
visible; the optional help is additional explanation, not a missing input.

- G01–G04: local scaling-arrow definitions; mega versus scientific-notation
  normalization; why second moment of area has fourth-power units; supplied
  conversion factors. The existing density explanation is preserved.
- G05–G11: gravity and its half-factor, steel modulus/yield, air and water
  density, thermal coefficients, context-specific heat-flux symbols, and
  angular-frequency versus cycles-per-second conversions.
- G12–G19: molar mass/Avogadro number, Arrhenius inputs, crack geometry,
  Larson–Miller conventions, teaching phase boundaries, directional material
  tables, lifecycle assumptions, and shared spar inputs.
- G20–G29: equal bolt sharing, derived section geometry, thermal mismatch,
  hypothetical process quotes, statistical lookups, supplied extra DOE data,
  a complete raw/normalized/weighted trade matrix, beam-sweep inputs,
  fictional standards labeling, and honest capstone uncertainty statements.
- G30–G35: cutting coefficient, casting surface geometry, Cp/Cpk intermediate
  values, Taylor coefficients, weld/wear conversion factors, and extension
  model constants. The extension helpers and interactive benches use the same
  selected inputs where factored into `ladder-inputs.ts`.
- C01: six parts at 60 seconds to three at 36 saves **24 seconds** in text and
  animation. The separate two-part removal still saves 16 seconds.
- C02: the specific-stiffness index favors carbon; later screening leaves
  aluminum. It no longer falsely attributes a steel win to the printed index.
- C03: the MMC example explicitly gives a **cylindrical position-zone diameter**.
  A diameter of 0.40 mm permits a radial center deviation of 0.20 mm in this
  no-datum-shift teaching case. Bench, animation, labels and answer wording agree.

### Shared data, not a second hidden table

Spar tables use `REFERENCE_SPAR` / `SPAR_MATERIALS`; the engineering capstone uses
its own `CAP_REFERENCE` / `CAP_MATERIALS`. Their safety factors are intentionally
different, so the display must not silently merge the two design cases.
Trade-study matrices use `BRACKET_ALTERNATIVES`, `BRACKET_CRITERIA` and the real
normalization/scoring functions. Beam sweeps use `BEAM_CASE`; diffusivity uses
`DIFFUSANTS` / `GAS_CONSTANT`; extension examples use `LADDER_INPUTS`.

### Regression and acceptance commands

```sh
npm test
npm run typecheck
npm run build
node --test scripts/lesson-givens.test.mjs
node scripts/browser-lesson-givens.mjs
ACCEPTANCE_BUILD=1 ACCEPTANCE_OUT=screenshots/lesson-givens-built node scripts/browser-lesson-givens.mjs
```

The focused suite protects all 166 lesson identities, benches, numeric answer
positions, pass marks and reviewed option text, checks context/help integrity,
and recalculates the known intermediates. The fixture records the two reviewed
wording exceptions (fictional standard wording and diameter-zone wording); it
is not permission to change grading. No saved learner scores are migrated.

The browser harness renders the **real LessonView, figures, help, benches and
quizzes** in an isolated memory router with fresh browser storage. It exercises
all 55 context-bearing lessons at desktop and mobile widths, keyboard-operated
help, focus restoration, reduced motion, the Math Runway check, table navigation,
the bonus-tolerance bench and saved-score preservation. It runs both with Vite
serving modules and with a minified production bundle of that same harness.
This is component/student-journey acceptance, **not a test of deployed login,
account integration or the hosting service**. `npm run build` separately checks
the full application production bundle.

### Review checklist

For a new example, read it in its actual displayed order. Can the learner name
and locate each input before it is used? Is a coefficient a definition, a table
value, an assumption or a fitted teaching curve? Are symbols defined locally?
Are the necessary intermediate operations visible? Does the animation use the
same conditions as the text? A digit-search cannot answer those questions.

The changes do not certify classroom material values as design allowables or
validate every scientific model in the course. Applicable engineering standards,
actual alloy/product condition and measured operating conditions remain required
for real design.

## Learner follow-up: calibration and proportional reasoning

The graphs lesson now names its two hypothetical calibration readings before the animation, derives rise/run and the zero intercept, and distinguishes a fitted zero from a real sensor zero-balance guarantee. The optional help repeats both operations without making them prerequisites for finding essential inputs. The direct/inverse idea has three visible comparison tables, a 1/x plotting explanation, and an optional drilling example that derives 3.82 from 12/π with units.

The existing slope bench is retained. Four ungraded three-pair practice sets test direct, inverse, linear-with-offset, and decreasing-but-not-inverse patterns. Calculations appear after an attempt; retries and restart do not call the progress store. There are now 56 example contexts; existing quiz options, answers and pass marks are unchanged.

Popover height is constrained by Radix collision space and opening focuses the explanation rather than scrolling to its last button. Browser acceptance must complete both desktop and mobile interactions; a separate report verifier rejects failed or incomplete reports even if a child process exits zero.

References: Interface technical-library calibration/zero-balance definitions (https://www.interfaceforce.com/support/technical-library/) and Radix Popover size/accessibility contract (https://www.radix-ui.com/primitives/docs/components/popover). The arithmetic examples are supplied classroom data, not recommended machine settings or real calibration certificates.
