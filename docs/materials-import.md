# Materials 101 walkthrough import

## Delivered scope

This change connects `materials.txt` to all **30 existing Materials 101 lesson IDs**.
It imports **218 sections, 103 tables and 29 practice exercises**. Lesson 30 has
mastery guidance rather than an invented practice exercise. Every source section,
table and practice item has a corresponding parsed-content check. Joined lesson
headings are repaired; browser-agent follow-up chatter is excluded.

Open a Materials lesson, stay on **Read**, and expand **Walk me through this
lesson**. The section links jump to individual steps. Answers have a separate
**Show the answer and reasoning** disclosure. The existing lesson summary,
animations, benches and assessments remain intact. Reading support does not write
to saved scores or change pass thresholds.

## Source identity and course separation

- `docs/lesson-sources/materials.txt` is the exact uploaded source, preserved with
  a path-specific Git attribute so line-ending conversion does not change its hash.
- `materials-reviewed.md` is the editable student-facing revision.
- `materials-review.json` documents 75 focused wording/correctness edits.
- `materials-import-manifest.json` records source hashes and lesson-level counts.
- `course-import-coverage.json` lists the 90 distinct core course lesson IDs.

The overall sequence is **30 Physics + 30 Materials + 30 Engineering = 90**.
`Pasted text(1).txt` is Physics Lessons 16–30 and duplicates `Pasted text.txt`.
`materials.txt` is Materials, not Engineering. `Pasted text(3).txt` is the separate
Engineering source. This patch delivers the **30 Materials walkthroughs only**;
it does not claim to publish or finish the other two import batches.

## Content review

The source's teaching style and structure are retained. Corrections include the
SiC semiconductor exception, stiffness versus work hardening, flux per unit area,
pure-iron versus alloy-specific transformation temperatures, engineering stress
after necking, finite-data allowable limitations, model bounds on fatigue/creep,
polymer service around Tg, and the distinction between diffusion length and a
concentration-defined case depth. Workshop calculations are not repair approvals.

These are targeted corrections, not a comprehensive scientific or safety
certification. The unchanged legacy summaries and animations remain separate
content; this import does not certify every existing caption or simulation model.

Selected references used for the corrections:

- NIST, silicon-carbide semiconductors:
  https://www.nist.gov/news-events/news/2026/07/department-commerce-announces-direct-funding-agreement-bosch-225-million
- NIST, tolerance intervals for a normal distribution:
  https://www.itl.nist.gov/div898/handbook/prc/section2/prc263.htm
- Cambridge DoITPoMS, Fick's first law and interstitial diffusion:
  https://eng.libretexts.org/Workbench/Materials_Science_for_Electrical_Engineering/02%3A_Solids/2.02%3A_Diffusion/2.2.02%3A_Fick%27s_First_Law_of_Diffusion
- University of Bath, glass transition:
  https://www.bath.ac.uk/announcements/another-way-to-measure-the-glass-transition-in-polymers/
- Protolabs, service above and below polymer Tg:
  https://www.protolabs.com/en-gb/resources/design-tips/glass-transition-temperature-of-polymers/

## Repeatable commands

```sh
node scripts/import-materials-walkthroughs.mjs
node scripts/import-materials-walkthroughs.mjs --check
npm test
npm run typecheck
npm run build
node scripts/browser-materials-walkthroughs.mjs
ACCEPTANCE_BUILD=1 node scripts/browser-materials-walkthroughs.mjs
```

The importer fails on missing/duplicate lessons, mismatched titles, malformed
tables, lost sections/practice, a changed source hash, or stale generated output.
All HTML-looking source content is rendered as React text, not executed.

## Validation at delivery

- **596 automated tests passed**: 234 script tests plus 362 course/app tests.
- The new checks include 47 import/arithmetic tests and 31 server-render tests.
- TypeScript: passed.
- Production build: passed. Database migration was skipped by the existing script
  because no `DATABASE_URL` was configured; no database or auth changes are made.
- Changed-file ESLint: passed. Full-repository lint was not rerun.
- Browser acceptance: **898 checks passed in development and 898 in production**,
  covering all 30 lessons on desktop and mobile. The runner selects explicit
  table-region elements so named lesson sections do not interfere with its
  keyboard-focus check. All original assertions remain enabled.
- Full-app server rendering: all 30 Materials routes returned their walkthroughs
  in both development and production (60 checks).

One retained editorial issue remains in the mastery walkthrough: its
`Arrhenius → 2√(Dt)` reminder calls the result "case depth." Lesson 8 correctly
distinguishes characteristic diffusion length from depth at a specified
concentration; the mastery reminder should retain that concentration-dependent
step too.

The pre-change `lesson-view.tsx` blob was checked against GitHub main at
`ae3c4d112b0b626f132f815ca08c792c13fe695b`: blob
`5737fd1ab76eada60d940b53c03a46ad0e2132c1`. The only existing application source
change is the Materials-only panel wiring; the importer and reading data are new.
