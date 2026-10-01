# Phase diagrams, stability, and bonding: scientific-consistency pass

Baseline: `306ba3c13ce4b506a078e8b6c12f85418d83bb1d` (merged PR #48).
The requested scope is all three follow-ups, desktop-first. Prior Hangar and
stress–strain improvements are preserved. This is a bounded correction and
verification record, not whole-curriculum scientific certification.

## 1. Phase diagrams and grading

The tin-rich liquid-plus-beta branch now returns liquid at the lower-tin
endpoint and beta solid at the higher-tin endpoint. Phase identity travels
with each endpoint; neither the grader nor the displayed fraction labels
has to infer identity from an assumed universal order of solid and liquid.
Phase composition (wt% Sn) is distinguished from mass fraction (0 to 1).

Both liquidus segments now interpolate exactly through the original supplied
classroom endpoints: (0 wt%, 327 °C), (61.9 wt%, 183 °C), and (100 wt%, 232 °C).
This replaces rounded slopes that disagreed slightly with the plotted endpoints;
it is not a new empirical phase-diagram fit. Other supplied teaching constants
are retained. The new figure, boundary table, reader, and grading use the same
model, explicitly labeled a classroom approximation at fixed pressure.

The independent 90 wt% Sn, 200 °C check gives liquid 75.118367 wt% Sn and beta
98.367347 wt% Sn. Opposite-segment fractions sum to one and reconstruct the
90 wt% overall composition. Independent examples also cover lead-rich liquid
plus alpha and the two-solid region. Reversing the phase fractions is rejected.

The eutectic is no longer a half-degree-wide three-phase band. At its exact
reaction temperature the three phase amounts are underdetermined by overall
composition and temperature alone. Pure-component melting is also explicit:
there is no nonzero two-phase composition tie line and no unique solid/liquid
amount from temperature alone. At an ordinary phase boundary the reader reports
the limiting single-phase state. The grader requires empty two-phase fields in
these cases; blanks are not interpreted as numeric zero. Invalid compositions,
nonfinite values, reversed or zero-length ties, and out-of-tie inputs are rejected.

The Cu–Ni reader is restricted to its stated 20–45 wt% Ni teaching range rather
than extrapolating its local straight lines to pure nickel. Cooling paths include
the exact solidus even when the chosen temperature step does not divide the
interval. Invalid/zero steps are rejected. The former coring control now compares
first and final equilibrium solid compositions; it explicitly does not predict
a quenched rim or implement a nonequilibrium segregation model.

Lesson IDs, six original phase-practical fixtures, and ordinary phase quiz keys
are preserved. Reviewed reading, examples, terminology, and diagrams are reconciled.

## 2. Static margin in the older Physics pre-lab

For this simplified model, negative static margin is unstable, zero is neutral,
and positive is statically stable. Positive values below 5%, within 5–25%
(inclusive), and above 25% are separately labeled relative to the classroom
target. An invalid input is not declared stable. Floating-point roundoff at the
stated thresholds is handled without treating tiny negative margins as positive.
Legacy internal enum names are retained where possible; learner-facing labels
carry the correct distinctions. No new flight-safety or handling standard is implied.

The pre-lab, feedback, local notation, lesson, and enrichment now distinguish
neutral point from center of pressure and static response from trim or dynamic
stability. A new labeled sketch places the center of gravity and neutral point
on the same coordinate system. Editing the geometry clears old graded feedback.
The ten-percent lift/weight screen is no longer described as proof of steady
glide or complete force-and-moment equilibrium. Existing note storage and quiz
answer positions are preserved.

## 3. Bonding and material-property generalizations

All three Week-11 lessons, their figures, reviewed imported reading, and actual
live bond-family/reference activities are reconciled. The duplicate unused
legacy activities are replaced with re-exports of the live versions so an
incorrect alternative does not remain available accidentally.

- Network bonding does not imply electrical insulation: silicon carbide remains
  a semiconductor; graphite's in-plane conduction and layer sliding remain
  qualified material-specific examples.
- Metal bonding or cohesive energy alone does not establish ductility. The
  tungsten discussion retains the supplied energy/melting datum while explaining
  the roles of processing, microstructure and temperature, including the rolled
  foil counterexample. It does not turn cohesive energy into a melting formula.
- Diamond network bonding is not an unconditional extreme-temperature service
  claim; atmosphere, pressure and heating conditions matter.
- Glass-transition softening, crystalline melting and chemical degradation are
  different processes. Softening without decomposition does not itself establish
  that covalent polymer backbones have broken.
- Molecular bond, ionic lattice-separation and cohesive-energy quantities have
  different reference states/molar bases; these are shown locally rather than
  treated as interchangeable fusion energies. The spring-lattice E approximation
  is identified as a teaching model with geometry/orientation assumptions.

The 18 existing material-specific bank keys and its corrected v2 best-score
storage key are unchanged. Six answer-option wordings across three ordinary
lesson assessments were updated for the corrected science; answer positions
and thresholds are unchanged. The assessment contract records exactly those
reviewed wording changes rather than silently resetting every hash.
Raw `materials.txt` remains byte-for-byte intact (SHA256
`9128660c48cf150f22637f78c535a196c03c5979025dab9fd27e40995a84aa24`).

## Reference basis and limits

These sources support substantive corrections, not unprovided experimental data.
Supplied classroom numbers remain identified as supplied approximations.

- Cambridge DoITPoMS, *Phase Diagrams and Solidification / Lever Rule*:
  https://www.doitpoms.ac.uk/tlplib/phase-diagrams/printall.php
  Retrieved indexed teaching text; direct full-page access was denied.
- Princeton University, *Eutectic*:
  https://www.princeton.edu/~maelabs/mae324/glos324/eutectic.htm
- Embry-Riddle, *Aircraft Stability & Control*:
  https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/aircraft-stability-control/
- NIST, *Characterization and Modeling of Silicon-Carbide Power Devices*:
  https://www.nist.gov/publications/characterization-and-modeling-silicon-carbide-power-devices
- Reiser et al., *Tungsten laminate pipes*, original research abstract at ORNL:
  https://impact.ornl.gov/en/publications/tungsten-w-laminate-pipes-for-innovative-high-temperature-energy-/
- Seal, *Graphitization of Diamond*, original research abstract:
  https://www.nature.com/articles/185522a0
- University of Bath, polymer glass-transition research explanation:
  https://www.bath.ac.uk/announcements/another-way-to-measure-the-glass-transition-in-polymers/

## Verification record

Local registered tests: **394 script + 370 TypeScript = 764 reported tests**, all
passing. The new registered wrapper actually executes **13 child tests**; these
are not additional tests to double-count. The independent discovery run over
all course/simulation test files passes **413/413**, overlapping registered tests.
Typecheck and production build passed. Changed-source lint passed; an unused
import was removed. The local browser was blocked from loopback navigation with
`ERR_BLOCKED_BY_ADMINISTRATOR`; that is not a passing acceptance run.

The desktop workflow records its exact revision and runs the new real-component
acceptance in development and production. It uses the visible rounded boundary
table to calculate phase fractions, not hidden answer keys, and tests deliberately
reversed answers, all six phase problems, boundary exploration, all five stability
classes, stale feedback, bonding reference answers/persistence, and all seven
affected lesson integrations. The test records failures and screenshots without
automatic retry. Consult the PR and workflow artifacts for executed CI results;
this document does not infer browser success from unit tests.

The primary numerical regression checks every two-phase point on a 0.5 wt% by
1 °C grid over the displayed Pb–Sn domain, enforcing ordered endpoints, physical
fractions and mass conservation. This is a consistency check of a stated model,
not independent validation of that model as measured alloy data.

### Executed desktop acceptance

Run `36932579972`, source commit `e4595610ad34503af1531b283faec4f9bb4f4b7c`:
**12/12 scenarios and 116 assertions passed in each of development and production
components**, with zero recorded failures. The downloaded JSON and representative
screenshots were inspected. The original two failures were test selectors that
omitted the values included in the existing sliders' accessible names. Selectors
now use the exact label prefix while retaining every assertion and the original
15-second timeout; no failed case is retried. The phase figure's tin-rich labels
were moved outside the narrow fields to avoid overlapping a test-point marker.

Five separate rational-arithmetic examples reproduce the revised phase endpoints
and fractions. The grid visits 56,481 states, including 28,885 two-phase states;
maximum observed mass-balance residual is about 1.42e-14 wt% Sn (floating-point
roundoff). This additional consistency evidence does not turn supplied teaching
boundary lines into experimentally validated alloy data.

No authenticated-deployment, physical test, learner study, assistive-technology
certification, mobile-specific work or blanket certification is claimed.
