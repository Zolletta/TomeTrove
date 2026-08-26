# Author normalization rules

This page is the canonical, mechanical specification for turning an external author record into a row of the [`author` table](data-model.md#author-curator). It covers the name split, the suffix and particle vocabularies, script handling, the alias permutations, and the disambiguation rules applied when two records look like the same person. For the design rationale (why a pre-loaded author pool exists at all), see [ADR 0016](../explanation/adr/0016-data-normalization.md).

The rules are deterministic: the same input always produces the same output, with no network lookup and no human judgement. Anything requiring judgement is a *candidate* handed to the user, never an automatic write.

## Source of record

The pre-load source is **Wikidata**, queried with SPARQL at `https://query.wikidata.org`. Wikidata is preferred over the [OpenLibrary author dumps](https://openlibrary.org/developers/dumps) because it carries the fields this schema actually needs — a Latin label, a native-script label *with its language*, cross-catalogue identifiers, and `also known as` values — whereas the OpenLibrary dump carries almost none of them.

Measured on the OpenLibrary author dump of 2026-07-31 (first 3,000,000 records), field coverage is:

| Field                          | Coverage |
|--------------------------------|----------|
| `name`                         | 100%     |
| `personal_name`                | 41.7%    |
| `birth_date`                   | 12.8%    |
| `death_date`                   | 3.8%     |
| `entity_type` (person vs org)  | 2.1%     |
| `remote_ids` (VIAF/Wikidata/…) | 2.1%     |
| `alternate_names`              | 0.9%     |
| `bio`                          | 0.3%     |
| Wikipedia links (any language) | 0.05%    |

Two consequences drive the design:

- **Aliases must be generated, not imported.** Only 0.9% of OpenLibrary authors carry `alternate_names`, so the exact-alias-match step of [ADR 0016](../explanation/adr/0016-data-normalization.md) would be dead code without the [generated permutations](#alias-generation) below.
- **OpenLibrary has no nationality and effectively no per-language Wikipedia links.** Across 3M records there were 1,394 Wikipedia links in total (`en` 983, `de` 227, `es` 41, `fr` 40, `it` 4, the rest in single digits). Language and nationality therefore come from Wikidata, not from OpenLibrary.

OpenLibrary remains relevant only as an identifier: Wikidata's `P648` fills [`author_openlibrary_id`](data-model.md#author-curator), which stays the deduplication key across refreshes.

## Identifiers

| Column                  | Source                      | Notes                                                                                                                                     |
|-------------------------|-----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `author_wikidata_id`    | Wikidata item QID (`Q1734`) | Language-independent and stable. Preferred over a Wikipedia page id, which differs per language edition and changes when pages are moved. |
| `author_openlibrary_id` | Wikidata `P648`             | Present for a minority of items; the dedup key for OpenLibrary-sourced refreshes.                                                         |
| `author_googlebooks_id` | not available from Wikidata | Populated only by a Google Books lookup at runtime.                                                                                       |

## Canonical name form

`author_name_latin` is always `Surname, Given Names` — optionally followed by `, Suffix`. `author_surname` always holds exactly the surname portion, so sorting and the prefix-scoped Levenshtein bucket of [ADR 0016](../explanation/adr/0016-data-normalization.md) never see given names, particles-only tokens, or suffixes.

Given names are **never abbreviated** in the canonical form. If the source name is initials-only and a spelled-out form exists (Wikidata `also known as`, or OpenLibrary `fuller_name`), the spelled-out form becomes canonical and the initialed form becomes an alias.

```text
"Edgar Allan Poe"       -> surname "Poe"        latin "Poe, Edgar Allan"
"Craig S. Farmer"       -> surname "Farmer"     latin "Farmer, Craig S."
"J. R. R. Tolkien"      -> surname "Tolkien"    latin "Tolkien, J. R. R."
```

## Source label cleanup

Before any split, two things are removed from the source label.

- **Disambiguating qualifiers.** Wikidata labels carry a parenthesized qualifier when two items share a name: `Michele Alboreto (calciatore)`, `Aurel Cosma (junior)`. Anything inside `(...)` or `[...]` is dropped — it is metadata about the item, not part of the name.
- **Leading titles.** {`Dr.`, `Prof.`, `Sir`, `Dame`, `Lord`, `Lady`, `Rev.`, `Mr.`, `Mrs.`, `Ms.`} at the front, and [credentials](#6-trailing-suffix) at the end.

```text
"Michele Alboreto (calciatore)"  -> latin "Alboreto, Michele"
"Dr. Jane Goodall"               -> latin "Goodall, Jane"
```

## Name split rules

Apply in order; the first rule that fires wins.

### 1. Corporate and institutional names

If the record is flagged as an organization (Wikidata: the item is not an instance of human; OpenLibrary: `entity_type` is `org`), or the name matches an institutional pattern — an internal `. ` separator, `&`, or a token from {`Inc`, `Ltd`, `GmbH`, `Co.`, `Company`, `Press`, `Dept`, `Department`, `Ministry`, `University`, `Congress`, `Association`, `Society`, `Museum`, `Institute`, `Foundation`, `Committee`} — the name is kept **verbatim** and `author_surname` is the whole string.

```text
"United States. Congress"   -> surname "United States. Congress"   latin "United States. Congress"
"Walt Disney Company"       -> surname "Walt Disney Company"       latin "Walt Disney Company"
```

The structured flag wins over the pattern: a human named `"Victoria Institute"` is not made corporate by the word `Institute` if the source says she is a person.

### 2. Already inverted

If the name contains a comma, it is already in `Surname, Given` order and is kept as is — after [suffix normalization](#suffix-vocabulary). `author_surname` is the text before the first comma.

```text
"Poe, Edgar Allan"          -> surname "Poe"     latin "Poe, Edgar Allan"
"King, Jr., Martin Luther"  -> surname "King"    latin "King, Martin Luther, Jr."
```

The second example is the trap this rule exists for: a naive split would yield surname `King` with given name `Jr.`. When the segment following the first comma is *only* a suffix, it is detached and re-appended after the given names.

### 3. Single token

A one-token name is a mononym: no comma, and the token is both surname and full name.

```text
"Homer"     -> surname "Homer"     latin "Homer"
"Voltaire"  -> surname "Voltaire"  latin "Voltaire"
```

### 4. Regnal names

A name introduced by a religious or regnal title, or a single name followed by a Roman ordinal, is a regnal name: it keeps its source order, is **not** inverted, and is filed under the given name.

```text
"papa Clemente IX"        -> surname "Clemente"  latin "papa Clemente IX"
"Papa Giovanni Paolo I"   -> surname "Giovanni"  latin "Papa Giovanni Paolo I"
"Louis XIV"               -> surname "Louis"     latin "Louis XIV"
```

An ordinal after **two or more** names is a generational suffix instead, handled by [rule 6](#6-trailing-suffix): `Henry Ford III` is not a monarch. Titles that are also ordinary surnames — Italian `Re`, `Conte`, `Duca` — only count as titles when the name ends in an ordinal, so `Bernardino Re` still files as `Re, Bernardino`.

### 5. Pen names and trailing initials

A final token that carries no letter, or is a single letter, cannot be a surname. Such names are collective or stage pen names: kept verbatim, filed under the first token, and given no [generated aliases](#alias-generation) because permuting them is meaningless.

```text
"Wu Ming 1"     -> surname "Wu"         latin "Wu Ming 1"
"Militant A"    -> surname "Militant"   latin "Militant A"
```

The exception is a name of three tokens or more ending in a single letter, where that letter is a misplaced given-name initial rather than a pen-name marker:

```text
"Gastone Rossi D."  -> surname "Rossi"  latin "Rossi, Gastone D."
```

### 6. Trailing suffix

Trailing generational suffixes are detached before splitting and re-appended at the end, comma-separated, following library cataloguing practice (`Surname, Given, Suffix`). The suffix is never part of `author_surname`.

```text
"Martin Luther King Jr."     -> surname "King"         latin "King, Martin Luther, Jr."
"John D. Rockefeller, Sr."   -> surname "Rockefeller"  latin "Rockefeller, John D., Sr."
"Henry Ford III"             -> surname "Ford"         latin "Ford, Henry, III"
```

Academic and honorific credentials — {`PhD`, `Ph.D.`, `MD`, `M.D.`, `Esq.`, `Dr.`, `Prof.`, `Sir`, `Dame`} — are **stripped** from the canonical form and preserved only as aliases. They are titles, not parts of a name.

### 7. Nobiliary and patronymic particles

A surname preceded by particles keeps them, in source order and with the **source's capitalization** — `De Filippo` and `de Filippo` are both legitimate and are not recased. Consecutive particles chain.

```text
"Vincent van Gogh"           -> surname "van Gogh"     latin "van Gogh, Vincent"
"Ludwig von Mises"           -> surname "von Mises"    latin "von Mises, Ludwig"
"Eduardo De Filippo"         -> surname "De Filippo"   latin "De Filippo, Eduardo"
"Ernesto Di Napoli"          -> surname "Di Napoli"    latin "Di Napoli, Ernesto"
"Sor Juana Inés de la Cruz"  -> surname "de la Cruz"   latin "de la Cruz, Sor Juana Inés"
"Leonardo da Vinci"          -> surname "da Vinci"     latin "da Vinci, Leonardo"
```

`da Vinci` is a toponym rather than a family name, but every catalogue files it as the surname and so does TomeTrove.

Particle vocabulary, matched case-insensitively: `van`, `van der`, `van den`, `van de`, `von`, `von der`, `von dem`, `de`, `de la`, `de las`, `de los`, `del`, `della`, `dello`, `degli`, `dei`, `di`, `da`, `dal`, `dos`, `das`, `du`, `des`, `le`, `la`, `ter`, `ten`, `af`, `av`, `bin`, `ibn`, `bint`, `al-`, `el-`, `ap`, `ben`.

Prefixes written without a following space — `Mc`, `Mac`, `O'`, `Fitz`, `D'`, `L'` — are part of the token itself and need no special handling (`McCarthy`, `O'Brien`, `D'Annunzio`).

### 8. Default

The last token is the surname; everything before it is the given names.

```text
"Italo Calvino"  -> surname "Calvino"  latin "Calvino, Italo"
```

## Suffix vocabulary

Suffixes are normalized to one canonical spelling so that `King Jr` and `King Jr.` collapse to a single form.

| Input variants              | Canonical |
|-----------------------------|-----------|
| `Jr`, `Jr.`, `Junior`, `jr` | `Jr.`     |
| `Sr`, `Sr.`, `Senior`, `sr` | `Sr.`     |
| `II`, `2nd`                 | `II`      |
| `III`, `3rd`                | `III`     |
| `IV`, `4th`                 | `IV`      |
| `V`, `5th`                  | `V`       |

## Scripts and languages

`author_name_latin` is mandatory; `author_name_original` holds the original script and is `NULL` for Latin-script authors.

1. If the name is Latin-script, `author_name_original` and `author_original_language_id` are both `NULL`.
2. If the name is non-Latin, it goes to `author_name_original`, and the Latin form is taken from — in order — the source's Latin-script label (Wikidata `en` label, or an OpenLibrary Latin `alternate_name`), then deterministic transliteration.
3. `author_original_language_id` is the language of the original-script label: taken from Wikidata's label language when available, otherwise inferred from the script.

```text
"Толстой, Лев"  -> original "Толстой, Лев"  latin "Tolstoj, Lev"       language ru
"Καζαντζάκης"   -> original "Καζαντζάκης"   latin "Kazantzakis, Nikos" language el
```

Script-to-language fallback, used only when the source gives no label language: Cyrillic → `ru`, Greek → `el`, Arabic → `ar`, Hebrew → `he`, Devanagari → `hi`, Han → `zh`, Kana → `ja`, Hangul → `ko`, Thai → `th`, Armenian → `hy`, Georgian → `ka`. The mapping is a heuristic — Cyrillic covers Russian, Ukrainian, Bulgarian and Serbian alike — so a source-provided language always wins.

> [!WARNING]
> Mechanical transliteration of Han, Kana and Hangul is per-character and produces wrong names (`三島 由紀夫` transliterates to "San Dao You Ji Fu", not "Mishima, Yukio"). CJK authors are therefore imported **only** when the source provides a Latin label; otherwise the record is skipped rather than stored with an invented Latin name.

### Surname-first scripts

For Han, Kana and Hangul names the **first** token is the surname, the reverse of the [default rule](#8-default). The split is applied to the Latin label with this ordering.

```text
"三島 由紀夫"  (Latin label "Yukio Mishima")  -> surname "Mishima"  latin "Mishima, Yukio"
```

Because Wikidata's Latin labels are usually already in Western order (`Yukio Mishima`), this rule applies to the *original* token order and is only used to decide which part of the Latin label is the family name.

### Language identifiers

`author_original_language_id` is a foreign key to the [`language` table](data-model.md#language), which has no production seed yet. The generated SQL therefore ships with a temporary `language` seed covering the ISO 639-1 codes referenced by the author files, and the author `INSERT`s resolve the key through that seed. When the real language seed lands, the temporary file is dropped and the ids re-resolved by `language_code`.

## Alias generation

`author_aliases` is a JSON array of alternative spellings. Its purpose is the exact-match step of [ADR 0016](../explanation/adr/0016-data-normalization.md): a user or CSV row writes a name in *some* form, and an exact alias hit resolves it without fuzzy matching.

Sources, merged and deduplicated:

1. The source's own variants (Wikidata `also known as`, OpenLibrary `alternate_names`, `personal_name`, `fuller_name`) when they differ from the canonical form.
2. Generated permutations of the canonical name.

Generated permutations for `Poe, Edgar Allan`:

```text
Edgar Allan Poe
Edgar A. Poe
Edgar Poe
E. A. Poe
E.A. Poe
EA Poe
Poe, Edgar A.
Poe, Edgar
Poe, E. A.
Poe, E.A.
```

Rules for the generator:

- The canonical form itself is never repeated in the array.
- Suffix-bearing names generate both with-suffix and without-suffix variants (`Martin Luther King Jr.`, `Martin Luther King`, `King, Martin Luther`, `M. L. King Jr.`).
- Particle surnames additionally generate the particle-last filing form used by some catalogues (`van Gogh, Vincent` → `Gogh, Vincent van`), because Dutch and Portuguese names are filed both ways.
- Mononyms, pen names, regnal names and corporate names generate no permutations.
- Generation is capped at four given-name tokens; beyond that only the full form and the all-initials form are emitted, to bound the array size.
- Aliases are stored with their original case and accents. Matching is expected to be case- and accent-insensitive, so accent-stripped variants are **not** stored as separate aliases.

Permutations are computed by a script over the loaded rows rather than baked into every `INSERT`, keeping the committed SQL small; see [the generated SQL layout](#generated-sql-layout).

## Disambiguation

The alias system deliberately creates collisions — `E. A. Poe` could be Edgar Allan Poe or a hypothetical Emily A. Poe. These rules decide what is automatic and what needs a human.

1. **Identifier match is authoritative.** Same `author_wikidata_id`, or same `author_openlibrary_id`, means the same person. Identifiers are compared before names, always.
2. **Exact canonical match is automatic.** An exact hit on `author_name_latin` resolves without confirmation.
3. **Exact match on a source-provided alias is automatic.** These come from a catalogue, not from generation.
4. **Exact match on a generated full-name alias is automatic.** `Edgar Allan Poe` unambiguously reconstructs `Poe, Edgar Allan`.
5. **A match on an initials-bearing alias is a candidate, never a resolution.** `E. A. Poe`, `Poe, E. A.` and friends are presented for confirmation, even when only one author matches, because the abbreviation is lossy.
6. **Multiple authors sharing an alias always ask.** The candidate list is ordered by number of linked books, descending.
7. **Never merge on name alone.** Two records with the same `author_name_latin` and different identifiers stay two rows; the schema's dedup key is the identifier. Merging is a deliberate, user-confirmed action.
8. **Rejected records.** Names that are empty, `?`, `Unknown`, `Anonymous`, `Various`, `n/a`, a single letter, or purely numeric are dropped rather than imported.

## Generated SQL layout

The generated seed lives in `assets/db/sql/author/`, batched by language so a human can open a single file and read it:

- One or more `.sql` files per language, numbered when a language needs splitting (`author_it_0001.sql`), each staying well below GitHub's per-file limits.
- Data only: `INSERT` statements, no `CREATE TABLE`. The schema is owned by migrations ([ADR 0009](../explanation/adr/0009-schema-migrations.md)).
- No `author_id` column — the primary key is left to `AUTO_INCREMENT`.
- Multi-row `INSERT`s in fixed column order, UTF-8 (`utf8mb4`), MySQL/TiDB dialect ([ADR 0003](../explanation/adr/0003-database-choice.md)).
- A temporary `language` seed file, loaded first, so `author_original_language_id` resolves.
- An alias permutation script, run after load, that fills `author_aliases` per the [alias rules](#alias-generation).

The generator lives in `assets/db/tools/`: `normalize.py` implements this page, `languages.py` holds the temporary language ids, `harvest.py` queries Wikidata and writes the files, `permute_aliases.py` fills the aliases after load, and `test_normalize.py` checks the normalizer against every example on this page.

```bash
python3 assets/db/tools/test_normalize.py
python3 assets/db/tools/harvest.py --language it
python3 assets/db/tools/harvest.py --all
python3 assets/db/tools/permute_aliases.py --dsn mysql://user:pass@host:4000/tometrove
```

## Language batching

A writer belongs to the batch of the language they write in, taken from Wikidata's `P1412` (languages spoken, written or signed), `P103` (native language) and `P6886` (writing language), unioned. Multilingual writers therefore appear in several candidate sets, so a writer is emitted **once**, in the first language batch that claims them, and the run order is the order of `assets/db/tools/languages.py` — Italian first. Re-running a single language is idempotent for that language but does not reshuffle writers already claimed by an earlier one.

Italian, harvested on 2026-08-26: 16,741 candidate QIDs (`P1412` 16,694, `P6886` 4,802, `P103` 795), 16,451 rows emitted, 290 skipped as [rejected records](#disambiguation) or non-Latin items with no Latin label.

## Future enrichment

Wikidata carries data this schema has no column for yet: birth and death dates, nationality (`P27`), and cross-catalogue identifiers (VIAF, ISNI, `lc_naf`, `opac_sbn`). These are dropped by the current import. Adding them is a schema change plus a re-harvest — no change to the rules on this page.
