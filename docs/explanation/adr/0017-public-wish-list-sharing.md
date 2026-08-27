# ADR 0017: Public list sharing

- Status: Accepted
- Date: 2026-08-24

## Context

Users want to share their book list with others (e.g. for birthdays, holidays, gift-giving). The recipient should see a read-only public page with book titles, authors, and a link to the user's preferred store for each book — no authentication required, no prices, no personal info, no editing.

Requirements:

- User selects a subset of their wish list: all books, by Type, by genre, by language, or a mix of filters.
- System generates a **share link** (public URL, no auth required).
- Anyone with the link sees: title, author, link to the user's preferred store for each book.
- The user can have **multiple named lists** (e.g. "Birthday list", "Christmas list"), each with its own link.
- The user can rename a list, remove individual wishes from a list, or revoke (delete) a list entirely.
- Lists can have an optional **expiration date** — expired lists are physically deleted by a daily cleanup job.

Constraints:

- The share page is public (no auth) — it must not expose user identity, prices, or any data beyond what's explicitly shared (title, author, store link).
- The share link must be unguessable — use a random token (nanoid), not a sequential ID.
- The preferred store link is determined at render time from the user's preferences and store capabilities ([ADR 0013](0013-store-integration-architecture.md)) — it's the user's preferred store that ships to their country and carries the book's edition language.
- The share page is server-rendered ([ADR 0007](0007-frontend-delivery.md)) — no client-side app needed for visitors.

## Options

1. **Stored filters + runtime generation** — each named list stores only filter criteria and a token; the share page queries the user's wish list with those filters at request time. Permanent link (filters don't expire). Simple storage, but the list cannot be edited per-item: removing a single book requires adding an exclusion list, and adding a book that does not match the filters is impossible.
2. **Materialized subset (snapshot of wishes, kept in sync)** — at creation time the filters populate a `list_item` junction linking the list to specific wishes. The list is then a concrete, editable subset: the owner can add or remove individual wishes without affecting their wish list. Removing a wish from the wish list automatically removes it from every list that contained it (via `ON DELETE CASCADE` on the junction). **Chosen.**
3. **Snapshot at share time (decoupled copy)** — store a copy of the book list at share time. The link always shows the same books even if the collection changes. Simpler to render but stale; requires storage per list; and decouples the list from the wish list entirely (a deleted wish would still appear on the shared page).

## Decision

Adopt **option 2: materialized subset, kept in sync with the wish list**.

A shared list is a **public subset of the user's wishes**. Filters are used only at creation time to seed the initial `list_item` rows; afterwards the list is a concrete, editable subset. This gives the user the same mental model as their wish list — they add and remove books — while staying linked to the underlying wishes so deletions propagate automatically.

### Data model

