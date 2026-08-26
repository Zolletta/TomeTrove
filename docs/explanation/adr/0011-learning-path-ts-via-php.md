# ADR 0011: Learning approach — TypeScript via PHP parallelism

- Status: Accepted
- Date: 2026-08-24

## Context

The author has ~26 years of PHP and some Python, and last used JavaScript ~15 years ago — but did encounter ES6 at the time, so modern JS syntax (arrow functions, `let`/`const`, classes, modules, template literals, destructuring, `Promise`/`async`/`await`) is familiar ground. The fastest learning path is therefore not "learn TS from scratch" but "map what PHP and Python already teach onto TS", surfacing the parallels and the genuine differences explicitly, and treating the ES6 foundation as a given rather than re-teaching it. This ADR records the *pedagogical* approach so it can guide how code is written and how the tutorials quadrant is structured.

### The author's existing architecture pattern

The author already follows a consistent architecture across PHP and Python: **DTOs hold state, service classes orchestrate behaviour**. In PHP this means readonly property classes (or similar) for data and service classes with injected dependencies for logic. In Python this means `@dataclass(frozen=True)` for data and service classes with injected repositories for logic. The same pattern maps directly to TypeScript: `interface` with `readonly` fields for data, `class` with `constructor(private repo)` for behaviour. The architecture does not change — only the language mechanics do. This significantly narrows the learning surface: the goal is **TS syntax and type-system rules for a paradigm the author already practices**, not a new paradigm.

### Key parallels and divergences

| Concept              | PHP                              | Python                                                  | TypeScript                                                                                     |
|----------------------|----------------------------------|---------------------------------------------------------|------------------------------------------------------------------------------------------------|
| Type declarations    | `function f(int $x): string`     | `def f(x: int) -> str`                                  | `function f(x: number): string`                                                                |
| Nullable             | `?int $x`                        | `int \| None`                                           | `number \| null` / `number \| undefined`                                                       |
| Union types          | `int\|string`                    | `int \| str`                                            | `number \| string`                                                                             |
| DTO (data)           | class with readonly props        | `@dataclass(frozen=True)`                               | `interface` with `readonly` fields + object literal                                            |
| Behaviour (service)  | class with injected deps         | class with injected deps                                | same — `class` with `constructor(private repo)`                                                |
| Interface (contract) | `interface` + `implements`       | `ABC` + inheritance (nominal) / `Protocol` (structural) | `interface` + `implements` (checked at class site) or structural match (no declaration needed) |
| Enums                | backed enums                     | `enum.Enum`                                             | `enum` (numeric + string)                                                                      |
| Generics             | PHPStan `@template`              | `TypeVar` / `Generic[T]`                                | first-class `<T>`                                                                              |
| Async                | none (sync by default)           | `async def` / `await`                                   | `Promise` / `async`/`await` (familiar from ES6, but pervasive in Workers)                      |
| Modules              | `require`/`use` / Composer       | `import` / pip                                          | `import`/`export` / npm                                                                        |
| Tooling              | PHPStan, Psalm, Composer         | mypy/pyright, ruff, pip/uv                              | `tsc`, ESLint, npm                                                                             |
| Runtime              | request-isolated, shared nothing | process-based, shared nothing                           | V8 isolate, shared-nothing per request but persistent isolate                                  |

### Structural vs nominal typing — the biggest conceptual leap

PHP's types are **nominal**: a class *is* its name. Two classes with identical fields are different types. `class Ebook implements BookInterface` is the only way to satisfy `BookInterface`.

Python has **both**: ABCs are nominal (inheritance required), Protocols are structural (shape alone matches, `class Foo(BarProtocol)` is optional discipline — it helps tooling and readability but is not required for type-checking).

TypeScript is **purely structural**: if an object has the fields an `interface` requires, it matches — no `implements` declaration needed. `const book: Book = { title: "Dune", author: "Herbert" }` is valid; the object literal *is* a `Book` by shape. This means a DB row from TiDB is already a `Book` — no hydration step needed, unlike PHP where you'd reconstruct an entity from an array.

TS interfaces serve three roles that are separate constructs in PHP: **DTO shape** (like a PHP readonly class), **class contract** (like a PHP interface), and **type annotation for raw data** (like a typed array shape). One construct, multiple uses.

TS does have `implements` for classes, but it only checks the shape at the class declaration site — it does not change assignability. An object literal with the right shape still matches the interface regardless. There is no way to opt into full nominal typing as a language feature.

