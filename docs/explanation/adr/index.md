# Architecture Decision Records

This directory holds TomeTrove's ADRs. Each ADR is a short markdown file capturing a single architectural decision — the context that forced it, the chosen option, and the consequences of living with that choice.

## Index

| ADR                                            | Title                                             | Status   |
|------------------------------------------------|---------------------------------------------------|----------|
| [0001](0001-typescript-as-primary-language.md) | Adopt TypeScript as the primary language          | Accepted |
| [0002](0002-cloudflare-workers-runtime.md)     | Cloudflare Workers as the compute platform        | Accepted |
| [0003](0003-database-choice.md)                | Database: D1 vs TiDB Cloud Starter                | Accepted |
| [0004](0004-book-metadata-source.md)           | Book metadata source                              | Accepted |
| [0005](0005-media-cover-storage.md)            | Media / cover image storage                       | Accepted |
| [0006](0006-authentication-model.md)           | Authentication model                              | Accepted |
| [0007](0007-frontend-delivery.md)              | Frontend delivery strategy                        | Accepted |
| [0008](0008-http-routing.md)                   | HTTP routing & API structure                      | Accepted |
| [0009](0009-schema-migrations.md)              | Schema management & migrations                    | Accepted |
| [0010](0010-testing-strategy.md)               | Testing strategy                                  | Accepted |
| [0011](0011-learning-path-ts-via-php.md)       | Learning approach: TypeScript via PHP parallelism | Accepted |
| [0012](0012-method-binding-strategy.md)        | Method binding strategy                           | Accepted |
| [0013](0013-store-integration-architecture.md) | Store integration architecture                    | Accepted |
| [0014](0014-scheduled-price-fetching.md)       | Scheduled price fetching & background processing  | Accepted |
| [0015](0015-alert-delivery.md)                 | Alert/notification delivery                       | Accepted |
| [0016](0016-data-normalization.md)             | Data normalization pipeline                       | Accepted |
| [0017](0017-public-wish-list-sharing.md)       | Public list sharing                               | Accepted |
| [0018](0018-ontology-data-model.md)            | Book classification ontology data model           | Accepted |
| [0019](0019-ontology-i18n.md)                  | Ontology internationalization architecture        | Accepted |
| [0020](0020-datetime-convention.md)            | Date and time storage convention                  | Accepted |
| [0021](0021-data-erasure-and-export.md)        | Data erasure and export                           | Accepted |
| [0022](0022-ui-string-i18n.md)                 | UI string internationalization                    | Accepted |
| [0023](0023-logging-and-monitoring.md)         | Logging and monitoring                            | Accepted |
| [0024](0024-database-environments.md)          | Database environment separation                   | Accepted |
| [0025](0025-collation-convention.md)           | Character set and collation convention            | Accepted |

## Statuses

- **Draft** — decision not yet taken; the ADR frames the question and options.
- **Proposed** — a decision is written but not yet accepted.
- **Accepted** — the decision is final and in force.
- **Superseded** — replaced by a later ADR (links to the successor).
- **Deprecated** — no longer relevant; no replacement.

## Format

Each ADR follows this template:

```
# ADR NNNN: Title

- Status: Draft | Proposed | Accepted | Superseded by NNNN | Deprecated
- Date: YYYY-MM-DD

## Context

Why does this decision need to be made? What constraints are in play?

## Decision

The chosen option, stated plainly. "To be decided" while in Draft.

## Consequences

What becomes easier, harder, or impossible because of this decision.
```
