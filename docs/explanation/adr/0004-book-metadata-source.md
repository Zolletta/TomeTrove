# ADR 0004: Book metadata source

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove needs book metadata (original title, original language, authors, curators, genre, tags, ISBN, publisher, edition info, cover). This data comes from two distinct sources, and they are separate problems:

1. **Book metadata** (bibliographic data) — title, authors, genre, ISBN, publisher, language, cover. Used to populate the book record and its editions. Needed at import time (CSV) and at manual entry time. This is a lookup: given an ISBN or title, fetch the canonical metadata.

2. **Store pricing data** — current prices at specific stores. This is a real-time or scheduled fetch against store-specific APIs/websites, not a bibliographic lookup. This is covered by [ADR 0013](0013-store-integration-architecture.md) (store integration architecture) and [ADR 0014](0014-scheduled-price-fetching.md) (scheduled fetching), not this ADR.

This ADR covers only the **book metadata** source.

Constraints:

- Manual entry of every field is tedious and error-prone, especially for imports of hundreds/thousands of books.
- The metadata feeds the normalization pipeline ([ADR 0016](0016-data-normalization.md)) — ISBN lookup can auto-fill most fields.
- Cover images are binary assets — see [ADR 0005](0005-media-cover-storage.md) for where they live.
- The system needs data in multiple languages (original language, edition titles and descriptions in edition languages) — not all APIs provide multilingual data.
- **Genre is a required field on the book record** (see [data model reference](../../reference/data-model.md)). The metadata source must be able to provide it, either directly (some APIs include subject/genre data) or via a mapping from API subjects to TomeTrove's genre tree. If the metadata source cannot provide a genre, the normalization pipeline ([ADR 0016](0016-data-normalization.md)) must fill it — but the metadata source is the first choice. The genre mapping problem is a separate concern (see [ontology mappings](../../reference/ontology/ontology-mappings.md)).

### OpenLibrary (primary)

