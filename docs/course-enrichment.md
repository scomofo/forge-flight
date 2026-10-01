# September 30 course enrichment

The supplied [course-change transcript](lesson-sources/axiom-course-changes-2026-09-30.md)
is integrated as additions to the existing lessons. Learner commands such as
“walk me through this,” “expand,” “explain this” and “here” are conversation turns,
not course text, section headings or placement instructions.

## Coverage and placement

[The coverage manifest](course-enrichment-coverage.json) maps every one of the
110 lesson entries to its original transcript line, lesson ID, section headings
and reading anchors. It records 228 visible additions, 150 contextual explanations
and 107 ungraded practice exercises. The lesson counts are:

| Course | Enriched lessons | Practice exercises |
|---|---:|---:|
| Physics | 28 (lessons 3–30) | 27 |
| Materials | 30 | 29 |
| Engineering | 30 | 29 |
| Manufacturing 101–401 | 22 | 22 |

Essential rules, comparison tables and missing scenario resolutions appear in
Read beside the related idea, example or method. Supplemental derivations,
analogies and examples use the existing keyboard-accessible contextual popover,
with a subject-specific title. Practice appears in Try, with the answer hidden
behind “Answer and reasoning.” The existing bench and graded Check remain.
Opening explanations do not change saved grades, assessment answers or pass marks.

The Materials import's 218 sections and 103 tables are all retained, together
with its introductions, model notes, references and 29 exercises. The former
lesson-sized “Walk me through this lesson” panel has been replaced with placement
at the relevant reading anchors. [Materials provenance](materials-import.md)
records the unchanged raw source and the reviewed student text.

## Other transcript items

- The earlier Math trig/radian explanations, calculator-mode warning,
  measurement-error help and expanded vector feedback were already present and
  are retained. So are the pendulum animation's dimensional labels and checks.
- Physics now resolves the survey, tow-truck work and scaffold openings. Supplied
  assumptions specify the survey route, cable force and weightless plank.
- Glider Brief and Design offer the default mass/stability calculation. The
  constraint list includes static margin. Design distinguishes excessive,
  acceptable, weak and negative margins using the current model value; the pitch
  animation caption identifies its illustrative role. Reading the calculation
  leaves the design and Ledger unchanged.
- The shelf explains that screens can eliminate a material entirely. The shelf
  and the four Manufacturing endings have next-section links; Manufacturing 401
  continues to the glider.
- Glider Materials, Simulate, Make, Test and Review were explicitly outside the
  transcript's reviewed scope and are not presented as newly reviewed content.

## Numerical and editorial decisions

The transcript is a source pool rather than a literal replacement of the course.
The full uploaded [Manufacturing explanations](lesson-sources/manfu.txt) are also
preserved byte-for-byte and hashed in the coverage manifest; their dialogue is
excluded from the edited teaching content.
Missing numerical inputs are supplied explicitly as classroom assumptions.
Several distinctions are made explicit so the worked numbers can be reproduced:

- The survey's approximately 77 m walked distance assumes two diagonal legs;
  walking each east/north/west segment would instead total 105 m.
- The worker's 2 m/s velocity is relative to the bank, and the jumper example's
  stopping forces exclude body weight. The resonance exercise reports displacement
  magnification, distinct from force transmissibility.
- The clamp-force result `12.4 ± 0.8 kN` is a 95% interval for the mean, with sample
  standard deviation `0.652 kN` and Grubbs statistic `1.69`.
- The paint-study `+1.0 MPa` is the coefficient in a ±1 coded model; its full
  interaction effect is `+2.0 MPa`. Convergence requires two successive changes
  below 2%. Trade-study weights are renormalized explicitly.
- FMEA mitigations reduce occurrence/detection ratings while retaining severity.
  Practice standards, safety-factor policies and process quotes are labeled as
  hypothetical; they are not represented as actual product requirements.
- Springback opens the included bend angle. First-pass yield multiplies conditional
  step yields. Required start pace includes yield while customer takt retains its
  demand-based definition. The DFA exercise explicitly assumes a viable five-part
  redesign. A square-root HAZ-width scaling is identified as a teaching model.
- The Materials mastery reminder now distinguishes characteristic diffusion length
  from depth at a specified concentration, matching the diffusion lesson.

## Reproduce verification

Use Node 22 and the repository's installed dependencies. Playwright uses its
installed Chromium, or `CHROMIUM_EXECUTABLE_PATH` when supplied.

```sh
node scripts/import-materials-walkthroughs.mjs --check
node --experimental-strip-types scripts/course-enrichment-coverage.mjs --check
npm test
npm run typecheck
npm run build
node scripts/browser-course-enrichment.mjs
ACCEPTANCE_BUILD=1 node scripts/browser-course-enrichment.mjs
```

The coverage generator checks source and edited-content hashes. Its manifest
records placement and table totals for the browser checks. Content tests verify
that anchors exist in each actual lesson reading flow, that every Materials block
survives placement once, that source commands do not become labels, and that
representative calculations reproduce the stated results.

Browser acceptance opens every added popover by keyboard, checks focus restoration,
counts all tables across main text/help/practice, checks answers initially hidden,
confirms saved scores unchanged and visits the original benches and assessments.
Both desktop and mobile run against development and a production component build.
The CI lesson-clarity workflow runs these checks and uploads screenshots/results.

For the running full application, `scripts/browser-course-boundaries.mjs` accepts
`ACCEPTANCE_URL` and checks the glider and shelf in fresh browser contexts.
`scripts/browser-smoke.mjs` checks both viewport sizes, and its `--baseline`
option compares the real production app with development.

## Validation result (2026-10-01)

- 742 automated tests passed: 380 script tests and 362 course/app tests.
- TypeScript and the production build passed. The existing build skips database
  migration when `DATABASE_URL` is absent; this change adds no database work.
- All 110 lessons passed 5,084 browser assertions in development and another
  5,084 in the production component build, each covering desktop and mobile.
- All 110 real application lesson routes rendered their additions in both modes
  (220 route checks). The glider/shelf checks passed in both modes and viewports.
- Full-app browser smoke passed on desktop and mobile with no console errors,
  uncaught errors or horizontal overflow; production did not diverge from the
  development baseline. Representative screenshots were visually inspected.
- Changed-file lint reported no errors. The existing `PitchAnimation` effect
  dependency warning remains in `src/components/forge/bench.tsx`.

The acceptance runner has its own Vite dependency cache and disables HMR so
preview activity and production builds cannot reload a page during a test.
