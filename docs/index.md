<img class="logo-light" src="assets/images/light_logo_wordmark.svg" alt="TomeTrove" width="400">
<img class="logo-dark" src="assets/images/dark_logo_wordmark.svg" alt="TomeTrove" width="400">

The definitive book list — track books you want, monitor prices across stores, and get alerts when the price drops.

## What it does

- **Wish list** — keep track of books you want to read or buy. Search by title or author, add to your list, organize into custom lists.
- **Price monitoring** — mark books as monitored and TomeTrove fetches prices from supported stores on a schedule. See price history charts and spot the best time to buy.
- **Price alerts** — set a target price and get notified when a monitored book drops below your threshold.
- **Book classification** — a custom ontology of 9 editorial Types (Fiction, Poetry, Theatre, Comics, Essay, Memoir, Manual, Travel, Reference) with genre hierarchies and dynamic tags. Browse by type, genre, or tag — not just a flat search.
- **Internationalization** — the ontology is translatable. Author names are stored in both Latin and original script, displayed according to the user's UI language.
- **Public list sharing** — share a read-only wish list via a token link, no login required.

## Tech stack

| Layer    | Technology                                                             |
|----------|------------------------------------------------------------------------|
| Runtime  | [Cloudflare Workers](https://workers.cloudflare.com/)                  |
| Database | [TiDB Cloud](https://tidbcloud.com/) (MySQL-compatible) via Hyperdrive |
| ORM      | [Drizzle ORM](https://orm.drizzle.team/)                               |
| API      | [Hono](https://hono.dev/) — REST with HATEOAS pagination               |
| Frontend | Multi-page app with [Alpine.js](https://alpinejs.dev/)                 |
| Auth     | GitHub OAuth + JWT                                                     |

## Documentation

This site follows the [Diátaxis](https://diataxis.fr/) framework, which organizes content into four quadrants based on the reader's intent.

| Quadrant        | Path                                   | Purpose                                                                                                  | Audience                  |
|-----------------|----------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------|
| **Tutorials**   | [`tutorials/`](tutorials/index.md)     | Learning-oriented guides. Walk a newcomer through a task end-to-end so they learn by doing.              | New to the project        |
| **How-to**      | [`how-to/`](how-to/index.md)           | Task-oriented guides. Solve a specific, real-world problem. Assumes some familiarity.                    | Practitioners             |
| **Reference**   | [`reference/`](reference/index.md)     | Information-oriented. Describe the machinery neutrally — APIs, schemas, config. No explanation.          | Anyone who needs a fact   |
| **Explanation** | [`explanation/`](explanation/index.md) | Understanding-oriented. Discourse, background, trade-offs, and **Architecture Decision Records (ADRs)**. | People who want the "why" |

Highlights:

- **[Architecture Decision Records](explanation/adr/index.md)** — every major design choice, from the runtime to the ontology i18n strategy.
- **[Data model reference](reference/data-model.md)** — tables, fields, types, and constraints.
- **[Book classification ontology](reference/ontology/index.md)** — the 9 Types, genre hierarchies, and modifier vocabularies.
- **[Contributor guides](contributor/coding.md)** — coding style, documentation style, Cloudflare Workers reference.
