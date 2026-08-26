# ADR 0019: Ontology internationalization architecture

- Status: Accepted
- Date: 2026-08-25

## Context

TomeTrove's ontology ([ADR 0018](0018-ontology-data-model.md)) defines three kinds of translatable terms:

- **9 Types** — closed list (Fiction, Poetry, Theatre, …).
- **Genres** — disciplines/subjects (Mystery, Physics, Music, …). Dozens of terms.
- **Tags** — the additional levels, including fixed-vocabulary modifier values (continents, faiths, …) and open-vocabulary values (countries, sports, animals, instruments, …). Hundreds of terms, growing as classifiers fill open modifiers.

English is the **canonical and default** language — every term has an English name stored in the entity's `_en` field (`type_name_en`, `genre_name_en`, `ontology_name_en` in the [data model reference](../../reference/data-model.md)). At launch, only English exists. The translation table is empty until a second language is contributed.

Requirements:

- **Graceful fallback**: if a translation is missing for a term, the system falls back to the entity's `_en` field. Partial translations must work — a language does not need to be 100% complete to be usable.
- **No schema changes for new languages**: adding a language must not require a migration. It should be a data contribution (new rows in the `translation` table).
- **Separation from UI strings**: ontology term translation is a distinct concern from UI string translation (button labels, error messages, etc.). Both need i18n, but they have different lifecycles — ontology terms are curated data queried alongside entity data; UI strings are code-adjacent and needed on every page render regardless of DB queries. This ADR covers ontology terms only. UI string i18n is addressed in [ADR 0022](0022-ui-string-i18n.md).

Constraints from the platform (Cloudflare Workers + TiDB via Hyperdrive, [ADR 0003](0003-database-choice.md)):

- Ontology data is already queried from TiDB. A JOIN to the `translation` table rides the same query — no extra round-trip.
- UI strings, by contrast, are needed on every page render regardless of whether a DB query happens. Putting them in the DB would add a round-trip for strings that could be an in-memory map loaded at startup. This is why UI strings stay file-based ([ADR 0022](0022-ui-string-i18n.md)) while ontology translations are DB-based.

## Options

### Option 1 — Unified `translation` table keyed by entity PK (chosen)

A single `translation` table keyed by `(table_name, entity_id, language_id)`. The `table_name` enum discriminator identifies which entity table the row belongs to (`type`, `genre`, `ontology`). The `entity_id` is the primary key of the entity in that table. Non-English translations only — the entity's own `_en` field is the canonical English and the fallback.

- **Pros**: one table for all ontology translations — simple, uniform; no schema changes for new languages (just new rows); translations are queried alongside entity data via JOIN — no extra round-trip; the `table_name` enum is self-documenting (values are the actual table names); entity PKs are inherently immutable and never reused — no orphan risk from renames; integer JOINs are faster than string JOINs; works for any entity table regardless of whether it has a slug (the `language` table has no slug — it has `language_code` — but it has a PK).
- **Cons**: no FK from `translation_entity_id` to entity tables — the `table_name` discriminator makes a single FK impossible. Application-level validation checks that `(table_name, entity_id)` corresponds to an existing row; the `table_name` enum is fixed — adding a new translatable entity type requires a migration (acceptable — new entity types are rare); a developer reading the raw `translation` table sees `entity_id = 7` instead of a human-readable slug — a JOIN resolves this, and developers write JOINs.

### Option 2 — Per-entity translation tables

Separate tables: `type_translation`, `genre_translation`, `ontology_translation`, each with FK to its entity table.

- **Pros**: referential integrity — a deleted entity orphans translations visibly.
- **Cons**: three (or more) tables instead of one; each entity type needs its own translation table and migration; no uniform query pattern — each entity type has its own JOIN. Rejected for complexity.

### Option 3 — File-based translations, JSON keyed by slug

Store translations in version-controlled JSON files, bundled at deploy time, loaded into an in-memory map at startup. This was the original approach considered for ontology terms.

- **Pros**: zero runtime DB cost; volunteers edit files and submit PRs.
- **Cons**: ontology terms are data — they're already queried from the DB. File-based translations introduce a second source of truth that must be kept in sync with the DB; open-vocabulary tags (created at runtime) need their translations added to files that are only updated on deploy, creating a lag; the English files must be generated from the DB seed, adding a generation step. Rejected for ontology terms — the DB is the natural home for data-adjacent translations. (Viable for UI strings — [ADR 0022](0022-ui-string-i18n.md).)

### Option 4 — gettext (.po / .pot) files

