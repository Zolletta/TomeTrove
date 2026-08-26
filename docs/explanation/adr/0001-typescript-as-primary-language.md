# ADR 0001: Adopt TypeScript as the primary language

- Status: Accepted
- Date: 2026-08-24

## Context

The primary development goal for TomeTrove is **learning TypeScript**. The author has ~26 years of PHP experience, some Python, and last used JavaScript ~15 years ago — but did encounter ES6 at the time, so modern syntax (arrow functions, `let`/`const`, classes, modules, template literals, destructuring, `Promise`/`async`/`await`) is not entirely foreign. The project must therefore be written in a way that exercises modern TS idioms rather than papering over them with `any`.

Constraints:

- The codebase must compile under `tsc --strict` (or equivalent) so the type system does real teaching work.
- PHP-isms should be surfaced as explicit parallels, not avoided — the learning path is "TS via PHP parallelism" (see [ADR 0011](0011-learning-path-ts-via-php.md)).
- The Cloudflare Workers runtime is the target ([ADR 0002](0002-cloudflare-workers-runtime.md)); TS is the default language there.

## Options

1. **TypeScript (strict)** — the intended choice. Embrace types, interfaces, generics, and the structural-typing model.
2. JavaScript — rejected; defeats the learning goal and loses Workers' default tooling story.

## Decision

Adopt **TypeScript in strict mode** as the sole language for TomeTrove. All source files are `.ts`; `tsc --strict` (or the project's equivalent strict config) must pass with no `any` types except where explicitly justified and documented.

## Consequences

- **Positive**: the type system does real teaching work, surfacing the nominal-vs-structural distinction ([ADR 0011](0011-learning-path-ts-via-php.md)) and generics in a hands-on way; Workers' default tooling and bindings types (`wrangler types`) are TS-native; refactoring and autocomplete are meaningfully better than in plain JS.
- **Negative**: a stricter learning curve than plain JS; some Workers examples and community snippets are in JS and must be mentally transcribed; initial velocity is slower until the type vocabulary is internalised.
- **Neutral**: the project already ships TS scaffolding from create-cloudflare, so no tooling migration is needed.
