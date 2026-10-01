# Materials 101 walkthrough import

## Delivered scope

This change connects `materials.txt` to all **30 existing Materials 101 lesson IDs**.
It imports **218 sections, 103 tables and 29 practice exercises**. Lesson 30 has
mastery guidance rather than an invented practice exercise. Every source section,
table and practice item has a corresponding parsed-content check. Joined lesson
headings are repaired; browser-agent follow-up chatter is excluded.

Materials explanations now appear beside the relevant idea, example or method in
**Read**. Optional detail opens in subject-specific popovers. Exercises are in
**Try**, with a separate **Answer and reasoning** disclosure. The existing
animations, benches and assessments remain intact. Reading support does not write
to saved scores or change pass thresholds. See [course enrichment](course-enrichment.md)
for the complete transcript integration and current placement.

## Source identity and course separation

- `docs/lesson-sources/materials.txt` is the exact uploaded source, preserved with
  a path-specific Git attribute so line-ending conversion does not change its hash.
- `materials-reviewed.md` is the editable student-facing revision.
- `materials-review.json` documents 76 focused wording/correctness edits.
- `materials-import-manifest.json` records source hashes and lesson-level counts.
- `course-import-coverage.json` lists the 90 distinct core course lesson IDs.

The overall sequence is **30 Physics + 30 Materials + 30 Engineering = 90**.
`Pasted text(1).txt` is Physics Lessons 16–30 and duplicates `Pasted text.txt`.
`materials.txt` is Materials, not Engineering. `Pasted text(3).txt` is the separate
Engineering source. The original import delivered the **30 Materials walkthroughs**. The subsequent
[course enrichment](course-enrichment.md) integrates the supplied summary across
Physics, Materials, Engineering and Manufacturing.

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

## Validation history

The original import passed 596 automated tests, TypeScript, the production build,
changed-file lint, and 898 browser checks in each build mode. Its keyboard table
check used explicit table-region elements so named lesson sections could not
interfere with focus checks.

The integrated layout supersedes that panel-specific browser run. Current
commands above validate distributed reading content and practice; the full-course
runner is `scripts/browser-course-enrichment.mjs`. Its Materials-only wrapper
remains `scripts/browser-materials-walkthroughs.mjs`.

The mastery reminder's earlier “case depth” shortcut has been corrected in review
edit 76 to include the concentration-profile step. Re-running the importer
preserves that correction and records the updated reviewed-source hash.
