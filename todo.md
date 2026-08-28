# TomeTrove Figma Design — Progress log & TODO

**Figma file:** `z6yz2kWXO9D8gahuOyYW8J` (TomeTrove Design System)
**Page:** Widgets & Components (`66:2`)
**Session start:** 2026-08-28

This branch is the running log of the Figma design-system rebuild (switch from
Unicode icon characters to Phosphor SVG icons). The status below is updated at
every asset created or reworked.

## Key decisions (from ADR 0007 — "Frontend technology decisions")

- **Architecture:** MPA + Alpine.js + Tailwind CSS (no bundler, no SPA)
- **Fonts:** Josefin Sans (titles, Bold), Outfit (body and everything else, Regular/Medium)
- **Icons:** Phosphor Icons (regular weight), curated subset, single file as Alpine.js `<x-icon>` component. NOT Unicode. See `docs/reference/icons.md`.
- **Design-to-code:** Figma Dev Mode → HTML + Tailwind → add Alpine.js directives → add fetch() calls

## Initial file state (audited 2026-08-28)

- Pages: `TomeTrove Design System` (0:1), `Widgets & Components` (66:2), `Logos - Definitive` (87:2)
- Variable collections: Primitives (5 COLOR — includes new `color/orange`), Semantics (12 COLOR, Light/Dark), Typography (20 FLOAT), Icons (9 STRING with Unicode chars — to be replaced)
- Text styles: Typography/Display … Overline already exist (10 styles)
- Effect styles: none
- Widgets on 66:2: theme-toggle 68:2, search-wishes 72:2, notifications 73:2, notifications-dropdown 75:2, header 76:2, footer 77:10, currency-selector ×2 (78:10 dup + 79:10), country-selector ×2 (78:16 dup + 79:16)
- Known issues found: duplicated selector components (78:x vs 79:x); notifications-dropdown and both selectors have height 1 (broken frame sizing); header logo is a plain text node instead of the wordmark logo from `Logos - Definitive` / `assets/images`

## TODO / status

### 0. Foundations

- [x] Spacing variables (space-4 … space-64) as a Figma variable collection (`Spacing`, 110:3…110:10)
- [x] Border radius variables (radius-4 … radius-full) as a Figma variable collection (`Radius`, 110:12…110:16)
- [x] Text styles — already present (Typography/Display … Overline)
- [x] Effect styles — Elevation/1, Elevation/2, Elevation/3

### 1. Phosphor SVG icon components (replaces the Icons STRING variable collection)

- [x] `icon/sun` (111:22)
- [x] `icon/moon` (111:26)
- [x] `icon/magnifying-glass` (111:31)
- [x] `icon/bell` (111:36)
- [x] `icon/trend-down` (111:41)
- [x] `icon/sign-out` (111:47)
- [x] `icon/coins-money` (compound currency icon) (111:66)
- [x] `icon/globe` (111:73)
- [x] `icon/caret-down` (111:77)
- [x] `icon/percent` (111:83)
- [x] `icon/star` (111:87)
- [x] `icon/dots-six-vertical` (111:96)
- [x] `icon/book-open` (111:101)
- [x] `icon/barcode` (111:112)
- [x] `icon/x` (111:117)
- [x] `icon/check` (111:121)
- [x] Delete the old Icons STRING variable collection (Unicode chars)

### 2. Widgets — rework with Phosphor icon instances

- [x] `theme-toggle` (68:2) → icon/sun + icon/moon (bound to text-on-accent)
- [x] `search-wishes` (72:2) → icon/magnifying-glass; Inter → Outfit
- [x] `notifications` (73:2) → icon/bell; badge count bound to text-on-accent; Inter → Outfit
- [x] `notifications-dropdown` (75:2) → icon/trend-down ×3 (bound to success); fixed height-1 frame sizing + FILL rows; removed hardcoded #fff frame fills; Inter → Outfit; Elevation/2
- [x] `header` (76:2) → icon/sign-out; text logo replaced with `logo/wordmark` (114:14) instance built from Logos - Definitive (Tome bound to semantic text-primary so it adapts to Light/Dark); fixed logout frame width-1; removed hardcoded #fff section fills; Inter → Outfit
- [x] `footer` (77:10) → no icons; Inter → Outfit
- [x] Removed duplicate currency-selector 78:10 / country-selector 78:16 (verified uninstantiated)

### 3. Components

- [x] `currency-selector` (79:10) → icon/coins-money + icon/caret-down; fixed frame sizing; Inter → Outfit
- [x] `country-selector` (79:16) → icon/globe + icon/caret-down; fixed frame sizing; Inter → Outfit
- [x] `alert-threshold` (117:88) — percentage input (default 5), icon/percent
- [x] `reading-languages` (118:113) — language rows with Type constraints, icon/check + icon/star (accent = preferred)
- [x] `accepted-formats` (117:97) — sortable list (used, new, ebook) with rank, icon/dots-six-vertical handles
- [x] `add-wish` (118:134) — Title/ISBN segmented control (icon/book-open + icon/barcode), search box, autocomplete results with "Is this the book?" prompt
- [x] `rename-share` (118:169) — overlay form (Elevation/3), Save (icon/check, accent) / Cancel (icon/x)

