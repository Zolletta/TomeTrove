# TomeTrove — Agent instructions

STOP. Before you start, identify which guide applies to your task and read it first.

- **Working with Cloudflare Workers, KV, R2, D1, Durable Objects, Queues, or the Agents SDK?** Read [Cloudflare Workers](docs/contributor/cloudflare-workers.md) — then retrieve current docs before writing any code.
- **Writing or editing TypeScript, running builds, tests, or schema migrations?** Read [Coding style](docs/contributor/coding.md) — Biome, method binding (ADR 0012), testing, Drizzle, TiDB serverless driver.
- **Writing or editing documentation?** Read [Documentation style](docs/contributor/documentation.md) — Diátaxis quadrants, formatting rules, ADR conventions. For Mermaid diagrams, also read [Mermaid diagram style](docs/contributor/mermaid-style.md) — boxes have no fill and no background; border colors only, 2 px max thickness.
- **Running an automated review before a PR?** Read [Automated review](docs/contributor/auto-review.md) — [Zolletta-MetaSkill](https://metaskill.zolletta.org) for code and documentation review.
- **Working on UX (maybe with Figma), features, or user journeys?** Read the [feature inventory](docs/contributor/ux/features.md) and [user journeys](docs/contributor/ux/user-journeys/index.md) — all planned features with their UI type, container, and the flows that connect them. The complete UI design export (screenshots, component code, tokens, interaction specs) lives in [`design/`](design/README.md) — start from `design/README.md`.

If your task spans more than one area, read all the relevant guides.

## Just-In-Time (JIT) Planning

TomeTrove follows a Just-In-Time (JIT) planning philosophy for issue implementation:

- **No upfront batch-planning**: Do not write implementation plans for future issues in advance. Architectural insights and runtime lessons from active issues refine downstream tasks. Plan an issue only when work on it begins.
- **Plan before code**: Before writing code for an issue, formulate a concrete, step-by-step implementation plan detailing the exact files to create or edit, Drizzle/Zod schemas, method signatures, edge cases, and test specifications.
- **Human review gate**: Obtain human approval on the plan before implementation starts. Attach the approved plan to the GitHub issue or maintain it as a `PLAN-<issue>.md` on the working branch.

## Development & Branch Workflow

- **Branch per issue**: For every issue, create a dedicated feature branch starting from `main` (e.g. `<issue-number>-<slug>`). Never commit or push feature implementation directly to `main`.
- **Work locally**: Implement and verify all changes locally on the branch using `wrangler dev`, `vitest`, `tsc`, and `biome`.
- **Pull Request workflow**: Push the branch to GitHub and create a Pull Request against `main` that references the issue (e.g. `Closes #<number>`). Merge to `main` only through approved PRs.


