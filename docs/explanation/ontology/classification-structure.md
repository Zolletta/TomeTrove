# The structure of a classification

## Why nine Types, not "fiction vs non-fiction"

It seems intuitive to divide books into "fiction" and "non-fiction". In practice the dichotomy is insufficient and generates edge cases that a classification system must handle explicitly:

| Work        | Fiction?                                          | Non-fiction?                        | The problem                                         |
|-------------|---------------------------------------------------|-------------------------------------|-----------------------------------------------------|
| Memoir      | uses narrative arc, characters                    | based on real events                | Hybrid — belongs to neither side cleanly.           |
| Poetry      | can be narrative, lyrical, or essayistic in verse | —                                   | Does not coincide with either macro-category.       |
| Theatre     | a creative work (script)                          | structured as dialogue, not prose   | Structurally distinct from both Fiction and Poetry. |
| Sacred Text | —                                                 | not essayistic in the secular sense | A religious foundation; lookup, not linear reading. |
| Comics      | narrative, but told through sequential art        | —                                   | The primary medium is visual, not textual.          |
| Catalogue   | —                                                 | neither narrative nor essayistic    | An inventory, a structured list.                    |
| Textbook    | —                                                 | an essay with a didactic purpose    | Folded into Essay as a modifier, not its own type.  |

This is why the system defines a **closed list of 9 Types** that capture the real modes in which editorial content presents itself. The Type is the first and most stable classification level — it describes *what the book is* as an editorial object, not what it is *about*:

1. Fiction — prose narrative
2. Poetry — verse
3. Theatre — stage scripts
4. Comics — sequential art
5. Essay — analysis, criticism, theory
6. Memoir — personal memory with narrative style
7. Manual — technical-operational instructions
8. Travel — itineraries and place description
9. Reference — point lookup (encyclopedia, dictionary, sacred text)

The full definition of each Type is in the [ontology reference](../../reference/ontology/index.md).

The list is **closed**: new Types are not added casually. If a work does not fit, the answer is a modifier or a new genre, not a new Type. This stability is what makes the Type a reliable first-level partition and a translatable constant.

## The hierarchy of levels

A classification is a hierarchy of levels:

- **Type** — mandatory. One of the 9 closed Types.
- **Genre** — mandatory. The discipline or subject (`Mystery`, `Physics`, `Music`).
- **Additional levels** — optional, added when the content requires further specification (`Mystery/Investigation`, `Music/Jazz`, `Essay/Literature/History/Italy`).

A genre can also serve as a subgenre and vice versa: `Fiction/Mystery/History` (a story set in the past) versus `Essay/Literature/Mystery/History` (an essay on the history of the mystery genre). The position in the hierarchy, not the term itself, determines the meaning.

## Dynamic modifiers

Some levels are not fixed genres but **placeholders** the classifier fills at classification time. They are slots that adapt to the content:

| Modifier                | Example use                                     | Filled with                                            |
|-------------------------|-------------------------------------------------|--------------------------------------------------------|
| `<Cuisine>`             | `Manual/Cooking/Recipe/<Cuisine>`               | Country, regional style, dietary type, or cooking type |
| `<Faith>`               | `Reference/Religion/<Faith>`                    | A religion name (Christianity, Islam, …)               |
| `<Continent>`           | `Travel/<Continent>`                            | One of 6 continents                                    |
| `<Country>`             | `Essay/Literature/History/<Country>`            | A sovereign state name                                 |
| `<Argument>`            | `Essay/<Argument>`                              | An Art, a Discipline, or an AllowedType                |
| `<Sport>`               | `Manual/Sport/<Sport>`                          | A sport name                                           |
| `<Animal>`              | `Manual/<Animal>/Training`                      | A species common name                                  |
| `<Instrument>`          | `Manual/Music/<Instrument>`                     | A musical instrument name                              |
| `<Language>`            | `Manual/<Language>`                             | A natural language name                                |
| `<ProgrammingLanguage>` | `Manual/Computer Science/<ProgrammingLanguage>` | A programming language name                            |
| `<Culture>`             | `Essay/Mythology/<Culture>`                     | An ancient/distinct cultural tradition                 |

Some modifiers draw from a **fixed vocabulary** (continents: 6 values; faiths: 12 values). Others are **open** (countries, sports, animals, instruments) — the classifier supplies the value, and the system accepts it. This distinction matters for the data model: fixed vocabularies can be validated and translated as a closed set; open ones are free-form tags that get translated opportunistically. See the [ontology reference](../../reference/ontology/index.md) for the full vocabularies and [ADR 0018](../adr/0018-ontology-data-model.md) for how this maps to storage.

The structure described here is governed by [three universal rules](rules.md) — Autonomy, Substantivization, and Instrumental disambiguation — which constrain how levels are named and disambiguated.
