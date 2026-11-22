import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("GET /api/health", () => {
	it("responds 200 inside the Workers runtime without authentication", async () => {
		const response = await exports.default.fetch(
			"http://example.com/api/health",
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok" });
	});
});
