import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
	OAUTH_STATE_COOKIE_MAX_AGE_SECONDS,
	OAUTH_STATE_COOKIE_NAME,
	SESSION_COOKIE_MAX_AGE_SECONDS,
	SESSION_COOKIE_NAME,
} from "../constants";
import { authService } from "../services/auth-service";
import type { UserRepository } from "../services/user-repository";
import type { AppEnv } from "../types";

export type UserRepositoryFactory = (env: AppEnv) => UserRepository;

const callbackUrl = (env: AppEnv, requestUrl: string): string =>
	`${env.APP_URL || new URL(requestUrl).origin}/auth/github/callback`;

/**
 * GitHub OAuth in the Worker with an HS256 JWT session cookie
 * (supersedes ADR 0006; TODO: cite the ADR from #47 once it has a number).
 */
export const createAuthRouter = (userRepositoryFor: UserRepositoryFactory) => {
	const router = new Hono<{ Bindings: AppEnv }>();

	/**
	 * Generates an unguessable CSRF state, stores it in an HttpOnly cookie,
	 * and redirects to GitHub.
	 */
	router.get("/github/login", (c) => {
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

		const state = crypto.randomUUID();
		setCookie(c, OAUTH_STATE_COOKIE_NAME, state, {
			path: "/",
			httpOnly: true,
			secure: c.req.url.startsWith("https"),
			sameSite: "Lax",
			maxAge: OAUTH_STATE_COOKIE_MAX_AGE_SECONDS,
		});

		return c.redirect(
			authService.generateAuthUrl(
				clientId,
				callbackUrl(c.env, c.req.url),
				state,
			),
			302,
		);
	});

	/**
	 * Validates the CSRF state, exchanges the code, upserts the user by GitHub
	 * id and sets the session cookie with `sub` = internal `user_id`.
	 */
	router.get("/github/callback", async (c) => {
		const code = c.req.query("code");
		const state = c.req.query("state");
		const expectedState = getCookie(c, OAUTH_STATE_COOKIE_NAME);

		deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: "/" });

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

		let githubId: number;
		try {
			const accessToken = await authService.exchangeCodeForToken(
				code,
				clientId,
				clientSecret,
				callbackUrl(c.env, c.req.url),
			);
			githubId = (await authService.fetchGitHubUser(accessToken)).id;
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Authentication failed";
			return c.json({ error: "oauth_exchange_failed", message }, 400);
		}

		const userId = await userRepositoryFor(c.env).upsertByGithubId(
			githubId,
			new Date(),
		);
		const sessionToken = await authService.createSessionToken(
			userId,
			githubId,
			jwtSecret,
		);

		setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
			path: "/",
			httpOnly: true,
			secure: c.req.url.startsWith("https"),
			sameSite: "Lax",
			maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
		});

		return c.redirect("/", 302);
	});

	/**
	 * Logs out the current user by clearing the session cookie.
	 */
	router.post("/logout", (c) => {
		deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
		return c.body(null, 204);
	});

	return router;
};
