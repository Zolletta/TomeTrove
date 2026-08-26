# ADR 0017: Public list sharing

- Status: Accepted
- Date: 2026-08-24

## Context

Users want to share their book list with others (e.g. for birthdays, holidays, gift-giving). The recipient should see a read-only public page with book titles, authors, and a link to the user's preferred store for each book — no authentication required, no prices, no personal info, no editing.

Requirements:

- User selects a subset of their book list: all books, by genre, by language, or a mix of filters.
- System generates a **share link** (public URL, no auth required).
- Anyone with the link sees: title, author, link to the user's preferred store for each book.
- The list is **built at runtime** from the stored filters — the share link stores only the filter criteria, not a snapshot of books. If the user adds or removes books from their collection, the shared page reflects the current state automatically.
- Links are **permanent** — since the list is runtime-generated from filters, there is no expiry. The user can revoke a named share to invalidate its link.
- User can have **multiple named shares** (e.g. "Birthday list", "Christmas list"), each with its own filters and link.

Constraints:

- The share page is public (no auth) — it must not expose user identity, prices, or any data beyond what's explicitly shared (title, author, store link).
- The share link must be unguessable — use a random token (UUID or nanoid), not a sequential ID.
- The preferred store link is determined at runtime from the user's preferences and store capabilities ([ADR 0013](0013-store-integration-architecture.md)) — it's the user's preferred store that ships to their country and carries the book's language.
- The share page is server-rendered ([ADR 0007](0007-frontend-delivery.md)) — no client-side app needed for visitors.

## Options

1. **Stored filters + runtime generation + named shares** — each named share stores filter criteria (genres, languages) and a random token. The share page queries the user's book list with those filters at request time. Permanent link (filters don't expire). User can revoke (delete the share). **Chosen.**
2. **Snapshot at share time** — store a copy of the book list at share time. The link always shows the same books even if the collection changes. Simpler to render (no filtering at request time) but stale; requires storage per share.
3. **Single user link + query string filters** — one permanent link per user (e.g. `tometrove.app/u/abc123`), filters encoded in the URL query string (`?genre=fiction&language=it`). No server-side storage of shares. Simplest but no named shares, no revocation per filter set.

## Decision

Adopt **option 1: stored filters + runtime generation + named shares**.

### Data model

New `shares` table:

| Field            | Type      | Notes                                                                |
|------------------|-----------|----------------------------------------------------------------------|
| id               | PK        |                                                                      |
| user_id          | FK → User |                                                                      |
| name             | string    | User-facing label (e.g. "Birthday list", "Christmas list")           |
| token            | string    | Random unguessable token (nanoid or UUID) — used in the share URL    |
| filter_genres    | json      | Array of genre IDs to include (null/empty = all genres)              |
| filter_languages | json      | Array of language IDs to include (null/empty = all languages)        |
| created_at       | datetime  |                                                                      |
| revoked_at       | datetime  | Nullable — if set, the share link is invalid (soft delete for audit) |

**Unique constraint**: `(user_id, name)` — a user can't have two shares with the same name.
**Unique constraint**: `token` — each share has a unique token.

### Share URL format

```
tometrove.app/share/{token}
```

Example: `tometrove.app/share/K7m2pX9qR4wL`

The token is a nanoid (15-20 chars, unguessable). No user ID in the URL — the token maps to the share (and thus the user) server-side.

### Share page rendering

When a visitor opens the share URL:

1. Look up the share by `token` — if not found or `revoked_at` is set, return 404.
2. Query the user's book list, filtered by `filter_genres` and `filter_languages` (if set; empty/null = all).
3. For each book, find the user's preferred store: the first actionable store ([ADR 0013](0013-store-integration-architecture.md): per-user capability filtering) that carries the book's edition language. Use the edition URL from the most recent price quote for that store.
4. Render a read-only HTML page (server-side, [ADR 0007](0007-frontend-delivery.md)) with:
   - Share name (e.g. "Birthday list")
   - List of books: title, author(s), link to preferred store
   - No prices, no user identity, no edit controls
5. The page is cacheable (short TTL, e.g. 5 minutes) since it's read-only and the book list doesn't change frequently.

### Store link resolution

The "preferred store" for each book on the share page is determined the same way as in the main app:

1. Get the user's preferences (preferred language, readable languages, prefers_used, excludes_ebooks, shipping country).
2. Filter the store registry ([ADR 0013](0013-store-integration-architecture.md)) by those preferences → actionable stores.
3. For the book's edition in the user's preferred language, find the most recent price quote from an actionable store.
4. Use that quote's `url` field as the store link.

If no quote exists for any actionable store, the store link is omitted (the book is still listed, just without a buy link).

### Creating a share

From the app (authenticated), the user:

1. Names the share (e.g. "Birthday list").
2. Selects filters: genres (from the genre tree), languages (from the languages table), or "all".
3. Clicks "Create share" → system generates a random token, stores the share, and displays the share URL.
4. The user copies the URL and shares it.

### Managing shares

From the app (authenticated), the user sees a list of all their named shares with the following options:

- **View**: see the share page as a visitor would (opens the public URL).
- **Rename**: change the share's name (e.g. "Birthday list" → "Birthday 2026"). The token and URL stay the same — only the label changes.
- **Delete (revoke)**: revoke the share. Sets `revoked_at` — the share link immediately returns 404. The share row is retained for audit (soft delete). This is irreversible from the UI (a new share with a new token would need to be created to share again).

## Consequences

- **Positive**: the list is always current — no stale snapshots; named shares let users organize different lists for different occasions; permanent links are simple (no expiry logic); revocation is instant and auditable; the share page is public (no auth barrier for gift-givers); server-side rendering ([ADR 0007](0007-frontend-delivery.md)) means the page works without JS and loads fast; the page is cacheable (short TTL) for performance; no personal info or prices are exposed — only title, author, and store link.
- **Negative**: the share page requires a database query at request time (filter the user's book list) — slightly more work than serving a snapshot; if the user has a very large collection and the share has no filters, the page could be long (pagination may be needed later); the preferred store link depends on existing price quotes — if no quote has been fetched for a book, there's no store link on the share page; the token must be unguessable (nanoid/UUID) to prevent enumeration of other users' shares.
- **Neutral**: the share page is a separate route from the main app (no auth middleware) — it needs its own route in the router ([ADR 0008](0008-http-routing.md)); the page styling should be simple and clean (it's a public-facing page representing the user's taste); the share page could later show cover images if [ADR 0005](0005-media-cover-storage.md) is revisited (currently no covers); pagination of the share page is a future enhancement if lists get long.
