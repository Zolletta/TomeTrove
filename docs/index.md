# TomeTrove Documentation

This documentation follows the [Diátaxis](https://diataxis.fr/) framework, which organizes content into four quadrants based on the reader's intent.

## Structure

| Quadrant        | Path                                   | Purpose                                                                                                  | Audience                  |
|-----------------|----------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------|
| **Tutorials**   | [`tutorials/`](tutorials/index.md)     | Learning-oriented guides. Walk a newcomer through a task end-to-end so they learn by doing.              | New to the project        |
| **How-to**      | [`how-to/`](how-to/index.md)           | Task-oriented guides. Solve a specific, real-world problem. Assumes some familiarity.                    | Practitioners             |
| **Reference**   | [`reference/`](reference/index.md)     | Information-oriented. Describe the machinery neutrally — APIs, schemas, config. No explanation.          | Anyone who needs a fact   |
| **Explanation** | [`explanation/`](explanation/index.md) | Understanding-oriented. Discourse, background, trade-offs, and **Architecture Decision Records (ADRs)**. | People who want the "why" |

## Architecture Decision Records

ADRs live in [`explanation/adr/`](explanation/adr/index.md). Each ADR captures a single architectural decision: its context, the decision itself, and the consequences. See the [ADR index](explanation/adr/index.md) for the full list and statuses.