**Escape hatch — branded types**: when two domain types have overlapping shapes but different meanings (e.g. `Book` and `Movie` both with `title: string; creator: string`), structural matching would incorrectly treat them as interchangeable. TS has no language-level nominal typing, but you can simulate it with a phantom brand field:

```typescript
interface Book { readonly __brand: "Book"; title: string; creator: string; }
interface Movie { readonly __brand: "Movie"; title: string; creator: string; }
```

The `__brand` field exists only in the type system. It forces the type checker to treat `Book` and `Movie` as distinct even when their real fields are identical. You reach for branding **reactively** (when shapes collide and mean different things), not proactively (on every type). In practice, most types don't need it — different field names (`author` vs `director`) already keep types separate structurally.

### Interfaces as DTOs — the hydration insight

In PHP, fetching a row from the database returns an array; you hydrate it into a DTO object via a constructor or mapper. In TS, the database driver returns a plain object; you annotate it as `Book` and it *is* a `Book` — no hydration, no constructor call, no mapping layer. The row is already the model, structurally.

This is why the TS ecosystem (and the Cloudflare Workers ecosystem specifically) leans toward **data as interfaces + behaviour as functions or service classes**, rather than the PHP pattern of **everything as a class**. [Hono](https://hono.dev/) ([ADR 0008](0008-http-routing.md)) uses plain objects and functions. [Drizzle](https://orm.drizzle.team/) ([ADR 0009](0009-schema-migrations.md)) returns plain typed objects, not class instances. The Workers runtime itself is functional (`ExportedHandler.fetch(request, env, ctx)` — no class, just a function).

### Async pervasiveness

Async (`Promise`/`async`/`await`) is familiar from ES6 and from Python's `async def`/`await`, so it is a refresher rather than a new concept. The difference in the Workers runtime is **pervasiveness**: every I/O operation (database query, `fetch`, KV read, R2 put) is async, unlike PHP's sync-by-default model. This is not conceptually new (Python's `asyncio` is the same), but it means there is no sync fallback — `await` is everywhere, and forgetting it is a common TS beginner bug that the type system does not always catch.

## Options

1. **PHP/Python-parallelism first** — every new TS concept introduced with its PHP and/or Python counterpart and a callout of where they diverge. Tutorials in `docs/tutorials/` are structured around this mapping. The author's existing DTO+service architecture is preserved; only syntax changes.
2. **Pure TS-from-scratch** — ignore PHP/Python knowledge; learn TS as a newcomer would. Slower; wastes existing mental models and existing architecture instincts.
3. **Parallelism as a side reference** — learn TS normally, keep a PHP/Python↔TS cheat sheet in `docs/reference/` for lookup. Less structured; risks missing the structural-typing shift until it causes a bug.

## Decision

Adopt **option 1: PHP/Python-parallelism first**.

Every new TS concept is introduced with its PHP and/or Python counterpart, with explicit callouts where they diverge. The author's existing architecture pattern (DTOs for state, service classes for behaviour) is preserved and mapped directly — the learning is **TS syntax and type-system rules for a paradigm already practiced**, not a new paradigm. Tutorials in `docs/tutorials/` are structured around the mapping table above.

The structural-typing shift is the single biggest conceptual hurdle and is called out explicitly in tutorials: interfaces as DTOs (no hydration needed), structural matching (no `implements` required), and branded types as the escape hatch when nominal guarantees are needed.

## Consequences

- **Positive**: the learning surface is narrow — syntax and type-system rules, not architecture or paradigm; the author's DTO+service pattern maps directly, so early code will feel familiar in structure; the hydration-free data layer (DB row is already the typed object) is a genuine productivity win over PHP and a motivating example of why structural typing is useful; the PHP/Python/TS mapping table serves as a durable reference in `docs/reference/` for lookup during development.
- **Negative**: structural typing will occasionally surprise — two types with overlapping fields are interchangeable, which can mask bugs that nominal typing would catch; the `this` binding gotcha in TS classes (callbacks lose `this`) has no PHP equivalent and will need explicit explanation; async pervasiveness means forgetting `await` is a common bug the type system does not always catch (a `Promise<T>` is assignable to `T` in some contexts); branded types add ceremony in the few cases where nominal guarantees are needed.
- **Neutral**: the author may choose to start with classes for the first features (comfort zone) and refactor toward functions + interfaces for the data layer once the hydration pain becomes concrete — this refactoring exercise is itself a useful TS lesson and is expected, not a sign of wrong initial decisions.
