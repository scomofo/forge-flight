# Manuscript editorial implementation

Baseline: `9d33bea105b9c8791011b0796be5485a0b862c5e` (merged PR #47).
Scope: truthful Hangar outcomes, the Materials `readcurve` lesson and practical,
then local notation and interface copy. Desktop is the requested QA target.

## Outcome integrity

The result summary checks every required pass flag, not the absence of a named
failure. Every normal failed criterion has learner-facing feedback. Insufficient
lift includes the lift/weight comparison. Strength-margin shortfall and exceeding
a supplied strength limit are distinct; neither is represented as an observed
yield event. Positive static margin outside the classroom target is not labeled
negative-margin instability. A first-mode proximity warning is not proof of a
forced resonant response. The virtual-test limitation remains visible after both
passing and failing outcomes.

Manufacturing messages report actual dimensions and classroom limits with
separate pass/fail wording. They do not turn an illustrative threshold into a
universal statement about chatter, layer bonding, fill or ejection. All original
limits and scoring thresholds are retained. Setup/tooling parentheses, primary-
part quote scope, model dimensions, virtual overrides and the best-score unlock
rule are stated explicitly. The result revision identifier invalidates obsolete
analysis/test evidence while preserving existing designs and ledger history.

## Stress–strain meaning, givens and figure

The original steel example supplies a 12.5 mm diameter, a departure from linearity
at 42.9 kN, peak force 51.5 kN and modulus 200 GPa. These givens remain unchanged.
The supplied record does **not** locate the 0.2%-offset intersection. The revised
lesson and schematic therefore label the 349.6 MPa result as stress at reported
departure, not as a confirmed offset yield strength. Peak engineering stress is
419.7 MPa. The omission is explained rather than replaced by an invented force.

The 0.2% construction is explained as a line parallel to the initial elastic
slope, shifted to strain 0.002; it is not the exact first onset of plasticity.
The separate imported practice already supplies its offset force. Its answer now
distinguishes elastic strain (approximately 0.00391) from total strain at the
offset point (approximately 0.00591). Definitions and units are local to first use.

The practical uses exactly the same generated samples, extraction method and
8%/12%/6%/10% scoring bands as before. It now displays numeric axis ticks, a full
record and enlarged initial region, a keyboard-operated optional offset guide,
a sample cursor and an accessible table of the same samples. Stress noise is
bounded ±0.8%; strain coordinates receive no added noise. These are synthetic
teaching records, not qualified material measurements. Feedback identifies a
mismatch with an exercise reference without blaming the learner or awarding a
professional qualification.

The original `materials.txt` upload is untouched. Reviewed Markdown, review log,
generated walkthrough, import manifest and enrichment coverage are regenerated
together. Lesson IDs, ordinary quiz option text and answer indices are retained;
one quiz prompt now asks for engineering stress at the supplied force instead
of implying an unprovided yield convention.

## Reference basis

- Mississippi State University, *Yield*:
  https://www.ae.msstate.edu/vlsm/materials/strength_chars/yield.htm
- ZwickRoell, *Yield Point / Proof Strength*:
  https://www.zwickroell.com/industries/materials-testing/tensile-test/yield-point/

These support the offset construction and its distinction from other landmarks;
they do not supply a missing measurement for the fictional worked example.

## Verification

`npm test` includes `scripts/manuscript-regressions.test.mjs`, which runs the
focused outcome, boundary, axis-range and content checks. Do not double-count
its child tests when adding registered test totals. The dedicated desktop
workflow runs the full registered tests, TypeScript, build and edited-file lint.

`browser-manuscript-edit.mjs` exercises real components and virtual-test workers.
Its curve-reading estimates are independently calculated from the **visible,
rounded sample table**, not imported hidden reference values. It tests keyboard
figure controls, all five specimens, incorrect feedback, correction, completion
and restart; lesson integration; insufficient lift; strength-margin wording;
valid success; DFM pass/fail boundary copy and the unlock description. A result
file records every case and failure. No failed case is automatically retried.

Local registered tests, typecheck and build were executed. The local browser
rejected loopback navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; that run is not
claimed as passing. Browser evidence is supplied by GitHub Actions and must be
read at its recorded revision. This is not an authenticated-deployment test,
physical experiment, learner study or whole-curriculum scientific certification.

## Remaining scope

This focused patch does not close unrelated Pb–Sn tie-line ordering, older
Physics pre-lab stability terminology or remaining bonding generalizations.
No physical measurements have been supplied for the missing steel offset datum.
