# ADR 0024: Database environment separation

- Status: Accepted
- Date: 2026-08-26

## Context

TomeTrove runs on TiDB Cloud Starter ([ADR 0003](0003-database-choice.md)). In TiDB Cloud the *instance* is the MySQL server; a "database" is a plain schema created with `CREATE DATABASE`. The project needs at least two environments: one holding real data (the wish list, price history, alerts) and one to try migrations and destructive data loads against — the author seeds in `assets/db/sql/author` alone are 100+ files of bulk `INSERT`s, and [ADR 0009](0009-schema-migrations.md) notes that Drizzle Kit can render a column rename as drop+add, which loses data.

Three ways to obtain that separation:

- **Two schemas in one instance** — `CREATE DATABASE` twice; environments are selected by the database name in the connection string.
- **Two Starter instances** — the free plan allows five instances per organization, each with its own endpoint, user prefix, password and quota.
- **TiDB Cloud Branching** — a branch is a separate instance holding a copy-on-write snapshot of the parent at a point in time, created in minutes. Data diverges immediately after creation and **there is no merge operation**: a change is promoted by re-running the migration against the parent. Branching is in public preview, is capped at five branches per organization, and the documentation scopes it to short-term feature development and functional testing, explicitly not to performance testing. The [GitHub integration](https://docs.pingcap.com/tidbcloud/branch-github-integration/) can create a branch per pull request (`${github_branch_name}_${pr_id}`), reset it on each push, and delete it when the pull request closes or merges.

Sources: [Explore SQL with TiDB](https://docs.pingcap.com/tidbcloud/basic-sql-operations/?plan=starter), [TiDB Cloud Branching overview](https://docs.pingcap.com/tidbcloud/branch-overview/?plan=starter), [Manage TiDB Cloud branches](https://docs.pingcap.com/tidbcloud/branch-manage/?plan=starter).

## Options

1. **Two schemas, `tometrove_production` and `tometrove_staging`, in the single existing instance.** One endpoint, one credential, one Hyperdrive configuration; environments differ only by database name. **Chosen.**
2. **Two separate Starter instances.** True isolation of storage, Request Units and credentials, at the cost of a second Hyperdrive configuration and a second set of secrets to manage.
3. **A long-lived branch as the staging environment.** Rejected: branches are documented as short-term environments without auto-scaling, and a permanent one would consume one of the five organization-wide branch slots indefinitely.

## Decision

Create two schemas in the existing instance:

```sql
CREATE DATABASE IF NOT EXISTS tometrove_production CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS tometrove_staging    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

The collation is per [ADR 0025](0025-collation-convention.md). Every migration is applied to `tometrove_staging` first and to `tometrove_production` only once it has been verified there.

Branching is not part of the environment topology. It stays available for a future per-pull-request CI database, which is the use case its GitHub integration is built for; adopting it will be its own decision.

## Consequences

- **Positive**: one endpoint, one credential and one Hyperdrive configuration — the environment is selected by the database name alone; no preview-stage feature in the critical path; migrations get a rehearsal target before they touch real data; both schemas stay inside the free tier.
- **Negative**: the 5 GiB row storage and 50 million Request Units per month are per *instance*, so staging activity is charged against the same quota as production and throttling affects both; the same database user reaches both schemas, so nothing but the connection string prevents a migration from being applied to the wrong environment; a schema-level accident (`DROP DATABASE`, a runaway `UPDATE` against the wrong name) is not contained by an instance boundary.
- **Neutral**: promoting a change is always "re-run the migration against the other schema" — the same workflow that branching would require, since branches cannot be merged either; moving to two instances later is a connection-string and Hyperdrive change, not a data-model change.
