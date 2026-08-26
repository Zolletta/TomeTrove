# ADR 0007: Frontend delivery strategy

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

Adopt a **multi-page application (MPA) with a mini-SPA per page**, using **[Alpine.js](https://alpinejs.dev/)** as the per-page interactivity framework.

### Architecture

Each page is a separate HTML document served as a static asset. Navigation between pages is a full browser page load — no client-side router, no single-page shell. Within each page, a small Alpine.js app handles that page's interactivity: fetching from the REST API, rendering the UI, handling user input.

This gives:

- **No client-side router** — URLs are real pages, browser back/forward works natively, deep linking works for free.
- **Small JS bundles per page** — each page loads only the JS it needs. No large SPA bundle on every page.
- **Independent pages** — a bug in one page doesn't break others. No shared global state.
- **Workers-friendly** — static HTML + JS served as assets, REST API returns JSON. Simple to deploy.

### Why Alpine.js

[Alpine.js](https://alpinejs.dev/) is a tiny (~15KB) JavaScript framework that adds reactivity to HTML via declarative attributes (`x-data`, `x-show`, `x-for`, `x-model`). It requires no build step and no client-side router. The mental model is close to PHP Blade/Twig directives — you write HTML and add behavior through attributes, rather than writing JavaScript that generates HTML.

This contrasts with component-based frameworks like [Preact](https://preactjs.dev/) or React, where HTML is generated from JavaScript (JSX). That approach is more powerful for complex state management but represents a bigger mental shift from PHP and doesn't integrate well with design-tool output (see below).

### Design-to-code workflow with Google Stitch

[Google Stitch](https://stitch.withgoogle.com/) is an AI design tool by Google Labs that generates UI designs from text prompts, sketches, or screenshots, and exports clean, semantic HTML + CSS (with Tailwind CSS). It does not generate JavaScript — it produces the layout and styling, not the interactivity.

The workflow for each page:

1. **Design in Stitch** — prompt it to generate the page layout (e.g. "a book wish list page with a search bar, a table of books with title/author/price, and a CSV import button").
2. **Export HTML + CSS** — download the clean HTML for the screen.
3. **Add Alpine.js directives** — sprinkle `x-data`, `x-for`, `x-show` attributes onto the HTML elements that need interactivity. The HTML structure from Stitch stays intact — you're adding behavior, not rewriting.
4. **Add `fetch()` calls** — write small `<script>` blocks that call the REST endpoints and populate the Alpine state.

Stitch gives the HTML skeleton. Alpine gives it behavior. `fetch()` connects it to the API. Three layers, each doing one thing. This workflow doesn't work with Preact/React because those frameworks require converting HTML into JSX components — manually rewriting every element as a JavaScript function, which defeats the purpose of using a design tool.

### Page set

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

1. **MPA + mini-SPA per page with Alpine.js (chosen)** — each page is a separate HTML document with Alpine.js for interactivity. Full page reloads on navigation, client-side interactivity within a page. Integrates naturally with Google Stitch's HTML export. Best balance of simplicity, performance, developer experience, and design-tool workflow.
2. **MPA + Preact/HTM** — same MPA pattern, but Preact as the per-page framework. More structured than Alpine, but requires converting Stitch's HTML output to JSX components — defeats the design-tool workflow. Bigger mental shift from PHP.
3. **Static HTML + vanilla TS (no framework)** — same MPA pattern, but no per-page framework. Viable but more boilerplate for complex pages (trees, charts, reactive forms).
4. **Server-side rendering in the Worker (Hono / JSX)** — server generates HTML with data embedded. Rejected — the UI consumes REST endpoints only ([ADR 0008](0008-http-routing.md)), so the backend returns JSON, not pre-rendered HTML.
5. **Full SPA (React/Vue/Svelte + Vite)** — single-page app with client-side routing. Rejected — too much complexity and resource consumption for TomeTrove's needs.
6. **HTMX + server-rendered HTML** — server returns HTML fragments. Rejected — conflicts with the REST-only constraint (HTMX expects HTML responses, not JSON).

## Consequences

- **Positive**: no client-side router — the biggest source of SPA complexity is gone; URLs are real pages — browser navigation, deep linking, and bookmarking work natively; small JS bundles per page — each page loads only what it needs; independent pages — failures are isolated, no shared global state; Workers-friendly — static assets + JSON API, simple deployment; the pattern is close to the PHP request-response mental model — each page is a self-contained unit; Alpine.js integrates naturally with Google Stitch's HTML export — design in Stitch, add Alpine directives, add fetch(), done.
- **Negative**: full page reload on navigation — there is a flash/latency on each navigation (mitigated by static asset caching and small page sizes); no shared state between pages — each page boots from scratch, re-fetching data the previous page already had (acceptable — the REST API is fast, and pages are independent by design); Alpine.js has a smaller ecosystem than React/Vue — but it covers what TomeTrove's pages need (reactive forms, lists, conditional display).
- **Neutral**: the page set (7 pages) may grow as features are added — each new page is a new HTML document + Alpine app, following the same pattern; charts on the monitored/books pages will need a charting library (e.g. Chart.js) loaded only on those pages; the public list page is the only unauthenticated page — it follows the same pattern but without JWT in the API calls; Stitch's HTML output is a starting point, not production-ready — it needs adaptation for the tech stack (adding Alpine directives, fetch calls, real data binding).
