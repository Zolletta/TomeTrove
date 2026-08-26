# Ontology Reference

This is the reference for TomeTrove's book classification ontology: the closed list of Types, the genre hierarchies per Type, and the dynamic modifier vocabularies. For the rules that resolve overlaps between Types and Genres, see [Disambiguation rules](disambiguation-rules.md). For the mapping of each classification to OpenLibrary subjects and Google Books categories, see [Ontology mappings](ontology-mappings.md). For the design rationale, see the [ontology explanation](../../explanation/ontology/index.md).

## Types

- [Comics](comics.md) — sequential art
- [Essay](essay.md) — analysis, criticism, theory
- [Fiction](fiction.md) — prose narrative
- [Manual](manual.md) — technical-operational instructions
- [Memoir](memoir.md) — personal memory with narrative style
- [Poetry](poetry.md) — verse
- [Reference](reference-type.md) — point lookup (encyclopedia, dictionary, sacred text)
- [Theatre](theatre.md) — stage scripts
- [Travel](travel.md) — itineraries and place description


### [Comics](comics.md)

```text
Comics
├── Adventure
├── Children
├── Experimentation
├── Fantasy
├── History
├── Horror
├── Humor
├── Mystery
├── Romance
└── Science Fiction
```


### [Essay](essay.md)

Dynamic modifiers: [Instrument](dynamic-modifiers.md#instrument) - [Sport](dynamic-modifiers.md#sport) - [Faith](dynamic-modifiers.md#faith) - [Culture](dynamic-modifiers.md#culture) - [Art](dynamic-modifiers.md#art) - [Common essay subgenres](dynamic-modifiers.md#common-essay-subgenres) - [Country](dynamic-modifiers.md#country)

```text
Essay
├─── <Arts>
│   ├── Catalogue
│   └── <Common Essay Subgenres>
├─── Anthropology
│   └── <Common Essay Subgenres>
├─── Archaeology
│   └── <Common Essay Subgenres>
├─── Astronomy
│   └── <Common Essay Subgenres>
├─── Biology
│   └── <Common Essay Subgenres>
├─── Botany
│   └── <Common Essay Subgenres>
├─── Chemistry
│   └── <Common Essay Subgenres>
├─── Communication
│   └── <Common Essay Subgenres>
├─── Ecology
│   └── <Common Essay Subgenres>
├─── Economics
│   └── <Common Essay Subgenres>
├── Esotericism
├─── History
│   ├── Ancient
│   ├── Contemporary
│   ├── Critique
│   ├── Medieval
│   ├── Modern
│   ├── <Country>
│   ├── Monograph
│   └── Theory
├─── Mathematics
│   └── <Common Essay Subgenres>
├─── Medicine
│   └── <Common Essay Subgenres>
├── Music
│   ├── Classical
│   ├── Electronic
│   ├── Jazz
│   ├── <Instrument>
│   ├── Opera
│   ├── Pop
│   ├── Rock
│   └── <Common Essay Subgenres>
├── Mythology
│   └── <Culture>
├─── Nature
│   └── <Common Essay Subgenres>
├─── Neuroscience
│   └── <Common Essay Subgenres>
├─── Philosophy
│   └── <Common Essay Subgenres>
├─── Physics
│   └── <Common Essay Subgenres>
├─── Politics
│   └── <Common Essay Subgenres>
├── Poetry
│   └── <Common Essay Subgenres>
├─── Psychology
│   ├── Analysis
│   ├── Behavioral
│   ├── Clinical
│   ├── Cognitive
│   ├── Development
│   ├── Social
│   └── <Common Essay Subgenres>
├── Religion
│   ├── <Faith>/Institution
│   ├── <Faith>/History
│   ├── <Faith>
│   └── History
├── Sport
│   └── <Sport>
└── Theatre
    └── <Common Essay Subgenres>
```

### [Fiction](fiction.md)

```text
Fiction
├── Adventure
│   ├── Exploration
│   ├── Sea
│   ├── History
│   ├── Survival
│   └── Treasure
├── Experimentation
│   ├── Language
│   ├── Satire
│   ├── Structure
│   └── Surrealism
├── Fantasy
│   ├── Adventure
│   ├── Children
│   ├── Epic
│   ├── Myth
│   └── Urban
├── Horror
│   ├── Body
│   ├── Creature
│   ├── Folk
│   ├── Gothic
│   ├── Psychology
│   └── Slasher
├── Humor
│   ├── Absurd
│   ├── Children
│   ├── Parody
│   └── Satire
├── Magical Realism
├── Mystery
│   ├── Investigation
│   ├── History
│   └── Humor
├── Science Fiction
│   ├── Alien
│   ├── Cyberpunk
│   ├── Dystopia
│   ├── Hard Sci-Fi
│   ├── Space
│   ├── Time
│   └── Uchronia
├── Romance
│   ├── Death
│   ├── Destiny
│   ├── History
│   ├── Memory
│   └── Second Chance
└── Thriller
   ├── Action
   ├── Politics
   └── Psychology
```


### [Manual](manual.md)

Dynamic modifiers: [ProgrammingLanguage](dynamic-modifiers.md#programminglanguage) - [Language](dynamic-modifiers.md#language) - [Cuisine](dynamic-modifiers.md#cuisine) - [Instrument](dynamic-modifiers.md#instrument) - [Sport](dynamic-modifiers.md#sport) - [Animal](dynamic-modifiers.md#animal)

```text
Manual
├── <Animal>
├── <Art>
├── Cooking
│   ├── Recipe
│   ├── Recipe/<Cuisine>
│   ├── Technique
│   └── Wine
├── Computer Science
│   ├── Algorithm
│   ├── DevOps
│   ├── <ProgrammingLanguage>
│   ├── Security
│   └── Software
├── Craft
├── Dance
├── Gardening
├── Health
├── <Language>
├── <Instrument>
└── <Sport>
```

### [Memoir](memoir.md)

```text
Memoir
├── Autobiography
├── Biography
└── Personal
```

### [Poetry](poetry.md)

```text
Poetry
├── Elegy
├── Epic
├── Lyric
├── Ode
└── Sonnet
```

### [Reference](reference-type.md)

Dynamic modifiers: [Language](dynamic-modifiers.md#language) - [Faith](dynamic-modifiers.md#faith)

```text
Reference
├── Atlas
├── Catalogue
├── Dictionary
│   └── <Language>
├── Encyclopedia
├── Humor
├── Religion
│   └── <Faith>
└── Yearbook
```

### [Theatre](theatre.md)

```text
Theatre
├── Comedy
└── Tragedy
```

### [Travel](travel.md)

Dynamic modifiers: [Continent](dynamic-modifiers.md#continent) - [Country](dynamic-modifiers.md#country)

```text
Travel
└── <Continent>
    └── <Country>
```