[OpenLibrary](https://openlibrary.org/developers/api) — free, no API key, community-edited.

What it provides:
- **Works and editions** — a "work" is the abstract book (maps to TomeTrove's `Book`), editions are TomeTrove's `Edition` rows. The data model maps well.
- **Subjects and genre** — works have `subject`, `subject_place`, `subject_time`, and `genre` fields. The `genre` field is more structured (e.g. "Biography", "Fiction"); subjects are a flat folksonomy (e.g. "Runaway children -- Fiction"). Neither maps directly to TomeTrove's genre tree — see [ontology mappings](../../reference/ontology/ontology-mappings.md).
- **Authors** — with author IDs, so author details can be fetched and the author/alias table can be built.
- **Covers** — a dedicated Covers API (by ISBN or OL ID). Relevant for [ADR 0005](0005-media-cover-storage.md).
- **Multiple languages** — editions have language codes; titles are per-edition.
- **ISBN lookup** — search by ISBN returns the work + matching editions.
- **Batch search** — `search.json` returns multiple works per call, useful for CSV imports.

Rate limits (retrieved 2026-08-24 from `openlibrary.org/developers/api`):
- Default (no identification): 1 request/second.
- Identified (`User-Agent` header with app name + email): 3 requests/second.
- Usage policy: "not intended to serve as a bulk data backend." Fine for lookup-at-add-time; not for bulk scraping.

Caveats:
- Community-edited — data quality varies. Some works lack genre/subjects; some have inconsistent author names. Manual override is essential.
- Subjects are a flat folksonomy, not a structured tree — genre mapping required (see [ontology mappings](../../reference/ontology/ontology-mappings.md)).

### Google Books (fallback)

[Google Books API](https://developers.google.com/books) — free quota, requires an API key.

What it provides:
- **Broader coverage** — Google's index is larger, especially for recent editions and non-English works.
- **More consistent metadata** — publisher-provided data is often cleaner than community-edited.
- **Volume info** — title, authors, publisher, publishedDate, language, categories (Google's equivalent of genre), description, imageLinks.
- **ISBN search** — supported.

Caveats:
- API key required — free quota is 1,000 requests/day. Fine for TomeTrove's use case.
- Categories are coarse ("Fiction", "Literary Criticism", "Social Science") — less granular than OpenLibrary subjects. Still usable for genre auto-fill via the [ontology mappings](../../reference/ontology/ontology-mappings.md).
- No editions concept — Google Books returns "volumes" (individual books), not grouped into works with editions. The work/edition grouping must be done by TomeTrove (by title + author or ISBN overlap).

## Options

1. **Manual entry only** — user fills every field. Simplest; no external dependency; worst UX, especially for large CSV imports. Rejected.
2. **OpenLibrary primary + Google Books fallback + manual override** — search by ISBN or title, fetch metadata from OpenLibrary first; if OpenLibrary lacks data or the result is incomplete, fall back to Google Books; let the user edit the result. **Chosen.**
3. **External lookup, no override** — fastest to build, but locks out corrections. Rejected: community-edited data requires correction capability.
4. **Multiple APIs, merged** — query both APIs simultaneously, merge results, let the user pick. Most accurate; most complex; double the API calls. Rejected for now — the fallback approach (try one, then the other) is simpler and sufficient.

## Decision

Adopt **option 2: OpenLibrary as primary metadata source, Google Books as fallback, with manual override**.

When a user adds a book (via CSV import or manual entry), the system:

1. Searches OpenLibrary by ISBN (if available) or by title + author.
2. If OpenLibrary returns a result, pre-fills the book record and its editions from the work + edition data.
3. If OpenLibrary returns no result or incomplete data (e.g. missing genre), falls back to Google Books for the missing fields.
4. The user reviews and can override any field before saving.

Genre data from either API (OpenLibrary subjects/genre, Google Books categories) is passed through the genre mapping layer (see [ontology mappings](../../reference/ontology/ontology-mappings.md)) to assign a TomeTrove genre. If no mapping is found, the genre is left empty for the user or normalization pipeline ([ADR 0016](0016-data-normalization.md)) to fill.

## Consequences

- **Positive**: OpenLibrary is free with no API key — zero infrastructure cost for the primary source; the work/edition model maps directly to TomeTrove's data model, reducing transformation logic; Google Books as fallback covers coverage gaps, especially for recent or non-English editions; manual override ensures data quality is never locked behind API limitations; the batch search endpoint (`search.json`) supports CSV imports without excessive API calls.
- **Negative**: OpenLibrary's community-edited data quality varies — some works have missing or incorrect metadata, requiring user review; neither API provides genres in TomeTrove's tree structure — a genre mapping layer is required (see [ontology mappings](../../reference/ontology/ontology-mappings.md)), which is additional work; OpenLibrary's rate limits (3 req/s identified) require throttling for batch imports; Google Books requires an API key (a secret to manage in Workers — [ADR 0002](0002-cloudflare-workers-runtime.md)); Google Books has no work/edition concept, so the fallback path must do its own grouping logic.
- **Neutral**: the metadata source is decoupled from store pricing ([ADR 0013](0013-store-integration-architecture.md)/[0014](0014-scheduled-price-fetching.md)) — this ADR covers only bibliographic data; the normalization pipeline ([ADR 0016](0016-data-normalization.md)) handles author name resolution and title canonicalization, which is downstream of the metadata fetch; external source IDs (OpenLibrary work/edition/author IDs, Google Books volume IDs, ISBNs) are stored as columns on the `book`, `edition`, and `author` tables (`book_openlibrary_id`, `book_googlebooks_id`, `edition_openlibrary_id`, `edition_googlebooks_id`, `author_openlibrary_id`, `author_googlebooks_id`, `author_wikidata_id`, `edition_isbn`) — see [data model reference](../../reference/data-model.md) — for re-fetching, deduplication, and linking back to the source.
