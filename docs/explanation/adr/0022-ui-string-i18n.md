# ADR 0022: UI string internationalization

- Status: Accepted
- Date: 2026-08-25

## Context

TomeTrove has two distinct i18n concerns:

- **Ontology term translation** — Type, Genre, and ontology tag names. These are curated data, queried from TiDB alongside entity data. Addressed in [ADR 0019](0019-ontology-i18n.md) via a DB-based `translation` table.
- **UI string translation** — button labels, error messages, page titles, navigation text, form labels, tooltips. These are code-adjacent: they change when the UI changes, and they are needed on every page render regardless of whether a DB query happens.

This ADR covers UI strings only.

Requirements:

- **Graceful fallback**: if a UI string is missing for a language, the system falls back to English. Partial translations must work.
- **No schema changes for new languages**: adding a language must not require a migration or a deploy of the application code. It should be a data/file contribution.
- **Zero runtime DB cost**: UI strings are needed on every page render. A DB round-trip per request for strings that could be in memory is wasteful — unlike ontology terms, which ride an existing DB query via JOIN.
- **Developer workflow**: when a developer adds or changes a UI string, the translation infrastructure should not require manual coordination with translators. The English string is the source of truth; other languages are derived.

Constraints from the platform (Cloudflare Workers, [ADR 0002](0002-cloudflare-workers-runtime.md)):

- Workers can bundle static assets (via the `assets` binding or imported JSON/TS modules). File content is available at runtime without a network fetch.
- Workers have no filesystem at runtime — translation files must be bundled at deploy time, not read from disk per request.
- Workers have a 128 MB memory cap — translation files must be small enough to load into memory without pressure. UI strings are short (a few hundred strings × a few languages = a few hundred KB), well within limits.

## Options

### Option 1 — File-based JSON, keyed by string ID (chosen)

Store UI strings in version-controlled JSON files, one file per language, keyed by a stable string ID. The files live in `src/i18n/{lang}/ui.json`. The Worker bundles them at deploy time (imported as JSON modules) and loads them into an in-memory `Map<string, string>` at startup.

```
src/i18n/
  en/ui.json    # English — canonical, hand-edited by developers
  it/ui.json    # Italian — hand-edited by volunteers (future)
  {lang}/ui.json
```

Each file is a flat string ID → text mapping:

```json
// src/i18n/en/ui.json
{
  "button.save": "Save",
  "button.cancel": "Cancel",
  "error.required": "This field is required",
  "page.books.title": "My Books",
  "nav.wishlist": "Wishlist"
}
```

- **Pros**: zero runtime DB cost — strings are in memory, loaded once at startup; no DB round-trip per request; developers add strings by editing the English file alongside the code that uses them; new languages are a new JSON file; partial translations work (missing keys fall back to English); JSON is universally understood and works with any text editor or translation tool; the files are version-controlled alongside the code, so changes ship with the deploy that needs them.
- **Cons**: translations update only on deploy (not live-editable without a merge + deploy cycle — acceptable since UI strings change infrequently and always ship with code changes); a string ID rename requires updating all language files (mitigated by stable, descriptive string IDs); the English file is hand-edited (not generated), so developers must keep it in sync with the code (mitigated by a lint/test check that verifies every string ID referenced in code exists in the English file).

### Option 2 — DB-based `translation` table (same as ontology)

Store UI strings in the `translation` table with `table_name = 'ui'`.

- **Pros**: one unified system for all translations.
- **Cons**: UI strings are needed on every page render regardless of whether a DB query happens — a DB round-trip per request for strings that could be in memory is wasteful; UI strings are code-adjacent (they change when the UI changes), so coupling them to DB writes adds friction to the development workflow; the `translation` table's `table_name` enum would need a `ui` value, coupling the schema to the UI. Rejected — the access pattern and lifecycle are wrong for UI strings.

### Option 3 — gettext (.po / .pot) files

Industry-standard translation format with excellent tooling (Poedit, Weblate, Transifex).

- **Pros**: industry-standard; excellent tooling; handles plural forms and message context; familiar to FOSS translators.
- **Cons**: gettext's `.po` workflow (extract → merge → translate) is heavier than JSON for a small project; the extraction step requires a tool that parses the codebase for translatable strings; plural forms are rarely needed for UI labels (most are singular nouns or short phrases). Viable but overkill for TomeTrove's scale. Rejected in favor of JSON, but the format choice is reversible.

### Option 4 — TypeScript objects

