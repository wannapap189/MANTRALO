# MANTRALO — Daily Pause design

This folder preserves the new MagicPath visual prototype built on 2026-11-26.

- Project: `476588229383036928`
- Component: `476588232818171904`
- Revision: `476588232818171905`
- Generated name: `freshly-lake-3141`

## Files and use

`src/components/generated/MANTRALODailyPause.tsx` exports the named React component `MANTRALODailyPause`. Its sibling CSS is imported by the component. The three original raster assets are in `assets/`; preserve their relative import paths when integrating.

Use this component inside a React/TypeScript application with a normal CSS pipeline such as Vite. This folder is a design component, not a standalone Vite scaffold: it deliberately does not contain MagicPath's host-specific `src/settings/types`, generated App wrapper, package files or build configuration. Mount the named export from the consuming application's own App component.

The stylesheet loads Noto Sans Thai from Google Fonts. The existing buildless site at repository root uses locally bundled font files. If adapting the component for offline use, replace its font import with an appropriately licensed self-hosted font.

## Scope

Three internal state-switched pages: home, book and 12-lesson course. Includes start/pause/reset timer, seven reflection-topic choices, checklist, lesson accordions and product inquiry dialogs. Navigation uses component state rather than the root site's hash router.

Free-kit/library/sample dialogs are design placeholders and do not deliver files. Payments, entitlement verification, email and CRM are not connected. Treat the original root frontend as the source for the broader route coverage and verified sample-file links during migration.

The remote MagicPath build completed and its native desktop preview was visually inspected. Mobile runtime and full interaction testing inside MagicPath remain pending. Do not promote this prototype to production solely because a build succeeded.
