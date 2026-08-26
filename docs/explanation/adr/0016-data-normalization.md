# ADR 0016: Data normalization pipeline

- Status: Accepted
- Date: 2026-08-24

## Context

Users import book lists from CSV and enter books manually. The input is messy: misspelled author names ("William Shakespear" instead of "Shakespeare, William"), titles in the wrong language ("Amleto" instead of "Hamlet"), missing genres, missing ISBNs. The system must normalize this input into canonical book records.

Examples of normalization needed:

- "William Shakespear, Amleto" → author "Shakespeare, William", book "Hamlet" (original title), Italian edition "Amleto".
- "E. A. Poe" → "Poe, Edgar Allan" (via alias table).
- "Pride and Prejudice" with no genre → genre auto-filled to "Fiction > Romance" (or similar).
- ISBN lookup: given an ISBN, fetch the book metadata (title, author, publisher, language) from an external API and pre-fill the record.

The normalization pipeline runs on import (CSV) and on manual entry. It may also run asynchronously for slow operations (e.g. API lookups).

### Pre-loaded author database

The `author` table is pre-loaded from [OpenLibrary author dumps](https://openlibrary.org/developers/dumps) before any user interaction. The dump includes author names, alternate names, and OpenLibrary IDs. The import pipeline normalizes the dump into the TomeTrove schema:

- `author_name_latin` — romanized name in "Surname, Firstname" format (derived from the dump's `name` field).
- `author_name_original` — name in the original script, where available (derived from `alternate_names` containing non-Latin scripts, or from the author's language).
- `author_aliases` — JSON array from the dump's `alternate_names` field.
- `author_openlibrary_id` — the OpenLibrary author ID, used for deduplication.

The dump is refreshed periodically (re-imported to pick up new authors). This is a batch job, not a runtime concern.

The pre-loaded database means that when a user enters an author name, the canonical form probably already exists. The author table is not built incrementally from user input — it starts comprehensive and grows via dump refreshes. User-created authors (not found in the dump) are added as new rows and merged into the canonical pool at the next dump refresh.

Constraints:

- The author/curator table has an alias system (see [data model reference](../../reference/data-model.md): `author.author_aliases`) — exact alias matches are deterministic and fast. With the pre-loaded dump, the alias table is comprehensive from day one.
- Fuzzy matching (misspellings, transliterations) is needed for CSV import, where there is no interactive typing. Levenshtein distance against the pre-loaded authors, scoped by a prefix filter (first 3 characters of the surname), keeps the candidate set small (typically hundreds, not millions).
- Genre auto-fill requires either a rule-based mapping (ISBN → known genre) or an external API (OpenLibrary/Google Books often include genre/subject data — see [ADR 0004](0004-book-metadata-source.md)).
- The user should be able to review and correct normalization results — fully automatic normalization without review risks wrong matches.

## Options

1. **Rule-based only** — pre-loaded author database with autocomplete for manual entry, alias tables + prefix-scoped Levenshtein for CSV import, ISBN lookup for metadata. Deterministic, fast, no external dependencies beyond the OpenLibrary dump. Limited: won't catch "Shakespear" → "Shakespeare" if the CSV has a very different prefix, or resolve transliterations without a close prefix match.
2. **AI-assisted + user confirmation** — use an LLM (Workers AI or external) to resolve ambiguous entries (misspellings, transliterations, title translations) that the rule-based pass couldn't match. The LLM proposes a canonical form; the user confirms. More accurate for edge cases; adds latency and cost.
3. **Rules now, AI later** — start with rule-based (pre-loaded authors, autocomplete, alias tables, ISBN lookup, prefix-scoped Levenshtein for CSV). Add an AI second pass for entries the rules couldn't resolve. Pragmatic; defers AI complexity.
4. **Manual review only** — no automatic normalization; the user fixes everything by hand. Simplest; worst UX for large imports.

## Decision

Adopt **option 3: rules now, AI later**.

### Manual entry — interactive autocomplete

When a user types an author name in the UI, the system searches the pre-loaded `author` table with a prefix search on `author_name_latin` and `author_aliases`. The search is triggered only when the user has typed at least 3 characters and stopped typing (debounced). The system presents matching authors as autocomplete suggestions. The user picks the right one or creates a new author if no match is found.

This replaces post-hoc fuzzy matching for manual entry — the user self-normalizes by picking from suggestions. No Levenshtein is needed for this path; the prefix search is the filter, and the user's eyes are the matcher.

### CSV import — prefix-scoped Levenshtein with interactive resolution

CSV import processes author names in bulk, but resolves ambiguities interactively. For each author name in the CSV:

1. **Exact match** — check `author_name_latin` and `author_aliases` for an exact match. If found, use that author.
2. **Prefix-scoped Levenshtein** — extract the first 3 characters of the surname. Filter the `author` table to authors whose surname starts with those characters. Run Levenshtein distance on the candidates (typically hundreds). If exactly one match is below a threshold (e.g. distance ≤ 2), use that author.
3. **Ambiguous** — if multiple candidates are below the threshold, or no candidate is below the threshold but close matches exist, the system pauses and asks the user to pick from the candidates or create a new author. This is interactive — the user resolves the ambiguity during the import, not after.
4. **No match** — if no candidates are found at all, the system asks the user to confirm creating a new author.

### ISBN lookup

Given an ISBN, fetch the book metadata (title, author, publisher, language) from OpenLibrary or Google Books (see [ADR 0004](0004-book-metadata-source.md)) and pre-fill the record. The author from the API response is matched against the pre-loaded `author` table using the same exact-match + prefix-scoped Levenshtein approach.

### Genre auto-fill

Genre auto-fill uses OpenLibrary/Google Books subject data mapped to the TomeTrove ontology (see [ADR 0004](0004-book-metadata-source.md) and the [ontology mappings](../../reference/ontology/ontology-mappings.md)). If no mapping is found, the genre is left empty for the user to fill.

### AI second pass (future)

Entries where the user creates a new author during import (no match found) could benefit from an AI second pass that proposes a possible match the user missed. An LLM suggests a canonical form; the user confirms. This is deferred to a future phase — the interactive resolution with the pre-loaded database covers the majority of cases.

## Consequences

- **Positive**: the pre-loaded author database means most authors already exist — the match rate is high from day one; interactive autocomplete for manual entry gives the best UX (the user self-normalizes by picking from suggestions); CSV import uses prefix-scoped Levenshtein, which is fast (hundreds of candidates, not millions); aliases are pre-populated from the OpenLibrary dump, so exact alias matches cover many variants; the AI second pass is deferred — the rule-based pass is sufficient for launch.
- **Negative**: the OpenLibrary dump import is a one-time pipeline with its own complexity (deduplication, name normalization, encoding cleanup); the dump must be refreshed periodically to pick up new authors; the dump is large (~100-200MB compressed) and loading millions of rows into TiDB is a one-time cost; user-created authors (not in the dump) need to be merged at the next dump refresh — a merge conflict resolution strategy is needed; CSV import with interactive resolution means the user must be present during import — a large CSV with many ambiguities requires multiple rounds of user input.
- **Neutral**: the AI second pass (option 2) remains available as a future enhancement for edge cases; the genre auto-fill depends on the quality of the OpenLibrary/Google Books subject mapping (ADR 0004); the OpenLibrary author ID (`author_openlibrary_id`) is the deduplication key across dump refreshes — authors are matched by this ID, not by name, during refresh.
