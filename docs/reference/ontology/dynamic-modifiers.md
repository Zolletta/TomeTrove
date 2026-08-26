# Dynamic modifier vocabularies

Dynamic modifiers are placeholders in the classification that the classifier fills with a specific value. They are not fixed genres — they are slots that adapt to the content.

## Animal

**Open vocabulary** — common species name, English, singular. Examples: `Dog`, `Cat`, `Horse`, `Bird`, `Fish`, `Rabbit`, `Bee`.

## Art

Used in `Essay/<Art>` and its dynamic subcategories.

- Dance
- Photography
- Painting
- Architecture
- Cinema
- Design
- Fashion
- Sculpture
- Graphics
- Comics
- Animation
- Theatre
- Installation
- Performance
- Literature

## Common Essay Subgenres

**Fixed vocabulary**:

- Critique
- History
- History/<Country>
- Monograph
- Theory

Note: `Essay/History` no longer uses `<Common Essay Subgenres>` — its children (Ancient, Contemporary, Critique, Medieval, Modern, `<Country>`, Monograph, Theory) are inlined directly. All other Essay disciplines still use `<Common Essay Subgenres>`.

## Continent

**Fixed vocabulary**:

- Africa
- Asia
- Europe
- America
- Oceania
- Antarctica

## Country

**Open vocabulary** — the name of a sovereign state, in English, singular form. Examples: `Italy`, `France`, `Japan`, `United States`, `Brazil`, `Egypt`, `Australia`.

## Cuisine

**Open vocabulary**, can be any of:

- **Country**: `Italy`, `France`, `Japan`, `Mexico`, `India`, `Thailand`, `China`
- **Regional style**: `Mediterranean`, `Nordic`, `Latin`, `Asian`, `Middle East`
- **Dietary type**: `Vegan`, `Vegetarian`, `Gluten-Free`, `Keto`, `Halal`, `Kosher`
- **Cooking type**: `Pastry`, `Baking`, `Grill`, `Fermentation`, `Preserving`

## Culture

 **Open vocabulary** — name of an ancient or distinct cultural tradition. Examples: `Greece`, `Egypt`, `Rome`, `Norse`, `Celtic`, `Mesopotamia`, `Persia`, `India`, `China`, `Japan`, `Aztec`, `Maya`, `Inca`, `Africa`, `Slavic`.

## Faith

**Fixed vocabulary**:

- Catholic
- Protestant
- Islam
- Hinduism
- Buddhism
- Judaism
- Sikhism
- Shinto
- Taoism
- Bahai
- Jainism
- Zoroastrianism
- Animism

## Instrument

**Open vocabulary**. Examples: `Piano`, `Guitar`, `Violin`, `Drums`, `Flute`, `Trumpet`, `Cello`, `Saxophone`.

## Language

**Open vocabulary** — Name of a natural language, capitalized. Examples: `English`, `Italian`, `French`, `German`, `Spanish`, `Portuguese`, `Japanese`, `Chinese`, `Arabic`, `Russian`, `Hindi`, `Korean`, `Dutch`, `Swedish`, `Latin`, `Greek`, `Hebrew`

## ProgrammingLanguage

**Open vocabulary**. Examples: `JavaScript`, `Python`, `Java`, `C`, `C++`, `C#`, `Go`, `Rust`, `Ruby`, `PHP`, `Swift`, `Kotlin`, `TypeScript`, `SQL`, `R`, `Scala`, `Haskell`, `Assembly`.

## Sport


**Open vocabulary**. Examples: `Soccer`, `Tennis`, `Golf`, `Basketball`, `Swimming`, `Cycling`, `Boxing`, `Skiing`.
