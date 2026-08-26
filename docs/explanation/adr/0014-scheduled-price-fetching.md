# ADR 0014: Scheduled price fetching & background processing

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove has two price-fetching modes:

1. **On-demand fetch** — user requests current prices for a book. No limit on how many books or how many times, but the same book cannot be refetched within 1 hour (cooldown) unless the previous fetch errored (retry allowed immediately).

2. **Scheduled monitoring (watchlist)** — user elects up to 5 books for regular monitoring. On election, prices are fetched immediately as the **baseline**. Then daily, prices are fetched again for all monitored books. Notifications:
   - **In-app**: always — every daily quote is stored and visible in the app.
   - **Email / webhook** (external channels, [ADR 0015](0015-alert-delivery.md)): only if price dropped by at least a configurable percentage threshold (default 5%) below the baseline. **Email/webhook delivery is deferred to a later phase — for now, only in-app notifications are implemented.**

### Scale estimate

With 100 users × 5 monitored books × 5 stores = 2,500 API calls per day. Spread across 24 hours (per-user scheduling) ≈ ~100 calls per hour. Very manageable.

### Cloudflare limits (retrieved 2026-08-24)

| Feature                   | Free                  | Paid                  |
|---------------------------|-----------------------|-----------------------|
| Cron Triggers per account | 5                     | 250                   |
| Cron Trigger wall time    | 15 min                | 15 min                |
| Queue consumer wall time  | 15 min                | 15 min                |
| Queue consumer CPU time   | configurable to 5 min | configurable to 5 min |
| Max consumer batch size   | 100 messages          | 100 messages          |
| Queue throughput          | 5,000 msg/s           | 5,000 msg/s           |
| Message size              | 128 KB                | 128 KB                |

One hourly cron + one Queue is well within free tier limits.

## Options

1. **Hourly cron + Queue, spread across users** — an hourly cron tick selects users assigned to that hour; enqueues their (book, store) pairs to a Queue; queue consumers fetch prices, store quotes, check thresholds, send alerts. Each user's books are fetched together (simple per-user batch), but different users are fetched at different hours (gentle on stores). **Chosen.**
2. **Daily cron, single batch** — one cron tick at 3 AM fetches all monitored books for all users at once. Simple but creates a burst of API calls to stores; may hit cron wall time limit (15 min) with many users.
3. **Daily cron + Queue, all users at once** — one cron tick enqueues all users' fetch jobs to a Queue; consumers process in batches. Spreads the load across consumer invocations but all stores get a burst at the same time of day.
4. **Workflows** — a Cloudflare Workflow orchestrates the full cycle (select users → enqueue → fetch → store → check thresholds → alert) with durable retries. Most robust; newest API; learning curve; overkill for the current scale.

## Decision

Adopt **option 1: hourly cron + Queue, spread across users**.

### Architecture

```
Hourly Cron Trigger (1 of 5 free cron slots)
│
├── selects users whose fetch hour == current hour
│   (user_preferences.next_fetch_hour, assigned round-robin 0-23)
│
├── for each selected user:
│   ├── filters actionable stores ([ADR 0013](0013-store-integration-architecture.md): per-user capability filtering)
│   └── enqueues (user_id, book_id, edition_id, store_binding) to Queue
│
└── Queue consumer (batch of up to 100 messages):
    ├── for each message:
    │   ├── calls store Worker.fetchPrice(edition) via service binding ([ADR 0013](0013-store-integration-architecture.md))
    │   ├── stores price quote in TiDB
    │   ├── compares to baseline:
    │   │   ├── if price dropped ≥ threshold (default 5%): generate alert
    │   │   │   └── store alert row in TiDB (in-app, always)
    │   │   │       (email/webhook delivery deferred to later phase — [ADR 0015](0015-alert-delivery.md))
    │   │   └── if no drop: store quote only (visible in-app)
    │   └── on error: mark message for retry (Queue handles retries, up to 100)
    └── batch complete
```

### On-demand fetch (separate from scheduled)

```
User requests price for a book
│
├── check last_fetched_at for (edition_id, store_id) pairs
│   ├── if any fetch was < 1 hour ago AND succeeded: return cached quote
│   ├── if last fetch errored: allow immediate retry
│   └── otherwise: fetch fresh
│
├── for each actionable store ([ADR 0013](0013-store-integration-architecture.md)):
│   └── calls store Worker.fetchPrice(edition) via service binding
│
├── stores quotes in TiDB
│
└── returns cheapest result to user
```

