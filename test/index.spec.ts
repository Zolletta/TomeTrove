import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("worker", () => {
	it("responds inside the Workers runtime", async () => {
		const response = await exports.default.fetch("http://example.com/");
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("Hello, world!");
	});
});
