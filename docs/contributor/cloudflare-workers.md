# Cloudflare Workers

This page is the canonical reference for working with Cloudflare Workers in TomeTrove. For the rationale behind choosing Workers, see [ADR 0002](../explanation/adr/0002-cloudflare-workers-runtime.md). For coding conventions including the commands below, see [Coding style](coding.md).

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
- [Cloudflare MCP server](https://docs.mcp.cloudflare.com/mcp)

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command                    | Purpose                               |
|----------------------------|---------------------------------------|
| `npx wrangler dev`         | Local development                     |
| `npx wrangler deploy`      | Deploy to Cloudflare                  |
| `npx wrangler types`       | Generate TypeScript types             |
| `npx drizzle-kit generate` | Generate SQL migration from TS schema |
| `npx drizzle-kit migrate`  | Apply migrations to database          |
| `npx vitest`               | Run tests (Vitest + Workers runtime)  |
| `npx tsc --noEmit`         | Type check (static analysis)          |
| `npx biome check --write`  | Format + lint + fix (Biome)           |

Run `wrangler types` after changing bindings in wrangler.jsonc.
Run `drizzle-kit generate` after changing schema in `src/db/schema.ts`.

## Node.js Compatibility

[Node.js compatibility in Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from [`/workers/platform/limits/`](https://developers.cloudflare.com/workers/platform/limits/)
- **All errors**: [Workers error reference](https://developers.cloudflare.com/workers/observability/errors/)

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

Relevant ADRs: [ADR 0003](../explanation/adr/0003-database-choice.md) (TiDB Cloud Starter via serverless driver), [ADR 0005](../explanation/adr/0005-media-cover-storage.md) (R2), [ADR 0008](../explanation/adr/0008-http-routing.md) (Hono on Workers).

## TiDB Cloud integration

TomeTrove connects to TiDB Cloud Starter using the [`@tidbcloud/serverless`](https://www.npmjs.com/package/@tidbcloud/serverless) driver, which works over HTTP (Workers cannot make TCP connections). See the [coding style guide](coding.md#database-connection) for setup and usage, and the [official PingCAP integration docs](https://docs.pingcap.com/tidbcloud/integrate-tidbcloud-with-cloudflare/).

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)
- [Workflows: Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)
