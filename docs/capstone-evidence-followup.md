# Capstone evidence follow-up — October 1, 2026

Baseline: `b9f80411b03b39f342bd426ff44795690d3c6c2c` (merged PR #44).
The diagnostic, task/note delivery and scientific corrections from that PR are
retained, not reimplemented.

## Changes

- A capstone section must contain non-whitespace text before it earns a self-score.
  Saved records are normalized: absent/invalid text and invalid scores cannot pass.
- Editing a section resets only its score. Reassess the revised evidence; other
  sections and valid legacy packages retain their work.
- Completion is derived from the saved written package on hydration, even before
  the bench is opened. Legacy cached `capstonePass` values are ignored. New progress
  writes do not persist that derived flag. Quiz/placement/practical records retain
  their existing keys and meanings.
- The package is loaded before any save, avoiding an empty initial-state write.
  Storage failures are reported in the bench; work can still be used in memory.
- Clearing the package requires confirmation. Resetting progress history does not
  delete the separately stored written package. Cross-tab package changes refresh
  the package/completion view.
- The binding-constraint prediction readout uses the third mark (`marks[2]`), not
  an out-of-range fourth mark. The mismatch caption now matches the existing
  lesson's distinction between nominal disagreement and statistical significance.

The package gate remains a **self-assessment**. Nonblank evidence and a 70% rubric
score do not establish scientific correctness or independent review. This change
does not add AI grading, change lesson IDs, or alter the capstone scoring threshold.

## Verification

Local isolated checks: 16 package helper tests passed; the npm-discovery wrapper
passed; TypeScript transpilation/syntax checks passed for the changed UI and store.
The local environment cannot clone GitHub or install the app dependencies. These
checks are not a full application typecheck, build, or browser run.

The PR workflow runs the existing unit/script suite, TypeScript, production build,
changed-file lint, and existing lesson/enrichment browser checks. It also runs
`scripts/browser-capstone-evidence.mjs` against development and built components
at desktop and mobile sizes. That script checks legacy normalization, keyboard
self-scoring, the 7/10 boundary, rehydration without opening the bench, preservation
of other progress, editing/clearing/reassessing, cancellation and confirmation of
reset, prediction feedback, and browser errors/overflow. Workflow results, not this
plan, establish whether those integration checks pass.
