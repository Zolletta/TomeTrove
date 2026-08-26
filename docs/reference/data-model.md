# Data model reference

This is the reference for TomeTrove's data model: the tables, fields, types, and constraints. It is a reference, not a schema definition — the actual schema is defined in migrations ([ADR 0009](../explanation/adr/0009-schema-migrations.md)) and may differ in implementation details. For the design rationale and data-flow descriptions, see the [data model explanation](../explanation/data-model.md).

## User

Table: `user`

| Field              | Type     | Notes                            |
|--------------------|----------|----------------------------------|
| user_id            | PK       |                                  |
| user_github_id     | string   | From the Access JWT              |
| user_last_login_at | DATETIME | UTC (ADR 0020). Updated on login |
| user_created_at    | DATETIME | UTC (ADR 0020). Set once         |

### User preferences

Table: `user_preference`

| Field                           | Type        | Notes                                                                                                                                                       |
|---------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| user_id                         | FK → User   |                                                                                                                                                             |
| user_format_preference          | json        | Ordered list of accepted formats, best-to-worst (e.g. `["used", "new", "ebook"]`). Formats not listed are excluded.                                         |
| user_next_fetch_hour            | int (0-23)  | Hour at which monitored books are fetched daily (ADR 0014). Assigned round-robin when user elects first monitored book.                                     |
| user_alert_threshold_percentage | int (0-100) | Minimum percentage drop below baseline to trigger external notification (ADR 0014). Default 5. Example: 10 means alert when price drops 10% below baseline. |
| user_currency                   | string      | ISO 4217 code (e.g. `EUR`). Chosen by the user on first login from the union of all `store_currencies`. Price quotes are filtered to this currency.         |
| user_country                    | string      | ISO 3166-1 alpha-2 country code (e.g. `IT`). Chosen by the user on first login. Determines which stores ship to the user; drives the `user_store` junction. |

### User stores

Pre-computed junction of which stores are applicable for a user. Built by intersecting the user's preferences (currency, country, format) against store capabilities (`store_currencies`, `store_ships_to`, `store_sells_used`, `store_sells_ebooks`). Rebuilt for a single user whenever their `user_preference` row changes; rebuilt for all users when a `store` row is added or modified. The per-edition language filter (`store_languages` vs the edition's language) is still applied at fetch time — this table captures only the user-level criteria.

Table: `user_store`

| Field    | Type       | Notes |
|----------|------------|-------|
| user_id  | FK → User  |       |
| store_id | FK → Store |       |

**Primary key**: `(user_id, store_id)`.

### User languages

One row per (user, language). `user_language_allowed_type_id` lists the Types the user can read in this language (null or all 9 = all Types). Exactly one row per user has `user_language_preferred = true`.

Table: `user_language`

| Field                         | Type          | Notes                                                                                     |
|-------------------------------|---------------|-------------------------------------------------------------------------------------------|
| user_id                       | FK → User     |                                                                                           |
| language_id                   | FK → Language |                                                                                           |
| user_language_preferred       | boolean       | True for the user's primary reading language. Only one row per user.                      |
| user_language_allowed_type_id | json          | Array of Type IDs the user can read in this language. Null = all Types. Example: `[3, 5]` |

## Book

Table: `book`

| Field                     | Type          | Notes                                                                                                                                                                                                                     |
|---------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| book_id                   | PK            |                                                                                                                                                                                                                           |
| book_original_title       | string        | Title in the original language                                                                                                                                                                                            |
| book_original_language_id | FK → Language |                                                                                                                                                                                                                           |
| book_type_id              | FK → Type     | The editorial Type (one of 9 — see [ontology](ontology/index.md) and ADR 0018). Required.                                                                                                                                 |
| book_genre_id             | FK → Genre    | The Genre / discipline. Required. The `(book_type_id, book_genre_id)` pair must be valid (exists in `type_genre`). Provided by the metadata source (ADR 0004), normalization pipeline (ADR 0016), or OpenLibrary mapping. |
| book_openlibrary_id       | string (null) | OpenLibrary work ID (e.g. `OL27448W`). Populated when the book is imported from OpenLibrary.                                                                                                                              |
| book_googlebooks_id       | string (null) | Google Books volume ID (e.g. `zyTCAlFjzC`). Populated when the book is imported from Google Books.                                                                                                                        |

The book's additional classification levels (beyond Type and Genre) are stored as tags in the `book_ontology` junction — see [Classification ontology](#classification-ontology) below.

### Book ↔ Author / Curator

Table: `book_author`

