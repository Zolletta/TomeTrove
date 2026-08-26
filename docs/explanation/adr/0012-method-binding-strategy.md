# ADR 0012: Method binding strategy — arrow function properties for service classes

- Status: Accepted
- Date: 2026-08-24

## Context

In TypeScript/JavaScript, `this` is resolved at **call time** based on the call site, not at definition time. A method called as `service.markAsRead()` has `this = service` (bound by the dot), but the same method passed as a bare callback (`router.get(path, service.markAsRead)`) loses `this` — it becomes `undefined` at runtime when the router calls it without the dot. This has no equivalent in PHP (`$this` is baked into the object) or Python (`self` is an explicit parameter).

The author's architecture ([ADR 0011](0011-learning-path-ts-via-php.md)) uses service classes with injected dependencies. Service methods are called from two contexts:

1. **Directly** — `service.markAsRead(book)` — `this` is bound by the dot. Always safe.
2. **As callbacks** — passed to a router, event handler, or other framework that calls them later — `this` is lost unless the method is bound.

The question is how to ensure `this` is always correct without boilerplate or runtime risk.

## Options

### 1. Anonymous wrapper at the call site

```typescript
router.get("/books/:id/read", async (c) => {
    await service.markAsRead(c.req.param("id"));
});
```

The method is always called with the `service.` prefix inside the wrapper. `this` is bound by the dot. No change to the class needed.

- **Pro**: zero class-level changes; natural in the Hono/Workers ecosystem; the `this` problem never arises.
- **Con**: every call site that passes a method must wrap it — if someone forgets and passes a bare method, runtime error.

### 2. Arrow function property on the class

```typescript
class BookService {
    constructor(private repo: BookRepository) {}

    markAsRead = async (book: Book): Promise<Book> => {
        return this.repo.save({ ...book, status: "read" };
    };
}
```

The arrow function captures `this` from the constructor's scope at construction time. The binding is permanent — the method can be passed bare and `this` is never lost.

- **Pro**: binding is resolved at **creation time**, not call time — the guarantee is baked in once and can never be broken at any call site; no wrapper boilerplate at call sites; one function object per method (no redundancy).
- **Con**: each instance gets its own copy of the function (it's an instance property, not a prototype method) — slight memory overhead per instance. Negligible for a small number of service instances.

### 3. `.bind()` at the call site

```typescript
router.get("/books/:id/read", service.markAsRead.bind(service));
```

Creates a new wrapper function with `this` permanently set to `service`.

- **Pro**: no class-level change.
- **Con**: must be remembered at **every** call site — forget once, runtime error; creates a redundant wrapper function object on each call (the original unbound method still exists, unused).

### 4. `.bind()` in the constructor

```typescript
class BookService {
    constructor(private repo: BookRepository) {
        this.markAsRead = this.markAsRead.bind(this);
    }

    async markAsRead(book: Book): Promise<Book> {
        return this.repo.save({ ...book, status: "read" };
    }
}
```

Binds each method to `this` once, at construction.

- **Pro**: call sites can pass methods bare without wrappers.
- **Con**: the method is defined as a regular (unbound) prototype method, then overwritten with a bound copy in the constructor — **two function objects per method** (the prototype method, shadowed and unused, plus the bound wrapper). This is redundant: the original is dead weight. Also requires one `.bind()` line per method in the constructor — boilerplate that's easy to forget.

### Structural distinction between options 2 and 4

Option 2 **defines the method correctly at the source** — it's an arrow function from the start, `this` is captured lexically, one function object. Option 4 **defines the method incorrectly (unbound) then fixes it downstream** (bind in constructor) — two function objects, the original is shadowed dead weight. Same end result for the caller, but option 2 is the cleaner design: one function, one binding, no leftovers. This maps to the principle of defining things correctly at the source rather than patching them afterward.

## Decision

Adopt **option 2 (arrow function properties) as the default for service class methods**, with **option 1 (anonymous wrappers) as the preferred pattern for route handlers**.

- Service classes use arrow function properties (`markAsRead = async (book) => { ... }`) so methods are safe to pass as callbacks without any call-site boilerplate. The binding is resolved at creation time — a permanent guarantee.
- Route handlers in the router (Hono — [ADR 0008](0008-http-routing.md)) are written as anonymous arrow functions that call service methods. This is the idiomatic [Hono](https://hono.dev/) pattern and keeps route definitions readable.
- Options 3 and 4 (`.bind()`) are not used — they add redundant function objects and require remembering boilerplate at call sites or in constructors.

## Consequences

- **Positive**: `this` binding is guaranteed at creation time for service methods — no runtime `this is undefined` errors from detached callbacks; call sites are clean (no `.bind()` or wrapper boilerplate when passing service methods); one function object per method (no redundancy); the convention is simple to state and follow — "arrow function properties on service classes, anonymous wrappers for route handlers."
- **Negative**: each service instance carries its own copy of each method (instance property, not prototype method) — slight memory overhead per instance, negligible for the small number of service instances in TomeTrove; developers unfamiliar with the pattern may expect regular methods and be surprised by the arrow syntax in class bodies.
- **Neutral**: this convention is specific to TS/JS and has no PHP or Python equivalent — it's a language-mechanics decision, not an architectural one; it can be revisited if a future framework expects prototype methods specifically (rare).
