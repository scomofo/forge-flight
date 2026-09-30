# Density clarification and animation publication: verification

Verified September 30, 2026. The density clarification and media are based on main
`fd110e27493e616676680511ace1bb2c5b807818`, preserving its animated SVG figures.

## Application and asset checks

Publication run: https://github.com/scomofo/forge-flight/actions/runs/36758324586

- `npm ci`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed (including the new density regression script).
- `npm run build:dev`: passed. This does not claim a production database migration.
- Seven focused density regression assertions: passed.
- Before/after Math Runway JSON comparison: only the powers worked example and its new exampleHelp field changed; quiz content, IDs, order, bench IDs and mastery thresholds are unchanged.
- 132 arithmetic/export checks: passed; twelve GIFs, twelve MP4s and twelve PNG stills published in `public/learn-media`.
- Full-repository `npm run lint`: failed on an existing `no-empty` error at `src/lib/app-data/client.server.ts:281`, plus six existing warnings. That file is unchanged by this PR. It was not edited to hide the finding.

## Focused browser acceptance

Passing run: https://github.com/scomofo/forge-flight/actions/runs/36759560918

Tested application-code revision: `d2ca1de5918f4230591d17ce3c717c95e181b219`.
Browser evidence: https://github.com/scomofo/forge-flight/actions/runs/36759560918/artifacts/11118197457

43 checks passed in Chromium using desktop 1280x900 and mobile 390x844 with
reduced motion enabled for the mobile case:

- The same density help is present in the Powers figure and worked-example presentation.
- Keyboard opening, accessible dialog name, all three reference links, viewport fit, Escape dismissal and automatic return of focus to the original trigger.
- A distinct Density (given) step on desktop; the existing reduced-motion behavior retains the complete final still without motion controls.
- All three new SVG labels are visible and within the viewBox; neither layout has horizontal overflow or runtime errors.
- The React media player is opt-in, plays the MP4 with native controls after request, and returns to its still image.
- All twelve published MP4s play in the local gallery; the asset manifest has twelve unique IDs.

Desktop, mobile and popup screenshots were also visually inspected. This is a
component/media acceptance harness using the real components and course data,
not an authenticated end-to-end student journey. Authentication was neither
bypassed in the application nor modified.

All eight changed/new application TypeScript files passed focused ESLint in the
same acceptance run. The unrelated server-file lint finding remains disclosed
above.

## Reproduce

After `npm ci` and `npx playwright install --with-deps chromium`:

```sh
node --test scripts/density-given.test.mjs
ACCEPTANCE_OUT=/tmp/density-acceptance node scripts/browser-density-help.mjs
```

The browser script creates a temporary Vite harness and removes it in its
cleanup. The one-off publication and verification workflow wrappers are removed
from the final branch tree. Only this evidence and the reusable test/render
sources remain. The final documentation/cleanup commit does not change the
application code that passed the browser check.

## Scope of the media addition

The assets, typed manifest and opt-in player are available for lesson placement.
They do not replace the newer SVG figures or automatically insert a second
animation into every lesson. The preview is served from `/learn-media/index.html`
when the branch is built. No merge or deployment was performed by this work.
