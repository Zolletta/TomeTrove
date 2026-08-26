# Explanation

Understanding-oriented documentation: discourse, background, trade-offs, and the reasoning behind architectural choices.

## Data model

The [data model explanation](data-model.md) covers why the TomeTrove data model is shaped the way it is — entity boundaries (Book vs Edition, shared author/curator pool), store applicability via the `user_store` junction, classification storage, price quote lifecycle, and the data flows for wish list adds, price fetches, alerts, and public list sharing. For the bare table and field listings, see the [data model reference](../reference/data-model.md).

## Book classification ontology

The [ontology explanation](ontology/index.md) covers why TomeTrove uses 9 Types instead of a fiction/non-fiction dichotomy, the three universal classification rules, how hierarchy levels and dynamic modifiers work, and how internationalization is designed in from the start.

## Architecture Decision Records

ADRs capture each significant architectural decision — its context, the chosen option, and the consequences. See the [ADR index](adr/index.md) for the full list and statuses.