| Field                | Type        | Notes                                              |
|----------------------|-------------|----------------------------------------------------|
| book_id              | FK → Book   |                                                    |
| author_id            | FK → Author |                                                    |
| book_author_role     | enum        | `author` or `curator`                              |
| book_author_position | int         | Order within the role (first author is position 0) |

**Constraint**: a book must have at least one row with `book_author_role = author` OR at least one row with `book_author_role = curator`.

## Edition

Table: `edition`

| Field                  | Type                  | Notes                                                                                                                                             |
|------------------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| edition_id             | PK                    |                                                                                                                                                   |
| book_id                | FK → Book             |                                                                                                                                                   |
| language_id            | FK → Language         | The language of this edition                                                                                                                      |
| publishing_house_id    | FK → Publishing House |                                                                                                                                                   |
| edition_isbn           | string (null)         | ISBN-10 or ISBN-13                                                                                                                                |
| edition_title          | string                | Title in this edition's language (may differ from original)                                                                                       |
| edition_published_year | YEAR (null)           | Year of publication. Used for edition recency filtering (most recent edition per language).                                                       |
| edition_url            | string (null)         | URL to the edition (e.g. on the publisher's site or a store). The store page shows the cover — no cover image is stored or referenced (ADR 0005). |
| edition_openlibrary_id | string (null)         | OpenLibrary edition ID (e.g. `OL3404981M`). Populated when imported from OpenLibrary.                                                             |
| edition_googlebooks_id | string (null)         | Google Books volume ID (e.g. `zyTCAlFjzC`). Populated when imported from Google Books.                                                            |

**Filtering rule**: for each book, list the most recent edition per language where: (a) the language is the book's original language, OR (b) the language is in the user's readable languages matrix AND the matrix allows it for the book's Type (ADR 0018). If multiple editions exist in the same language, show only the most recent (by `edition_published_year`).

### Edition TOC

Table: `edition_toc`

| Field                | Type          | Notes                                                                              |
|----------------------|---------------|------------------------------------------------------------------------------------|
| edition_toc_id       | PK            |                                                                                    |
| edition_id           | FK → Edition  |                                                                                    |
| author_id            | FK → Author   | The contributor (author or curator)                                                |
| edition_toc_role     | enum          | `author` or `curator`                                                              |
| edition_toc_position | int           | Order within the TOC (first entry is position 0)                                   |
| edition_toc_title    | string (null) | Title of the contribution in this edition's language (e.g. "The Yellow Wallpaper") |

### Publishing house

Table: `publishing_house`

| Field                 | Type          | Notes                                               |
|-----------------------|---------------|-----------------------------------------------------|
| publishing_house_id   | PK            |                                                     |
| publishing_house_name | string        | Display name (e.g. "Einaudi", "Penguin")            |
| publishing_house_url  | string (null) | Publisher's website (e.g. "https://www.einaudi.it") |

## Price quote

Table: `price_quote`

| Field                    | Type         | Notes                                                                                               |
|--------------------------|--------------|-----------------------------------------------------------------------------------------------------|
| price_quote_id           | PK           |                                                                                                     |
| edition_id               | FK → Edition |                                                                                                     |
| user_id                  | FK → User    | The user whose fetch triggered this quote (null for system/scheduled fetches)                       |
| store_id                 | FK → Store   |                                                                                                     |
| price_quote_datetime     | DATETIME     | UTC (ADR 0020). When the quote was fetched. Also used for the 1-hour cooldown on on-demand fetches. |
| price_quote_currency     | string       | ISO 4217 (e.g. `EUR`, `USD`)                                                                        |
| price_quote_price        | int          | Price in cents (integer, avoids float precision issues)                                             |
| price_quote_url          | string       | Direct link to the product page at this price                                                       |
| price_quote_is_used      | boolean      | Whether this is a used copy                                                                         |
| price_quote_is_ebook     | boolean      | Whether this is an ebook edition                                                                    |
| price_quote_is_baseline  | boolean      | Marks the baseline quote (first fetch when book is marked as monitored, ADR 0014)                   |
| price_quote_fetch_status | enum         | `success` or `error` — if `error`, the cooldown is bypassed for retry                               |

A quote is per (edition, date, store) — one price per store per day per edition. On-demand fetches store only the latest price per (edition, store); if a fetch fails, the previous price is kept and the failure is recorded via `price_quote_fetch_status`. For monitored books, all price attempts are saved during the month and consolidated into `price_quote_historic` at month-end (min, max, mean). Raw `price_quote` rows for the consolidated month are deleted after consolidation. Baseline quotes (`price_quote_is_baseline = true`) are preserved — they are used for alert notifications, not for historic trends.

## Price quote historic

Table: `price_quote_historic`

| Field                         | Type         | Notes                                      |
|-------------------------------|--------------|--------------------------------------------|
| price_quote_historic_id       | PK           |                                            |
| edition_id                    | FK → Edition |                                            |
| store_id                      | FK → Store   |                                            |
| price_quote_historic_month    | DATE         | First day of the month (e.g. `2026-01-01`) |
| price_quote_historic_type     | enum         | `min`, `max`, `mean`                       |
| price_quote_historic_currency | string       | ISO 4217 (e.g. `EUR`, `USD`)               |
| price_quote_historic_price    | int          | Price in cents                             |

**Unique constraint**: `(edition_id, store_id, price_quote_historic_month, price_quote_historic_type)`.

## Wish

Table: `wish`

| Field                      | Type            | Notes                                                                                                                                                |
|----------------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| wish_id                    | PK              |                                                                                                                                                      |
| user_id                    | FK → User       |                                                                                                                                                      |
| book_id                    | FK → Book       |                                                                                                                                                      |
| wish_created_at            | DATETIME        | UTC (ADR 0020). When the user added the book to their wish list.                                                                                     |
| wish_is_monitored          | boolean         | If true, this book is included in scheduled price fetching.                                                                                          |
| wish_baseline_refreshed_at | DATETIME (null) | UTC (ADR 0020). When the baseline was last refreshed. Set at election time; refreshed by the month-end consolidation job after 12 months (ADR 0014). |

**Constraint**: maximum 5 rows per `user_id` where `wish_is_monitored = true`. The baseline price quote is fetched when a book is first marked as monitored.

**Unique constraint**: `(user_id, book_id)` — a book can appear only once per user's wish list.

## List

Table: `list`

| Field                 | Type        | Notes                                                                                                  |
|-----------------------|-------------|--------------------------------------------------------------------------------------------------------|
| list_id               | PK          |                                                                                                        |
| user_id               | FK → User   |                                                                                                        |
| list_name             | string      | User-facing label (e.g. "Birthday list", "Christmas list")                                             |
| list_token            | string      | Random unguessable token (nanoid) — used in the share URL                                              |
| list_filter_types     | json        | Array of Type IDs to include (null/empty = all Types)                                                  |
| list_filter_genres    | json        | Array of Genre IDs to include (null/empty = all genres)                                                |
| list_filter_languages | json        | Array of language IDs to include (null/empty = all languages)                                          |
| list_expiration_date  | DATE (null) | If set, the list is auto-deleted after this date. Checked on user access and during scheduled fetches. |
| list_created_at       | DATETIME    | UTC (ADR 0020)                                                                                         |

**Unique constraints**: `(user_id, list_name)` and `list_token`.

## Classification ontology

The classification system is defined by ADR 0018 and documented in the [ontology reference](ontology/index.md). Translations are stored in the [`translation`](#translation) table (ADR 0019).

### Type

Table: `type`

| Field        | Type   | Notes                                         |
|--------------|--------|-----------------------------------------------|
| type_id      | PK     |                                               |
| type_slug    | string | Canonical English identifier (e.g. `fiction`) |
| type_name_en | string | English display name (e.g. `Fiction`)         |

**Unique constraint**: `type_slug`.

### Genre

Table: `genre`

| Field         | Type   | Notes                                         |
|---------------|--------|-----------------------------------------------|
| genre_id      | PK     |                                               |
| genre_slug    | string | Canonical English identifier (e.g. `mystery`) |
| genre_name_en | string | English display name (e.g. `Mystery`)         |

**Unique constraint**: `genre_slug`.

### type_genre

Table: `type_genre`

| Field    | Type       | Notes |
|----------|------------|-------|
| type_id  | FK → Type  |       |
| genre_id | FK → Genre |       |

**Primary key**: `(type_id, genre_id)`.

### Ontology

Table: `ontology`

| Field                   | Type                 | Notes                                                                |
|-------------------------|----------------------|----------------------------------------------------------------------|
| ontology_id             | PK                   |                                                                      |
| ontology_parent_id      | FK → Ontology (null) | Null for root nodes scoped by (type_id, genre_id)                    |
| ontology_scope_type_id  | FK → Type (null)     | Required for root nodes; null for child nodes (inherits from parent) |
| ontology_scope_genre_id | FK → Genre (null)    | Required for root nodes; null for child nodes (inherits from parent) |
| ontology_slug           | string               | Canonical English identifier                                         |
| ontology_name_en        | string               | English display name                                                 |
| ontology_is_open        | boolean              | True = children created on demand by the classifier. Default false.  |
| ontology_is_placeholder | boolean              | True for dynamic-modifier slot nodes (elided in display)             |

**Example — Essay/Music and Essay/Anthropology subtrees:**

| ontology_id | ontology_parent_id | ontology_scope_type_id | ontology_scope_genre_id | ontology_slug | ontology_name_en | ontology_is_open | ontology_is_placeholder |
|-------------|--------------------|------------------------|-------------------------|---------------|------------------|------------------|-------------------------|
| 100         | null               | 5 (Essay)              | 14 (Music)              | classical     | Classical        | false            | false                   |
| 101         | null               | 5                      | 14                      | critique      | Critique         | false            | false                   |
| 102         | null               | 5                      | 14                      | electronic    | Electronic       | false            | false                   |
| 103         | null               | 5                      | 14                      | history       | History          | false            | false                   |
| 104         | 103                | null                   | null                    | country       | <Country>        | true             | true                    |
| 105         | null               | 5                      | 14                      | instrument    | <Instrument>     | true             | true                    |
| 106         | null               | 5                      | 14                      | jazz          | Jazz             | false            | false                   |
| 107         | null               | 5                      | 14                      | monograph     | Monograph        | false            | false                   |
| 108         | null               | 5                      | 14                      | opera         | Opera            | false            | false                   |
| 109         | null               | 5                      | 14                      | pop           | Pop              | false            | false                   |
| 110         | null               | 5                      | 14                      | rock          | Rock             | false            | false                   |
| 111         | null               | 5                      | 14                      | theory        | Theory           | false            | false                   |
| 120         | null               | 5                      | 15 (Anthropology)       | critique      | Critique         | false            | false                   |
| 121         | null               | 5                      | 15                      | history       | History          | false            | false                   |
| 122         | 121                | null                   | null                    | country       | <Country>        | true             | true                    |
| 123         | null               | 5                      | 15                      | monograph     | Monograph        | false            | false                   |
| 124         | null               | 5                      | 15                      | theory        | Theory           | false            | false                   |

**Example classification — `Essay/Music/History/Italy`:**

| book_id         | ontology_id   | book_ontology_value | book_ontology_position |
|-----------------|---------------|---------------------|------------------------|
| 1               | 103 (History) | null                | 0                      |
| 104 (<Country>) | null          | "Italy"             | 1                      |

**Example classification — `Essay/Music/<Instrument>` (e.g. Piano):**

| book_id | ontology_id        | book_ontology_value | book_ontology_position |
|---------|--------------------|---------------------|------------------------|
| 2       | 105 (<Instrument>) | "Piano"             | 0                      |

### book_ontology

Table: `book_ontology`

| Field                  | Type          | Notes                                                   |
|------------------------|---------------|---------------------------------------------------------|
| book_id                | FK → Book     |                                                         |
| ontology_id            | FK → Ontology |                                                         |
| book_ontology_value    | string (null) | Filled for open placeholder nodes. Null for predefined. |
| book_ontology_position | int           | Order for hierarchical display (0-based)                |

**Primary key**: `(book_id, ontology_id)`.

### Translation

Unified translation table for all translatable ontology entities. Non-English translations only — the entity's own `_en` field is the canonical English and the fallback when no translation exists. See ADR 0019.

Table: `translation`

| Field                   | Type          | Notes                                                                     |
|-------------------------|---------------|---------------------------------------------------------------------------|
| translation_id          | PK            |                                                                           |
| translation_table_name  | enum          | `type`, `genre`, `ontology` — the table the entity belongs to             |
| translation_entity_id   | int           | PK of the entity being translated (in the `translation_table_name` table) |
| translation_language_id | FK → Language | The language of this translation                                          |
| translation_text        | string        | The translated text                                                       |

**Unique constraint**: `(translation_table_name, translation_entity_id, translation_language_id)` — one translation per entity per language.
**Index**: `(translation_table_name, translation_language_id)` for loading all translations for a language in a given table.

No foreign key from `translation_entity_id` to the entity tables — the `translation_table_name` discriminator makes a single FK impossible. Primary keys are inherently immutable and never reused, so orphans cannot occur from renames. Application-level validation checks that `(translation_table_name, translation_entity_id)` corresponds to an existing entity row before accepting a translation.

**Fallback chain**: `translation` table → entity's `_en` field. The `_en` field is always populated at seed time, so a displayable string is guaranteed.

## Language

Table: `language`

| Field                | Type   | Notes                                             |
|----------------------|--------|---------------------------------------------------|
| language_id          | PK     |                                                   |
| language_code        | string | ISO 639-1 (e.g. `it`, `en`, `fa`)                 |
| language_name_en     | string | English name (e.g. "Italian")                     |
| language_name_native | string | Native name (e.g. "Italiano", "Farsi", "English") |

## Author / Curator

Table: `author`

| Field                       | Type          | Notes                                                                                                                                                   |
|-----------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| author_id                   | PK            |                                                                                                                                                         |
| author_surname              | string        | Surname, extracted from `author_name_latin` for sorting.                                                                                                |
| author_name_latin           | string        | Romanized name in "Surname, Firstname" format (e.g. "Poe, Edgar Allan", "Tolstoj, Lev"). Always present.                                                |
| author_name_original        | string (null) | Name in the original script (e.g. "Толстой, Лев"). Null for Latin-script authors (Poe, Austen).                                                         |
| author_original_language_id | FK → Language | The language of the original script form. Null when `author_name_original` is null. Drives display: show original only when user's UI language matches. |
| author_aliases              | json          | Array of alternative names (e.g. `["E. A. Poe", "Edgar Poe"]`). Generated per [author normalization](author-normalization.md#alias-generation).         |
| author_wikidata_id          | string (null) | Wikidata item QID (e.g. `Q1734`). Stable and language-independent, unlike a per-language Wikipedia page id.                                             |
| author_openlibrary_id       | string (null) | OpenLibrary author ID (e.g. `OL26348A`). Populated from Wikidata `P648`, or when imported from OpenLibrary.                                             |
| author_googlebooks_id       | string (null) | Google Books author ID. Populated when imported from Google Books.                                                                                      |

**Display logic**: if `author_name_original` is null, show `author_name_latin`. If `author_name_original` is not null AND the user's UI language matches `author_original_language_id`, show `author_name_original`. Otherwise show `author_name_latin`.

**Pre-loaded**: the `author` table is pre-loaded from Wikidata before any user interaction (ADR 0016). Most authors already exist when a user enters a name. The mechanical rules that produce each field — name split, suffix and particle handling, script and language detection, alias permutations, disambiguation — are specified in [author normalization](author-normalization.md).

**Normalization rule**: for manual entry, the user picks from autocomplete suggestions (prefix search on `author_name_latin` and `author_aliases`, min 3 characters). For CSV import, the system resolves via exact alias match, then prefix-scoped Levenshtein on the pre-loaded authors (see ADR 0016). Which alias matches resolve automatically and which only produce candidates is specified in [author normalization](author-normalization.md#disambiguation).

## Store

Table: `store`

| Field                | Type    | Notes                                                                                                                       |
|----------------------|---------|-----------------------------------------------------------------------------------------------------------------------------|
| store_id             | PK      |                                                                                                                             |
| store_name           | string  | Display name (e.g. "Amazon.it", "ibs.it")                                                                                   |
| store_url            | string  | Base URL                                                                                                                    |
| store_implementation | string  | Identifier for the adapter/service that implements price fetching for this store                                            |
| store_languages      | json    | Array of language_id values this store is a good source for (e.g. Amazon.it is good for Italian and English, but not Farsi) |
| store_ships_to       | json    | Array of ISO 3166-1 alpha-2 country codes (e.g. `["IT", "DE"]`)                                                             |
| store_currencies     | json    | Array of ISO 4217 currency codes (e.g. `["EUR", "USD"]`)                                                                    |
| store_sells_used     | boolean | Whether the store sells used books                                                                                          |
| store_sells_ebooks   | boolean | Whether the store sells ebooks                                                                                              |

## Log

Application-level operational log. Written by a dedicated Logging Worker that receives events from the main Worker via `ctx.waitUntil()` (fire-and-forget). Covers system health and scheduled task output — not user activity. See [ADR 0023](../explanation/adr/0023-logging-and-monitoring.md).

Table: `log`

| Field      | Type     | Notes                                                           |
|------------|----------|-----------------------------------------------------------------|
| log_id     | PK       |                                                                 |
| log_time   | DATETIME | UTC (ADR 0020)                                                  |
| log_level  | enum     | `info`, `warn`, `error`                                         |
| log_source | enum     | `api`, `scheduled_fetch`, `consolidation`, `alert`, `auth`      |
| log_event  | string   | Machine-readable event name (e.g. `fetch_started`, `api_error`) |
| log_detail | json     | Structured details (book count, store ID, error message, trace) |

**Index**: `(log_source, log_time)` for filtering by source within a time range.
**Retention**: a scheduled job deletes rows older than 90 days (configurable).

Workers Logs (Cloudflare built-in) captures access-level logs (request method, path, status, duration) and `console.log()` / `console.error()` output as a fallback. This table captures application-level events that need long-term retention and SQL querying.
