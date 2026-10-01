# Trig clarity follow-up

This focused pass builds on the merged lesson-givens audit. It addresses the learner's side-name, degree/radian, measurement and resultant-force questions without changing the 166-lesson assessment contract.

## Student-facing changes

- In Math Runway → Geometry, triangles, and vectors, the side definitions and angle-unit choice now precede the cable's worked arithmetic. The opening figure has its own local givens so it also stands alone.
- Right-triangle ratios define theta, hypotenuse, opposite and adjacent. They explain the angle-dependent side names and show a ratio-selection table. Optional help solves the 24 in, 30° brace for both height (13.9 in) and length (27.7 in).
- Radians have a radius-length-on-an-arc explanation, two-way conversions, and a 10 in radius/90° example. The text distinguishes rim distance from rolling without slipping. Calculator mode is not presented as an automatic conversion for ordinary multiplication, nor is multiplication alone treated as a reason to use radians.
- The lesson and bench share a visible measurement limitation. Optional help gives the hypothetical 1,000 lbf 30°/32° comparison and a 500 N 34°/35°/36° sensitivity table. The total input force is held fixed; its components vary. These examples do not establish equipment accuracy or safe tolerances.
- The resultant idea defines R, Rx, Ry and Σ. Shared explanatory sections supply the two-force component table, magnitude, direction and distractor explanations. They appear in optional reading help and as structured quiz feedback only after an answer is selected.
- atan2 help explains argument-order conventions, signed quadrants, radian output in JavaScript, inverse tangent versus reciprocal tangent, and the undefined direction of a zero vector.

## Editorial checks

The forces in the floor example are right/up **on the diagram** in the floor plane, not necessarily horizontal/vertical forces in physical space. Two pulls 60° apart are not opposing each other; their resultant is smaller than the sum of their magnitudes because they are not aligned.

Use unrounded components for the final resultant: Rx = 650 N and Ry = 300 sin 60° give R = 700 N. The displayed rounded pair (650, 260) gives about 700.1 N. All original question options, answer positions, IDs, benches and pass marks are retained.

## Verification entry points

- `npm test` includes `scripts/trig-clarity.test.mjs` with arithmetic, content-order, shared-data and feedback-gating regressions.
- `npm run typecheck`, `npm run build`, and ESLint on changed sources.
- `scripts/browser-lesson-givens.mjs` exercises the real lesson, help, bench and quiz on desktop/mobile, in development and a minified component build. It tests late quiz-help disclosure, wrong/right answers, retake scores, keyboard table access, popup bounds/scroll/focus restoration, and no changes to existing scores.
- `scripts/assert-lesson-acceptance.mjs` rejects missing, failed, or incomplete reports, including reports that omit the trig retake checks.

The component harness is not a deployed authentication/hosting certification or engineering design approval.

## Pendulum unit-check follow-up

- A local symbolic context before the figure defines period (one complete cycle), length, gravitational acceleration, brackets and the dual use of T. No invented numerical values are needed.
- Metres-and-seconds cancellation comes before M/L/T notation. The three candidates share one source between the diagram, visible table and optional help.
- The surviving candidate is only dimensionally possible. The factor 2π and small-angle assumptions still need derivation or measurement. The motion is explicitly schematic.
- A unit-conversion mismatch can pass dimensional analysis: the Mars Climate Orbiter example is not represented as a failure that dimension matching alone would have caught. Reference links are in the explainer.
- Browser acceptance also checks local definitions, unit rows, SVG label bounds, reduced motion, keyboard-accessible table/help, focus restoration and unchanged scores for the pendulum page.
