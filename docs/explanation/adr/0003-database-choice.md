# ADR 0003: Database — D1 vs TiDB Cloud Starter

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove needs relational storage for books, their metadata, status, tags, and (later) users. The author is **very familiar with MySQL** from 26 years of PHP work. Two serverless SQL databases are candidates.

### Cloudflare D1 (SQLite)

Limits (retrieved 2026-08-24 from `developers.cloudflare.com/d1/platform/limits`):

| Limit                 | Free                                               | Paid   |
|-----------------------|----------------------------------------------------|--------|
| Max database size     | 500 MB                                             | 10 GB  |
| Storage per account   | 5 GB                                               | 1 TB   |
| Databases per account | 10                                                 | 50,000 |
| Query duration        | 30 s                                               | 30 s   |
| Concurrency           | single-threaded per DB; ~1,000 QPS at 1 ms queries | same   |

- Native Workers binding (`env.DB`), no connection pooling needed.
- SQLite dialect (some MySQL syntax differences: no `AUTO_INCREMENT`, uses `INTEGER PRIMARY KEY` rowid; different `DATE` handling; `LIKE` is case-insensitive only for ASCII).
- Read replication available for global read latency.
- Free tier is generous for a personal book collection.

### TiDB Cloud Starter (MySQL-compatible)

Limits (retrieved 2026-08-24 from `pingcap.com` / `docs.pingcap.com`):

| Limit (per free instance) | Value      |
|---------------------------|------------|
| Row storage               | 5 GiB      |
| Columnar storage          | 5 GiB      |
| Request Units / month     | 50 million |
| Free instances / org      | 5          |

- **MySQL dialect** — directly maps to the author's existing mental model.
- External to Cloudflare; reached over the public network. From a Worker, either a direct driver (`@tidb.ai/serverless` / `mysql2`) or via **Hyperdrive** (see below).
- Built-in full-text search and vector search (could matter for book search later).
- Scales to zero; throttles (not bills) when the free quota is hit.

### Cloudflare Hyperdrive

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) is a Cloudflare service that accelerates access to **existing external** databases (Postgres or MySQL) from Workers. It provides two things:

1. **Global connection pooling** — Workers cannot keep TCP connections alive between requests, so without pooling every request pays a full TLS handshake to the external database. Hyperdrive maintains a pool of persistent connections at Cloudflare's edge; the Worker creates a "new" client per request, but it is cheap because Hyperdrive hands back a pooled connection.
2. **Query caching** — results of frequent read queries are cached at the edge, so repeat reads do not hit the database at all. On by default.

Key facts (retrieved 2026-08-24 from `developers.cloudflare.com/hyperdrive`):

- Available on **Free and Paid** plans — no extra cost to use it.
- Supports any Postgres or MySQL database hosted anywhere (AWS, GCP, Azure, Neon, PlanetScale, TiDB, etc.).
- You use your **existing driver/ORM** (`mysql2`, `pg`, Drizzle, Prisma, Kysely…); you point it at `env.HYPERDRIVE.connectionString` instead of a raw connection string.
- Requires the `nodejs_compat` compatibility flag in `wrangler.jsonc`.
- Configured as a binding: `"hyperdrive": [{ "binding": "HYPERDRIVE", "id": "<id>", "localConnectionString": "..." }]`.

**Relevance to this ADR**: D1 needs no Hyperdrive — it is a native in-process binding with sub-ms latency and no pooling to think about. TiDB (or any external MySQL) needs Hyperdrive to be ergonomic from a Worker; without it, every query pays a cold TLS handshake. With it, pooled connections plus cached reads close much of the latency gap with D1, at the cost of one extra binding and the `nodejs_compat` flag.

### Trade-off summary

| Concern                | D1                          | TiDB Cloud Starter                            |
|------------------------|-----------------------------|-----------------------------------------------|
| SQL dialect            | SQLite (new to author)      | MySQL (deeply familiar)                       |
| Workers integration    | Native binding, zero config | Network call; needs Hyperdrive or driver      |
| Latency from Worker    | Sub-ms, in-process          | Network RTT (mitigated by Hyperdrive caching) |
| Free tier for this app | Plenty                      | Plenty                                        |
| Search features        | Plain SQL `LIKE` / FTS5     | Built-in full-text + vector search            |
| Learning value         | New dialect to learn        | Familiar dialect; focus stays on TS, not SQL  |

## Options

1. **D1** — stay fully inside the Cloudflare ecosystem; learn SQLite dialect.
2. **TiDB Cloud Starter via Hyperdrive** — keep MySQL familiarity; add a network dependency and Hyperdrive binding; focus learning effort on TS rather than SQL.
3. **D1 now, TiDB later** — start with D1 for simplicity, design the data layer behind an interface so a swap is possible.

## Decision

Adopt **TiDB Cloud Starter** as the database, accessed from the Worker via **Cloudflare Hyperdrive**.

The primary motivation is alignment with the project's learning goal ([ADR 0001](0001-typescript-as-primary-language.md)): keeping the author in the familiar MySQL dialect ensures that friction encountered during development is TypeScript and Workers friction, not SQL-dialect friction. A secondary motivation is exposure to [TiDB](https://www.pingcap.com/tidb-cloud/) as a respected distributed-SQL/HTAP tool — while a personal book collection will not exercise TiDB's distributed-engineering strengths, familiarity with its console, connection model, billing (Request Units), and built-in full-text/vector search is genuine, transferable knowledge.

Option 3 (D1 now, TiDB later) is rejected: abstracting the data layer for a hypothetical future swap adds interface complexity now that may never pay off, and setting up the same database twice is wasted effort.

## Consequences

- **Positive**: SQL dialect is MySQL — the author's deep familiarity keeps cognitive load on TS, not SQL; Hyperdrive's connection pooling and query caching mitigate the network-RTT penalty of an external database; TiDB's built-in full-text and vector search are available if search becomes a feature later; the Request Units billing model and TiDB Cloud console are transferable knowledge; a TS-first ORM (Drizzle/Prisma — see [ADR 0009](0009-schema-migrations.md)) can generate typed access from the MySQL schema, reinforcing the TS learning goal.
- **Negative**: dev/prod parity is not free — `wrangler dev` needs a local MySQL instance (Hyperdrive's `localConnectionString` points at it), so a MySQL server must be installed and running on the development machine; the `nodejs_compat` compatibility flag is required in `wrangler.jsonc`; one extra binding (Hyperdrive) is a moving part that D1 would not have; every query is a network call, so latency is higher than D1's in-process binding even with Hyperdrive pooling; the free tier throttles (rather than bills) when the 50M RU/month quota is hit, which could pause the app at month-end under unusual load.
- **Neutral**: the project does not currently use D1 in production, so there is no data migration; the decision is made before any schema is written, so it shapes [ADR 0009](0009-schema-migrations.md) (schema/migrations tooling) from the start.
