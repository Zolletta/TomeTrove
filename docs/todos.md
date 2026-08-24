# TomeTrove — Architecture & Roadmap TODOs

Living document. Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` needs a decision from Veronica.

---

## 0. Framing (please confirm or correct)

**Working assumption:** TomeTrove is a personal (later multi-user) catalogue of *tomes* — books first,
possibly other media — split into what you **own** and what you **want** ("the definitive wish list"),
with metadata enrichment from external sources (ISBN lookup), tagging, notes, and shareable public
wishlists.

Secondary, equally important goal: **this repo is a TypeScript learning vehicle.** That biases several
decisions below towards "explicit and typed" over "magic and terse", even where the magic is popular.

- [?] Confirm the domain: books only, or books + comics/games/films?
- [?] Single-user (you) forever, or accounts + sharing? This is the single biggest architectural fork.
- [?] Is public sharing of a wishlist in scope (guest read-only links)?
- [?] Import/export expectations (Goodreads CSV, Calibre, StoryGraph)?
- [?] Do you want a mobile-installable PWA (offline reading of your own list + barcode scanning)?

**Non-goals (explicit, to keep scope honest):** no social feed, no recommendations engine, no
e-book storage/reading, no i18n in v1 (but no hard-coded English strings in the data layer).

---

## 1. Architecture decisions to make (ADR-style)

Record each of these as a short file in `docs/adr/NNN-title.md` once decided. One page each, "context /
decision / consequences". This is cheap and it is how you'll remember *why* in six months.

- [ ] **ADR-001 — Runtime & topology.** Recommendation: single Cloudflare Worker serving both the API and
  the static frontend (`assets` binding, already configured in `wrangler.jsonc`). One deploy, one origin,
  no CORS. Split into multiple Workers only when a piece needs a different lifecycle (e.g. a scheduled
  metadata refresher).
- [ ] **ADR-002 — Primary datastore.** See §2. Recommendation: **D1** for v1.
- [ ] **ADR-003 — HTTP layer.** Recommendation: **Hono**. Reason for a PHP veteran: it's the closest thing
  to Slim/Laravel routing in the Workers world, and its typed context/validator middleware teaches you
  generics *by using them* rather than by reading about them. Alternative: hand-rolled `fetch` +
  `URLPattern` — more learning per line, more boilerplate per feature.
- [ ] **ADR-004 — Validation & the type/runtime boundary.** Recommendation: **Zod** (or ArkType/Valibot) at
  every edge — request bodies, query params, external API responses, env. Key TS lesson here: types are
  *erased at runtime*; unlike PHP 8 typed properties, nothing checks your DTO at the boundary unless you
  do. Derive TS types from schemas (`z.infer`) rather than declaring both.
- [ ] **ADR-005 — Data access.** Recommendation: **Drizzle ORM** — SQL-first, schema-in-TypeScript,
  generated migrations, and its inferred result types are a superb (if occasionally brutal) generics
  lesson. Alternatives: Kysely (query builder only, simpler types) or raw `env.DB.prepare()` (best for
  learning D1 itself; consider starting here for the first 2–3 endpoints, then migrating).
- [ ] **ADR-006 — Frontend.** Recommendation: **React SPA + Vite via the Cloudflare Vite plugin**
  (`@cloudflare/vite-plugin`), served from the same Worker, `assets.not_found_handling =
  "single-page-application"`. If you'd rather learn server-rendered TS, React Router v8 or TanStack Start
  are the officially supported SSR options on Workers. Do **not** pick SSR *and* a new ORM *and* auth in
  the same milestone.
- [ ] **ADR-007 — Auth.** Recommendation: defer to M4. When you get there, either Better Auth (now has
  first-party D1/Kysely support) or a deliberately minimal OAuth-only flow (GitHub) with a signed
  session cookie in KV. If v1 is truly single-user, a single long-lived Cloudflare Access policy or one
  bearer secret is legitimate and buys you a month.
- [ ] **ADR-008 — Testing.** Recommendation: **`@cloudflare/vitest-plugin`** (v1 — this replaced
  `@cloudflare/vitest-pool-workers`; don't copy older tutorials). It runs tests *inside* workerd with real
  bindings and isolated per-test-file storage, so your D1 tests hit a real SQLite, not a mock. Add
  Playwright later, only for the 2–3 golden-path flows.
- [ ] **ADR-009 — Durable Objects: keep or delete?** The template ships `MyDurableObject`. There is no
  obvious v1 use case for it; a wishlist is not a coordination problem. Recommendation: **remove it from
  `src/` and `wrangler.jsonc` in M0** (removing a DO namespace later requires a `deleted_classes`
  migration — cheapest now, while nothing is deployed). Revisit if you add real-time collaborative lists,
  per-user rate limiting, or a scan-session queue.
- [ ] **ADR-010 — Config, secrets, environments.** `wrangler secret put` for secrets, `vars` for non-secrets,
  a `staging` environment in `wrangler.jsonc`, and never a `.env` in git. Validate `Env` with Zod at
  startup so a missing binding fails loudly rather than as `undefined` three layers down.

---

## 2. The storage question: D1 vs TiDB (my recommendation, with reasoning)

**Recommendation: start on D1. Design so that swapping is a repository-layer change, not a rewrite.**

| | Cloudflare D1 | TiDB Cloud (Starter/Essential) |
|---|---|---|
| Engine | SQLite, serverless, per-database | MySQL-compatible distributed SQL (HTAP) |
| Access from a Worker | Native binding (`env.DB`), zero network setup | `@tidbcloud/serverless` HTTP driver (Workers cannot open raw TCP), or Hyperdrive + a MySQL driver |
| Latency | Same-datacenter-ish; global **read replication** via the Sessions API | Public endpoint over HTTP; one region; every query is an internet round trip |
| Ops | None | Account, connection string as a secret, IP/endpoint config |
| Fit for TomeTrove v1 | Excellent — read-heavy, small dataset, relational | Overkill until you have analytics or 100GB+ |

Concrete triggers that would justify TiDB (write them down now, check them later): you need MySQL
compatibility for an existing tool; the dataset outgrows D1's per-database limits; you want real
analytical queries (TiFlash) over a large corpus; you need a single database far larger than D1 targets.
Also note that if you go MySQL, **Hyperdrive** is the other supported path and lets you keep ordinary
drivers/ORMs.

- [ ] Pick one and write ADR-002.
- [ ] Keep all SQL behind `src/db/repositories/*` with hand-written interfaces (e.g. `TomeRepository`).
  This is the *only* structural insurance policy you need for a possible TiDB migration — and it's also
  where TS interfaces will click for you, since they're the same idea as PHP interfaces minus the
  `implements` ceremony (structural, not nominal — worth understanding early).
- [ ] Decide read-replication posture for D1: if you use it, all reads must go through the **Sessions API**
  (`env.DB.withSession(...)`) or they silently hit the primary only. Note Drizzle's support for this is
  still rough — check before committing.
- [ ] Add KV (or the Cache API) only for one purpose in v1: caching third-party ISBN lookups. Don't make
  KV a second source of truth.

---

## 3. Draft data model (v1)

Deliberately small. Two ideas worth internalising: a *work* (the thing you want) is not an *edition*
(the copy you own), and "owned" vs "wanted" is a **status on a user-item relation**, not two tables.

- `work` — canonical title, subtitle, original_language, first_published_year, external ids (OpenLibrary,
  Google Books), cover_url
- `author` + `work_author` (m2m, with `role`: author/translator/illustrator)
- `edition` — belongs to `work`; isbn13, publisher, published_year, format (hardcover/paperback/ebook/audio), page_count
- `item` — the user's relation to a `work` (and optionally a specific `edition`): `status` ∈
  `{wanted, owned, reading, read, abandoned, lent_out}`, `priority`, `acquired_at`, `price_paid`,
  `source_url`, `notes`
- `tag` + `item_tag` (m2m) — free-form shelves; avoid a rigid category tree
- `user` (from M4 on) — plus `session` if you roll your own auth
- Indices: `edition.isbn13` unique, `item(user_id, status)`, FTS5 virtual table for title/author search
  (SQLite FTS is available in D1 and will beat any `LIKE '%…%'` you write)

- [ ] Model this in `src/db/schema.ts` (Drizzle) and generate the first migration.
- [ ] Decide ID strategy: recommendation **UUIDv7 / ULID strings** over autoincrement — shareable,
  non-guessable, safe to generate client-side for offline entry.
- [ ] Decide soft-delete (`deleted_at`) yes/no now; retrofitting it is tedious.
- [ ] Write a seed script with ~30 real books so the UI is never developed against an empty list.

---

## 4. Milestones

### M0 — Foundations (repo hygiene, no features)

- [ ] Remove the Durable Object scaffold (per ADR-009) or explicitly keep it with a reason.
- [ ] Add ESLint (typescript-eslint, **type-aware** rules) + Prettier wired to the existing `.prettierrc`.
- [ ] Tighten `tsconfig.json`: add `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `verbatimModuleSyntax`; move `moduleResolution` to `bundler`. These four flags are
  where TypeScript stops being "PHP with annotations" and starts teaching you something.
- [ ] Add npm scripts: `typecheck`, `lint`, `format`, `test`, `db:generate`, `db:migrate:local`, `db:migrate:prod`.
- [ ] GitHub Actions CI: install → `typecheck` → `lint` → `test` on PRs. Cheap, and it makes the type
  errors non-negotiable.
- [ ] Pre-commit hook (husky + lint-staged) running format + typecheck on staged files.
- [ ] `docs/adr/` skeleton + `README` rewrite (what it is, how to run it, how to deploy).
- [ ] Decide branch/PR conventions and whether `main` deploys automatically (Workers Builds).

### M1 — Walking skeleton (one vertical slice, end to end)

- [ ] `GET /api/health` returning typed JSON — the "hello world" that proves the toolchain.
- [ ] D1 database created, first migration applied locally and remotely, binding + `wrangler types` run.
- [ ] `POST /api/items` + `GET /api/items` for a minimal `item` with a title only.
- [ ] Zod-validated request/response, typed error envelope (`{ error: { code, message, details? } }`).
- [ ] One integration test per endpoint under the Workers Vitest integration.
- [ ] Deploy to `*.workers.dev` and confirm it works in production before adding anything else.

### M2 — Real domain

- [ ] Full schema from §3 + migrations.
- [ ] CRUD for works/editions/items, status transitions, tags.
- [ ] Search: FTS5 + filters (status, tag, author), cursor pagination (not `OFFSET` — teach yourself
  keyset pagination once and use it forever).
- [ ] ISBN lookup against OpenLibrary/Google Books with a KV cache and a typed adapter per provider.
- [ ] CSV import (Goodreads/StoryGraph) and JSON export of everything you own.

### M3 — Frontend

- [ ] Scaffold React + Vite via the Cloudflare Vite plugin inside this repo; keep the Worker as the API.
- [ ] Share types between client and server from a single `src/shared/` module — the payoff moment for TS
  after 26 years of hoping the API response looked like you remembered.
- [ ] Data fetching with TanStack Query; optimistic add-to-wishlist.
- [ ] Screens: list/grid with filters, detail, quick-add by ISBN, tag management.
- [ ] Accessibility and keyboard-first add flow (you'll use this app from a keyboard).
- [ ] PWA + offline read-only cache; barcode scanning via `BarcodeDetector` where available.

### M4 — Multi-user & sharing

- [ ] Auth (ADR-007), `user_id` scoping on every query — add it at the repository layer, not per-route.
- [ ] Public share links for a wishlist (opaque token, read-only, revocable).
- [ ] Rate limiting on public endpoints (Workers Rate Limiting binding, or a DO if you need fairness).

### M5 — Operability

- [ ] Structured JSON logging + Workers Logs/Tail; a `request_id` on every response.
- [ ] Error tracking (Sentry or Workers' own observability — already `enabled` in `wrangler.jsonc`).
- [ ] Analytics Engine for cheap product metrics (items added per week) instead of bolting on SaaS.
- [ ] Backups: scheduled D1 export to R2 via a Cron Trigger, plus a documented restore drill you have
  actually performed once.
- [ ] Staging environment + a smoke test that runs post-deploy.

### M6 — Nice-to-haves (park here, don't let them leak upstream)

- [ ] Price/availability watchers per wanted item (Cron + Queues).
- [ ] Duplicate/near-duplicate detection across editions.
- [ ] Workers AI: cover-image OCR for spine photos, or "books like this" over embeddings in Vectorize.
- [ ] Lending tracker with reminders.

---

## 5. TypeScript learning track (mapped from your PHP background)

Sequenced so each milestone forces the next concept. Tick these off as you *use* them, not as you read them.

- [ ] **Structural typing** — TS types match by shape, PHP interfaces by name. Explains most early surprises.
- [ ] **Types are erased.** No runtime enforcement, no reflection. Hence Zod at every boundary (§ADR-004).
- [ ] **`unknown` over `any`**, and never `as` unless you've proven it. Treat `any` as a code smell; ban it
  in ESLint from day one so the habit never forms.
- [ ] **Union types + discriminated unions + exhaustive `switch`** — the single biggest expressiveness win
  over PHP. Model `status` and your error envelope this way.
- [ ] **`strictNullChecks` thinking** — `T | undefined` is the honest signature; embrace it rather than
  defaulting.
- [ ] **Generics**, learned by reading Hono's and Drizzle's signatures rather than tutorials.
- [ ] **`type` vs `interface`**, `readonly`, `satisfies` (note `satisfies ExportedHandler<Env>` already in
  `src/index.ts` — understand that line, it's a good one).
- [ ] **Modules**: ESM only, no CommonJS, no barrel-file sprawl.
- [ ] **Async**: `Promise`, `await`, and the Workers-specific `ctx.waitUntil` — plus the fact that a Worker
  has no long-lived process, no `$_SESSION`, no autoloading, and a CPU-time budget per request. This is
  the biggest mental shift from PHP-FPM, bigger than the language itself.
- [ ] **Tooling literacy**: `tsc --noEmit` as your compiler, `package.json` scripts as your Makefile,
  lockfile discipline.

---

## 6. Immediate next actions (this week)

1. [ ] Answer the `[?]` questions in §0.
2. [ ] Decide ADR-002 (D1 vs TiDB) and ADR-009 (drop the Durable Object).
3. [ ] Do all of M0 in one PR — boring, mechanical, and it makes every later PR faster.
4. [ ] Then M1 as a single vertical slice, deployed. Resist starting the UI before that is live.
