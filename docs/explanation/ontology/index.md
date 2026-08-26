# Book Classification Ontology

This section explains *why* TomeTrove classifies books the way it does — the design rationale behind the ontology, the rules that govern it, and how the hierarchy levels work. For the bare lists of types, genres, and modifier vocabularies, see the [ontology reference](../../reference/ontology/index.md).

## What problem the ontology solves

TomeTrove needs to group books so users can browse, filter, and share by topic. The obvious approach — copy a library classification like Dewey or LCC, or reuse the flat subject tags from a metadata source like OpenLibrary — does not fit a personal collection:

- **Library systems optimize for retrieval by librarians**, not for browsing by a reader who wants "my fantasy novels" or "essays about jazz". Their hierarchies are deep, numeric, and opaque to casual users.
- **Metadata-source subjects are a [folksonomy](https://en.wikipedia.org/wiki/Folksonomy)** — a user-generated tagging system where tags are assigned bottom-up by the community, not top-down by a controlled vocabulary. The result is flat and inconsistent: "Runaway children, Fiction", "Religious aspects of Love", and "Domestic fiction" sit side by side with no structure. They cannot drive a clean browse experience without a mapping layer (see [ontology mappings](../../reference/ontology/ontology-mappings.md)).

TomeTrove's ontology is a **curated, closed, structured taxonomy** designed for browsing. It is small enough to learn, strict enough to be consistent, and open enough to be translated by volunteers (see [ADR 0019](../adr/0019-ontology-i18n.md)).

## Topics

- [The structure of a classification](classification-structure.md) — why 9 Types replace the fiction/non-fiction dichotomy, how the hierarchy levels work, and dynamic modifiers.
- [The three universal rules](rules.md) — Autonomy, Substantivization, Instrumental disambiguation.

## Design principles

### Classification is objective

The system classifies based on elements found in the text or metadata, not on subjective impressions. It does not express value judgments: it never classifies a book as "a good novel" or "a shallow essay". It objectively describes *what the book is* and *what it is about*. This objectivity is what makes the taxonomy maintainable by multiple contributors without disputes about taste.

### Authorship is a separate concern

The classification string never encodes container information. A collection of short stories and a single novel share the same classification logic (`Fiction` + genre); the difference (single work vs. collection vs. anthology) lives entirely in the authorship data model, not in the ontology.

### Internationalization by design

Every level — Type, Genre, and all tag levels — is translatable. English is the default and canonical language, stored in each entity's `_en` field. At launch, only English exists. Additional languages are added by volunteers over time, with no schema changes required. The architecture for this is described in [ADR 0019](../adr/0019-ontology-i18n.md): non-English translations live in a unified `translation` table keyed by `(table_name, entity_id, language_id)`, so a new language is a data contribution (new rows), not a code change. The fallback when a translation is missing is the entity's `_en` field, which is always populated at seed time. UI string translation is a separate concern — see [ADR 0022](../adr/0022-ui-string-i18n.md).

## Where the ontology lives

| Artifact                  | Role                                                      |
|---------------------------|-----------------------------------------------------------|
| Universal rules           | The 3 rules + preamble                                    |
| Types                     | The closed list of 9 Types                                |
| Type-specific hierarchies | Genres and subgenres per Type                             |
| Dynamic modifiers         | Placeholder vocabularies                                  |
| Authorship                | Container concerns (separate from ontology)               |
| Ontology mappings         | External subjects → TomeTrove (OpenLibrary, Google Books) |

The [ontology reference](../../reference/ontology/index.md) is the canonical rendering of the taxonomy. These docs are the source of truth for the design; if the explanation and the reference ever disagree, the reference wins.
