# Known issues in the design export

Defects present in the Figma source file that the export reproduces faithfully. Documented here so implementation sessions don't mistake them for export errors — and so we don't chase them twice.

## Header: wordmark renders too small in every instance

Every instance of the main `header` component (light `76:2`, dark `187:744`) — used on **all authenticated screens** — renders its wordmark broken: the "TomeTrove" text draws at ~5.6px instead of the expected ~16.8px (the 35% instance scale of the 48px wordmark symbol), while the red underline below it scales correctly to 35% (~73px). Visually, the logo text appears tiny and faint, and its length does not match the red line — exactly what a correct render should produce (see the public view below).

Evidence from pixel analysis of the exported renders (see `../tools/analyze-png.mjs`):

| Render | Wordmark text glyphs | Red underline |
|--------|----------------------|----------------|
| `screenshots/components/header-light.png` | ~4px tall (5.6px font) | ~64px visible, correct |
| `screenshots/my-wishes/my-wishes-default-light.png` | same broken proportions | same |
| `screenshots/watchlist/watchlist-default-light.png` | same broken proportions | same |
| `screenshots/shared-lists/shared-lists-public-view-light.png` (minimal header) | ~13px tall (**correct**, ~16.8px font) | same ~64px — text and line match |

The minimal header on the public-list-view screen uses a correctly-scaled wordmark instance, which confirms the defect is specific to the main `header` component's wordmark instance (a text size override at the component level, not a defect of the wordmark symbol itself).

The defect was fixed in the Figma file and published as version **`ready`** (`2399505405459241420`, saved 2026-09-15). The component-level header exports were re-downloaded from that version and render correctly — the wordmark text is `16.8px` in the node data and measures ~17px tall in the render, matching the red line beneath it:

- `../screenshots/components/header-light.png`, `header-dark.png` — re-rendered from version `ready`
- `../context/components/header.json` — full REST node tree from version `ready` (authoritative structural reference, supersedes `header.tsx` for the wordmark details)

> [!NOTE]
> The 62 **screen** screenshots were deliberately **not** re-exported — every screen containing a main header instance still shows the old broken render. When implementing a screen, ignore its header region and use the component-level files listed above instead. The same applies to any screen region showing a logo.

## Logo components

The three logo component sets — `logo/full`, `logo/mark`, `logo/wordmark` — were refreshed from version `ready` together with the header:

- `../screenshots/components/logo-full-{light,dark}.png`, `logo-mark-{light,dark}.png`, `logo-wordmark-{light,dark}.png` — re-rendered from version `ready`
- `../context/components/logo-full.json`, `logo-mark.json`, `logo-wordmark.json` — REST node trees from version `ready`

These standalone component exports are the authoritative reference for the logo; they render correctly at full size.



TODO download all things related to header and logos from the "ready" version