### 4. Mini-SPA composition

- [x] Composed `mini-spa/preferences` (119:141) — header + 3-step onboarding wizard cards (step 1: currency/country/alert-threshold, step 2: reading-languages, step 3: accepted-formats, per user-journeys/onboarding.md) + footer

### 5. Documentation & validation

- [x] Screenshot verification of every component (icons, widgets, components, mini-SPA)
- [x] Verify all color variables bound — final scan reports zero unbound solid fills/strokes across all components on 66:2 (icon white bg fills removed at source, theme-toggle knob → text-on-accent, wordmark "Trove" → primitive forest-green, underline → primitive coral)
- [x] Component index/cover on the Widgets & Components page (`cover/index`, 121:286)
- [x] Design system ↔ docs-site (extra.css) discrepancy report — see below; reconciliation decided by the user

## Discrepancy report — Figma Semantics vs `docs/assets/css/extra.css`

Status: **awaiting user reconciliation** — no CSS or Figma value changed yet.

### A. Same token, different value (conflicts to reconcile)

| Token | Figma Light | CSS Light | Figma Dark | CSS Dark |
|---|---|---|---|---|
| background | `#EDF4F6` | `#D0E2F0` | `#0A2540` | `#041526` |
| border | `#C5D9DC` (=) | `#C5D9DC` | `#2E6B94` | `#184D75` |
| text-primary | `#0A396E` | `#000000` | `#EDF4F6` | `#DBEBEF` |
| accent | `#0F8A4F` | `#3BCB83` | `#0F8A4F` | `#3BCB83` |
| accent-hover | `#0A7641` | `#186E46` | `#1E9E5F` | `#2F8A4A` |

Matching in both: surface, surface-elevated, text-secondary (both modes), error, light border.

Note: the CSS accent `#3BCB83` equals the Figma **primitive** `color/forest-green`, while the
Figma **semantic** `color/accent` is `#0F8A4F` (which aliases no primitive) — the two sources
disagree on which green is "the" accent.

### B. In the docs CSS but missing from the design system

- Link tokens: `--tt-link` (light `#0A396E`, dark `#A8CCE8`) — no `color/link` semantic in Figma.
- Badge tokens: `--tt-badge-bg` / `--tt-badge-fg` — no badge semantics in Figma.
- Header/footer treatment: docs render header, tabs and footer **always deep-navy** (`#0A2B4E` bg,
  `#DBEBEF` text, hardcoded — bypasses `--tt-*` vars) in both color schemes; the Figma `header`
  uses `surface` and adapts to Light/Dark.
- Coral gradient hairline under header/tabs and above footer — decorative brand element absent from Figma.
- Heading color: docs headings use accent green; Figma headings use `text-primary`.
- Link styling: weight 600 + dotted coral underline on hover; Outfit 600 is imported but the DS
  typography only defines Regular/Medium.
- Code/syntax-highlight palette (amber `#D68E15`, honey `#F0A638`, sage `#259868`, coral) — partially
  overlaps Figma `warning`/`success` but is not tokenised.

### C. In the design system but missing from the docs CSS

- `color/success`, `color/warning`, `color/text-on-accent` semantics have no `--tt-*` counterparts.
- Spacing (`space-4…64`), radius (`radius-4…full`) and Elevation effect styles have no CSS custom-property equivalents (docs use ad-hoc px values).

### D. Docs non-compliance with the design system

- Many rules use hardcoded hex values instead of the `--tt-*` variables the file itself defines
  (header, tabs, footer, search, headings, links), so a token change would not propagate.
- Light-mode body text is pure black `#000000` instead of the DS `text-primary` deep navy.

## Log

- 2026-08-28: session start; audited Figma file and repo; created this branch.
- 2026-08-28: created Spacing + Radius variable collections and Elevation effect styles.
- 2026-08-28: created all 16 `icon/*` Phosphor components (Icons section 111:10), strokes bound to semantic text-primary by default.
- 2026-08-28: created `logo/wordmark` (114:14) from Logos - Definitive with mode-aware "Tome" fill.
- 2026-08-28: reworked all 7 existing widgets/components with Phosphor icon instances, Outfit typography, and frame-sizing fixes; deleted duplicate selectors.
- 2026-08-28: built alert-threshold, accepted-formats, reading-languages, add-wish, rename-share.
- 2026-08-28: composed mini-spa/preferences (1200px, header + wizard + footer).
- 2026-08-28: deleted the old Icons STRING (Unicode) variable collection; created `cover/index` (121:286).
- 2026-08-28: binding validation — removed white bg fills from all 16 icon components, bound theme-toggle knob and wordmark brand colors; final scan: zero unbound solid paints.
- 2026-08-28: wrote the Figma ↔ extra.css discrepancy report (above), pending user reconciliation.
