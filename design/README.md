# Design export — TomeTrove UI

Offline export of the complete TomeTrove UI design from Figma, captured on **2026-09-20** from file [`z6yz2kWXO9D8gahuOyYW8J`](https://www.figma.com/design/z6yz2kWXO9D8gahuOyYW8J) (page `final`). The export was taken before the Figma subscription ended, so the frontend can be built without any Figma access. Everything here is committed to the repository and is the source of truth for the UI.

The design maps to the [feature inventory](../docs/contributor/ux/features.md) and implements the stack decisions in [ADR 0007](../docs/explanation/adr/0007-frontend-delivery.md) (MPA, one mini-SPA per page, Alpine.js + Tailwind CSS, Phosphor icons, Josefin Sans + Outfit).

## Directory structure

| Path | Contents |
|------|----------|
| `manifest.json` | Machine-readable index: every section, screen, component group, icon, and button variant with its Figma node ID and the files it was exported to |
| `metadata/page-final.xml` | Full node tree of the Figma page — node IDs, names, and exact x/y/width/height geometry for every layer |
| `tokens/variables.json` | All Figma variables (design tokens): mode-scoped colors (light/dark), typography styles, button state colors, radii, effects |
| `notes/behavior-notes.md` | The authoritative interaction spec for every component (listing states, search logic, autocomplete, alerts, preferences, grid, wish detail) |
| `notes/ai-design-handoff-prompt.md` | The complete handoff prompt the design was produced from: product summary, information architecture, all 29 screens, data-model context |
| `screenshots/<section>/` | All 62 screens (light + dark) at native 1280px resolution |
| `screenshots/components/` | Visual reference for all 54 design-system component groups — every state variant (button default/hover/disabled with its icon, logos light + dark, form states, notification types, header/footer, and so on) |
| `context/components/` | Reference code for every design-system component (see "How to use the context code" below) |
| `context/my-wishes/` | Reference code for a representative full screen (`my-wishes-default-light`) |
| `assets/icons/` | All 31 icon symbols as named SVGs (`user.svg`, `bell.svg`, …) |
| `assets/exports/` | Per-component asset bundles referenced by the context code, plus PNG exports of the 21 named button variants and every icon |
| `tools/` | The export scripts (`fetch-context-assets.mjs`, `save-context.sh`) and `verify-export.mjs` |

## Screen inventory

62 screens = 29 screens from the embedded handoff spec × light/dark themes. Slugs below are `<slug>-<light|dark>.png` under `screenshots/<section>/`.

| Section | Screens (slug) | Feature names |
|---------|----------------|---------------|
| `homepage` | `homepage-not-logged` | `homepage` (unauthenticated landing / `login`) |
| `my-wishes` | `my-wishes-default`, `my-wishes-search-results` | `list-wishes`, `add-wish`, `search-wishes`, `search-results` |
| `watchlist` | `watchlist-default` | `view-watchlist` |
| `wish-detail` | `wish-detail-empty`, `wish-detail-delete-confirmation`, `wish-detail-fetching-quotes`, `wish-detail-watched`, `wish-detail-unwatched` | `wish-detail` |
| `shared-lists` | `shared-lists-before-adding`, `shared-lists-search-autocomplete-open`, `shared-lists-book-selected`, `shared-lists-book-added-overlay`, `shared-lists-edit-wishlist-overlay`, `shared-lists-public-view` | `view-shares`, `create-share`, `rename-share`, `shared-list`, `public-list-view` |
| `import-wishes` | `import-wishes-upload`, `import-wishes-reconciling`, `import-wishes-summary` | `import-wishes` |
| `user-preferences` | `user-preferences-all-closed`, `-country`, `-theme`, `-format`, `-alert-threshold`, `-reading-languages`, `-download-data-request`, `-download-data-waiting`, `-download-data-ready`, `-delete-account` | `preferences` and its components, `export-data`, `delete-account` |
| `alerts` | `alert-overlay` | `notifications`, `notification-detail` |
| `privacy-policy` | `privacy-policy` | `privacy` |
| `license-agreement` | `license-agreement` | `license` |

The My Wishes "populated" state (handoff screen #3) is realized by the grid inside `my-wishes-search-results`; the default screen shows the empty state.

## Post-login routing

There is no authenticated dashboard homepage. After login the app routes to **`preferences`** while setup is incomplete, otherwise to **`list-wishes`** (My Wishes). This decision is recorded in the [feature inventory](../docs/contributor/ux/features.md) (feature #32) and holds until further information.

## How to use the context code

`context/**/*.tsx` files are **Figma-generated React + Tailwind reference code**, not runnable project code:

- They are a visual-fidelity reference. Adapt them to the project stack — Alpine.js directives in HTML documents, Tailwind utility classes per [ADR 0007](../docs/explanation/adr/0007-frontend-delivery.md) — never copy them verbatim, and do not add React as a dependency.
- Every element carries `data-node-id` attributes mapping back to the Figma node IDs in `metadata/page-final.xml`, so exact geometry can be looked up when rebuilding a layout.
- CSS variables in the code (e.g. `var(--modes/general/surface, white)`) correspond to `tokens/variables.json` — wire them into the Tailwind theme config. The fallback value in the code is the light-mode value; the token file also carries the dark-mode value.
- Asset references (`../../assets/exports/<component>/<file>.svg`) are local paths that resolve from the context file's directory. Each `.tsx` has a sibling `.assets.json` recording the original Figma asset URL → local path mapping.
- Screens other than `my-wishes-default-light` were not exported as flattened code — compose them from the component contexts, the geometry in `metadata/page-final.xml`, and the screenshots.

## Icons

`assets/icons/*.svg` are the 31 icon symbols used by the design (Phosphor-derived, `fill="black"` masks — recolor with `currentColor` or Tailwind text color classes per ADR 0007). Two icons (`used-book`, `row-pencil-line`) have a second SVG part (`-2.svg`).

## Coverage notes

- **Motion**: not exportable via MCP (requires a live selection in the Figma desktop app). The design is static; interaction behavior is fully specified in `notes/behavior-notes.md` instead.
- **Code Connect**: not available on the Figma plan used at export time; no mappings exist.
- **Libraries**: the file subscribed only to public community UI kits (Material 3, Simple Design System, …); nothing custom needed exporting.
- **Screenshots** are at native 1280px resolution (the API does not upscale).

## Verification

```bash
node design/tools/verify-export.mjs
```

Checks that every manifest screen has a valid non-empty screenshot, every context file has its `.assets.json`, no temporary Figma URLs remain in code or docs, and all referenced assets exist locally.

## Manual backup recommendation

The editable `.fig` file cannot be produced via MCP. Keep a local copy from the Figma desktop app (**File → Save local copy**) as the editable backup of this design.
