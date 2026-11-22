import { decode, sign } from "hono/jwt";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app";
import {
	GITHUB_AUTH_URL,
	GITHUB_OAUTH_SCOPE,
	GITHUB_TOKEN_URL,
	GITHUB_USER_URL,
	JWT_ALGORITHM,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../src/constants";
import { authService } from "../src/services/auth-service";
import type { AppEnv } from "../src/types";
import { MemoryUserRepository } from "./support/memory-user-repository";

const testEnv: AppEnv = {
	ENVIRONMENT: "development",
	APP_URL: "http://localhost:8787",
	GITHUB_CLIENT_ID: "test-github-client-id",
	GITHUB_CLIENT_SECRET: "test-github-client-secret",
	JWT_SECRET: "test-jwt-secret-for-vitest-testing-32b",
};
const JWT_SECRET = testEnv.JWT_SECRET as string;
const GITHUB_ID = 13484638;
const STATE = "6f1c1b6e-3f7a-4d2b-9c4e-2a8d5e7f9b10";
const OTHER_STATE = "0b7e2c4a-9d1f-4e6b-8a3c-5f2d7e9c1a04";

let repo: MemoryUserRepository;
let app: ReturnType<typeof createApp>;

const mockGitHub = ({
	user = { id: GITHUB_ID, login: "ignored", email: "ignored" } as unknown,
	code = "test-code",
	appUrl = testEnv.APP_URL,
} = {}) =>
	vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
		const url = input instanceof Request ? input.url : String(input);
		if (url === GITHUB_TOKEN_URL) {
			expect(init?.method).toBe("POST");
			expect(JSON.parse(String(init?.body))).toEqual({
				client_id: testEnv.GITHUB_CLIENT_ID,
				client_secret: testEnv.GITHUB_CLIENT_SECRET,
				code,
				redirect_uri: `${appUrl}/auth/github/callback`,
			});
			return Response.json({ access_token: "gho_test" });
		}
		if (url === GITHUB_USER_URL) {
			expect(new Headers(init?.headers).get("Authorization")).toBe(
				"Bearer gho_test",
			);
			return Response.json(user);
		}
		throw new Error(`Unexpected fetch to ${url}`);
	});

const callback = (env: AppEnv = testEnv) =>
	app.request(
		`/auth/github/callback?code=test-code&state=${STATE}`,
		{ headers: { Cookie: `${OAUTH_STATE_COOKIE_NAME}=${STATE}` } },
		env,
	);

const sessionCookie = (res: Response): string => {
	const match = res.headers
		.getSetCookie()
		.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
	if (!match) throw new Error("No session cookie");
	return match;
};

beforeEach(() => {
	repo = new MemoryUserRepository();
	app = createApp({ userRepositoryFor: () => repo });
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GET /auth/github/login", () => {
	it("sets the state cookie and redirects to GitHub", async () => {
		const res = await app.request("/auth/github/login", {}, testEnv);
		expect(res.status).toBe(302);

		const location = new URL(res.headers.get("Location") ?? "");
		expect(`${location.origin}${location.pathname}`).toBe(GITHUB_AUTH_URL);
		expect(location.searchParams.get("client_id")).toBe(
			"test-github-client-id",
		);
		expect(location.searchParams.get("redirect_uri")).toBe(
			"http://localhost:8787/auth/github/callback",
		);
		expect(location.searchParams.get("scope")).toBe(GITHUB_OAUTH_SCOPE);

		const stateCookie = res.headers.get("Set-Cookie") ?? "";
		expect(stateCookie).toContain(
			`${OAUTH_STATE_COOKIE_NAME}=${location.searchParams.get("state")}`,
		);
		expect(stateCookie).toContain("HttpOnly");
		expect(stateCookie).toContain("SameSite=Lax");
	});

	it("returns 500 when GITHUB_CLIENT_ID is missing", async () => {
		const res = await app.request(
			"/auth/github/login",
			{},
			{ ...testEnv, GITHUB_CLIENT_ID: undefined },
		);
		expect(res.status).toBe(500);
		expect(await res.json()).toMatchObject({ error: "configuration_error" });
	});

	it("no longer exposes /auth/dev-login", async () => {
		const res = await app.request("/auth/dev-login", {}, testEnv);
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({
			error: "not_found",
			message: "Route not found",
		});
	});
});

