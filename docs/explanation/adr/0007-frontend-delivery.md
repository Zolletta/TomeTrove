# ADR 0007: Frontend technology decisions

- Status: Accepted
- Date: 2026-08-24

## Context

The project is currently scaffolded with Cloudflare **Static Assets** (`wrangler.jsonc` → `assets.directory: ./public`, serving `index.html`). TomeTrove needs a rich, interactive UI: book list with filtering/search, book detail with editions and price history, genre tree navigation, CSV import, user preferences, price comparison across stores, alert notifications, and potentially price history charts.

Constraints:

- Workers can serve static assets natively (no separate Pages project needed).
- The UI consumes REST endpoints and only those ([ADR 0008](0008-http-routing.md)). The backend returns JSON, not pre-rendered HTML with data.
- The learning goal is TypeScript — a TS-based frontend approach reinforces that.
- The author's PHP background includes server-side rendering (PHP templates) — the mental model is request-response per page, not a single-page app.
- SPAs are explicitly rejected — they do too much, consume too many resources, and add complexity (client-side routing, global state management, large bundles) that TomeTrove doesn't need.

## Decision

This ADR collects the technology choices that shape TomeTrove's frontend. Each section records one decision and its rationale.

### 1. Application architecture: MPA with mini-SPA per page

Adopt a **multi-page application (MPA) with a mini-SPA per page**, using **[Alpine.js](https://alpinejs.dev/)** as the per-page interactivity framework and **[Tailwind CSS](https://tailwindcss.com/)** as the styling layer.

Each page is a separate HTML document served as a static asset. Navigation between pages is a full browser page load — no client-side router, no single-page shell. Within each page, a small Alpine.js app handles that page's interactivity: fetching from the REST API, rendering the UI, handling user input. Styling is provided by Tailwind utility classes applied directly in the HTML.

This gives:

- **No client-side router** — URLs are real pages, browser back/forward works natively, deep linking works for free.
- **Small JS bundles per page** — each page loads only the JS it needs. No large SPA bundle on every page.
- **Independent pages** — a bug in one page doesn't break others. No shared global state.
- **Workers-friendly** — static HTML + JS served as assets, REST API returns JSON. Simple to deploy.

#### Why Alpine.js

[Alpine.js](https://alpinejs.dev/) is a tiny (~15KB) JavaScript framework that adds reactivity to HTML via declarative attributes (`x-data`, `x-show`, `x-for`, `x-model`). It requires no build step and no client-side router. The mental model is close to PHP Blade/Twig directives — you write HTML and add behavior through attributes, rather than writing JavaScript that generates HTML.

This contrasts with component-based frameworks like [Preact](https://preactjs.dev/) or React, where HTML is generated from JavaScript (JSX). That approach is more powerful for complex state management but represents a bigger mental shift from PHP and doesn't integrate well with design-tool output (see below).

#### Why Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework — you style elements by composing utility classes directly in the HTML (`class="flex items-center gap-4 rounded-lg shadow-md"`), rather than writing custom CSS rules in separate stylesheets.

Tailwind is chosen over a component library (Material UI, Mantine, etc.) for these reasons:

- **No framework lock-in** — component libraries like Material UI require React, which is rejected (see Options below). Tailwind is framework-agnostic: it works with plain HTML, which is what Alpine.js operates on.
- **Design-tool alignment** — [Figma](https://www.figma.com/) is the design tool for TomeTrove's UI (see the design-to-code workflow below). Figma's Dev Mode maps design tokens (colors, spacing, typography) to Tailwind utility classes, so the handoff from design to HTML is direct. A component library would impose its own design language and fight the Figma output.
- **Material aesthetic without the dependency** — Tailwind's utility classes can express Material Design visual language (elevation shadows, rounded corners, ripple effects, app bars, snackbars) without pulling in a Material component library that brings its own JS and fights Alpine for DOM control.
- **Tiny output** — Tailwind's JIT compiler emits only the utility classes actually used in the HTML. The production CSS is small (typically 10-30 KB), which matters on Workers where every byte of static asset is served on every page load.
- **No CSS file to maintain by hand** — utility classes compose into components inline. There is no separate `.css` file per page that drifts from the HTML. Custom component classes (e.g. `.btn`, `.card`) are defined once in `tailwind.config` via `@apply` if reuse is needed.
- **Learning value** — Tailwind teaches CSS properties and the box model directly (every utility maps to a CSS declaration), rather than abstracting them behind component props. This reinforces the learning goal alongside TypeScript.

### 2. Icon set: Phosphor Icons (curated subset)

Use **[Phosphor Icons](https://phosphoricons.com/)** as the icon set, but do **not** import the library wholesale. Instead, extract only the SVG path data for the icons TomeTrove actually uses and bundle them in a **single file** that registers an Alpine.js `<x-icon>` component.

#### Why Phosphor

- Clean, geometric, flexible — six weights (thin, light, regular, bold, fill, duotone) available, but TomeTrove uses **regular** weight exclusively for consistency.
- MIT licensed, no attribution required.
- 1,500+ icons available; TomeTrove uses ~20.
- SVG-based — no icon font, no web font loading, no FOUT.
- `currentColor` for fill — icons inherit Tailwind text color classes (`text-primary`, `text-secondary`, `text-accent`) automatically.

#### Why a single file, not per-icon or grouped

- **MPA = no bundler = no tree-shaking.** Per-file splitting only helps if a bundler can eliminate unused imports. TomeTrove has no bundler — each page loads Alpine and its plugins as static assets.
- **Size is negligible.** Each Phosphor icon is ~200-400 bytes of SVG path data. Twenty icons total ~4-8 KB; gzipped ~2-3 KB. Less than a single small raster image.
- **One HTTP request, cached forever.** The browser fetches the icon file once and caches it. Every subsequent page load uses the cached version.
- **Single source of truth.** All icons are visible in one file — easy to audit, add, remove, or rename. No hunting through directories.
- **Clean usage.** The Alpine component accepts a `name` attribute and optional Tailwind classes: `<x-icon name="magnifying-glass" class="w-5 h-5 text-secondary"></x-icon>`.

The full list of selected icons with their names and usage context is documented in the [icon reference](../../reference/icons.md).

### 3. Typography: Josefin Sans for titles, Outfit for everything else

- **[Josefin Sans](https://fonts.google.com/specimen/Josefin+Sans)** — used for all titles (page titles, section headings, card titles, modal titles). Weight: **Bold**.
- **[Outfit](https://fonts.google.com/specimen/Outfit)** — used for body text, labels, buttons, inputs, captions, overlines, and all other UI text. Weights: **Regular** (body), **Medium** (labels, emphasis).

Both fonts are variable, Google-hosted, and free (OFL license). They are loaded via `<link>` in each HTML document's `<head>`.

#### Why two fonts

- Josefin Sans has a distinctive geometric character that gives TomeTrove a recognizable identity in titles without being decorative.
- Outfit is a clean, highly legible sans-serif that works at all body sizes (12px to 16px) and in dense UI contexts (tables, forms, badges).
- Using a single font for everything would flatten the visual hierarchy; using more than two would add weight and complexity for no benefit.

#### Why not Inter

Inter is an excellent UI font and was considered for body text. Outfit was chosen because its slightly warmer geometry pairs better with Josefin Sans's geometric titles, while Inter's tighter, more neutral character would create a flatter, more corporate feel that doesn't match TomeTrove's library/treasure aesthetic.

### 4. Design-to-code workflow with Figma

[Figma](https://www.figma.com/) is the design tool for TomeTrove's UI. Designs are authored in Figma; Figma's Dev Mode exports clean, semantic HTML + Tailwind utility classes. It does not generate JavaScript — it produces the layout and styling, not the interactivity.

The workflow for each page:

1. **Design in Figma** — lay out the page (e.g. a book wish list page with a search bar, a table of books with title/author/price, and a CSV import button).
2. **Export HTML + Tailwind classes** — use Figma Dev Mode to get the HTML skeleton with Tailwind utility classes applied.
3. **Add Alpine.js directives** — sprinkle `x-data`, `x-for`, `x-show` attributes onto the HTML elements that need interactivity. The HTML structure from Figma stays intact — you're adding behavior, not rewriting.
4. **Add `fetch()` calls** — write small `<script>` blocks that call the REST endpoints and populate the Alpine state.

Figma gives the HTML skeleton with Tailwind styling. Alpine gives it behavior. `fetch()` connects it to the API. Three layers, each doing one thing. This workflow doesn't work with Preact/React because those frameworks require converting HTML into JSX components — manually rewriting every element as a JavaScript function, which defeats the purpose of using a design tool.

### 5. Page set

| Page            | Auth required | Purpose                                                                                         | REST endpoints consumed                                                                       |
|-----------------|---------------|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **Login**       | No            | GitHub OAuth redirect, JWT acquisition                                                          | OAuth flow ([ADR 0006](0006-authentication-model.md))                                         |
| **User**        | Yes           | Preferences: reading languages, currency, country, alert threshold, fetch hour, store selection | `/api/user/preferences`, `/api/user/preferences/languages`, `/api/stores`, `/api/user/stores` |
| **Wishes**      | Yes           | Full wish list, add/remove books, toggle monitored, CSV import, author/book search              | `/api/wishes`, `/api/wishes/import`, `/api/books`, `/api/authors`                             |
| **Monitored**   | Yes           | Monitored books (subset of wishes), price history, baseline, alerts, price graphs               | `/api/wishes?monitored=true`, `/api/editions/:id/prices`, `/api/alerts`                       |
| **Book detail** | Yes           | Single book: editions, prices, classification, author, price history                            | `/api/books/:id`, `/api/books/:id/editions`, `/api/editions/:id/prices`, `/api/authors/:id`   |
| **Lists**       | Yes           | Create/edit/share lists, filter configuration                                                   | `/api/lists`                                                                                  |
| **Public list** | No            | Shared list view via token (no login required)                                                  | `/api/lists/:token` ([ADR 0017](0017-public-wish-list-sharing.md))                            |

## Options considered

### Application architecture

1. **MPA + mini-SPA per page with Alpine.js + Tailwind (chosen)** — each page is a separate HTML document with Alpine.js for interactivity and Tailwind for styling. Full page reloads on navigation, client-side interactivity within a page. Integrates naturally with Figma's HTML + Tailwind export. Best balance of simplicity, performance, developer experience, and design-tool workflow.
2. **MPA + Preact/HTM** — same MPA pattern, but Preact as the per-page framework. More structured than Alpine, but requires converting Figma's HTML output to JSX components — defeats the design-tool workflow. Bigger mental shift from PHP.
3. **Static HTML + vanilla TS (no framework)** — same MPA pattern, but no per-page framework. Viable but more boilerplate for complex pages (trees, charts, reactive forms).
4. **Server-side rendering in the Worker (Hono / JSX)** — server generates HTML with data embedded. Rejected — the UI consumes REST endpoints only ([ADR 0008](0008-http-routing.md)), so the backend returns JSON, not pre-rendered HTML.
5. **Full SPA (React/Vue/Svelte + Vite)** — single-page app with client-side routing. Rejected — too much complexity and resource consumption for TomeTrove's needs.
6. **HTMX + server-rendered HTML** — server returns HTML fragments. Rejected — conflicts with the REST-only constraint (HTMX expects HTML responses, not JSON).
7. **MPA + Alpine.js + a component library (Material UI, Mantine)** — rejected. Component libraries like Material UI require React (option 5 in disguise); framework-agnostic CSS component libraries (Material Components Web, Materialize) ship their own JS for component behavior (ripples, dialogs, menus) which overlaps and conflicts with Alpine.js for DOM control. Tailwind expresses the same Material visual language via utility classes without the JS conflict.

### Icon set

1. **Phosphor Icons, curated single file (chosen)** — extract only the SVG paths for icons TomeTrove uses, bundle in one file as an Alpine.js component. One HTTP request, cached forever, single source of truth, ~4 KB total.
2. **Phosphor Icons, full library via npm** — rejected. Imports 1,500+ icons when TomeTrove uses ~20. Adds unnecessary weight and dependency.
3. **Heroicons** — considered. Excellent quality, but fewer icons than Phosphor and Tailwind-ecosystem-specific (not a problem per se, but Phosphor's broader coverage gives more flexibility for future needs).
4. **Lucide** — considered. Clean and consistent, but Phosphor's six-weight system offers more flexibility if TomeTrove ever needs filled or duotone variants.
5. **Material Symbols** — rejected. Google's Material icon font requires loading a web font (FOUT risk, render-blocking) and doesn't align with the SVG-inline approach.
6. **Unicode characters** — rejected. Inconsistent rendering across platforms, no design control, limited coverage for domain-specific icons (currency, barcode, trend-down).

### Typography

1. **Josefin Sans (titles) + Outfit (body) (chosen)** — geometric title font with a clean, warm body font. Pairs well visually. Both variable, both Google-hosted.
2. **Josefin Sans + Inter** — Inter is more neutral and corporate. Outfit's warmer geometry fits the library/treasure aesthetic better.
3. **Outfit only** — would flatten the visual hierarchy. Titles need distinct character.
4. **Inter only** — the safe, default choice. Rejected for the same reason as option 2, plus it would make TomeTrove look like every other developer-tool UI.

## Consequences

- **Positive**: no client-side router — the biggest source of SPA complexity is gone; URLs are real pages — browser navigation, deep linking, and bookmarking work natively; small JS bundles per page — each page loads only what it needs; independent pages — failures are isolated, no shared global state; Workers-friendly — static assets + JSON API, simple deployment; the pattern is close to the PHP request-response mental model — each page is a self-contained unit; Alpine.js integrates naturally with Figma's HTML + Tailwind export — design in Figma, add Alpine directives, add fetch(), done; Tailwind's JIT output is small and keeps the static asset payload lean; the Material aesthetic is achievable via Tailwind utilities without a component library that fights Alpine; Phosphor icons are inline SVG with `currentColor` — no icon font, no FOUT, no render-blocking, icons inherit Tailwind text colors automatically; the single-file icon approach means one cached HTTP request covers all icons on all pages; two-font system gives clear visual hierarchy with minimal weight.
- **Negative**: full page reload on navigation — there is a flash/latency on each navigation (mitigated by static asset caching and small page sizes); no shared state between pages — each page boots from scratch, re-fetching data the previous page already had (acceptable — the REST API is fast, and pages are independent by design); Alpine.js has a smaller ecosystem than React/Vue — but it covers what TomeTrove's pages need (reactive forms, lists, conditional display); Tailwind's utility-class soup can be verbose in HTML — mitigated by extracting reusable component classes via `@apply` in `tailwind.config` when patterns repeat; adding a new icon requires editing the icon file and using the new name — there is no auto-discovery, but this is a feature (explicit > implicit) for a small set.
- **Neutral**: the page set (7 pages) may grow as features are added — each new page is a new HTML document + Alpine app, following the same pattern; charts on the monitored/books pages will need a charting library (e.g. Chart.js) loaded only on those pages; the public list page is the only unauthenticated page — it follows the same pattern but without JWT in the API calls; Figma's HTML output is a starting point, not production-ready — it needs adaptation for the tech stack (adding Alpine directives, fetch calls, real data binding); the icon set may grow beyond 20 icons as features are added — the single-file approach scales to ~50 icons before per-page splitting becomes worth considering.
