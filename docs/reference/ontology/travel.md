# Travel

Itineraries and description of places.

## Genre hierarchies

| Classification                 | Description                | Examples                                                                                                                         |
|--------------------------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `Travel/<Continent>`           | Travel by continent        | *Rick Steves Europe Through the Back Door* (Rick Steves) → `Travel/Europe`, *Lonely Planet Asia* (Lonely Planet) → `Travel/Asia` |
| `Travel/<Continent>/<Country>` | Travel scoped to a country | *Rick Steves Italy* (Rick Steves) → `Travel/Europe/Italy`                                                                        |

Place subjects are **scope modifiers**, not standalone classifications. They attach to an existing Type/Genre. The mapping layer should treat a place subject as a `<Country>` tag on the primary classification, not as the primary classification itself.
