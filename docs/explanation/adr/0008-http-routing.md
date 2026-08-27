# ADR 0008: HTTP routing & API structure

- Status: Accepted
- Date: 2026-08-24

## Context

The current `src/index.ts` is a single `fetch` handler that calls a Durable Object. TomeTrove needs a substantial set of REST endpoints, one per business object, each with its own route group.

Constraints:

- Workers' default handler is `ExportedHandler.fetch(request, env, ctx)`. A router keeps the switch-on-`URL.pathname` out of hand-rolled code.
- The author knows PHP routing (Laravel/Symfony controllers) — a router with a similar mental model lowers the barrier.
- Whatever we pick must be TS-first and Workers-compatible.
- Route handlers should use anonymous wrappers that call service methods ([ADR 0012](0012-method-binding-strategy.md)).
- Authentication is via JWT ([ADR 0006](0006-authentication-model.md)) — most endpoints require auth; public list sharing is the exception.
- **The UI consumes these REST endpoints and only these.** The frontend is a multi-page application — each page is a separate HTML document with its own JavaScript that fetches from the REST API. No SPA (no client-side routing, no single-page shell), no SSR (the server returns JSON, not pre-rendered HTML with data), no BFF layer (no intermediate layer that pre-shapes data for a specific view). The REST API is the sole contract between frontend and backend. This means: the API must be complete (every piece of data the UI needs has an endpoint); the API is the contract (versioning and backward compatibility matter); response shapes must be consistent across endpoints so the UI can have generic handling.

## API design

### Conventions

- **Plural route prefixes for collections**: `/api/books`, `/api/authors`, `/api/wishes`. `GET /api/books` lists books; `GET /api/books/:id` returns one book. The `:id` disambiguates list vs. single.
- **Singular route prefixes for singletons**: `/api/user/preferences` (one per user). No `:id` — the resource is scoped to the authenticated user.
- **Search is a query param on the list endpoint**: `GET /api/books?q=hamlet`, `GET /api/authors?q=poe`. Same endpoint for listing and searching — search is just a filter.
- **Non-CRUD actions are POST to a sub-resource**: `POST /api/editions/:id/prices` (on-demand fetch), `POST /api/wishes/import` (CSV import). Actions are modeled as creates on a sub-resource.
- **Child resources are nested under their parent**: editions under books, price quotes under editions. Direct lookup by ID is also supported via a flat route when the parent ID is not needed.

### Endpoints

The canonical, up-to-date list of endpoints — routes, methods, purposes, and auth scoping — lives in the [API endpoints reference](../../reference/api-endpoints.md). This ADR records the conventions and architecture; the reference is the single source of truth for the endpoint inventory and is kept current as new endpoints are added.

### Auth scoping

All endpoints under `/api/` require JWT authentication ([ADR 0006](0006-authentication-model.md)) except the public list share endpoint (`GET /api/lists/:token`, [ADR 0017](0017-public-wish-list-sharing.md)). User-scoped resources (wishes, lists, preferences, alerts) are automatically filtered to the authenticated user — no `:userId` in the path. The user ID is extracted from the JWT.

## Options

