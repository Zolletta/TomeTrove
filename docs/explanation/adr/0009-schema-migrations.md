# ADR 0009: Schema management & migrations

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove uses TiDB Cloud Starter (MySQL-compatible) via Hyperdrive ([ADR 0003](0003-database-choice.md)). The schema is significantly complex — see the [data model reference](../../reference/data-model.md) for the full spec. Key tables: `user`, `user_preference`, `user_language`, `book`, `book_author`, `edition`, `price_quote`, `type`, `genre`, `translation`, `language`, `author`, `store`, `alert`. The schema will evolve as features are built.

The author is used to Laravel migrations / Doctrine migrations from PHP.

Constraints:

- TiDB is MySQL — migration tools that target MySQL are relevant, not SQLite tools.
- The chosen tool must not fight the TS learning goal ([ADR 0011](0011-learning-path-ts-via-php.md)): a TS-defined schema teaches TS types; a DSL schema (Prisma's `.prisma` file) teaches a tool-specific language.
- The schema has relationships (foreign keys, junction tables), a tree (genres), and arrays (aliases, tags, capabilities) — the tool must handle these ergonomically.
- MySQL arrays: MySQL doesn't have a native array type. Arrays (aliases, tags, ships_to, languages) will be stored as JSON columns or junction tables — the tool must support JSON columns.
- Workers bundle size matters: the free plan has a 3 MB compressed limit (10 MB paid). A query engine (WASM) consumes a significant chunk of that budget.

### Drizzle ORM + Drizzle Kit

[Drizzle ORM](https://orm.drizzle.team/) — lightweight TypeScript SQL builder and ORM.

- **Dedicated TiDB package**: `drizzle-orm/tidb-serverless` (since v0.31.2), using the `@tidbcloud/serverless` HTTP driver. Officially documented by both Drizzle and TiDB.
- **Schema is TypeScript**: tables defined with `mysqlTable('books', { id: serial(), title: varchar()... })` — pure TS, reinforces the learning goal ([ADR 0011](0011-learning-path-ts-via-php.md)).
- **No query engine**: Drizzle is a SQL builder, not a full ORM. No WASM, no external process. The Worker bundle stays small.
- **Returns plain typed objects**: query results are plain TS objects matching your schema types — exactly the "data as interfaces" pattern from [ADR 0011](0011-learning-path-ts-via-php.md). No class instances, no hydration.
- **Migrations**: Drizzle Kit generates SQL migration files from your TS schema (`drizzle-kit generate`). You write TS schema → it produces SQL → you apply it. Similar to Laravel migrations but schema-as-TS-code.
- **JSON columns**: supported (`json()` column type) — for array fields (aliases, tags, ships_to, languages).
- **MySQL dialect**: full MySQL support including foreign keys, indexes, junction tables.
- **SQL visibility**: query builder (`db.select().from(books).where(eq(books.id, 1))`) is close to SQL — you see what's happening. Familiar to someone with PHP/MySQL background.

### Prisma (the heavier alternative)

[Prisma](https://www.prisma.io/) — full ORM with its own schema DSL and query engine.

- **TiDB adapter**: `@tidbcloud/prisma-adapter` exists and works on Workers (community-proven), though the docs have a caveat about edge compatibility.
- **Schema is Prisma's own DSL**: `.prisma` file with `model Book { id Int @id, title String }` — not TypeScript. You learn Prisma's schema language, not TS types.
- **Query engine**: Prisma Client includes a WASM query engine (~1-3 MB) on Workers. Heavier bundle, more complexity. The engine runs inside the Worker and generates SQL from Prisma's API calls.
- **Migrations**: `prisma migrate` generates and applies SQL migrations from the `.prisma` schema.
- **Abstracts SQL away more**: `prisma.book.findUnique({ where: { id: 1 } })` hides the SQL. Less SQL to write but also less SQL to learn.
- **Relations ergonomics**: `prisma.book.findUnique({ include: { editions: true, authors: true } })` is very convenient for nested fetches. Drizzle's relation queries are more manual (you write the joins or separate queries).

### Raw SQL migrations + a TS migration runner

Full control; most SQL to write; no generated types; the author writes TS types for query results manually. Rejected: too much boilerplate and the TS learning value is in the schema definition, not in hand-writing types that a tool can generate.

### Atlas

Schema-as-code (HCL or SQL); generates migrations; not TS-native; less TS learning value. Rejected.

## Options

1. **Drizzle ORM + Drizzle Kit** — TS schema; SQL builder (no engine); generates SQL migrations; TiDB Serverless support; lightweight; strong TS learning value. **Chosen.**
2. **Prisma** — DSL schema; WASM query engine; heavier; less TS learning value; good relation ergonomics.
3. **Raw SQL migrations + TS migration runner** — full control; most boilerplate; no generated types.
4. **Atlas** — schema-as-code; not TS-native.

## Decision

Adopt **option 1: Drizzle ORM + Drizzle Kit**.

- **Schema definition**: TS files using `drizzle-orm/mysql-core` (`mysqlTable`, `varchar`, `serial`, `json`, etc.). Schema lives in `src/db/schema.ts`.
- **Migrations**: Drizzle Kit generates SQL migration files from the TS schema (`drizzle-kit generate`). Migrations live in `./drizzle/` and are applied via `drizzle-kit migrate` or a custom runner.
- **Database connection**: `drizzle-orm/tidb-serverless` with `@tidbcloud/serverless` HTTP driver for edge environments. For local development (`wrangler dev`), a local MySQL instance via Hyperdrive's `localConnectionString` ([ADR 0003](0003-database-choice.md)).
- **Array fields** (aliases, tags, ships_to, languages): stored as JSON columns using Drizzle's `json()` type. Junction tables are an alternative if query performance on array contents becomes important, but JSON columns are simpler to start with.
- **Query results**: plain typed objects matching the schema — no hydration, no class instances. Fits the "data as interfaces + behaviour as service classes" pattern from [ADR 0011](0011-learning-path-ts-via-php.md).

## Consequences

- **Positive**: schema is TypeScript — reinforces the TS learning goal every time a table is defined; no WASM query engine — Worker bundle stays small; query results are plain typed objects — fits the data-as-interfaces pattern ([ADR 0011](0011-learning-path-ts-via-php.md)); SQL builder is close to SQL — familiar to someone with PHP/MySQL background and teaches SQL alongside TS; Drizzle Kit generates SQL migrations from TS schema — similar to Laravel migrations but schema-as-code; dedicated TiDB Serverless package — officially supported by both Drizzle and TiDB; JSON columns supported for array fields — no need for junction tables on day one.
- **Negative**: relation queries are more manual than Prisma's `include` — nested fetches (book + editions + authors + price_quotes) require explicit joins or multiple queries; Drizzle's documentation is thinner than Prisma's for complex edge cases; Drizzle Kit's migration generation is less mature than Prisma Migrate for complex schema changes (e.g. column renames may be detected as drop+add, losing data).
- **Neutral**: if relation query ergonomics become painful, Drizzle's relational queries API (`db.query.books.findMany({ with: { editions: true } })`) provides a Prisma-like nested fetch syntax — it's available but less mature than Prisma's; the migration runner (how migrations are applied in production) is a separate concern — Drizzle Kit provides `migrate` but a custom runner via Workers may be needed since Workers don't have a traditional CLI deploy step for migrations.
