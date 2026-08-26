# Automated review

TomeTrove uses [Zolletta-MetaSkill](https://metaskill.zolletta.org) for automated code and documentation review. MetaSkill is a review orchestration skill that runs parallel subagents to check code style, test code, documentation drift, and structural conventions.

## What it reviews

- **Code style** — Biome rules, method binding (ADR 0012), structural conventions.
- **Test code** — test structure, coverage gaps, God test classes.
- **Documentation** — drift detection between docs and code, README structure, ADR format, cross-reference integrity.

## When to run it

Run a full review before opening a PR:

```bash
# See MetaSkill docs for installation and usage
# https://metaskill.zolletta.org/how-to/run-full-review/
```

## Documentation

Full documentation is at [metaskill.zolletta.org](https://metaskill.zolletta.org) — including [tutorials](https://metaskill.zolletta.org/tutorials/getting-started/), [how-to guides](https://metaskill.zolletta.org/how-to/install/), [reference](https://metaskill.zolletta.org/reference/), and [explanation](https://metaskill.zolletta.org/explanation/).
