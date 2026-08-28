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

- [ ] Spacing variables (space-4 … space-64) as a Figma variable collection
- [ ] Border radius variables (radius-4 … radius-full) as a Figma variable collection
- [x] Text styles — already present (Typography/Display … Overline)
- [ ] Effect styles (elevation shadows)

### 1. Phosphor SVG icon components (replaces the Icons STRING variable collection)

- [ ] `icon/sun`
- [ ] `icon/moon`
- [ ] `icon/magnifying-glass`
- [ ] `icon/bell`
- [ ] `icon/trend-down`
- [ ] `icon/sign-out`
- [ ] `icon/coins-money` (compound currency icon)
- [ ] `icon/globe`
- [ ] `icon/caret-down`
- [ ] `icon/percent`
- [ ] `icon/star`
- [ ] `icon/dots-six-vertical`
- [ ] `icon/book-open`
- [ ] `icon/barcode`
- [ ] `icon/x`
- [ ] `icon/check`
- [ ] Delete the old Icons STRING variable collection (Unicode chars)

### 2. Widgets — rework with Phosphor icon instances

- [ ] `theme-toggle` (68:2) → icon/sun + icon/moon
- [ ] `search-wishes` (72:2) → icon/magnifying-glass
- [ ] `notifications` (73:2) → icon/bell
- [ ] `notifications-dropdown` (75:2) → icon/trend-down ×3; fix frame sizing
- [ ] `header` (76:2) → icon/sign-out; use wordmark logo from Logos - Definitive
- [ ] `footer` (77:10) → no icons; verify bindings
- [ ] Remove duplicate currency-selector 78:10 / country-selector 78:16

### 3. Components

- [ ] `currency-selector` (79:10) → icon/coins-money + icon/caret-down; fix frame sizing
- [ ] `country-selector` (79:16) → icon/globe + icon/caret-down; fix frame sizing
- [ ] `alert-threshold` — percentage input (0-100, default 5), icon/percent
- [ ] `reading-languages` — language × ontology-Type checkbox matrix, icon/star for preferred
- [ ] `accepted-formats` — sortable list (used, new, ebook), icon/dots-six-vertical handles
- [ ] `add-wish` — title/ISBN segmented control (icon/book-open + icon/barcode), autocomplete results
- [ ] `rename-share` — overlay form, Save (icon/check) / Cancel (icon/x)

### 4. Mini-SPA composition

- [ ] Compose a mini-SPA page from widgets + components (header, footer, preference components)

### 5. Documentation & validation

- [ ] Screenshot verification of every component
- [ ] Verify all color variables bound (no hardcoded fills)
- [ ] Component index/cover on the Widgets & Components page
- [ ] Design system ↔ docs-site (extra.css) discrepancy report — reconciliation decided by the user

## Log

- 2026-08-28: session start; audited Figma file and repo; created this branch.
