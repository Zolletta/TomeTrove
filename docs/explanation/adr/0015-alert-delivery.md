# ADR 0015: Alert/notification delivery

- Status: Accepted
- Date: 2026-08-24

## Context

When scheduled price fetching ([ADR 0014](0014-scheduled-price-fetching.md)) detects that a book's price has dropped by at least the user's threshold (default 5%) below the baseline, TomeTrove generates an alert. The alert must reach the user through channels they configure.

**Current phase**: only in-app notifications are implemented. Email and webhook delivery are deferred to a later phase — the decision to support them is recorded here so the data model and alert generation logic are designed to accommodate them from the start.

Constraints:

- Users have different preferences for how they receive notifications.
- The system runs on Cloudflare Workers ([ADR 0002](0002-cloudflare-workers-runtime.md)) — there is no persistent process, so alerts must be sent as a side effect of the fetch cycle or enqueued for a separate sender.
- Email sending from Workers requires either the [Cloudflare Email Service](https://developers.cloudflare.com/email-architecture/) (Workers binding or REST API) or an external email provider.
- In-app notifications are the simplest — they require only a database row and a UI element on next login.
- Webhooks are a single `fetch()` call to a user-configured URL (Discord, Telegram, Slack, etc.).

## Options

1. **In-app notifications only** — store alerts in TiDB; show them when the user logs in. Simplest; no external delivery; user must visit the app to see alerts.
2. **Email** — send an email when a price threshold is hit. Requires an email sending service (Cloudflare Email Service or external). Good for time-sensitive alerts; users check email more often than a specific app.
3. **Webhook** — send a POST to a user-configured URL (Discord webhook, Telegram bot, Slack, etc.). Flexible; user chooses the destination; no email infrastructure needed.
4. **Combination** — offer multiple channels; user picks which ones to enable.

## Decision

Adopt **option 4: multi-channel alerts** — in-app notifications, email, and webhook, all user-configurable.

**Current phase (in-app only)**:

- **In-app notifications**: always on. Every alert is stored as a row in TiDB (table: `alerts`) with `user_id`, `book_id`, `edition_id`, `message`, `price`, `previous_low`, `created_at`, `read_at`. The UI shows unread alerts on next login.

**Deferred to later phase (email + webhook)**:

- **Email**: opt-in per user. When enabled, the fetch cycle (or a post-fetch alert job) sends an email for each alert. Implementation via Cloudflare Email Service (to be configured — see `cloudflare-email-service` skill) or an external provider. The exact email sending mechanism is an implementation detail to be resolved during development.
- **Webhook**: opt-in per user. The user configures a URL (e.g. a Discord webhook, Telegram bot endpoint). The system sends a POST with a JSON payload describing the alert. The payload format and authentication (if any) are implementation details.

All three channels can be enabled simultaneously — an alert generates an in-app row, an email (if enabled), and a webhook call (if enabled). The `alerts` table is designed from the start to support all three channels; only the delivery code for email/webhook is deferred.

## Consequences

- **Positive**: users choose their preferred channel(s); in-app is always available as a fallback; webhook is zero-infrastructure (just a `fetch()`); email is the most universally useful for time-sensitive price alerts; the `alerts` table provides a full audit trail of all alerts ever generated.
- **Negative**: email sending requires configuring an email service (Cloudflare Email Service or external) — this is additional infrastructure; webhook delivery is fire-and-forget (no retry guarantee unless the fetch cycle is built with retries — [ADR 0014](0014-scheduled-price-fetching.md)); users may get duplicate alerts across channels (same price drop → in-app + email + webhook) — this is intentional (redundancy) but could feel noisy.
- **Neutral**: the alert generation logic (what constitutes a "significant low") is a separate concern from delivery — it will be defined in the price-fetching ADR ([ADR 0014](0014-scheduled-price-fetching.md)) or a future ADR; the email sending mechanism (Cloudflare Email Service vs external) may warrant its own ADR if the choice is non-trivial.
