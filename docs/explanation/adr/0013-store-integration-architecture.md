# ADR 0013: Store integration architecture

- Status: Accepted
- Date: 2026-08-24

## Context

TomeTrove tracks book prices across multiple stores (Amazon.it, ibs.it, Barnes & Noble, etc.). Each store has a different website or API, different capabilities (ships to certain countries, sells used/ebooks, good for certain languages), and different scraping/API requirements. The system needs a way to add new stores without modifying core logic.

The store adapter is the component that, given an edition (ISBN, title, etc.), queries a specific store and returns a price quote. Different stores will have wildly different implementations: some may have official APIs, most will require scraping, some may need browser automation.

Constraints:

- Each store has different capabilities (ships_to, sells_used, sells_ebooks, languages) that must be declarable and queryable at runtime.
- The adapter interface must be consistent so the price-fetching orchestrator can call any store the same way.
- New stores should be addable with minimal changes to the core system — writing the adapter code is the real work; configuration overhead should be minimal.
- Store implementations may be long-running (scraping) and could hit Workers' CPU time limits (10 ms free / 30 s paid default — [ADR 0002](0002-cloudflare-workers-runtime.md)). Isolating each store in its own Worker means a slow store doesn't block others.
- The system must auto-detect what stores are available and which are actionable for each user based on their preferences (preferred language, readable languages, prefers used, excludes ebooks, shipping country).

### Cloudflare service bindings + RPC

Service bindings allow one Worker to call another without going through a public URL. With `WorkerEntrypoint` (requires compatibility date `2024-04-03` or higher), a store Worker can expose typed RPC methods that the main Worker calls directly — `await env.AMAZON_IT.fetchPrice(query)` feels like a local function call.

Service bindings are statically declared in `wrangler.jsonc`:
```jsonc
{
  "services": [
    { "binding": "AMAZON_IT", "service": "store-amazon-it" },
    { "binding": "IBS_IT", "service": "store-ibs-it" }
  ]
}
```

Adding a new store requires: (1) write the store adapter code, (2) deploy the store Worker, (3) add one binding line to the main Worker's `wrangler.jsonc`, (4) redeploy the main Worker. Since writing the adapter code is the real work, the one config line is negligible overhead — not a burden.

### Capability discovery at runtime

While bindings are static, capabilities are dynamic. Each store Worker exposes a `capabilities()` RPC method. The main Worker iterates over all bound stores at startup (or on demand) and builds a runtime registry by calling `capabilities()` on each. This means a store can change its capabilities (e.g. start shipping to France) without the main Worker changing — the registry is rebuilt from live data.

### Per-user filtering

Once the capability registry is built, filtering by user preferences is a pure function. The main Worker takes the registry + user preferences + user country and returns only the actionable stores. This runs on every price fetch (on-demand or scheduled) — fast because the registry is in memory and the filter is a simple array operation.

## Options

1. **Separate Worker per store (service bindings + RPC)** — each store is its own Worker extending `WorkerEntrypoint`, called via service bindings. Capabilities discovered at runtime via RPC. Per-user filtering in the main Worker. **Chosen.**
2. **Interface + class per store (in-process)** — each store is a TS class implementing `StoreAdapter`, registered in a config file, called directly in the same Worker. Simpler deployment but all stores share one Worker's CPU budget; a slow store blocks others.
3. **Hybrid** — simple/fast stores as in-process adapters; complex/slow stores as separate Workers. Pragmatic but two patterns to maintain.
4. **Plugin system** — stores dynamically loaded at runtime. Overkill for a project with a handful of stores; adds complexity with no benefit since adding a store requires writing code anyway.

## Decision

Adopt **option 1: separate Worker per store, with service bindings + RPC**.

### Architecture

```
Main Worker (TomeTrove API)
├── service binding: AMAZON_IT → store-amazon-it Worker
├── service binding: IBS_IT → store-ibs-it Worker
├── service binding: BARNES_NOBLE → store-barnes-noble Worker
│
├── on startup / on demand:
│   └── calls capabilities() on each bound store → builds runtime registry
│
├── per user request:
│   └── filters registry by user preferences → actionable stores
│
└── per price fetch (on-demand or scheduled):
    └── calls fetchPrice(edition) on each actionable store
    └── collects quotes, stores in TiDB, checks thresholds → alerts
```

### `StoreAdapter` interface

Each store Worker extends `WorkerEntrypoint` and implements the `StoreAdapter` interface (structural typing — [ADR 0011](0011-learning-path-ts-via-php.md)):