See the [data model reference](../../reference/data-model.md#list) for the canonical field definitions.

New `list` table:

| Field                 | Type        | Notes                                                                                                                                       |
|-----------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| list_id               | PK          |                                                                                                                                             |
| user_id               | FK → User   |                                                                                                                                             |
| list_name             | string      | User-facing label (e.g. "Birthday list", "Christmas list")                                                                                  |
| list_token            | string      | Random unguessable token (nanoid) — used in the share URL                                                                                   |
| list_filter_types     | json        | Array of Type IDs used to seed the list at creation (null/empty = all Types). Retained for reference; not consulted at render time.         |
| list_filter_genres    | json        | Array of Genre IDs used to seed the list at creation (null/empty = all genres). Retained for reference; not consulted at render time.       |
| list_filter_languages | json        | Array of language IDs used to seed the list at creation (null/empty = all languages). Retained for reference; not consulted at render time. |
| list_expiration_date  | DATE (null) | If set, the list is auto-deleted after this date. Checked on user access and by the daily cleanup cron.                                     |
| list_created_at       | DATETIME    | UTC ([ADR 0020](0020-datetime-convention.md))                                                                                               |

**Unique constraints**: `(user_id, list_name)` and `list_token`.

New `list_item` junction table:

| Field   | Type      | Notes                                                                                         |
|---------|-----------|-----------------------------------------------------------------------------------------------|
| list_id | FK → List |                                                                                               |
| wish_id | FK → Wish | `ON DELETE CASCADE` — when a wish is deleted, its `list_item` rows are deleted automatically. |

**Primary key**: `(list_id, wish_id)`.

The `wish_id` foreign key uses `ON DELETE CASCADE`. This is the key mechanism that keeps a shared list in sync with the wish list: if the user removes book A from their wishes, the corresponding `list_item` row disappears from every shared list that contained it — the visitor sees book A gone on next visit. But removing a `list_item` row (the "remove from this list" action) does **not** delete the underlying wish — book B stays in the user's wish list, it just no longer appears on the "mamma" list.

### Share URL format

```
tometrove.app/list/{list_token}
```

Example: `tometrove.app/list/K7m2pX9qR4wL`

The token is a nanoid (15-20 chars, unguessable). No user ID in the URL — the token maps to the list (and thus the user) server-side.

### Creating a list

From the app (authenticated), the user:

1. Names the list (e.g. "mamma").
2. Selects filters: Types, genres, languages, or "all".
3. Clicks "Create" → the system generates a random token, stores the `list` row, and **materializes** the initial `list_item` rows by selecting the user's wishes that match the filters.
4. The user copies the URL and shares it.

After creation, the filter columns are retained on the `list` row for reference (and a possible future "re-apply filters" action) but are **not** consulted when rendering the share page — the page reads the `list_item` junction.

### Managing lists

From the app (authenticated), the user sees a list of all their named lists with the following options:

- **View / preview**: see the share page as a visitor would (opens the public URL).
- **Rename**: change the list's name. The token and URL stay the same — only the label changes.
- **Add items**: add more wishes to the list (manual, beyond the original filter set).
- **Remove items**: remove individual wishes from the list. This deletes the `list_item` row only — the underlying wish is unaffected.
- **Delete (revoke)**: delete the list entirely. The `list` row and all its `list_item` rows are physically deleted; the public URL immediately returns 404.

### Share page rendering

When a visitor opens the share URL:

1. Look up the list by `list_token` — if not found, return 404.
2. Read the `list_item` junction to get the wishes in this list.
3. For each wish, find the user's preferred store: the first actionable store ([ADR 0013](0013-store-integration-architecture.md): per-user capability filtering) that carries the book's edition language. Use the edition URL from the most recent price quote for that store.
4. Render a read-only HTML page (server-side, [ADR 0007](0007-frontend-delivery.md)) with:
   - List name (e.g. "mamma")
   - List of books: title, author(s), link to preferred store
   - No prices, no user identity, no edit controls
5. The page is cacheable (short TTL, e.g. 5 minutes) since it's read-only and the book list doesn't change frequently.

### Store link resolution

The "preferred store" for each book on the share page is determined the same way as in the main app:

1. Get the user's preferences (preferred language, readable languages, currency, country, format preferences).
2. Filter the store registry ([ADR 0013](0013-store-integration-architecture.md)) by those preferences → actionable stores.
3. For the book's edition in the user's preferred language, find the most recent price quote from an actionable store.
4. Use that quote's `price_quote_url` field as the store link.

If no quote exists for any actionable store, the store link is omitted (the book is still listed, just without a buy link).

### Expiration

A list may have an optional `list_expiration_date`. The daily cleanup cron ([scheduled flows](../../reference/scheduled-flows.md#5-shared-list-expiration-cleanup)) deletes lists past their expiration date, even if the owner never logs in again. Expiration is also checked lazily on user access.

## Consequences

- **Positive**: the list is editable per-item — the user can curate exactly which wishes appear on each shared list, just like managing their wish list; the `ON DELETE CASCADE` on `list_item.wish_id` keeps shared lists honest — a deleted wish vanishes from every list automatically, with no stale references; named lists let users organize different lists for different occasions; revocation is instant and physical (no soft-delete audit retention needed for a personal app); the share page is public (no auth barrier for gift-givers); server-side rendering ([ADR 0007](0007-frontend-delivery.md)) means the page works without JS and loads fast; the page is cacheable (short TTL) for performance; no personal info or prices are exposed — only title, author, and store link.
- **Negative**: the list is a snapshot at creation time — wishes added to the wish list afterwards do **not** appear on an existing shared list automatically (the user must add them manually, or re-create the list). This is intentional (the user curates each list) but means a "all my wishes" list goes stale as new wishes are added; the share page requires a database query at request time (read the `list_item` junction) — slightly more work than serving a static snapshot, but the junction is small and indexed; the preferred store link depends on existing price quotes — if no quote has been fetched for a book, there's no store link on the share page; the token must be unguessable (nanoid) to prevent enumeration of other users' lists.
- **Neutral**: the share page is a separate route from the main app (no auth middleware) — it needs its own route in the router ([ADR 0008](0008-http-routing.md)); the page styling should be simple and clean (it's a public-facing page representing the user's taste); the share page could later show cover images if [ADR 0005](0005-media-cover-storage.md) is revisited (currently no covers); pagination of the share page is a future enhancement if lists get long; the retained filter columns could later power a "re-apply filters" action that re-seeds the `list_item` junction from the current wish list.