Define UI strings as TypeScript objects in `src/i18n/{lang}/ui.ts`, imported directly by the code.

- **Pros**: type-safe (the compiler checks that string IDs exist); no JSON parsing at runtime; IDE autocomplete for string IDs.
- **Cons**: translators edit `.ts` files, which is less friendly than JSON for non-developers; a syntax error in a `.ts` file breaks the build; JSON is the more standard format for translation tooling. Rejected in favor of JSON, but a type-generation step (JSON → TS types) can be added later for the type-safety benefit without changing the source format.

## Decision

Adopt **option 1: file-based JSON, keyed by string ID**.

### File structure

```
src/i18n/
  en/ui.json    # English — canonical, hand-edited by developers
  it/ui.json    # Italian — hand-edited by volunteers (future)
  {lang}/ui.json
```

### String ID conventions

- **Hierarchical, dot-separated**: `area.specific.label` (e.g. `button.save`, `error.required`, `page.books.title`, `nav.wishlist`).
- **Stable and immutable**: once a string ID is introduced, it is never renamed. If the text changes, the ID stays. If the concept is removed, the ID is retired (left in the file with a comment, or removed if no code references it).
- **Descriptive, not positional**: `button.save` not `btn_1`. A translator reading the ID should understand the context without seeing the code.

### Runtime lookup

The Worker imports the JSON files as modules at deploy time. At startup, it builds an in-memory `Map<string, string>` per language. The translation function is a pure lookup with fallback:

```typescript
// Pseudocode — see [ADR 0012](0012-method-binding-strategy.md) for method binding conventions
translate = (id: string, lang: string): string => {
  const map = loadUiStrings(lang)  // in-memory, bundled
  return map.get(id) ?? loadUiStrings('en').get(id) ?? id
}
```

- If the string has a translation in the requested language, return it.
- If not, fall back to English.
- If the ID is not in the English file either (a developer forgot to add it), return the ID itself (visible in the UI as a signal that a string is missing).

### Launch state

At launch, only `en/ui.json` exists. The file is populated as the UI is built. No other language files exist until a volunteer contributes one.

### Developer workflow

1. Developer adds a new UI element that needs a string.
2. They add the string ID and English text to `src/i18n/en/ui.json`.
3. They reference the string ID in the code (e.g. `translate("button.save", userLang)`).
4. A lint/test check verifies that every string ID referenced in code exists in `en/ui.json` — missing IDs are a build failure.
5. On deploy, the English file is bundled. Other language files (when they exist) are bundled too.

### Volunteer workflow (deferred)

The volunteer workflow for contributing new UI string translations (file import/export, validation, PR review) is deferred to a future phase. The file format and structure are decided here; the contribution mechanism is not.

### Separation from ontology translations

UI strings and ontology terms use different systems because they have different lifecycles and access patterns:

| Concern         | Ontology terms (ADR 0019)                     | UI strings (this ADR)                   |
|-----------------|-----------------------------------------------|-----------------------------------------|
| Source of truth | DB (`_en` fields on entity tables)            | File (`src/i18n/en/ui.json`)            |
| Translations    | DB (`translation` table)                      | File (`src/i18n/{lang}/ui.json`)        |
| Runtime cost    | JOIN on existing DB query                     | In-memory map (zero DB cost)            |
| Lifecycle       | Data-adjacent (changes when ontology changes) | Code-adjacent (changes when UI changes) |
| Key             | Entity PK + `table_name`                      | Stable string ID                        |

## Consequences

- **Positive**: zero runtime DB cost — UI strings are in memory, loaded once at startup; no DB round-trip per request; developers add strings alongside the code that uses them; new languages are a new JSON file — no schema changes, no migrations; partial translations work (fallback to English); JSON is universally understood and works with any text editor or translation tool; the files are version-controlled, so translation changes ship with the code deploy that needs them.
- **Negative**: translations update only on deploy (not live-editable without a merge + deploy cycle — acceptable since UI strings change infrequently and always ship with code changes); a string ID rename requires updating all language files (mitigated by stable, descriptive IDs that are never renamed); the English file is hand-edited, so developers must keep it in sync with code (mitigated by a lint/test check); no type-safety on string IDs at compile time (a JSON → TS type generation step can be added later).
- **Neutral**: the volunteer contribution workflow is not yet designed — this ADR stays Draft until it is; gettext is a viable alternative if the project outgrows JSON (the format choice is reversible); a type-generation step (JSON → TS types) can be added later for compile-time string ID checking without changing the source format.
