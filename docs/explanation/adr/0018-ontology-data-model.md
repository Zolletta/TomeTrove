# ADR 0018: Book classification ontology data model

- Status: Accepted
- Date: 2026-08-25

## Context

TomeTrove's book classification ontology (see the [ontology explanation](../ontology/index.md) and [ontology reference](../../reference/ontology/index.md)) defines a hierarchy:

- **Type** — mandatory, one of 9 closed values (Fiction, Poetry, Theatre, Comics, Essay, Memoir, Manual, Travel, Reference).
- **Genre** — mandatory, the discipline or subject (Mystery, Physics, Music, …).
- **Additional levels** — optional, added when the content requires further specification (e.g. `Mystery/Investigation`, `Music/Jazz`, `Essay/Literature/History/Italy`).

The ontology also defines **dynamic modifiers** — placeholders the classifier fills at classification time (`<Cuisine>`, `<Faith>`, `<Continent>`, `<Country>`, `<Sport>`, `<Animal>`, `<Instrument>`, `<Language>`, `<ProgrammingLanguage>`, `<Culture>`, `<Argument>`). Some modifiers draw from a **fixed vocabulary** (continents: 6 values; faiths: 13 values); others are **open** (countries, sports, animals — the classifier supplies the value).

The user's guidance for this data model:

- **Type and Genre are fields** (columns on the book), not segments of a path string. This means the `/` separator is a notation concern, not a storage concern — the string is rendered from fields, never stored as a blob.
- **The other levels are tags** — they can be present or not; the subset to choose from comes from the Type and Genre chosen; some have a defined list (continents, faiths), others are free-form (countries, sports).
- **All levels are translatable** — English is the default and canonical language, stored in the entity's `_en` field (`type_name_en`, `genre_name_en`, `ontology_name_en`). Non-English translations live in a unified `translation` table keyed by `(table_name, entity_id, language_id)` ([ADR 0019](0019-ontology-i18n.md)). At launch, only English exists; additional languages are added by volunteers in a future phase. Language names (`language_name_en`, `language_name_native`) are intrinsic to the `language` entity and are not translated via the `translation` table.

