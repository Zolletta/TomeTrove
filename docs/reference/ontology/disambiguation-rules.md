# Disambiguation rules

When a work could fit more than one Type or Genre, apply these rules to pick exactly one classification. The rules are decision rules — mechanical, not subjective. For the design rationale behind disambiguation as a universal principle, see [the three universal rules](../../explanation/ontology/rules.md) (rule 3, Instrumental disambiguation).

These rules consolidate the per-Type disambiguation notes that appear on each [Type page](index.md). If a rule here and a Type page ever disagree, treat this page as canonical and open an issue.

## Banned terms

Some labels are rejected outright and must be declined into an allowed classification:

- **"Noir"** is banned. If a book is labelled "Noir", convert it: if there is an investigation, use `Fiction/Mystery/Investigation`; if it is a tale of urban despair without a clear investigation, use `Fiction/Thriller/Psychology`.
- **"Dramaturgy"** is banned as a genre. Use `Theatre`.
- **"Fantastic"** is banned as a genre. Decline it into `Fiction/Fantasy`, `Fiction/Science Fiction`, or `Fiction/Magical Realism`.

## Essayistic vs Narrative

The same genre name can sit under two different Types with opposite meanings.

- If the volume **analyzes** the history of a genre, the Type is `Essay` and the ontology is `<Genre>/History`.
- `Fiction/<Genre>/History` means a **story set in the past**, not an essay about the genre.

## Works about a person

A work based on a person follows one of three distinct paths — choose by the work's relationship to its subject:

1. **Monograph** — a critical/technical study of the person's *work* (e.g. `Essay/Music/Monograph`). The subject's name is not a level; the ontology only says "this is a specific study on a personality".
2. **Biography / Autobiography** — a documentary, factual reconstruction of a *life* (`Memoir/Biography`, `Memoir/Autobiography`).
3. **Memoir** — a subjective account with narrative style, not tied to a specific person (`Memoir/Personal`).

A TomeTrove biography is always `Memoir/Biography` (or `Autobiography`) with **no discipline in the path**. The subject's profession, gender, and era are metadata, not ontology levels. A *critical study* of a person's work is `Essay/<Argument>/Monograph`, not a biography.

## Essay facets

The five facets under `Essay/<Discipline>/` answer one question: *what does the book do with its material?* They are mutually exclusive; apply the tests in the order below and take the first that fires.

### 1. Catalogue

A list of works, usually with reproductions and a checklist (dimensions, dates, owners).

- OpenLibrary: `exhibitions`, `catalogs`, `catalogues_raisonnes`.
- Record names an exhibition, a venue and a date span, or a collection.
- The prose is front matter to the plates, not the substance of the book.

### 2. Monograph

A study devoted to a **single subject**, treated exhaustively. "Subject" is meant grammatically, not biographically: it may be a person, but equally a building, an object, a species, one work, a technique, or a movement.

- OpenLibrary: one subject naming an entity (a personal name, a named work, a place-plus-thing).
- The scope never widens: no second artist, no comparison set, no period survey.
- A monograph *about a person* stays a `Monograph` when the person's **work** is the object (an artist's paintings, an architect's buildings, a philosopher's system). It becomes `Memoir/Biography` when the **life** is the object.

### 3. Critique

An evaluative reading of works by more than one hand.

- OpenLibrary: `criticism_and_interpretation`, `book_reviews`, `aesthetics` combined with a genre.
- Several makers or several works are weighed against each other.
- If exactly one subject is read → `Monograph`. If the arrangement is chronological and the claim is what happened rather than what is good → `History`.

### 4. History

A narrative of many agents over time.

- OpenLibrary: `history` plus a period subject (`19th_century`, `middle_ages`, a date range).
- The title or subtitle often carries a date span.
- `History/<Country>` when a place subject is also present; resolve the country from that subject.

### 5. Theory

An argument about the discipline itself rather than about particular works.

- OpenLibrary: `philosophy`, `aesthetics`, `theory`, `methodology`, and **no** `history` or `criticism_and_interpretation`.
- Defines terms, proposes a method, or states general laws; examples are illustrations, not objects.

### Ties

