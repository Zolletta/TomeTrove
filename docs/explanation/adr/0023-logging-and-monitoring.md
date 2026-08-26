# ADR 0023: Logging and monitoring

- Status: Accepted
- Date: 2026-08-25

## Context

TomeTrove runs on Cloudflare Workers with scheduled background tasks (price fetching, month-end consolidation — [ADR 0014](0014-scheduled-price-fetching.md)) and on-demand API endpoints ([ADR 0008](0008-http-routing.md)). The system needs observability to answer two questions:

1. **Is the app up?** — are the API endpoints responding? Are there errors?
2. **Did the scheduled tasks run?** — did the daily price fetch execute? Did the month-end consolidation complete? How many books were fetched? Were there failures?

This ADR covers **system health and scheduled task output** — not user activity tracking or audit logs. What the system did, not what users did.

Requirements:

- **API error logging** — unhandled errors, 5xx responses, unexpected exceptions. Not every request (that's Cloudflare's built-in analytics), but the failures that indicate bugs or infrastructure issues.
- **Scheduled task logging** — when a scheduled task starts, when it finishes, what it did (how many books fetched, how many stores queried, how many errors), and whether it succeeded or failed.
- **Alerting** — notify when scheduled tasks fail or when error rates spike. Not silent failures.
- **Low overhead** — logging must not add significant latency to requests or CPU time to scheduled tasks. Workers have a 128MB memory cap and per-request CPU limits.
- **No user activity tracking** — this is not analytics, not audit, not "who did what." User actions are not logged here.
- **One place to look** — operational logs should be queryable in the same database as application data, so a single SQL query can answer questions like "which books had fetch failures during the last scheduled run?"

Constraints from the platform (Cloudflare Workers + TiDB via Hyperdrive, [ADR 0002](0002-cloudflare-workers-runtime.md), [ADR 0003](0003-database-choice.md)):

