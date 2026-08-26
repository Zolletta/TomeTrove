# Documentation style

This page is the canonical reference for how to write and structure documentation in TomeTrove. For coding conventions, see [Coding style](coding.md); for the Cloudflare runtime, see [Cloudflare Workers](cloudflare-workers.md).

## Framework

TomeTrove documentation follows the [Diátaxis framework](https://diataxis.fr/). Every page belongs to exactly one of four quadrants:

| Quadrant      | Directory           | Purpose                                                      | Audience                            |
|---------------|---------------------|--------------------------------------------------------------|-------------------------------------|
| Tutorials     | `docs/tutorials/`   | Learning-oriented, practical steps for newcomers             | Beginners                           |
| How-to guides | `docs/how-to/`      | Problem-oriented, steps to solve a specific problem          | Practitioners                       |
| Reference     | `docs/reference/`   | Information-oriented, technical description of the machinery | Users who need to look something up |
| Explanation   | `docs/explanation/` | Understanding-oriented, clarification and rationale          | Readers who want to understand why  |

If a page does not fit a quadrant, it probably belongs in `docs/contributor/` (meta-instructions for people working on TomeTrove, not product documentation). For a worked example of the framework in action, see the [ontology explanation](../explanation/ontology/index.md) (Explanation) and the [ontology reference](../reference/ontology/index.md) (Reference).

## Formatting rules

- **No artificial line breaks.** Each paragraph is a single line in the source. Let the renderer wrap. This keeps diffs clean and avoids hard wraps that break at different viewport widths.
- Fenced code blocks must have a language specifier (e.g. ` ```text `, ` ```ts `), never bare ` ``` `. This satisfies the MD040 lint rule and enables syntax highlighting.
- Use GitHub-flavored admonitions (` > [!NOTE] `, ` > [!WARNING] `, ` > [!TIP] `) for callouts, not blockquotes.
- Tables for structured comparisons; prose for narrative.

## Navigation

Every new page must be added to `docs/mkdocs.yml` under the correct quadrant section. The nav is the table of contents — an unlisted page is invisible to readers.

## ADRs

Architecture Decision Records live in `docs/explanation/adr/` and are numbered sequentially. Once an ADR is accepted, its number is never reused. If an ADR is deleted, subsequent ADRs are renumbered and all cross-references updated. See the [ADR index](../explanation/adr/index.md) for the current list.

## Cross-references

Use relative Markdown links (`[text](../reference/ontology/index.md)`), not absolute paths. This keeps links working in local previews, GitHub renders, and the built site.