1. **[Hono](https://hono.dev/)** — the de-facto Workers router; TS-first; middleware chain (auth, error handling, logging); tiny; large ecosystem; route groups for per-resource organization; path parameters (`/api/books/:id`) with type inference. The frontend is a multi-page application that consumes these REST endpoints ([ADR 0007](0007-frontend-delivery.md)) — Hono serves the API, static assets serve the pages.
2. **[itty-router](https://itty.dev/)** — even smaller; functional style; less middleware ecosystem; no built-in route groups.
3. **Native `URL` switching** — no dependency; most boilerplate; closest to raw Workers; impractical for 30+ routes.

## Decision

Adopt **option 1: Hono**.

### Response conventions

Since the UI consumes only these endpoints, response shapes must be consistent and predictable:

- **Single resource**: the resource object as the JSON body (e.g. `GET /api/books/:id` → `{ "book_id": 1, "book_original_title": "Hamlet", ... }`).
- **Collections**: a JSON object with `data` (array of resources) and `_links` for pagination ([HATEOAS](https://en.wikipedia.org/wiki/HATEOAS)). Example:

```json
{
  "data": [
    { "book_id": 1, "book_original_title": "Hamlet", ... },
    { "book_id": 2, "book_original_title": "Macbeth", ... }
  ],
  "_links": {
    "self": { "href": "/api/books?cursor=eyJpZCI6MjB9&per_page=20" },
    "first": { "href": "/api/books?per_page=20" },
    "prev": { "href": "/api/books?cursor=eyJpZCI6MTB9&per_page=20" },
    "next": { "href": "/api/books?cursor=eyJpZCI6NDB9&per_page=20" },
    "last": { "href": "/api/books?cursor=eyJpZCI6OTkwfQ&per_page=20" }
  }
}
```

  - `self` — the current page. `first` — the first page (no cursor). `prev` — the previous page (omitted if on the first page). `next` — the next page (omitted if on the last page). `last` — the last page.
  - Changing `per_page` resets to the first page — cursor positions are relative to the page size, so a different `per_page` invalidates the current cursor. The `first` link uses the new `per_page` value.
  - The UI follows these links — it does not construct URLs or know cursor encoding.
  - No total count — the UI shows "first/prev/next/last" navigation, not "page 2 of 10". This avoids the expensive `COUNT(*)` query on large tables.
- **Errors**: a JSON object with `error` (machine-readable code) and `message` (human-readable) (e.g. `{ "error": "not_found", "message": "Book not found" }`). HTTP status code matches the error (400, 404, 409, 500).
- **Empty mutations**: `204 No Content` for DELETE and PATCH that don't return a body.
- **Created resources**: `201 Created` with the resource body.

### Pagination

All list endpoints use **cursor-based pagination** with HATEOAS links. The cursor is an opaque, URL-safe string encoding the position in the result set (typically the last seen PK). The UI passes `per_page` (default 20, max 100) and follows `next`/`prev` links from the response — it never constructs cursor values.

Cursor pagination is used uniformly on all list endpoints for consistency, even where offset pagination would be sufficient (small per-user collections like wishes and alerts). This gives the UI one generic pagination handler across all endpoints.

The ontology tree (`GET /api/ontology`) is an exception — it returns the full tree for a (type, genre) pair, not paginated. The tree is small (hundreds of nodes) and is rendered client-side as a whole.

### Route organization

Each business object gets its own route file under `src/routes/`, exporting a Hono instance with its routes. The main app composes them:

```typescript
// src/routes/books.ts — pseudocode, see ADR 0012 for method binding conventions
import { Hono } from "hono";
import { bookService } from "../services/book-service";

export const books = new Hono();

books.get("/", (c) => bookService.list(c.req.query("q"), c.req.param()));
books.post("/", (c) => bookService.create(c.req.json()));
books.get("/:id", (c) => bookService.get(c.req.param("id")));
books.put("/:id", (c) => bookService.update(c.req.param("id"), c.req.json()));
books.delete("/:id", (c) => bookService.delete(c.req.param("id")));
```

```typescript
// src/index.ts
import { Hono } from "hono";
import { books } from "./routes/books";
import { editions } from "./routes/editions";
// ... other route modules

const app = new Hono();
app.route("/api/books", books);
app.route("/api/editions", editions);
// ... mount other route modules
app.route("/api", api);

export default app;
```

### Middleware

Hono's middleware chain handles cross-cutting concerns:

- **Auth middleware** — validates the JWT ([ADR 0006](0006-authentication-model.md)), extracts the user ID, attaches it to the context. Applied to all `/api/` routes except the public list endpoint.
- **Error handler middleware** — catches service errors, maps them to HTTP status codes (400 for validation, 404 for not found, 409 for conflicts, 500 for internal errors).
- **Logging middleware** — request method, path, status, duration.

## Consequences

- **Positive**: Hono is the de-facto Workers router — well-documented, TS-first, large ecosystem; route groups per business object keep the codebase organized — each resource is a self-contained file; path parameters with type inference reduce boilerplate; middleware chain handles auth, error handling, and logging uniformly; the REST conventions (plural collections, singular singletons, query-param search, POST-to-sub-resource actions) are standard and predictable; search reuses the list endpoint — no extra routes; non-CRUD actions are RESTful (POST to sub-resource).
- **Negative**: a dependency on Hono — but it's tiny, Workers-native, and widely used; the number of route files grows with the number of business objects (acceptable — each is small and self-contained); nested routes (editions under books, price quotes under editions) require careful path parameter handling.
- **Neutral**: the frontend is a multi-page application consuming these REST endpoints ([ADR 0007](0007-frontend-delivery.md)) — Hono serves the API, static assets serve the HTML pages; the public list endpoint (`GET /api/lists/:token`) bypasses auth middleware — this is an explicit exception, not a gap.
