# ADR 0020: Date and time storage convention

- Status: Accepted
- Date: 2026-08-25

## Context

TomeTrove uses TiDB (MySQL-compatible, [ADR 0003](0003-database-choice.md)) and needs a consistent strategy for storing temporal values across all tables: `*_created_at`, `*_updated_at`, `last_login_at`, price quote dates, share expiration dates, etc.

TiDB supports two relevant types for date+time values:

- **`TIMESTAMP`**: converts from the session timezone to UTC on store, and back to the session timezone on retrieve. Range: `1970-01-01 00:00:01` to `2038-01-19 03:14:07` UTC. Subject to the **Year 2038 problem** — TiDB docs explicitly warn: "For storing values that may span beyond 2038, please consider using `DATETIME` instead."
- **`DATETIME`**: no automatic timezone conversion — stored as-is. Range: `0000-01-01 00:00:00` to `9999-12-31 23:59:59`. No 2038 limit.

The session timezone is controlled by the `time_zone` system variable (SESSION | GLOBAL scope, persists to cluster). Default is `SYSTEM` (host timezone). Can be set as offset (`'+00:00'`) or named zone (`'America/Los_Angeles'`).

TiDB supports non-materialized views (`CREATE VIEW`) and the `CONVERT_TZ()` function, but views cannot accept parameters — so a view cannot convert timestamps to a per-request timezone. Additionally, TiDB does **not** support stored procedures, stored functions, triggers, or user-defined functions (listed as unsupported in [MySQL Compatibility](https://docs.pingcap.com/tidb/stable/mysql-compatibility)). This rules out any server-side parameterized timezone conversion.

Sources: [TiDB Date and Time Types](https://docs.pingcap.com/tidb/stable/data-type-date-and-time), [TiDB System Variables — time_zone](https://docs.pingcap.com/tidb/stable/system-variables#time_zone), [TiDB MySQL Compatibility](https://docs.pingcap.com/tidb/stable/mysql-compatibility), [TiDB CREATE VIEW](https://docs.pingcap.com/tidb/stable/sql-statement-create-view), [TiDB Date and Time Functions](https://docs.pingcap.com/tidb/stable/date-and-time-functions).

## Decision

Use **`DATETIME`** for all timestamp columns (`*_created_at`, `*_updated_at`, `last_login_at`, etc.), with an application-level convention that **all values are stored in UTC**.

Set the session timezone to UTC on every connection:

```sql
SET SESSION time_zone = '+00:00';
```

This ensures `NOW()` and `CURRENT_TIMESTAMP` return UTC values, so `DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP` write UTC without application code.

Use **`DATE`** for calendar dates with no time component (e.g. price quote `date`). Use **`YEAR`** for year-only values (e.g. edition `published_year`).

Timezone conversion to the user's local timezone is the responsibility of the presentation layer (frontend / API response formatting), never the database. This is the only viable approach because TiDB does not support stored procedures or parameterized views that could perform per-request timezone conversion server-side.

## Consequences

- **Positive**: no Year 2038 problem — `DATETIME` supports dates up to 9999; full control over timezone handling — the application decides when and how to convert; `DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP` work correctly as long as the session timezone is UTC; consistent with MySQL/TiDB best practices for long-lived applications; `DATETIME` has no hidden conversion surprises (what you write is what is stored).
- **Negative**: UTC convention is enforced by discipline, not by the type system — if a connection forgets to set `time_zone = '+00:00'`, `NOW()` returns the host timezone and `DATETIME` stores it as-is (no conversion); the application must always pass UTC values when writing explicitly (not relying on `NOW()`).
- **Neutral**: the `time_zone = '+00:00'` setting must be applied per connection — in the Hyperdrive connection string or as the first statement after connecting; TiDB Cloud Starter's default `system_time_zone` may vary, so relying on `SYSTEM` is unsafe.
