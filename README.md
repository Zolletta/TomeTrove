# TomeTrove

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
| Docs     | [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)        |

## Documentation

The full documentation is at [tometrove.zolletta.org](https://tometrove.zolletta.org/) and covers:

- **Architecture Decision Records** — 23 ADRs documenting every major design choice, from the runtime to the ontology i18n strategy.
- **Data model reference** — tables, fields, types, and constraints.
- **Book classification ontology** — the 9 Types, genre hierarchies, and modifier vocabularies.
- **Contributor guides** — coding style, documentation style, Cloudflare Workers reference.

## Development

```bash
npx wrangler dev      # local development
npx biome check --write  # format + lint
npx tsc --noEmit      # type check
npx vitest            # run tests
```

See the [contributing guide](CONTRIBUTING.md) and the [coding style](docs/contributor/coding.md) for details.

## License

[MIT](LICENSE)
