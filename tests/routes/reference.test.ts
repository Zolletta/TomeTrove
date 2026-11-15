import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { decodeCursor } from "../../src/lib/pagination";
import { createReferenceRouter } from "../../src/routes/reference";
import {
	isIntegerKey,
	isStringKey,
	ReferenceService,
} from "../../src/services/reference-service";
import { memorySource } from "../support/memory-source";

const service = new ReferenceService({
	countries: memorySource(
		[
			{ country_id: "DE", country_name_en: "Germany" },
			{ country_id: "FR", country_name_en: "France" },
			{ country_id: "IT", country_name_en: "Italy" },
		],
		(row) => row.country_id,
		isStringKey,
	),
	currencies: memorySource(
		[
			{ currency_id: "EUR", currency_name_en: "Euro", currency_minor_units: 2 },
			{ currency_id: "JPY", currency_name_en: "Yen", currency_minor_units: 0 },
			{
				currency_id: "XAU",
				currency_name_en: "Gold",
				currency_minor_units: null,
			},
		],
		(row) => row.currency_id,
		isStringKey,
	),
	languages: memorySource(
		[
			{
				language_id: "en",
				language_name_en: "English",
				language_name_native: "English",
			},
			{
				language_id: "it",
				language_name_en: "Italian",
				language_name_native: "Italiano",
			},
		],
		(row) => row.language_id,
		isStringKey,
	),
	types: memorySource(
		[
			{ type_id: 1, type_slug: "fiction", type_name_en: "Fiction" },
			{ type_id: 2, type_slug: "poetry", type_name_en: "Poetry" },
			{ type_id: 3, type_slug: "theatre", type_name_en: "Theatre" },
		],
		(row) => row.type_id,
		isIntegerKey,
	),
});

const app = new Hono().route(
	"/api",
	createReferenceRouter(() => service),
);

describe("reference endpoints", () => {
	it.each([
		["/api/countries", "country_id", ["DE", "FR", "IT"]],
		["/api/currencies", "currency_id", ["EUR", "JPY", "XAU"]],
		["/api/languages", "language_id", ["en", "it"]],
		["/api/types", "type_id", [1, 2, 3]],
	])("GET %s returns { data, _links } in key order", async (path, key, ids) => {
		const res = await app.request(path);
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			data: Record<string, unknown>[];
			_links: Record<string, { href: string }>;
		};
		expect(body.data.map((row) => row[key])).toEqual(ids);
		expect(body._links.self.href).toBe(`${path}?per_page=20`);
		expect(body._links.next).toBeUndefined();
	});

	it("follows the next link to the second page", async () => {
		const first = await app.request("/api/types?per_page=2");
		const firstBody = (await first.json()) as {
			_links: { next: { href: string } };
		};
		const nextHref = firstBody._links.next.href;
		expect(
			decodeCursor(
				new URL(nextHref, "http://x").searchParams.get("cursor") ?? "",
			),
		).toBe(2);

		const second = await app.request(nextHref);
		const secondBody = (await second.json()) as {
			data: { type_slug: string }[];
		};
		expect(secondBody.data.map((row) => row.type_slug)).toEqual(["theatre"]);
	});

	it("returns 400 for an invalid cursor", async () => {
		const res = await app.request("/api/countries?cursor=garbage");
		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({
			error: "invalid_cursor",
			message: "Invalid pagination cursor",
		});
	});

	it("returns 400 for per_page above 100", async () => {
		const res = await app.request("/api/countries?per_page=101");
		expect(res.status).toBe(400);
	});

	it("fails with 500 when DATABASE_URL is missing", async () => {
		const real = new Hono();
		real.onError((err, c) =>
			c.json({ error: "internal_error", message: err.message }, 500),
		);
		real.route("/api", createReferenceRouter());
		const res = await real.request("/api/countries", {}, {});
		expect(res.status).toBe(500);
	});
});
