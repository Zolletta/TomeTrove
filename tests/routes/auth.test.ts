import { describe, expect, it } from "vitest";
import {
	GITHUB_AUTH_URL,
	GITHUB_OAUTH_SCOPE,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_NAME,
} from "../../src/constants";
import app from "../../src/index";
import { authService } from "../../src/services/auth-service";
import type { AppEnv } from "../../src/types";

const testEnv: AppEnv = {
	ENVIRONMENT: "development",
	APP_URL: "http://localhost:8787",
	GITHUB_CLIENT_ID: "test-github-client-id",
	GITHUB_CLIENT_SECRET: "test-github-client-secret",
	JWT_SECRET: "test-jwt-secret-for-vitest-testing-32b",
};

describe("Authentication & Session Infrastructure", () => {
	it("GET /health responds with 200 and healthy status", async () => {
		const res = await app.request("/health", {}, testEnv);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: "healthy" });
	});

	describe("AuthService unit behavior", () => {
		it("generates GitHub OAuth URL with minimal read:user scope and no email", () => {
			const url = authService.generateAuthUrl(
				"client-123",
				"http://localhost:8787/auth/github/callback",
				"state-abc",
			);
			const parsed = new URL(url);
			expect(parsed.origin).toBe("https://github.com");
			expect(parsed.pathname).toBe("/login/oauth/authorize");
			expect(parsed.searchParams.get("client_id")).toBe("client-123");
			expect(parsed.searchParams.get("scope")).toBe(GITHUB_OAUTH_SCOPE);
			expect(parsed.searchParams.get("state")).toBe("state-abc");
		});

		it("creates and verifies valid JWT session token", async () => {
			const token = await authService.createSessionToken(
				"github:12345",
				12345,
				testEnv.JWT_SECRET as string,
				3600,
			);
			const session = await authService.verifySessionToken(
				token,
				testEnv.JWT_SECRET as string,
			);

			expect(session).not.toBeNull();
			expect(session?.sub).toBe("github:12345");
			expect(session?.github_id).toBe(12345);
		});

		it("rejects expired JWT session token", async () => {
			const expiredToken = await authService.createSessionToken(
				"github:12345",
				12345,
				testEnv.JWT_SECRET as string,
				-10, // Expired in past
			);
			const session = await authService.verifySessionToken(
				expiredToken,
				testEnv.JWT_SECRET as string,
			);
			expect(session).toBeNull();
		});
	});

	describe("Protected Route /api/user/me", () => {
		it("returns 401 Unauthorized when no cookie or header is provided", async () => {
			const res = await app.request("/api/user/me", {}, testEnv);
			expect(res.status).toBe(401);
			const body = (await res.json()) as { error: string; message: string };
			expect(body.error).toBe("unauthorized");
			expect(body.message).toBe("Authentication required");
		});

		it("returns 401 Unauthorized when invalid token is provided", async () => {
			const res = await app.request(
				"/api/user/me",
				{
					headers: {
						Authorization: "Bearer invalid.fake.token",
					},
				},
				testEnv,
			);
			expect(res.status).toBe(401);
			const body = (await res.json()) as { error: string };
			expect(body.error).toBe("unauthorized");
		});

		it("returns 200 with minimal user identity when valid session cookie is provided", async () => {
			const token = await authService.createSessionToken(
				"github:13484638",
				13484638,
				testEnv.JWT_SECRET as string,
			);

			const res = await app.request(
				"/api/user/me",
				{
					headers: {
						Cookie: `${SESSION_COOKIE_NAME}=${token}`,
					},
				},
				testEnv,
			);

			expect(res.status).toBe(200);
			const body = (await res.json()) as {
				user_id: string;
				user_github_id: string;
				preferences_completed: boolean;
			};
			expect(body).toEqual({
				user_id: "github:13484638",
				user_github_id: "13484638",
				preferences_completed: false,
			});
		});
	});

	describe("OAuth Initiation & Callback Endpoints", () => {
		it("GET /auth/github sets oauth_state cookie and redirects to GitHub", async () => {
			const res = await app.request("/auth/github", {}, testEnv);
			expect(res.status).toBe(302);

			const location = res.headers.get("Location");
			expect(location).toContain(GITHUB_AUTH_URL);
			expect(location).toContain("client_id=test-github-client-id");

			const setCookie = res.headers.get("Set-Cookie");
			expect(setCookie).toContain(`${OAUTH_STATE_COOKIE_NAME}=`);
			expect(setCookie).toContain("HttpOnly");
		});

		it("GET /auth/github/callback fails with 400 on state mismatch", async () => {
			const res = await app.request(
				"/auth/github/callback?code=test-code&state=wrong-state",
				{
					headers: {
						Cookie: `${OAUTH_STATE_COOKIE_NAME}=expected-state`,
					},
				},
				testEnv,
			);

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: string };
			expect(body.error).toBe("invalid_state");
		});

		it("GET /auth/github/callback fails with 400 on missing authorization code", async () => {
			const res = await app.request(
				"/auth/github/callback?state=expected-state",
				{
					headers: {
						Cookie: `${OAUTH_STATE_COOKIE_NAME}=expected-state`,
					},
				},
				testEnv,
			);

			expect(res.status).toBe(400);
			const body = (await res.json()) as { error: string };
			expect(body.error).toBe("missing_code");
		});

		it("GET /auth/dev-login issues session cookie in development mode", async () => {
			const res = await app.request("/auth/dev-login", {}, testEnv);
			expect(res.status).toBe(302);
			expect(res.headers.get("Location")).toBe("/");

			const setCookie = res.headers.get("Set-Cookie");
			expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
			expect(setCookie).toContain("HttpOnly");
		});

		it("POST /auth/logout clears session cookie and returns 204 No Content", async () => {
			const res = await app.request(
				"/auth/logout",
				{
					method: "POST",
					headers: {
						Cookie: `${SESSION_COOKIE_NAME}=existing-session-token`,
					},
				},
				testEnv,
			);

			expect(res.status).toBe(204);
			const setCookie = res.headers.get("Set-Cookie");
			expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=;`);
			expect(setCookie).toContain("Max-Age=0");
		});
	});
});
