# API endpoints

This is the canonical list of TomeTrove's REST API endpoints. For the routing architecture and response conventions, see [ADR 0008](../explanation/adr/0008-http-routing.md). For the frontend delivery model (multi-page app consuming these endpoints), see [ADR 0007](../explanation/adr/0007-frontend-delivery.md).

## Conventions

- **Plural route prefixes for collections**: `/api/books`, `/api/wishes`. `GET /api/books` lists; `GET /api/books/:id` returns one.
- **Singular route prefixes for singletons**: `/api/user/preferences` — scoped to the authenticated user, no `:id`.
- **Search is a query param on the list endpoint**: `GET /api/books?q=hamlet`. Same endpoint for listing and searching.
- **Non-CRUD actions are POST to a sub-resource**: `POST /api/editions/:id/prices` (on-demand fetch), `POST /api/wishes/import` (CSV import).
- **Child resources nested under their parent**: editions under books, price quotes under editions.
- **Cursor-based pagination** on all list endpoints, with HATEOAS `_links` (`self`, `first`, `prev`, `next`, `last`). No total count.
- **Auth**: all `/api/` endpoints require JWT authentication ([ADR 0006](../explanation/adr/0006-authentication-model.md)) except `GET /api/lists/:token` (public share). User-scoped resources are filtered to the authenticated user — no `:userId` in the path.

## Endpoints

### Authentication & user

| Route              | Method | Purpose                                                               | Auth | Source                                                         |
|--------------------|--------|-----------------------------------------------------------------------|------|----------------------------------------------------------------|
| `/api/user/me`     | GET    | Current user's profile (GitHub ID, display name, preferences status)  | Yes  | —                                                              |
| `/api/user`        | DELETE | Delete account and all associated data (physical deletion)            | Yes  | [ADR 0021](../explanation/adr/0021-data-erasure-and-export.md) |
| `/api/user/export` | GET    | Export user data as JSON download (`Content-Disposition: attachment`) | Yes  | [ADR 0021](../explanation/adr/0021-data-erasure-and-export.md) |

### Preferences

| Route                                 | Method | Purpose                                                            | Auth | Source                                              |
|---------------------------------------|--------|--------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/user/preferences`               | GET    | Get user preferences (currency, country, alert threshold, formats) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/user/preferences`               | PUT    | Update user preferences                                            | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/user/preferences/languages`     | GET    | List user's readable languages                                     | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/user/preferences/languages`     | POST   | Add a readable language                                            | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/user/preferences/languages/:id` | DELETE | Remove a readable language                                         | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Books

| Route            | Method | Purpose                                 | Auth | Source                                              |
|------------------|--------|-----------------------------------------|------|-----------------------------------------------------|
| `/api/books`     | GET    | List books (with optional `?q=` search) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/books`     | POST   | Create a book                           | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/books/:id` | GET    | Get one book                            | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/books/:id` | PUT    | Update a book                           | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/books/:id` | DELETE | Delete a book                           | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Editions

| Route                         | Method | Purpose                       | Auth | Source                                              |
|-------------------------------|--------|-------------------------------|------|-----------------------------------------------------|
| `/api/books/:bookId/editions` | GET    | List editions for a book      | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/books/:bookId/editions` | POST   | Add an edition to a book      | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/editions/:id`           | GET    | Get one edition (flat, by ID) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Prices

| Route                                      | Method | Purpose                                                                                                  | Auth | Source                                              |
|--------------------------------------------|--------|----------------------------------------------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/editions/:editionId/prices`          | GET    | List price quotes for an edition (recent)                                                                | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/editions/:editionId/prices`          | POST   | On-demand price fetch (1-hour cooldown, [ADR 0014](../explanation/adr/0014-scheduled-price-fetching.md)) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/editions/:editionId/prices/historic` | GET    | List historic price data (monthly min/max/mean from `price_quote_historic`)                              | Yes  | —                                                   |

### Authors

| Route              | Method | Purpose                                                                                                   | Auth | Source                                              |
|--------------------|--------|-----------------------------------------------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/authors`     | GET    | List/search authors (with `?q=`, min 3 chars — [ADR 0016](../explanation/adr/0016-data-normalization.md)) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/authors`     | POST   | Create an author (user-created, not in pre-loaded database)                                               | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/authors/:id` | GET    | Get one author                                                                                            | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/authors/:id` | PUT    | Update an author (e.g. fix name, add aliases)                                                             | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/authors/:id` | DELETE | Delete an author (only if no books reference it)                                                          | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Wishes

| Route                | Method | Purpose                                                                         | Auth | Source                                              |
|----------------------|--------|---------------------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/wishes`        | GET    | List user's wishes (supports `?q=` for search, `?monitored=true` for watchlist) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/wishes`        | POST   | Add a book to the wish list (creates wish + wish_edition rows)                  | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/wishes/:id`    | GET    | Get one wish (with acceptable editions and latest prices)                       | Yes  | —                                                   |
| `/api/wishes/:id`    | PATCH  | Update a wish (e.g. toggle `is_monitored` — elect/unwatch)                      | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/wishes/:id`    | DELETE | Remove a wish from the wish list                                                | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/wishes/import` | POST   | CSV import                                                                      | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Wish editions

