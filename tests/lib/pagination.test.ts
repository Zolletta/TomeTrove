import { describe, expect, it } from "vitest";
import {
	decodeCursor,
	encodeCursor,
	InvalidCursorError,
	paginate,
	paginationQuerySchema,
} from "../../src/lib/pagination";
import {
	isIntegerKey,
	isStringKey,
} from "../../src/services/reference-service";
import { memorySource } from "../support/memory-source";

const letters = "abcdefghij".split("").map((id) => ({ id }));
const source = memorySource(letters, (row) => row.id, isStringKey);
const cursorOf = (href: string | undefined) =>
	href === undefined
		? undefined
		: new URL(href, "http://x").searchParams.get("cursor");

describe("cursor encoding", () => {
	it("round-trips string and number keys", () => {
		expect(decodeCursor(encodeCursor("IT"))).toBe("IT");
		expect(decodeCursor(encodeCursor(7))).toBe(7);
	});

	it("produces URL-safe cursors", () => {
		expect(encodeCursor("Ünïcødé?/+")).toMatch(/^[A-Za-z0-9_-]+$/);
	});

	it.each(["not-base64!", encodeCursor("x").slice(1), btoa('{"x":1}')])(
		"rejects tampered cursor %s",
		(cursor) => {
			expect(() => decodeCursor(cursor)).toThrow(InvalidCursorError);
		},
	);
});

describe("paginationQuerySchema", () => {
	it("defaults per_page to 20", () => {
		expect(paginationQuerySchema.parse({}).per_page).toBe(20);
	});

	it.each(["0", "101", "1.5", "abc"])("rejects per_page=%s", (perPage) => {
		expect(paginationQuerySchema.safeParse({ per_page: perPage }).success).toBe(
			false,
		);
	});
});

describe("paginate", () => {
	it("returns the first page with next and last links, no prev", async () => {
		const page = await paginate(source, "/api/x", { per_page: 3 });
		expect(page.data.map((row) => row.id)).toEqual(["a", "b", "c"]);
		expect(page._links.self.href).toBe("/api/x?per_page=3");
		expect(page._links.first.href).toBe("/api/x?per_page=3");
		expect(page._links.prev).toBeUndefined();
		expect(decodeCursor(cursorOf(page._links.next?.href) ?? "")).toBe("c");
		// 10 rows, 3 per page: the last page starts at "j" (after "i").
		expect(decodeCursor(cursorOf(page._links.last.href) ?? "")).toBe("i");
	});

	it("walks every row exactly once by following next links", async () => {
		const seen: string[] = [];
		let cursor: string | undefined;
		for (let i = 0; i < 10; i++) {
			const page = await paginate(source, "/api/x", { per_page: 4, cursor });
			seen.push(...page.data.map((row) => row.id));
			cursor = cursorOf(page._links.next?.href) ?? undefined;
			if (cursor === undefined) break;
		}
		expect(seen).toEqual(letters.map((row) => row.id));
	});

	it("links prev to the first page from the second page", async () => {
		const page = await paginate(source, "/api/x", {
			per_page: 3,
			cursor: encodeCursor("c"),
		});
		expect(page.data.map((row) => row.id)).toEqual(["d", "e", "f"]);
		expect(page._links.prev?.href).toBe("/api/x?per_page=3");
	});

	it("links prev with a cursor from a later page", async () => {
		const page = await paginate(source, "/api/x", {
			per_page: 3,
			cursor: encodeCursor("f"),
		});
		expect(page.data.map((row) => row.id)).toEqual(["g", "h", "i"]);
		expect(decodeCursor(cursorOf(page._links.prev?.href) ?? "")).toBe("c");
	});

	it("omits next on the last page", async () => {
		const page = await paginate(source, "/api/x", {
			per_page: 3,
			cursor: encodeCursor("i"),
		});
		expect(page.data.map((row) => row.id)).toEqual(["j"]);
		expect(page._links.next).toBeUndefined();
	});

	it("handles an exact multiple of per_page", async () => {
		const page = await paginate(source, "/api/x", { per_page: 5 });
		expect(page._links.next).toBeDefined();
		expect(decodeCursor(cursorOf(page._links.last.href) ?? "")).toBe("e");
	});

	it("handles an empty collection", async () => {
		const empty = memorySource<{ id: string }, string>(
			[],
			(row) => row.id,
			isStringKey,
		);
		const page = await paginate(empty, "/api/x", { per_page: 20 });
		expect(page.data).toEqual([]);
		expect(page._links.next).toBeUndefined();
		expect(page._links.last.href).toBe("/api/x?per_page=20");
	});

	it("rejects a cursor whose key type does not match the collection", async () => {
		const numeric = memorySource([{ id: 1 }], (row) => row.id, isIntegerKey);
		await expect(
			paginate(numeric, "/api/x", { per_page: 20, cursor: encodeCursor("a") }),
		).rejects.toThrow(InvalidCursorError);
	});
});
