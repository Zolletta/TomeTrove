# ADR 0005: Media / cover image storage

- Status: Accepted
- Date: 2026-08-24

## Context

Book metadata is fetched externally ([ADR 0004](0004-book-metadata-source.md)). [OpenLibrary](https://openlibrary.org/developers/api) provides a Covers API and [Google Books](https://developers.google.com/books) provides `imageLinks`. The question was whether to store cover image bytes locally, reference external cover URLs, or do nothing.

Constraints:

- Workers memory is 128 MB per isolate; never buffer large images in memory.
- Storing nothing means relying on a third-party URL that can rot (link rot, hotlinking blocks, CORS).
- [Cloudflare R2](https://developers.cloudflare.com/r2/) is S3-compatible blob storage with no egress fees and a native Workers binding.
- Cover images are non-critical — the app is fully functional without them.
- Each edition already has a `url` field pointing to the edition's page on a store or publisher site. Those pages display the cover image.

## Options

1. **Store nothing — hotlink the external cover URL** — zero storage cost; fragile (covers disappear when the source removes or blocks them).
2. **Mirror covers into R2 on add** — fetch once at add-time, store in R2, serve via a Worker route or a public R2 bucket. Durable; costs R2 storage.
3. **Store covers as BLOBs in the database** — rejected: TiDB free row storage is precious; BLOBs in the DB are an anti-pattern.
4. **Do nothing — no cover URL stored at all** — the edition's `url` field links to the store/publisher page, which shows the cover. The user sees the cover when they click through. Zero storage, zero image handling, zero external dependencies.

## Decision

Adopt **option 4: do nothing — no cover URL stored**.

Cover images are not stored, not referenced, and not fetched. Each edition has a `url` field pointing to the edition's page on a store or publisher site. That page displays the cover. The user sees the cover by clicking through. TomeTrove does not render cover images in its own UI.

## Consequences

- **Positive**: zero storage cost (no R2, no database BLOBs); zero infrastructure to maintain; zero image processing or proxying; zero external URL dependencies; zero Workers memory concerns; the data model is simpler (no `cover_url` field).
- **Negative**: the TomeTrove UI has no cover thumbnails — the book list is text-only; users must click through to a store to see a cover; if a store page removes the cover image, TomeTrove has no fallback.
- **Neutral**: if cover thumbnails in the UI become important later, this decision can be reversed by adding a `cover_url` field (option 1) or an R2 mirror step (option 2) without changing the core data model — the `book`, `edition`, and `author` tables already store the OpenLibrary/Google Books IDs (`book_openlibrary_id`, `book_googlebooks_id`, `edition_openlibrary_id`, `edition_googlebooks_id`, `author_openlibrary_id`, `author_googlebooks_id`) needed to reconstruct cover URLs. See the [data model reference](../../reference/data-model.md).