The cooldown is tracked per (edition_id, store_id) — a `last_fetched_at` timestamp on the latest price quote for that pair. If the most recent successful fetch was less than 1 hour ago, the cached quote is returned. If the most recent fetch errored, the cooldown is bypassed (the `error` flag on the quote allows retry).

### Watchlist election

When a user elects a book for monitoring:
1. Fetch prices immediately from all actionable stores (on-demand fetch, bypassing the 1-hour cooldown for this one-time baseline fetch).
2. Store the quotes as the **baseline** — `is_baseline = true` on the quote rows.
3. Set `user_preferences.next_fetch_hour` if not already set (round-robin assignment 0-23).
4. The book is now in the daily monitoring cycle.

### Alert threshold

- Default: 5% drop below baseline triggers an alert (in-app notification — stored as a row in TiDB).
- Configurable per user in `user_preferences.alert_threshold_percentage`.
- In-app notifications are always generated for any price change (not just drops) — the user sees all daily quotes in the app.
- The baseline is the price at election time. If the price drops below baseline by ≥ threshold, an alert is generated. If the price rises above baseline and then drops back, a new alert is generated each time it crosses the threshold downward.
- **Baseline refresh**: the baseline is refreshed to the most recent month's `price_quote_historic` mean after 12 months. This corrects for inflation and list-price drift on long-tracked books — without it, a book whose list price has risen would never trigger alerts (everything is above the old baseline), and a book whose list price has fallen would trigger on every minor fluctuation. The refresh happens during the existing month-end consolidation job — no new scheduled job is needed. The `price_quote_baseline_refreshed_at` timestamp on `wish` records when the baseline was last refreshed; the consolidation job checks this and refreshes if it is older than 12 months.
- **Email/webhook delivery of alerts is deferred to a later phase** ([ADR 0015](0015-alert-delivery.md)). For now, alerts are in-app only — stored as rows in the `alerts` table and shown in the UI.

### Data model additions

- `user_preferences.next_fetch_hour` (int 0-23, nullable) — the hour at which this user's monitored books are fetched daily. Assigned round-robin when the user elects their first monitored book.
- `user_preferences.alert_threshold_percentage` (decimal, default 5.0) — minimum percentage drop below baseline to trigger external notification.
- `price_quotes.is_baseline` (boolean) — marks the quote as the baseline (first fetch at election time).
- `price_quotes.last_fetched_at` (datetime) — when this quote was fetched (used for the 1-hour cooldown on on-demand fetches).
- `price_quotes.fetch_status` (enum: `success`, `error`) — if `error`, the cooldown is bypassed for on-demand retry.
- `monitored_books` junction table: `user_id`, `book_id`, `elected_at` — the user's watchlist (max 5 rows per user, enforced at application level).

## Consequences

- **Positive**: the 5-book watchlist cap keeps API call volume bounded and predictable (~2,500 calls/day for 100 users); spreading fetches across users (hourly cron) is gentle on stores — no burst at one time of day; the Queue handles batching and retries automatically — failed fetches retry without manual intervention; the 1-hour cooldown on on-demand fetches prevents abuse without complex rate limiting; the "retry on error" exception is practical — users don't get stuck waiting an hour after a transient failure; the percentage threshold for external notifications reduces noise — users only get emailed for meaningful drops; in-app notifications are always available — the user can check prices in the app anytime; the architecture fits within free tier limits (1 cron, 1 queue, well under batch/consumer limits).
- **Negative**: the 5-book limit may feel restrictive for users with many books they want to monitor — it forces prioritization (could be increased later, but API call volume scales linearly); the hourly cron means a user's books are fetched once per day at their assigned hour — if a price drops and recovers within 24 hours, the drop may be missed; the `next_fetch_hour` assignment is round-robin and not timezone-aware — a user might get their fetch at 3 AM their time (irrelevant for notifications since alerts are sent after the fetch, but the timing is not user-chosen); the percentage threshold is relative to the baseline at election time — if the baseline was unusually high, the user gets alerts for "drops" that are still above the market average.
- **Neutral**: the watchlist limit (5) and alert threshold (5%) are configurable — they can be adjusted without architectural changes; the "spread across users" approach could be enhanced later with timezone-aware scheduling (fetch at a user's local morning); the historical-low alert ("cheapest in 30 days") mentioned in the original spec is not implemented in this ADR — it requires tracking the minimum price over a rolling window, which is a future enhancement on top of the stored quotes; the on-demand 1-hour cooldown could be stored in KV (with TTL) instead of querying TiDB for `last_fetched_at` — an optimization to consider later.