describe("GET /auth/github/callback", () => {
	it("rejects a state mismatch", async () => {
		const res = await app.request(
			`/auth/github/callback?code=c&state=${OTHER_STATE}`,
			{ headers: { Cookie: `${OAUTH_STATE_COOKIE_NAME}=${STATE}` } },
			testEnv,
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ error: "invalid_state" });
	});

	it("rejects a missing state cookie", async () => {
		const res = await app.request(
			`/auth/github/callback?code=c&state=${STATE}`,
			{},
			testEnv,
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ error: "invalid_state" });
	});

	it("rejects a missing code", async () => {
		const res = await app.request(
			`/auth/github/callback?state=${STATE}`,
			{ headers: { Cookie: `${OAUTH_STATE_COOKIE_NAME}=${STATE}` } },
			testEnv,
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			error: "validation_error",
			issues: [{ field: "code" }],
		});
		expect(res.headers.get("Set-Cookie")).toContain(
			`${OAUTH_STATE_COOKIE_NAME}=;`,
		);
	});

	it.each([
		["a non-UUID state", "code=c&state=s1", "state"],
		["a missing state", "code=c", "state"],
		["an empty code", `code=&state=${STATE}`, "code"],
	])("rejects %s before calling GitHub", async (_name, query, field) => {
		const fetchSpy = mockGitHub();
		const res = await app.request(
			`/auth/github/callback?${query}`,
			{ headers: { Cookie: `${OAUTH_STATE_COOKIE_NAME}=${STATE}` } },
			testEnv,
		);
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({
			error: "validation_error",
			issues: [{ field }],
		});
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("returns 500 when secrets are missing", async () => {
		const res = await callback({ ...testEnv, JWT_SECRET: undefined });
		expect(res.status).toBe(500);
		expect(await res.json()).toMatchObject({ error: "configuration_error" });
	});

	it("returns 400 when GitHub rejects the code", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			Response.json({
				error: "bad_verification_code",
				error_description: "The code passed is incorrect or expired.",
			}),
		);
		const res = await callback();
		expect(res.status).toBe(400);
		expect(await res.json()).toMatchObject({ error: "oauth_exchange_failed" });
		expect(repo.users.size).toBe(0);
	});

	it("upserts the user and signs a session with a string sub and a numeric github_id", async () => {
		const fetchSpy = mockGitHub();
		const before = Date.now();
		const res = await callback();

		expect(res.status).toBe(302);
		expect(res.headers.get("Location")).toBe("/");
		expect(fetchSpy).toHaveBeenCalledTimes(2);

		const stored = repo.users.get(GITHUB_ID);
		expect(stored).toBeDefined();
		expect(stored?.userCreatedAt.getTime()).toBeGreaterThanOrEqual(before);
		expect(stored?.userLastLoginAt).toEqual(stored?.userCreatedAt);

		const cookie = sessionCookie(res);
		expect(cookie).toContain("HttpOnly");
		expect(cookie).toContain("SameSite=Lax");
		expect(cookie).toContain("Max-Age=604800");

		const token = cookie.split(";")[0].split("=")[1];
		expect(decode(token).payload).toMatchObject({
			sub: String(stored?.userId),
			github_id: GITHUB_ID,
		});
		const session = await authService.verifySessionToken(token, JWT_SECRET);
		expect(session?.userId).toBe(stored?.userId);
		expect(session?.githubId).toBe(GITHUB_ID);
	});

	it("keeps the same user_id on a second login", async () => {
		mockGitHub();
		const first = await callback();
		const firstUserId = repo.users.get(GITHUB_ID)?.userId;
		const second = await callback();

		expect(repo.users.size).toBe(1);
		const t1 = sessionCookie(first).split(";")[0].split("=")[1];
		const t2 = sessionCookie(second).split(";")[0].split("=")[1];
		expect((await authService.verifySessionToken(t1, JWT_SECRET))?.userId).toBe(
			firstUserId,
		);
		expect((await authService.verifySessionToken(t2, JWT_SECRET))?.userId).toBe(
			firstUserId,
		);
	});

	it("sets a Secure cookie over https", async () => {
		mockGitHub({ code: "c", appUrl: "https://tometrove.zolletta.org" });
		const res = await app.request(
			`https://tometrove.zolletta.org/auth/github/callback?code=c&state=${STATE}`,
			{ headers: { Cookie: `${OAUTH_STATE_COOKIE_NAME}=${STATE}` } },
			{ ...testEnv, APP_URL: "https://tometrove.zolletta.org" },
		);
		expect(sessionCookie(res)).toContain("Secure");
	});
});

