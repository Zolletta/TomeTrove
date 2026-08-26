# ADR 0002: Cloudflare Workers as the compute platform

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove is already scaffolded as a Cloudflare Workers project (create-cloudflare CLI output, `wrangler.jsonc`, `src/index.ts`). The platform choice is effectively made, but this ADR records *why* so the reasoning is durable.

Relevant platform limits (retrieved 2026-08-24 from `developers.cloudflare.com/workers/platform/limits`):

| Limit               | Free    | Paid                 |
|---------------------|---------|----------------------|
| Requests/day        | 100,000 | No limit             |
| CPU time/request    | 10 ms   | 5 min (default 30 s) |
| Memory/isolate      | 128 MB  | 128 MB               |
| Subrequests/request | 50      | 10,000               |
| Simultaneous conns  | 6       | 6                    |

Constraints:

- TomeTrove is read-heavy and low-traffic at the personal scale — well within the free tier.
- Workers' edge execution gives low-latency reads globally.
- The V8 isolate model has no long-lived process; state lives in bindings (D1 / KV / R2 / Durable Objects), not in-memory.

## Options

1. **Cloudflare Workers** — already scaffolded; native TS; edge-native; free tier sufficient for a personal book collection.
2. A traditional Node server (Express/Fastify on a VPS) — closer to the PHP mental model but loses the serverless/edge story and the CF storage bindings.
3. PHP on a host — would be the comfort zone but contradicts the TS learning goal.

## Decision

Adopt **Cloudflare Workers** as the compute platform. The application runs as a single Worker (or a small set of Workers) deployed via `wrangler`, with state held entirely in Cloudflare bindings rather than in-process memory.

## Consequences

- **Positive**: no server to manage; edge-native low latency for reads; the free tier comfortably covers a personal book collection; native TS tooling and `wrangler types` for bindings align with [ADR 0001](0001-typescript-as-primary-language.md); the storage bindings ([D1](https://developers.cloudflare.com/d1/), [KV](https://developers.cloudflare.com/kv/), [R2](https://developers.cloudflare.com/r2/), [Durable Objects](https://developers.cloudflare.com/durable-objects/)) are first-class and require no connection-pooling plumbing.
- **Negative**: the V8 isolate model differs from PHP's shared-nothing-per-request model — there is no persistent process, no `$_SESSION`, and no filesystem; the 128 MB memory cap and 10 ms free-tier CPU cap constrain what can be done in a single request (stream large bodies, avoid buffering); the 6-simultaneous-connections limit bounds fan-out.
- **Neutral**: the project is already scaffolded on Workers, so this decision ratifies the status quo rather than introducing migration work.
