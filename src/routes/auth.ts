import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { authService } from "../services/auth-service";
import type { AppEnv } from "../types";

export const authRouter = new Hono<{ Bindings: AppEnv }>();

/**
 * Initiates GitHub OAuth flow.
 * Generates an unguessable CSRF state, stores it in an HttpOnly cookie, and redirects to GitHub.
 */
authRouter.get("/github", (c) => {
	const clientId = c.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		return c.json(
			{
				error: "configuration_error",
				message: "GITHUB_CLIENT_ID is not configured",
			},
			500,
		);
	}

	const origin = c.env.APP_URL || new URL(c.req.url).origin;
	const redirectUri = `${origin}/auth/github/callback`;
	const state = crypto.randomUUID();

	setCookie(c, "oauth_state", state, {
		path: "/",
		httpOnly: true,
		secure: c.req.url.startsWith("https"),
		sameSite: "Lax",
		maxAge: 600, // 10 minutes
	});

	const authUrl = authService.generateAuthUrl(clientId, redirectUri, state);
	return c.redirect(authUrl, 302);
});

/**
 * Handles GitHub OAuth callback.
 * Validates CSRF state, exchanges authorization code, signs session JWT, and sets session cookie.
 */
authRouter.get("/github/callback", async (c) => {
	const code = c.req.query("code");
	const state = c.req.query("state");
	const expectedState = getCookie(c, "oauth_state");

	deleteCookie(c, "oauth_state", { path: "/" });

	if (!state || !expectedState || state !== expectedState) {
		return c.json(
			{ error: "invalid_state", message: "OAuth state mismatch or expired" },
			400,
		);
	}

	if (!code) {
		return c.json(
			{ error: "missing_code", message: "Missing authorization code" },
			400,
		);
	}

	const clientId = c.env.GITHUB_CLIENT_ID;
	const clientSecret = c.env.GITHUB_CLIENT_SECRET;
	const jwtSecret = c.env.JWT_SECRET;

	if (!clientId || !clientSecret || !jwtSecret) {
		return c.json(
			{
				error: "configuration_error",
				message: "OAuth credentials or JWT secret not configured",
			},
			500,
		);
	}

	try {
		const origin = c.env.APP_URL || new URL(c.req.url).origin;
		const redirectUri = `${origin}/auth/github/callback`;

		const accessToken = await authService.exchangeCodeForToken(
			code,
			clientId,
			clientSecret,
			redirectUri,
		);
		const githubUser = await authService.fetchGitHubUser(accessToken);

		const userId = `github:${githubUser.id}`;
		const sessionToken = await authService.createSessionToken(
			userId,
			githubUser.id,
			jwtSecret,
		);

		setCookie(c, "tometrove_session", sessionToken, {
			path: "/",
			httpOnly: true,
			secure: c.req.url.startsWith("https"),
			sameSite: "Lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return c.redirect("/", 302);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Authentication failed";
		return c.json({ error: "oauth_exchange_failed", message }, 400);
	}
});

/**
 * Logs out the current user by clearing the session cookie.
 */
authRouter.post("/logout", (c) => {
	deleteCookie(c, "tometrove_session", { path: "/" });
	return c.body(null, 204);
});

/**
 * Development-only bypass endpoint to issue a mock test session without live GitHub credentials.
 */
authRouter.get("/dev-login", async (c) => {
	const isDev = c.env.ENVIRONMENT === "development";
	if (!isDev) {
		return c.json(
			{
				error: "forbidden",
				message: "Dev login is only available in development",
			},
			403,
		);
	}

	const jwtSecret = c.env.JWT_SECRET || "dev-jwt-secret-for-testing-only-32b";
	const mockGithubId = 13484638;
	const userId = `github:${mockGithubId}`;

	const sessionToken = await authService.createSessionToken(
		userId,
		mockGithubId,
		jwtSecret,
	);

	setCookie(c, "tometrove_session", sessionToken, {
		path: "/",
		httpOnly: true,
		secure: false,
		sameSite: "Lax",
		maxAge: 60 * 60 * 24 * 7,
	});

	if (c.req.header("Accept")?.includes("application/json")) {
		return c.json({ sessionToken, userId, githubId: mockGithubId });
	}

	return c.redirect("/", 302);
});