| Signal pair                                            | Resolution                                   |
|--------------------------------------------------------|----------------------------------------------|
| `history` + one named subject                          | `Monograph`                                  |
| `history` + `criticism_and_interpretation`, many works | `History` (dated) or `Critique` (evaluative) |
| `exhibitions` + one named artist                       | `Catalogue`                                  |
| `philosophy` + `history`                               | `History` of the field's ideas               |
| `biography` and the life is the object                 | `Memoir/Biography`                           |

### External mapping consequences

- OpenLibrary carries the facet directly, which is why it is the primary source on import.
- BISAC has no facet axis. Several facets therefore export to one heading: all five `Essay/Poetry/*` rows, all per-discipline science `History` rows (`Science / History`), and `Theory` rows (`Science / Philosophy & Social Aspects`).
- BISAC's `Individual <Role> / Monographs` headings (Art, Architecture, Photography, Design, Music, Philosophy, Performing Arts) presuppose a person. When the monograph's subject is not a person, use the discipline heading given on the `Critique` row instead.
- BISAC has no per-faith institutions or reference heading, so `Essay/Religion/<Faith>/Institution` and `Reference/Religion/<Faith>` lose the faith on export; it survives in the OpenLibrary column.

## Religion, Esotericism, Mythology

- **Sacred texts** live in `Reference/Religion/<Faith>` to avoid dispersion (e.g. *The Bible* → `Reference/Religion/Christianity`).
- **Essays on religion** use `Essay/Religion/<Faith>`, `Essay/Religion/History`, or `Essay/Religion/<Faith>/Institution`.
- **Esotericism** is a root genre for esoteric and initiatory traditions.
- **Mythology** is an autonomous genre for ancient cultures, using `Essay/Mythology/<Culture>`.
- **Fictional myth vs religion**: a narrative reworking of ancient deities (Greece, Norse) is `Fiction/Fantasy/Myth`. A text concerning active faiths or sacred texts shifts to `Religion/<Faith>`.

## Humor

- **Humor as genre vs modifier**: if humor is the main engine of the plot, use `Humor` as the genre. If humor is secondary to another genre, use the primary genre and let humor be a subgenre (e.g. `Fiction/Mystery/Humor`).
- **Satire vs Parody**: satire targets real institutions or behaviours; parody mimics and exaggerates a specific literary work or genre.
- **Humor vs Memoir**: humorous autobiographical works (e.g. David Sedaris, Bill Bryson) are `Memoir/Autobiography`, not `Fiction/Humor`. Humor as a Fiction genre applies only when humor is the primary engine of a *fictional* narrative.
- **Joke collections** are not narrative fiction. They belong to `Reference/Humor`, not `Fiction/Humor`.

## Catalogue vs Essay

- A catalogue **with critical/analytical content** is `Essay/<Art>/Catalogue`.
- A **pure inventory** with no analytical content (auction catalogues, collection listings) is `Reference/Catalogue`.
- The distinction is the presence of critical/analytical text, not the format.

## Comics boundaries

- Comics works can span any genre: a graphic novel can be mystery, fantasy, memoir, essay, etc.
- **Comics vs Fiction** is structural: Comics tells stories through panels and images, Fiction through prose paragraphs.
- **Comics vs Reference**: Comics is narrative content told through images. A photography book or art catalogue is not Comics — it is `Essay` or `Reference` with visual content.

## Theatre boundaries

- **Type `Theatre`** is used for the dramatic text (the script). The comedy/tragedy distinction is ontological (`Theatre/Comedy`, `Theatre/Tragedy`).
- **Type `Essay`** is used for essays *on* theatre, with ontology `Essay/Theatre/History` or `Essay/Theatre/Critique`.
- **Opera libretti** are grouped under `Music/Opera` (see [Essay](essay.md)), not under Theatre, because users expect to find them in the music compartment. The Type still separates the script (`Theatre`) from the analysis (`Essay`).

## Fiction genre rules

### Mystery and Thriller

- **Mystery**: classic investigation structure (mystery, inquiry, deduction). Focus on solving an enigma.
- **Thriller**: action, suspense, or a psychological/political component prevails. Focus on imminent danger.
- **Spy stories** (e.g. Le Carré) fall under `Fiction/Thriller/Politics`.
- **Historical Mystery**: if the protagonist is a real historical figure who investigates, the ontology remains `Fiction/Mystery/History`.