- Workers have no filesystem — logs go to a service, not to disk.
- Cloudflare provides [Workers Analytics](https://developers.cloudflare.com/workers/observability/analytics/) and [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/) for built-in access-level observability (request method, path, status, duration). This is always on, like Apache/Nginx access logs.
- Cloudflare provides [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for scheduled tasks, with execution history visible in the dashboard.
- Workers can use `console.log()` / `console.error()` which are captured by Workers Logs — useful as a fallback, but short retention (3-7 days) and limited queryability.
- TiDB scales to terabytes and handles high write throughput — log volume won't compete with application data for storage.

## Options

1. **Workers Logs only** — structured `console.log()` / `console.error()` in the main Worker. Everything in Workers Logs (Cloudflare dashboard). No logging Worker, no TiDB. Simplest. Retention 3-7 days. Good enough for "did the cron run?" but limited for long-term analysis or joining with application data.
2. **Logging Worker + TiDB `log` table (chosen)** — main Worker sends structured application events to a dedicated Logging Worker via `ctx.waitUntil()` (fire-and-forget, non-blocking). The Logging Worker batches and writes to a `log` table in TiDB. One database, one place to look, SQL querying, JOIN with application data. Workers Logs remains as access-level fallback.
3. **External logging service (e.g. Logtail, Sentry)** — send logs/errors to an external service via `fetch()`. Richer querying and alerting, but a separate place to look (not TiDB) and an external dependency.
4. **Workers Logs + Sentry for errors only** — Workers Logs for scheduled task output, Sentry for API error capture. Split concerns across two services. Rejected — two places to look, not one.
5. **Custom logging to D1/KV** — log to D1 or KV. D1 has a 10GB limit (logs compete with data); KV is not queryable. Rejected in favor of TiDB.

## Decision

Adopt **option 2: a Logging Worker writing to a TiDB `log` table**, with Workers Logs as the access-level fallback.

### Two-tier logging

1. **Workers Logs** (built-in, always on) — access-level logs: request method, path, status, duration. Like Apache/Nginx access logs. No code needed. Short retention (3-7 days). Viewable in the Cloudflare dashboard. Also captures `console.log()` / `console.error()` output as a fallback if the Logging Worker is unavailable.
2. **Logging Worker + TiDB `log` table** (custom) — application-level events: scheduled task lifecycle, API errors, operational metrics. Fire-and-forget from the main Worker. Long-term retention in TiDB. Queryable via SQL.

### Architecture

```
Main Worker (API / scheduled)
  ├─ console.log() / console.error() → Workers Logs (access-level, always on, fallback)
  └─ ctx.waitUntil(fetch(loggingWorker, event)) → Logging Worker → TiDB `log` table
```

The main Worker sends structured events to the Logging Worker via `fetch()` inside `ctx.waitUntil()`. This is fire-and-forget — the main Worker does not wait for the log to be written. If the Logging Worker is down, the event is lost, but `console.log()` in Workers Logs serves as a fallback.

### The `log` table

See the [data model reference](../../reference/data-model.md#log) for the canonical definition. Summary:

| Field      | Type     | Notes                                                                                                                         |
|------------|----------|-------------------------------------------------------------------------------------------------------------------------------|
| log_id     | PK       |                                                                                                                               |
| log_time   | DATETIME | UTC ([ADR 0020](0020-datetime-convention.md))                                                                                 |
| log_level  | enum     | `info`, `warn`, `error`                                                                                                       |
| log_source | enum     | `api`, `scheduled_fetch`, `consolidation`, `alert`, `auth`                                                                    |
| log_event  | string   | Machine-readable event name (e.g. `fetch_started`, `fetch_completed`, `fetch_failed`, `consolidation_completed`, `api_error`) |
| log_detail | json     | Structured details (book count, store ID, error message, stack trace)                                                         |

**Index**: `(log_source, log_time)` for filtering by source within a time range.
**Retention**: a scheduled job deletes rows older than 90 days. The retention period is configurable.

### The Logging Worker

- Receives events via `POST /log` (internal endpoint, shared-secret auth to prevent external writes).
- Batches inserts — buffers events for a few seconds, then bulk INSERTs to reduce write load on TiDB.
- Exposes `GET /logs` with filtering (`?source=&level=&since=&until=`) for viewing logs without a SQL client.
- Runs a scheduled cleanup job (daily) to delete rows older than the retention period.

### What gets logged

| Source            | Events                                                                                                                                           |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `scheduled_fetch` | `fetch_started` (book count, store count), `fetch_completed` (success count, failure count, duration), `fetch_failed` (book ID, store ID, error) |
| `consolidation`   | `consolidation_started` (month), `consolidation_completed` (rows processed, duration), `consolidation_failed` (error)                            |
| `api`             | `api_error` (endpoint, status, error message, stack trace) — only 5xx and unhandled exceptions, not every request                                |
| `alert`           | `alert_sent` (user ID, book ID, channel, threshold), `alert_failed` (user ID, error)                                                             |
| `auth`            | `auth_failed` (reason — invalid JWT, expired token) — not user identity, just the failure reason                                                 |

### What does NOT get logged

- User activity (who searched for what, who clicked what, who changed preferences)
- Every API request (that's Workers Logs' job)
- Successful 2xx API responses (only errors are logged)
- User identity in auth logs (only failure reasons, not who failed)

### Alerting

The Logging Worker checks for error conditions on each write and triggers alerts:

- **Scheduled task failure** — if a `fetch_failed` or `consolidation_failed` event is logged, send an alert (email or webhook to the maintainer).
- **Error rate spike** — if `api_error` events exceed a threshold within a time window (e.g. >10 errors in 5 minutes), send an alert.

Alerting is built into the Logging Worker, not a separate service. The alert destination (email, webhook) is configured via environment variables.

## Consequences

- **Positive**: one database, one place to look — operational logs are in TiDB alongside application data, queryable with SQL, JOINable with application tables; fire-and-forget logging via `ctx.waitUntil()` adds no latency to the main Worker; Workers Logs remains as a built-in fallback; the `log` table schema is simple and extensible (new `log_source` values can be added without migration); retention is controlled by a scheduled cleanup job; alerting is built into the Logging Worker.
- **Negative**: a dedicated Logging Worker is additional infrastructure to build, deploy, and monitor; if the Logging Worker is down, application-level events are lost (mitigated by Workers Logs fallback); log writes hit the same TiDB database as application reads — but the Logging Worker batches inserts and the volume is low (operational events, not per-request logging); the `log` table grows over time and requires the retention job to run (if the job fails, logs accumulate).
- **Neutral**: the Logging Worker's `GET /logs` endpoint provides a basic log viewer — a richer dashboard could be added later if needed; the alerting threshold and retention period are configurable via environment variables; Workers Logs' 3-7 day retention is sufficient for access-level debugging, while TiDB provides long-term application-level observability.
