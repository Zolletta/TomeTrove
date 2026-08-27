# Reference

Information-oriented documentation that describes the machinery neutrally — APIs, schemas, configuration. No explanation here.

## Documents

- [Data model](data-model.md) — the TomeTrove data model specification: tables, fields, types, and constraints. For the design rationale, see the [data model explanation](../explanation/data-model.md).
- [API endpoints](api-endpoints.md) — the canonical list of REST API endpoints, conventions, and response shapes. For the routing architecture, see [ADR 0008](../explanation/adr/0008-http-routing.md).
- [Scheduled flows](scheduled-flows.md) — the automatic background flows (Cron Triggers and Queue consumers): price fetching, month-end consolidation, log retention, list expiration, alert delivery.
- [Author normalization](author-normalization.md) — the mechanical rules that turn an external author record into an `author` row: name split, suffixes, particles, scripts, alias permutations, disambiguation.
- [Ontology](ontology/index.md) — the book classification taxonomy: 9 Types, genre hierarchies, and dynamic modifier vocabularies.