### Fantasy and Magical Realism

- **Fantasy vs Magical Realism**: if the magical element is placed in an otherwise real, everyday world *without explanations* (Márquez, Allende), use `Fiction/Magical Realism`. If the magical element defines the rules of the world or involves a mission/adventure, use `Fiction/Fantasy`.
- **High Fantasy**: all works with complex world-building and a secondary world with its own rules (Tolkien, Jordan) go in `Fiction/Fantasy/Epic`.
- **Low Fantasy**: magical elements intrude into the real world with *explained* magic systems. This folds into `Fiction/Fantasy/Urban` (contemporary setting) or `Fiction/Fantasy/Adventure` (quest-driven). The distinction from Magical Realism is that Low Fantasy has *explained* magic, while Magical Realism has *unexplained* magic.
- **Children's target**: if the work is explicitly for children (classic fairy tales, moral fables), use `Fiction/Fantasy/Children`.

### Science Fiction

- Works with "hard-boiled" atmospheres are classified under the prevalent technology (e.g. `Fiction/Science Fiction/Cyberpunk`).
- **Uchronia vs Dystopia**: Uchronia focuses on the altered past timeline (a historical divergence point). Dystopia focuses on the nature of society (oppressive, totalitarian).
- **Hard Sci-Fi** is reserved for works where scientific rigour is the plot's engine.

### Horror

- **Folk vs Psychology**: Folk horror is about communal/cultural dread, pagan rituals, isolation, and the horror of place and tradition (*Midsommar*, *The Witch*). Psychology is about mental breakdown and inner unease (*Rosemary's Baby*, Shirley Jackson). They are distinct: Folk is about *place and tradition*, Psychology is about *mind*. A work can be both (`Fiction/Horror/Psychology/Folk`), but if only one applies, choose by the primary engine of fear.
- **Gothic vs Cosmic**: Gothic horror is about atmosphere, castles, dark romanticism (*Dracula*, Poe). Cosmic horror is about ineffable entities and the insignificance of humanity (Lovecraft). Both are listed under `Fiction/Horror/Gothic` as a combined subgenre since they share the atmosphere of dread, but Cosmic could be separated if needed.

### Adventure vs Thriller/Action

- **Thriller/Action**: the protagonist is *threatened*. Danger comes to them. Focus on tension, pursuit, escape (*The Great Train Robbery*, *The Bourne Identity*).
- **Adventure**: the protagonist *seeks*. They go toward the unknown. Focus on exploration, quest, discovery (*Treasure Island*, *Into the Wild*).
- **Edge cases**: works like *Indiana Jones* are both — the protagonist seeks treasure (Adventure) while being pursued (Thriller). Classify by the primary engine: if the quest dominates, `Fiction/Adventure`; if the danger dominates, `Fiction/Thriller/Action`.

### Experimentation

- Experimentation is a genre for fiction where the formal innovation **is** the content — the experiment is not a style applied to a story, it *is* the story. Not all experimental fiction is satirical or humorous (Kafka, Beckett, Robbe-Grillet are experimental but not comedy), so Experimentation is its own genre, not under Humor.
- **Experimentation vs content-based genres**: if the formal experiment is the primary characteristic, use `Experimentation`. If the work is primarily a mystery that happens to be experimental, use `Mystery` (the experiment is secondary).
- **Experimentation vs Surrealism**: Surrealism is a specific experimental approach (dream logic, automatic writing, juxtaposition). It is a subgenre of Experimentation, not a separate genre.

## Essay-internal rules

### Music

- **Opera (`Music/Opera`)** groups both libretti (technically theatrical texts) and critical essays. The user looking for "Aida" or an essay on Verdi expects to find everything in the music compartment. The distinction between text and criticism is left to the Type (`Theatre` for the script, `Essay` for the analysis).

### Nature

- `Botany`: study of plants.
- `Ecology`: study of the relationships between organisms and their environment.
- Under `Nature/` we group what concerns the external environment not strictly clinical.