Acceptable editions (alternatives) for a wish, tracked via the `wish_edition` junction table. See the [add-a-wish journey](../contributor/ux/user-journeys/add-a-wish.md) for the flows that create and replace these rows.

| Route                                 | Method | Purpose                                                                                   | Auth | Source |
|---------------------------------------|--------|-------------------------------------------------------------------------------------------|------|--------|
| `/api/wishes/:id/editions`            | GET    | List acceptable editions for a wish                                                       | Yes  | —      |
| `/api/wishes/:id/editions`            | POST   | Add an edition alternative to a wish                                                      | Yes  | —      |
| `/api/wishes/:id/editions/:editionId` | PUT    | Replace an edition (ISBN search finds a different edition for a book already in the list) | Yes  | —      |
| `/api/wishes/:id/editions/:editionId` | DELETE | Remove an edition alternative from a wish                                                 | Yes  | —      |

### Lists (shared wish lists)

| Route               | Method | Purpose                                                                                      | Auth | Source                                                          |
|---------------------|--------|----------------------------------------------------------------------------------------------|------|-----------------------------------------------------------------|
| `/api/lists`        | GET    | List user's shared lists                                                                     | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md)             |
| `/api/lists`        | POST   | Create a shared list (with filter criteria)                                                  | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md)             |
| `/api/lists/:id`    | GET    | Get one list (owner view, with filter config)                                                | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md)             |
| `/api/lists/:id`    | PATCH  | Rename a shared list (token and URL stay the same)                                           | Yes  | [ADR 0017](../explanation/adr/0017-public-wish-list-sharing.md) |
| `/api/lists/:id`    | DELETE | Delete/revoke a shared list                                                                  | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md)             |
| `/api/lists/:token` | GET    | Public list view (no auth — [ADR 0017](../explanation/adr/0017-public-wish-list-sharing.md)) | No   | [ADR 0008](../explanation/adr/0008-http-routing.md)             |

### Alerts (notifications)

| Route                  | Method | Purpose                                      | Auth | Source                                              |
|------------------------|--------|----------------------------------------------|------|-----------------------------------------------------|
| `/api/alerts`          | GET    | List alerts (supports `?unread=true` filter) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/alerts/:id`      | PATCH  | Mark one alert as read                       | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/alerts/read-all` | POST   | Mark all alerts as read                      | Yes  | —                                                   |

### Stores

| Route              | Method | Purpose                                                                  | Auth | Source                                              |
|--------------------|--------|--------------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/stores`      | GET    | List all stores                                                          | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/user/stores` | GET    | List stores applicable to the user (filtered by country/currency/format) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

### Reference data

| Route             | Method | Purpose                                                            | Auth | Source                                              |
|-------------------|--------|--------------------------------------------------------------------|------|-----------------------------------------------------|
| `/api/languages`  | GET    | List all languages (ISO 639-1)                                     | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/countries`  | GET    | List all countries (ISO 3166-1 alpha-2)                            | Yes  | —                                                   |
| `/api/currencies` | GET    | List all currencies (ISO 4217)                                     | Yes  | —                                                   |
| `/api/types`      | GET    | List the 9 ontology Types                                          | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/genres`     | GET    | List genres (optionally filtered by `?type_id=`)                   | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |
| `/api/ontology`   | GET    | List ontology nodes (optionally filtered by `?type_id=&genre_id=`) | Yes  | [ADR 0008](../explanation/adr/0008-http-routing.md) |

## Response conventions

- **Single resource**: the resource object as the JSON body.
- **Collections**: `{ "data": [...], "_links": { "self", "first", "prev", "next", "last" } }` — cursor-based pagination, HATEOAS links. No total count.
- **Errors**: `{ "error": "machine_code", "message": "Human-readable message" }` with matching HTTP status (400, 404, 409, 500).
- **Empty mutations**: `204 No Content` for DELETE and PATCH without a body.
- **Created resources**: `201 Created` with the resource body.

## Open questions

- **Shared list item removal**: the feature inventory lists `remove-share-items` (removing individual books from a shared list), but [ADR 0017](../explanation/adr/0017-public-wish-list-sharing.md) uses filter-based generation, not item-based snapshots. Resolving this may require either an exclusion list on the `list` table or a `list_item` junction table — and a corresponding endpoint (`DELETE /api/lists/:id/items/:bookId`).
- **Historic prices endpoint shape**: `GET /api/editions/:editionId/prices/historic` could return monthly aggregates only, or merge recent raw quotes with historic data. The wish-detail page needs both for its price history graph.