describe("GET /api/user/me", () => {
	const me = (headers: Record<string, string> = {}) =>
		app.request("/api/user/me", { headers }, testEnv);

	it("returns 401 without a cookie", async () => {
		const res = await me();
		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({
			error: "unauthorized",
			message: "Authentication required",
		});
	});

	it("ignores the Authorization header", async () => {
		const token = await authService.createSessionToken(
			1,
			GITHUB_ID,
			JWT_SECRET,
		);
		const res = await me({ Authorization: `Bearer ${token}` });
		expect(res.status).toBe(401);
	});

	it("returns 401 for an invalid token", async () => {
		const res = await me({
			Cookie: `${SESSION_COOKIE_NAME}=invalid.fake.token`,
		});
		expect(res.status).toBe(401);
	});

	it("returns 401 for an expired token", async () => {
		const token = await authService.createSessionToken(
			1,
			GITHUB_ID,
			JWT_SECRET,
			-10,
		);
		const res = await me({ Cookie: `${SESSION_COOKIE_NAME}=${token}` });
		expect(res.status).toBe(401);
	});

	it.each([
		["a non-numeric", "github:1"],
		["a numeric", 1],
		["a zero-padded", "01"],
	])("returns 401 for a token with %s sub", async (_name, sub) => {
		const now = Math.floor(Date.now() / 1000);
		const token = await sign(
			{ sub, github_id: GITHUB_ID, iat: now, exp: now + 60 },
			JWT_SECRET,
			JWT_ALGORITHM,
		);
		const res = await me({ Cookie: `${SESSION_COOKIE_NAME}=${token}` });
		expect(res.status).toBe(401);
	});

	it("returns numeric ids for a valid session", async () => {
		const token = await authService.createSessionToken(
			4611686018427,
			GITHUB_ID,
			JWT_SECRET,
		);
		const res = await me({ Cookie: `${SESSION_COOKIE_NAME}=${token}` });
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({
			user_id: 4611686018427,
			user_github_id: GITHUB_ID,
			preferences_completed: false,
		});
	});
});

describe("POST /auth/logout", () => {
	const logout = (headers: Record<string, string>) =>
		app.request(
			"/auth/logout",
			{
				method: "POST",
				headers: { Cookie: `${SESSION_COOKIE_NAME}=existing`, ...headers },
			},
			testEnv,
		);

	it.each([
		["a cross-site Origin", { Origin: "https://evil.example" }],
		[
			"a cross-site form post",
			{
				Origin: "https://evil.example",
				"Content-Type": "application/x-www-form-urlencoded",
				"Sec-Fetch-Site": "cross-site",
			},
		],
		["no Origin or Sec-Fetch-Site", {}],
	])("rejects %s with 403 and keeps the cookie", async (_name, headers) => {
		const res = await logout(headers);
		expect(res.status).toBe(403);
		expect(await res.json()).toMatchObject({ error: "forbidden" });
		expect(res.headers.get("Set-Cookie")).toBeNull();
	});

	it("accepts a same-origin Sec-Fetch-Site", async () => {
		const res = await logout({ "Sec-Fetch-Site": "same-origin" });
		expect(res.status).toBe(204);
	});

	it("clears the session cookie and returns 204", async () => {
		const res = await logout({ Origin: "http://localhost:8787" });
		expect(res.status).toBe(204);
		const cookie = res.headers.get("Set-Cookie") ?? "";
		expect(cookie).toContain(`${SESSION_COOKIE_NAME}=;`);
		expect(cookie).toContain("Max-Age=0");
	});
});
