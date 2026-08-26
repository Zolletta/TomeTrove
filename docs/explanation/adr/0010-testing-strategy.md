# ADR 0010: Testing strategy

- Status: Accepted
- Date: 2026-08-24

## Context

The author's PHP background includes:

- **PHPUnit** — test framework (arrange/act/assert, `setUp`/`tearDown`, data providers).
- **Prophecy** — mocking framework (`$this->prophesize(Service::class)`, method stubbing, call verification).
- **PHPStan** — static analysis (catches type errors across the whole project without running code).
- **PHP CS Fixer** — code style formatter and fixer (enforces coding standards automatically).

The TS ecosystem has direct equivalents for each. The testing setup should mirror the PHP mental model so the learning loop is tight (write test → see type errors → fix → green).

Constraints:

- Vitest is the standard TS test runner for Workers and integrates with Miniflare (the local Workers runtime) via `@cloudflare/vitest-plugin` (v0.22.0, requires Vitest 4.1+).
- Tests run against the real bindings (TiDB via Hyperdrive, KV, R2 if needed) locally through Miniflare — no manual mocking of the platform.
- Vitest has mocking built in (`vi.fn()`, `vi.mock()`) — no separate mocking library needed (replaces Prophecy).
- TypeScript's compiler (`tsc --noEmit`) IS the static analyzer — unlike PHP where PHPStan runs on top, TS static analysis is built into the language. No separate tool needed for type checking.
- Code formatting/linting: Biome (single Rust-based tool, replaces both Prettier + ESLint) is the recommended choice for new TS projects in 2026 — near-zero config, very fast, 97% Prettier compatibility.

### PHP → TS tool mapping

| PHP tool     | TS equivalent                           | Notes                                                                                                                                               |
|--------------|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| PHPUnit      | Vitest                                  | `describe/it/expect` — maps to PHPUnit's `setUp/test*/tearDown`. Standard for Workers testing.                                                      |
| Prophecy     | Vitest built-in `vi.fn()` / `vi.mock()` | No separate library. `vi.fn()` creates mock functions, `vi.mock()` replaces modules. Simpler than Prophecy's prophecy objects.                      |
| PHPStan      | `tsc --noEmit`                          | TypeScript's type system IS the static analyzer. `tsc --noEmit` checks types across the whole project without emitting JS. No separate tool needed. |
| PHP CS Fixer | Biome                                   | Single tool (Rust binary) that both formats and lints. Replaces Prettier (formatter) + ESLint (linter). Near-zero config. Very fast.                |

### Vitest + `@cloudflare/vitest-plugin`

[Cloudflare Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/) — tests run inside the Workers runtime.

- Unit tests: import the Worker's `fetch` handler, call it directly, assert on the response.
- Integration tests: make real HTTP requests to the Worker running in Miniflare, with real bindings.
- Isolated per-test storage — each test gets a fresh database/KV state.
- Hot-module reloading for near-instant reruns during development.
- Declarative interface for mocking outbound `fetch()` requests (e.g. mocking OpenLibrary API responses).
- Requires Vitest 4.1+ and `@cloudflare/vitest-plugin` v0.22.0+.

### Biome

[Biome](https://biomejs.dev/) — formatter and linter, single Rust-based binary.

- Replaces both Prettier (formatter) and ESLint (linter) with one tool.
- 97% Prettier formatting compatibility.
- 526 rules from ESLint, TypeScript ESLint, and other sources.
- Near-zero configuration — works out of the box for TS projects.
- Very fast (Rust, not Node) — saves CI and developer time.
- Type-aware linting (2.x, no `tsc` needed for many rules).

## Options

1. **Vitest + `@cloudflare/vitest-plugin` + Biome + `tsc --noEmit`** — full stack: Vitest for testing (with built-in mocking), Biome for formatting/linting, `tsc` for type checking. Each maps directly to a PHP tool the author already knows. **Chosen.**
2. **Bun test + Biome** — Bun's built-in test runner is fast but lacks Workers-specific tooling (no Miniflare integration, no real bindings in tests). More manual setup.
3. **Node `node:test` + ESLint + Prettier** — stdlib test runner (no extra dep) but no Workers awareness; ESLint + Prettier is the traditional two-tool stack (more config, slower than Biome).
4. **Vitest + ESLint + Prettier** — Vitest for testing but the traditional two-tool formatting/linting stack instead of Biome. More mature ecosystem but more configuration and dependencies.

## Decision

Adopt **option 1: Vitest + `@cloudflare/vitest-plugin` + Biome + `tsc --noEmit`**.

- **Test runner**: Vitest 4.1+ with `@cloudflare/vitest-plugin`. Tests run inside the Workers runtime via Miniflare with real bindings. Config in `vitest.config.ts`.
- **Mocking**: Vitest's built-in `vi.fn()` and `vi.mock()`. No separate mocking library. For outbound HTTP requests (OpenLibrary, Google Books, store APIs), use the Vitest plugin's declarative `fetch()` mocking.
- **Static analysis**: `tsc --noEmit` — run as part of the type-check step. TypeScript's type system is the static analyzer; no separate tool like PHPStan is needed. Type errors are caught at compile time, not at runtime.
- **Formatting & linting**: Biome. One config (`biome.json`), one command (`biome check --write` to format + lint + fix). Replaces both PHP CS Fixer (formatting) and the linting aspect of PHPStan (code quality rules).

### Test structure

Tests mirror the PHPUnit mental model:

```typescript
// PHPUnit:
// class BookServiceTest extends TestCase {
//     private $service;
//     protected function setUp(): void { $this->service = new BookService($this->prophesize(Repo::class)->reveal()); }
//     public function testMarkAsRead(): void { ... }
// }

// Vitest equivalent:
describe("BookService", () => {
    let service: BookService;
    beforeEach(() => {
        const repo = vi.mocked(BookRepository);  // mock like Prophecy
        service = new BookService(repo);
    });
    it("marks a book as read", async () => {
        // arrange / act / assert
    });
});
```

## Consequences

- **Positive**: every PHP tool the author knows has a direct TS equivalent — the mental model transfers; Vitest's `describe/it/expect` is close to PHPUnit/Pest syntax; mocking is built into Vitest — no separate library to learn (simpler than Prophecy); `tsc --noEmit` provides static analysis for free — no separate tool like PHPStan; Biome is one tool replacing two (Prettier + ESLint) — less configuration, fewer dependencies, faster; tests run against real Workers bindings via Miniflare — no manual platform mocking; hot-module reloading gives near-instant test reruns during development.
- **Negative**: Biome's rule ecosystem is smaller than ESLint's plugin ecosystem — some specialized rules (framework-specific, accessibility) may not be available; Vitest's mocking API (`vi.mock()`) has different semantics from Prophecy — module-level mocking vs. object-level mocking, which requires a mental shift; `@cloudflare/vitest-plugin` is relatively new and may have rough edges with complex binding setups; `tsc --noEmit` checks types but does not check for unused code or circular dependencies — Biome covers some of this, but not all PHPStan rules have Biome equivalents.
- **Neutral**: the test structure (describe/it/beforeEach) is a convention, not enforced — the author can organize tests however they prefer; integration tests (real HTTP to Miniflare Worker) vs. unit tests (direct function calls) is a choice per test, not a global config; the Biome vs. ESLint+Prettier decision can be reversed later if a specific ESLint plugin becomes necessary.