```typescript
interface StoreCapabilities {
    shipsTo: string[];      // ISO 3166-1 alpha-2 country codes (e.g. ["IT"])
    sellsUsed: boolean;
    sellsEbooks: boolean;
    languages: string[];    // ISO 639-1 language codes (e.g. ["it", "en"])
}

interface StoreAdapter {
    capabilities(): Promise<StoreCapabilities>;
    fetchPrice(query: EditionQuery): Promise<PriceQuote | null>;
}
```

### Store Worker example

```typescript
import { WorkerEntrypoint } from "cloudflare:workers";

class AmazonItStore extends WorkerEntrypoint {
    async fetch(): Promise<Response> {
        return new Response(null, { status: 404 }); // no HTTP handler needed
    }

    async capabilities(): Promise<StoreCapabilities> {
        return {
            shipsTo: ["IT"],
            sellsUsed: true,
            sellsEbooks: true,
            languages: ["it", "en"],
        };
    }

    async fetchPrice(query: EditionQuery): Promise<PriceQuote | null> {
        // scrape or API call to Amazon.it
        // return null if not found
    }
}

export default AmazonItStore;
```

### Capability registry and per-user filtering

The main Worker builds a registry from all bound stores and filters by user preferences:

```typescript
const stores = [
    { name: "Amazon.it", binding: env.AMAZON_IT },
    { name: "ibs.it", binding: env.IBS_IT },
    { name: "Barnes & Noble", binding: env.BARNES_NOBLE },
];

// Build registry by asking each store for its capabilities:
const registry = await Promise.all(
    stores.map(async s => ({
        name: s.name,
        binding: s.binding,
        capabilities: await s.binding.capabilities(),
    }))
);

// Filter by user preferences (pure function):
function actionableStoresFor(
    registry: StoreRegistryEntry[],
    prefs: UserPreferences,
    userCountry: string,
): StoreRegistryEntry[] {
    return registry.filter(entry => {
        const caps = entry.capabilities;
        if (prefs.excludesEbooks && caps.sellsEbooks && !caps.sellsUsed) return false;
        if (prefs.prefersUsed && !caps.sellsUsed) return false;
        if (!caps.shipsTo.includes(userCountry)) return false;
        const userLanguages = [prefs.preferredLanguage, ...prefs.readableLanguages];
        if (!caps.languages.some(l => userLanguages.includes(l))) return false;
        return true;
    });
}
```

### Adding a new store

1. Write the store adapter (new Worker project, extends `WorkerEntrypoint`, implements `StoreAdapter`).
2. Deploy the store Worker to Cloudflare.
3. Add one binding line to the main Worker's `wrangler.jsonc`:
   ```jsonc
   { "binding": "NEW_STORE", "service": "store-new-store" }
   ```
4. Add one entry to the `stores` array in the main Worker.
5. Redeploy the main Worker.

The store's capabilities are discovered at runtime — no need to update the `stores` table in the database or hardcode capabilities in the main Worker.

## Consequences

- **Positive**: each store is isolated in its own Worker — a slow or failing store doesn't block others; each store has its own CPU time budget (30 s paid default); store capabilities are discovered at runtime via RPC — no hardcoded capability tables in the main Worker; per-user filtering is a pure function — easy to test and reason about; adding a store is writing code + one config line — minimal overhead given that the adapter code is the real work; [RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/) makes cross-Worker calls feel like local function calls — no HTTP/JSON serialization boilerplate; the `StoreAdapter` interface is structural ([ADR 0011](0011-learning-path-ts-via-php.md)) — store Workers satisfy it by having the right methods, no `implements` keyword needed (though it can be used for clarity at the class site).
- **Negative**: each store is a separate deployment — more Workers to manage, more `wrangler.jsonc` files; service bindings are statically declared — no fully dynamic store discovery at runtime (acceptable: adding a store requires writing code anyway); the main Worker must be redeployed when a new store binding is added; RPC stubs are proxies — debugging across Worker boundaries is harder than debugging in-process code; each store Worker has its own cold start — first call to a newly-bound store may be slow.
- **Neutral**: the `stores` table in the database ([data model reference](../../reference/data-model.md)) stores display metadata (name, URL) and the implementation identifier — it is populated/updated when a store binding is added, but capabilities are fetched live from the store Worker, not stored in the database; the capability registry could be cached (e.g. in [KV](https://developers.cloudflare.com/kv/) with a TTL) to avoid calling `capabilities()` on every request — this is an optimization to consider later; the filtering logic may grow more complex as user preferences evolve (e.g. "only stores that accept PayPal") — the pure function approach makes this easy to extend.