Constraints from the platform (TiDB, per [TiDB limitations](https://docs.pingcap.com/tidb/stable/tidb-limitations/)):

- Maximum 1017 columns per table (adjustable up to 4096) — the design must not require wide tables, but the limit is generous.
- Maximum 64 indexes per table (adjustable up to 512) — the design must keep indexes focused.
- Maximum 6 MiB per row (adjustable up to 120 MiB) — not a concern for the ontology tables.
- Distributed HTAP database — the classification lookup for a book must be a small number of indexed queries; cross-region latency is mitigated by keeping lookups on indexed columns.

## Options

### Option 1 — Single classification string column

Store the full classification as a string on the book (e.g. `Fiction/Mystery/Investigation`). Render and parse the string at runtime.

- **Pros**: simplest schema (one column); matches the notation exactly.
- **Cons**: cannot query by Type or Genre without string parsing (no index usage); cannot enforce the controlled vocabulary; cannot translate individual levels without parsing; violates the user's explicit guidance that Type and Genre are fields. Rejected.

### Option 2 — Fixed-depth columns (type, genre, level1, level2, level3)

Store Type and Genre as columns, plus a fixed number of "level" columns for the additional levels.

- **Pros**: queryable by Type and Genre; simple.
- **Cons**: the ontology has variable depth (some classifications are 2 levels, some are 5); fixed columns either truncate deep classifications or waste columns on shallow ones; dynamic modifiers with open vocabularies don't fit a fixed-column model. Rejected.

### Option 3 — Type + Genre as fields, remaining levels as tags (chosen)

Store Type and Genre as columns on the book (foreign keys to controlled-vocabulary tables). Store the additional levels as **tags** in a junction table, where each tag is a node in a scoped tag tree. The tag tree defines which tags are valid for a given (Type, Genre) pair, and each tag node declares whether its vocabulary is fixed (predefined children) or open (children created on demand).

- **Pros**: matches the user's guidance exactly; Type and Genre are indexed, queryable fields; variable-depth classifications are natural (a book has 0..N tags); dynamic modifiers are modeled as tag nodes with a vocabulary type; fixed vocabularies are validated, open ones are free-form; the tag tree is small and fully indexed; translations are handled by a unified `translation` table ([ADR 0019](0019-ontology-i18n.md)) — no schema changes for new languages.
- **Cons**: more tables than a string column; reconstructing the full classification path requires joining the book's tags with the tag tree (but this is a small, indexed query per book); the tag tree must be seeded and maintained.

### Option 4 — EAV (entity-attribute-value)

Store levels as attribute-value pairs in a generic EAV table.

- **Pros**: maximally flexible.
- **Cons**: EAV is an anti-pattern for relational databases; queries become complex; no referential integrity on values; harder to validate vocabularies. Rejected.

## Decision

Adopt **option 3: Type + Genre as fields, remaining levels as tags**.

### Entities

The field names below are conceptual. The actual field names follow the table-prefixed convention in the [data model reference](../../reference/data-model.md) (e.g. `type_id`, `type_slug`, `type_name_en`). The table named `tag` here is named `ontology` in the reference; the `vocabulary_type` enum is replaced by the `ontology_is_open` boolean plus `ontology_is_placeholder`.

#### `type` — the 9 Types

The closed list of editorial Types. Seeded by migration; never modified at runtime.

| Field   | Type   | Notes                                         |
|---------|--------|-----------------------------------------------|
| id      | PK     |                                               |
| slug    | string | Canonical English identifier (e.g. `fiction`) |
| name_en | string | English display name (e.g. `Fiction`)         |

**Unique constraint**: `slug`.

The 9 rows: `fiction`, `poetry`, `theatre`, `comics`, `essay`, `memoir`, `manual`, `travel`, `reference`.

#### `genre` — disciplines / subjects

Genres are global (unique by slug) because the same genre name can appear under multiple Types (e.g. `Mystery` appears under both Fiction and Comics; `History` appears under Essay as a discipline and as a setting level under Fiction). The validity of a (Type, Genre) pair is declared in the `type_genre` junction.

| Field   | Type   | Notes                                         |
|---------|--------|-----------------------------------------------|
| id      | PK     |                                               |
| slug    | string | Canonical English identifier (e.g. `mystery`) |
| name_en | string | English display name (e.g. `Mystery`)         |

**Unique constraint**: `slug`.

#### `type_genre` — valid (Type, Genre) pairs

Declares which genres are valid for which type. Drives the UI: when a user selects a Type, the genre dropdown is populated from this junction.

| Field    | Type       | Notes |
|----------|------------|-------|
| type_id  | FK → type  |       |
| genre_id | FK → genre |       |

**Primary key**: `(type_id, genre_id)`.

#### `tag` — the additional levels (scoped tag tree)

A tag is a node in a tree scoped by (Type, Genre). Root tags have `parent_id = null` and are scoped to a (Type, Genre) pair. Child tags inherit the scope of their parent. Each tag declares its vocabulary type:

- `fixed` — the tag has predefined children (also rows in this table). The classifier selects from existing children. Example: `<Faith>` is a fixed-vocabulary tag with 13 children (Catholic, Protestant, Islam, …).
- `open` — the classifier supplies the value at classification time. The value is created as a child tag on demand (if it does not already exist). Example: `<Country>` is an open-vocabulary tag; the classifier adds `Italy` as a child if it doesn't exist.
- `leaf` — the tag is a terminal value with no children. Example: `Investigation` under (Fiction, Mystery) is a leaf tag.

| Field           | Type              | Notes                                                              |
|-----------------|-------------------|--------------------------------------------------------------------|
| id              | PK                |                                                                    |
| parent_id       | FK → tag (null)   | Null for root tags scoped by (type_id, genre_id)                   |
| scope_type_id   | FK → type (null)  | Required for root tags; null for child tags (inherits from parent) |
| scope_genre_id  | FK → genre (null) | Required for root tags; null for child tags (inherits from parent) |
| slug            | string            | Canonical English identifier                                       |
| name_en         | string            | English display name                                               |
| vocabulary_type | enum              | `fixed`, `open`, or `leaf`                                         |
| sort_order      | int               | Display order among siblings (alphabetical by default)             |

**Unique constraint**: `(parent_id, slug)` — a tag's slug is unique among its siblings. For root tags, this is `(NULL, slug)` scoped by `(scope_type_id, scope_genre_id)`, so the full uniqueness is enforced via a composite unique index on `(COALESCE(parent_id, 0), scope_type_id, scope_genre_id, slug)`.

**Index**: `(scope_type_id, scope_genre_id)` for root-tag lookups; `parent_id` for child-tag lookups.

#### `book` — classification fields

The `book` table has two fields for classification:

| Field    | Type       | Notes                              |
|----------|------------|------------------------------------|
| type_id  | FK → type  | The editorial Type (mandatory)     |
| genre_id | FK → genre | The Genre / discipline (mandatory) |

**Constraint**: `(type_id, genre_id)` must exist in `type_genre` — the pair must be valid.

#### `book_tag` — tags applied to a book

The additional levels applied to a book. A book has 0..N tags. The order matters for hierarchical display (e.g. `Essay/Literature/History/Italy` — `History` before `Italy`).

| Field    | Type      | Notes                                  |
|----------|-----------|----------------------------------------|
| book_id  | FK → book |                                        |
| tag_id   | FK → tag  |                                        |
| position | int       | Order within the book's tags (0-based) |

**Primary key**: `(book_id, tag_id)`. **Index**: `book_id` for loading a book's tags; `tag_id` for reverse lookups (which books have this tag).

### How a classification is stored and reconstructed

**Storing** `Essay/Literature/History/Italy`:

1. `book.type_id` → `Essay`, `book.genre_id` → `Literature`.
2. Look up or create root tag `History` scoped to (Essay, Literature), `vocabulary_type = leaf`. Add to `book_tag` at position 0.
3. Look up or create child tag `Italy` under `History`, `vocabulary_type = leaf`. Add to `book_tag` at position 1.

**Reconstructing** the classification string for display:

1. Read `book.type_id` → Type name (from `type_name_en` or the `translation` table). Read `book.genre_id` → Genre name (from `genre_name_en` or the `translation` table).
2. Read `book_ontology` rows ordered by `position`, joining `ontology` for each `ontology_name_en` (or the `translation` table).
3. Render as `Type/Genre/Tag1/Tag2/…`.

This is 3 indexed queries per book (Type lookup, Genre lookup, tags lookup) — well within TiDB's performance envelope.

### Dynamic modifiers in the tag tree

A dynamic modifier like `<Cuisine>` (used in `Manual/Cooking/Recipe/<Cuisine>`) is modeled as a tag node:

- **Root tag**: `Recipe` scoped to (Manual, Cooking), `vocabulary_type = leaf`.
- **Child tag**: a placeholder node `Cuisine` under `Recipe`, `vocabulary_type = open`. When the classifier fills `<Cuisine>` with `France`, a child tag `France` is created under `Cuisine` (if it doesn't exist), `vocabulary_type = leaf`. The book gets tags: `Recipe` (position 0), `Cuisine` (position 1), `France` (position 2). For display, the placeholder `Cuisine` node can be elided (it's a structural slot, not a display label) — see "Placeholder elision" below.

For **fixed-vocabulary** modifiers like `<Faith>`:

- The placeholder node `Faith` has `vocabulary_type = fixed` and its 13 children (Catholic, Protestant, Islam, …) are pre-seeded by migration. The classifier selects from existing children; no on-demand creation.

### Placeholder elision

Some tag nodes are structural placeholders (the dynamic modifier slots: `Cuisine`, `Faith`, `Continent`, `Country`, `Sport`, `Animal`, `Instrument`, `Language`, `ProgrammingLanguage`, `Culture`, `Argument`). They exist in the tree to define the vocabulary type and scope, but they are not part of the display path. When reconstructing the classification string, placeholder nodes are elided:

- Stored tags: `Recipe`, `Cuisine`, `France` → display: `Manual/Cooking/Recipe/France`.
- Stored tags: `Religion`, `Faith`, `Catholic` → display: `Reference/Religion/Catholic`.

A tag node is marked as a placeholder via a `is_placeholder` boolean (default `false`). Placeholder nodes are created by the ontology seeding migration and are never created by classifiers.

### Seeding

The ontology is seeded by a migration generated from the ontology source files. The seeding process:

1. Inserts the 9 `type` rows.
2. Inserts all `genre` rows and `type_genre` junction rows.
3. Inserts all fixed tag nodes (leaf tags like `Investigation`, fixed-vocabulary modifiers like `<Faith>` and their children, placeholder nodes for open-vocabulary modifiers like `<Country>`).
4. Open-vocabulary leaf values (e.g. `Italy` under `<Country>`) are **not** seeded — they are created on demand when a classifier fills the modifier.

The seeding migration is generated by a script that parses the ontology source files and emits SQL `INSERT` statements. This keeps the source-of-truth files as the input and the database as a derived artifact. Regenerating the migration when the ontology changes is the standard workflow (analogous to `drizzle-kit generate` for schema changes).

### Validation

When a user or the normalization pipeline ([ADR 0016](0016-data-normalization.md)) classifies a book:

1. `(type_id, genre_id)` must exist in `type_genre`.
2. Each tag must be a valid node in the tag tree for the book's (Type, Genre) scope — either a root tag scoped to that pair, or a descendant of such a root tag.
3. For `fixed`-vocabulary parent tags, the child must already exist (no on-demand creation).
4. For `open`-vocabulary parent tags, the child is created on demand if it doesn't exist.
5. The `position` values must be contiguous and ordered to reflect the hierarchy path.

Validation is enforced at the application layer (the service that writes classifications). TiDB referential integrity (foreign keys) handles the structural constraints; the scope and vocabulary-type rules are application-level because they depend on the tag's position in the tree relative to the book's (Type, Genre).

### Relationship to the readable-languages matrix

The `user_language` table (see [data model reference](../../reference/data-model.md)) is keyed by **Type**: each row declares which Types the user can read in a given language (`user_language_allowed_type_id`). A user can read English for all Types, but Spanish only for Essay and Memoir, for example. The matrix is per (user, language, type).

## Consequences

- **Positive**: Type and Genre are indexed, queryable fields — filtering a TomeTrove collection by Type or Genre is a fast indexed lookup, not a string parse; variable-depth classifications are natural (0..N tags per book); dynamic modifiers are first-class (fixed vocabularies are validated, open ones are free-form); the tag tree is small and fully indexed; the ontology is seeded from the ontology source files, keeping them as the single source of truth; translations are handled by a unified `translation` table ([ADR 0019](0019-ontology-i18n.md)) — no schema changes for new languages, just new rows; the `/` notation is a rendering concern, not a storage concern — the string is never stored, only reconstructed.
- **Negative**: more tables than a string column (type, genre, type_genre, ontology, book_ontology, translation); reconstructing the full path requires 3 indexed queries per book (acceptable but not free); the tag tree must be seeded and maintained via a generated migration; placeholder elision adds a small rendering rule; open-vocabulary tags grow over time (but they are small strings, well within [TiDB](https://www.pingcap.com/tidb-cloud/)'s row size limit); the `translation` table has no FK to entity tables — slug immutability is enforced at application level to prevent orphans.
- **Neutral**: [ADR 0016](0016-data-normalization.md) (data normalization) is partially affected — its genre-auto-fill step produces a (Type, Genre, tags) triple instead of a single genre_id, but the broader normalization concerns (author names, titles, ISBN) are unchanged; UI string internationalization is a separate concern (file-based, [ADR 0022](0022-ui-string-i18n.md)) and is not covered by the `translation` table.
