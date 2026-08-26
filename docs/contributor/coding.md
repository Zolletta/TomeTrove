# Coding style

This page is the canonical reference for coding conventions in TomeTrove. For the Cloudflare runtime context (wrangler, drizzle-kit, Workers limits), see [Cloudflare Workers](cloudflare-workers.md). For documentation conventions, see [Documentation style](documentation.md).

## Language

TomeTrove is written in TypeScript and runs on Cloudflare Workers (see [ADR 0001](../explanation/adr/0001-typescript-as-primary-language.md) and [ADR 0002](../explanation/adr/0002-cloudflare-workers-runtime.md)).

## Formatting and linting

[Biome](https://biomejs.dev/) is the single tool for formatting, linting, and auto-fixing. Run it before committing:

```bash
npx biome check --write
```

Type-check with the [TypeScript](https://www.typescriptlang.org/) compiler (no emit):

```bash
npx tsc --noEmit
```

## Method binding (ADR 0012)

Service class methods use **arrow function properties** so that `this` is bound at construction time and methods are safe to pass as callbacks:

```typescript
class BookService {
    constructor(private repo: BookRepository) {}

    markAsRead = async (book: Book): Promise<Book> => {
        return this.repo.save({ ...book, status: "read" });
    };
}
```

Route handlers use **anonymous arrow wrappers** that call service methods — the idiomatic Hono pattern (see [ADR 0008](../explanation/adr/0008-http-routing.md) for the routing architecture):

```typescript
router.get("/books/:id/read", async (c) => {
    await service.markAsRead(c.req.param("id"));
});
```

Do not use `.bind()` at call sites or in constructors. See [ADR 0012](../explanation/adr/0012-method-binding-strategy.md) for the full rationale.

## Testing

[Vitest](https://vitest.dev/) with the Workers runtime is the test framework (see [ADR 0010](../explanation/adr/0010-testing-strategy.md)):

```bash
npx vitest
```

## Schema changes

After changing `src/db/schema.ts`, generate a migration and apply it with [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview). For the migration strategy, see [ADR 0009](../explanation/adr/0009-schema-migrations.md); for the database choice (TiDB Cloud Starter + Drizzle), see [ADR 0003](../explanation/adr/0003-database-choice.md).

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Database connection

TomeTrove uses [TiDB Cloud Starter](https://www.pingcap.com/tidb-cloud/) (MySQL-compatible) as its database ([ADR 0003](../explanation/adr/0003-database-choice.md)). Workers run on the V8 engine and cannot make direct TCP connections, so TomeTrove uses the [`@tidbcloud/serverless`](https://www.npmjs.com/package/@tidbcloud/serverless) driver, which connects to TiDB over HTTP. This is the [official integration path](https://docs.pingcap.com/tidbcloud/integrate-tidbcloud-with-cloudflare/) documented by PingCAP for Cloudflare Workers.

### Setup

The driver is installed as a dependency:

```bash
npm install @tidbcloud/serverless
```

The connection string is stored as a Worker secret (not in `wrangler.jsonc`):

```bash
npx wrangler secret put DATABASE_URL
```

The URL follows the `mysql://username:password@host/database` format. Get it from the TiDB Cloud console (Cluster → Connect → Serverless Driver).

### Usage with Drizzle

Drizzle ORM connects through the serverless driver. The driver provides a `connect()` function that returns a connection object Drizzle can use:

```typescript
import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/mysql-serverless";

const conn = connect({ url: env.DATABASE_URL });
const db = drizzle(conn);
```

The connection is created per-request (Workers cannot keep TCP connections alive between requests). The serverless driver handles pooling internally over HTTP — no Hyperdrive binding needed.

### Local development

For `wrangler dev`, set `DATABASE_URL` in `.dev.vars` (gitignored):

```
DATABASE_URL=mysql://username:password@host/database
```

Use a local MySQL instance or a TiDB Cloud Starter dev cluster for local development.

## Type generation

After changing bindings in `wrangler.jsonc`, regenerate the TypeScript types with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npx wrangler types
```

## Commits

TomeTrove uses [semantic commit messages](https://www.conventionalcommits.org/). Every commit must use this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Purpose                                                   |
|------------|-----------------------------------------------------------|
| `feat`     | A new feature                                             |
| `fix`      | A bug fix                                                 |
| `docs`     | Documentation-only changes (ADRs, reference docs, guides) |
| `refactor` | Code changes that neither fix a bug nor add a feature     |
| `test`     | Adding or correcting tests                                |
| `chore`    | Build, tooling, dependencies, CI configuration            |
| `style`    | Formatting, linting, whitespace — no code logic change    |
| `perf`     | Performance improvement                                   |

### Scope (optional)

The scope identifies the area of the codebase: `api`, `db`, `ontology`, `i18n`, `auth`, `frontend`, `logging`, etc. Examples: `feat(api): add GET /api/books endpoint`, `docs(adr): approve ADR 0023`.

### Rules

- The description is lowercase, imperative mood, no trailing period (e.g. `add price fetch endpoint`, not `Added price fetch endpoint.`).
- The body (if present) explains *why*, not *what* — the diff already shows what.
- Breaking changes use `!` after the type/scope: `feat(api)!: change pagination response shape` — and include a `BREAKING CHANGE:` footer.
- Squash commits before merging a PR — the PR's commit history should be clean and semantic.