Industry-standard translation format with excellent tooling.

- **Cons**: gettext is designed for UI strings (short messages with context), not for a structured entity → name taxonomy mapping; the `.po` workflow is heavier than a DB table for this use case; plural forms are irrelevant for taxonomy terms. Overkill. Rejected for the ontology, but viable for UI strings ([ADR 0022](0022-ui-string-i18n.md)).

## Decision

Adopt **option 1: a unified `translation` table** for ontology entities (`type`, `genre`, `ontology`), keyed by entity primary key.

### Table structure

See the [data model reference](../../reference/data-model.md#translation) for the canonical definition. Summary:

| Field                   | Type          | Notes                                                                     |
|-------------------------|---------------|---------------------------------------------------------------------------|
| translation_id          | PK            |                                                                           |
| translation_table_name  | enum          | `type`, `genre`, `ontology` — the table the entity belongs to             |
| translation_entity_id   | int           | PK of the entity being translated (in the `translation_table_name` table) |
| translation_language_id | FK → Language | The language of this translation                                          |
| translation_text        | string        | The translated text                                                       |

**Unique constraint**: `(translation_table_name, translation_entity_id, translation_language_id)`.

The `table_name` enum values are the actual table names — a reader immediately knows which table the entity belongs to. No abstract "area" concept.

### Fallback chain

When displaying a term in the user's UI language:

1. Look up `(table_name, entity_id, language_id)` in the `translation` table. If found, return `translation_text`.
2. If not found, return the entity's `_en` field (`type_name_en`, `genre_name_en`, `ontology_name_en`). The `_en` field is always populated at seed time, so a displayable string is guaranteed.

Partial translations work naturally — a language does not need to be 100% complete. Missing terms fall back to English silently.

### No FK integrity

The `translation` table cannot FK `translation_entity_id` to multiple entity tables depending on `translation_table_name`. This is a tradeoff of the unified design. It is mitigated by:

- **Primary key immutability**: PKs are inherently immutable and never reused. Unlike slugs (which could theoretically be renamed), PKs cannot change — an entity's ID is fixed at insert time.
- **Application-level validation**: the translation service validates that a `(table_name, entity_id)` pair corresponds to an existing entity row before accepting a translation.

### Open-vocabulary tags

Open-vocabulary tags (countries, sports, animals, …) are created at runtime by classifiers. Their English name is stored in `ontology_name_en`. Their translation is added to the `translation` table when a volunteer contributes it. Until then, the tag displays in English (graceful fallback). This is acceptable — open-vocabulary values are often proper nouns that may not need translation.

### Launch state

At launch, the `translation` table is empty. Only English exists. The table and its fallback chain are designed and ready, but no translations are populated until a second language is contributed.

## Deferred concerns

The following are explicitly out of scope for this ADR:

- **Volunteer contribution workflow**: how volunteers contribute translations (file import/export, validation, PR review) is not designed here. The data model is decided; the contribution mechanism is not. This ADR stays Draft until the volunteer workflow is defined.
- **UI string internationalization**: addressed in [ADR 0022](0022-ui-string-i18n.md). UI strings are code-adjacent and needed on every page render — a file-based approach (bundled at deploy time, in-memory at runtime) is the right fit. One system for data-adjacent translations (DB, this ADR), another for code-adjacent translations (files, ADR 0022) — different lifecycles, different access patterns.

## Consequences

- **Positive**: one unified table for all ontology translations — simple, uniform; no schema changes for new languages (just new rows); translations are queried alongside entity data via JOIN — no extra round-trip; the `table_name` enum is self-documenting; entity PKs are immutable and never reused — no orphan risk; integer JOINs are fast; works for any entity table regardless of whether it has a slug; partial translations work (fallback to `_en`); open-vocabulary tags are translated with the same mechanism as fixed terms; the fallback chain guarantees a displayable string even when the translation table is empty (launch state).
- **Negative**: no FK integrity from `translation_entity_id` to entity tables — application-level validation compensates; the `table_name` enum is fixed — adding a new translatable entity type requires a migration (acceptable — new entity types are rare); a developer reading the raw `translation` table sees integer IDs instead of human-readable slugs (a JOIN resolves this); the volunteer contribution workflow is not yet designed — this ADR stays Draft until it is.
- **Neutral**: UI string i18n is addressed in [ADR 0022](0022-ui-string-i18n.md) — different lifecycle, different access pattern; the `language` table is not translatable via the `translation` table — `language_name_en` and `language_name_native` are intrinsic fields on the entity, not translations.
