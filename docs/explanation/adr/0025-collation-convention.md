# ADR 0025: Character set and collation convention

- Status: Accepted
- Date: 2026-08-26

## Context

TomeTrove stores author names, book titles and ontology labels in many languages and scripts ([ADR 0019](0019-ontology-i18n.md)), and searching them is a core feature. The collation decides which strings compare as equal in `WHERE`, `GROUP BY`, `ORDER BY` and unique indexes, so it decides whether a user typing `moliere` finds `Molière`.

TiDB's default collation for `utf8mb4` is **`utf8mb4_bin`** — byte-exact, so `'A' = 'a'` is false — whereas MySQL 8 defaults to `utf8mb4_0900_ai_ci` (accent-insensitive, case-insensitive). This is a documented incompatibility: a `CREATE DATABASE` that names a character set but relies on the implicit default collation behaves differently on TiDB than on MySQL. TiDB has supported `utf8mb4_0900_ai_ci` since v7.4; before that it silently fell back to `utf8mb4_bin`.

How the candidate collations behave, per the comparison examples in the TiDB documentation:

| Property                | `utf8mb4_bin` | `utf8mb4_general_ci` | `utf8mb4_unicode_ci` | `utf8mb4_0900_ai_ci` |
|-------------------------|---------------|----------------------|----------------------|----------------------|
| `'A' = 'a'`             | false         | true                 | true                 | true                 |
| `'ss' = 'ß'`            | false         | false                | true                 | true                 |
| Unicode collation rules | none (bytes)  | simplified table     | UCA 4.0.0            | UCA 9.0.0            |
| Trailing-space handling | `PAD SPACE`   | `PAD SPACE`          | `PAD SPACE`          | `NO PAD`             |
| MySQL 8 default         | no            | no                   | no                   | yes                  |

Source: [TiDB Character Set and Collation](https://docs.pingcap.com/tidb/stable/character-set-and-collation/).

The three `_ci` collations all fold case and accents, so `Molière` matches `Moliere` under any of them; they differ in how completely and how currently they implement the Unicode collation algorithm, which the `'ss' = 'ß'` row illustrates.

## Options

1. **`utf8mb4` / `utf8mb4_0900_ai_ci`** — matches MySQL 8's default; case- and accent-insensitive; Unicode UCA 9.0.0. **Chosen.**
2. **`utf8mb4` / `utf8mb4_bin`** — TiDB's default; exact matching. Rejected: a search for `michele acourt` would not find `Michèle A'Court`, so every query would need `LOWER()` plus accent folding in the application, defeating index use.
3. **`utf8mb4` / `utf8mb4_unicode_ci`** — equivalent in the cases that matter here, but built on UCA 4.0.0. Rejected: it is the older ruleset, with weaker coverage of characters and scripts added to Unicode after 4.0, which a multilingual author index will meet; and it is not what a MySQL 8 client negotiates by default, so it would differ from the connection collation.

## Decision

Every TomeTrove schema is created with `CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`, stated explicitly rather than left implicit, because TiDB's implicit default is `utf8mb4_bin`.

The collation is declared once at schema level ([ADR 0024](0024-database-environments.md)) and inherited by every table and column, so Drizzle-generated DDL ([ADR 0009](0009-schema-migrations.md)) needs no per-column collation. A column that requires exact matching — an external identifier, a token, a hash — declares `COLLATE utf8mb4_bin` on itself.

## Consequences

- **Positive**: accent- and case-insensitive search works in the database, using indexes, without `LOWER()` or application-side accent folding; matches MySQL 8's default, so a local MySQL used for `wrangler dev` ([ADR 0003](0003-database-choice.md)) behaves like TiDB; declared once at schema level, so it cannot drift table by table.
- **Negative**: accent-insensitivity also collapses genuinely distinct strings — under a unique index, `Molière` and `Moliere` collide, which the author seed loading and the normalization pipeline ([ADR 0016](0016-data-normalization.md)) must account for; identifier-like columns must opt out with an explicit `COLLATE utf8mb4_bin`, and forgetting to do so makes `OL387077A` and `ol387077a` the same key.
- **Neutral**: `utf8mb4_0900_ai_ci` is `NO PAD`, so trailing spaces are significant, unlike the `PAD SPACE` collations — values must be trimmed before insertion rather than relying on the collation to ignore the difference; the choice requires TiDB v7.4 or later, which TiDB Cloud Starter satisfies.
