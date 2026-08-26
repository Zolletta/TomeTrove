# ADR 0021: Data erasure and export

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove stores only the user's numeric GitHub User ID (pseudonymized data) — no email, no handle, no personal name ([ADR 0006](0006-authentication-model.md)). Nevertheless, [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) Article 17 (Right to erasure) and Article 20 (Right to data portability) apply: users must be able to delete their account and all associated data, and to export their data in a machine-readable format.

The privacy policy (see [`PRIVACY.md`](../../../PRIVACY.md)) commits to both features being available from the personal area, with physical (not soft) deletion. The tables referenced below are documented in the [data model reference](../../reference/data-model.md).

### Tables referencing a user

The following tables have a `user_id` foreign key and must be included in the deletion cascade:

| Table             | Relationship | Notes                                                                                 |
|-------------------|--------------|---------------------------------------------------------------------------------------|
| `user`            | PK row       | The user's own row                                                                    |
| `user_preference` | 1:1          | Preferences (currency, country, format, fetch hour, threshold)                        |
| `user_store`      | 1:N          | Pre-computed applicable stores junction                                               |
| `user_language`   | 1:N          | Readable languages matrix                                                             |
| `wish`            | 1:N          | Wish list entries                                                                     |
| `list`            | 1:N          | Public shared lists                                                                   |
| `price_quote`     | 1:N          | Price quotes triggered by this user (nullable — system fetches have `user_id = null`) |

Tables that do NOT reference `user_id` and are NOT deleted: `book`, `edition`, `author`, `publishing_house`, `language`, `type`, `genre`, `ontology`, `store`, `price_quote_historic`. These are shared catalog data — deleting a user does not remove books or price history that other users may reference. `price_quote_historic` is keyed by `(edition_id, store_id, month, type)` with no `user_id` — consolidated history is anonymous and retained.

## Options

1. **Soft delete** — add a `deleted_at` timestamp to `user`; filter out deleted users in queries; purge via a scheduled job after a retention period. Familiar pattern; allows undo; but leaves PII in the database during the retention window, which contradicts the privacy policy's commitment to physical deletion.
2. **Physical delete, synchronous** — when the user clicks "Delete this account", delete all rows referencing their `user_id` in a single transaction. Simple, immediate, no leftover data. Risk: if the transaction is large (many price quotes), it could hit D1/TiDB transaction limits or wall time.
3. **Physical delete, queued** — enqueue a deletion job to a Queue; the consumer deletes rows in batches (per table) to avoid transaction limits. More resilient for users with large histories; but the user sees "deletion pending" instead of immediate confirmation.

## Decision

Adopt **option 2: physical delete, synchronous** — for the current scale (personal app, low user count, max 5 monitored books per user) the transaction size is small. The deletion runs in a single transaction with `ON DELETE CASCADE` foreign keys (or explicit deletes in dependency order if the database does not support cascading deletes).

### Deletion flow

```
User clicks "Delete this account" in personal area
│
├── confirmation dialog: "This action is irreversible. All your data will be permanently deleted."
│
├── on confirm (authenticated request):
│   ├── BEGIN TRANSACTION
│   ├── DELETE FROM price_quote WHERE user_id = ?
│   ├── DELETE FROM list WHERE user_id = ?
│   ├── DELETE FROM wish WHERE user_id = ?
│   ├── DELETE FROM user_language WHERE user_id = ?
│   ├── DELETE FROM user_store WHERE user_id = ?
│   ├── DELETE FROM user_preference WHERE user_id = ?
│   ├── DELETE FROM user WHERE user_id = ?
│   ├── COMMIT
│   └── return 204 No Content
│
└── session is invalidated; user is redirected to the home page
```

The order matters: child tables first, then the parent `user` row. If the database supports `ON DELETE CASCADE`, only the `DELETE FROM user` statement is needed and the database handles the rest.

### Data export flow

```
User clicks "Export my data" in personal area
│
├── on request (authenticated):
│   ├── SELECT * FROM user_preference WHERE user_id = ?
│   ├── SELECT * FROM user_language WHERE user_id = ?
│   ├── SELECT * FROM wish WHERE user_id = ? (joined with book/edition for readability)
│   ├── SELECT * FROM list WHERE user_id = ?
│   ├── SELECT * FROM price_quote WHERE user_id = ?
│   ├── assemble JSON payload:
│   │   {
│   │     "exported_at": "2026-08-24T12:00:00Z",
│   │     "user_preferences": { ... },
│   │     "user_languages": [ ... ],
│   │     "wish_list": [ { "book_title": "...", "authors": [...], "is_monitored": true, ... } ],
│   │     "lists": [ ... ],
│   │     "price_quotes": [ ... ]
│   │   }
│   └── return as application/json download (Content-Disposition: attachment)
```

The export is generated on-demand — no pre-computation, no storage. It includes the user's own data only. Shared catalog data (books, authors, stores) is included by reference (title, name) but is not part of the export payload since it is not user data.

## Consequences

- **Positive**: physical deletion is GDPR-compliant and matches the privacy policy exactly — no PII remains after deletion; the synchronous transaction is simple to implement and test; the export is a read-only query with no side effects; both features are self-service (no need to open a GitHub issue or contact the author).
- **Negative**: deletion is irreversible — if a user deletes by mistake, there is no recovery (acceptable per the confirmation dialog); the synchronous transaction could fail for users with very large price quote histories — if this becomes a problem at scale, option 3 (queued deletion) can be adopted without changing the API contract; the export does not include `price_quote_historic` (which has no `user_id`) — a user's contribution to consolidated history is anonymous and cannot be separated out.
- **Neutral**: the deletion and export endpoints require authentication (the user must be logged in to delete their own account or export their own data — [ADR 0006](0006-authentication-model.md)); the export format is JSON — a future enhancement could offer CSV or other formats; the `PRIVACY.md` file at the repo root is the user-facing privacy policy, while this ADR documents the architectural decision; the deletion runs on TiDB ([ADR 0003](0003-database-choice.md)) via Hyperdrive.
