import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { csrf } from "hono/csrf";
import { z } from "zod";
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

const appOrigin = (env: AppEnv, requestUrl: string): string =>
	new URL(env.APP_URL || requestUrl).origin;

const callbackUrl = (env: AppEnv, requestUrl: string): string =>
	`${appOrigin(env, requestUrl)}/auth/github/callback`;

/**
 * GitHub does not document the code format, so only its length is bounded;
 * it is sent JSON-encoded. `state` is the `crypto.randomUUID()` from /github/login.
 */
const callbackQuerySchema = z.object({
	code: z.string().min(1).max(1024),
	state: z.uuid(),
});

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
	router.get(
		"/github/callback",
		zValidator("query", callbackQuerySchema, (result, c) => {
			if (!result.success) {
				deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: "/" });
				return c.json(
					{
						error: "validation_error",
						message: "Invalid OAuth callback parameters",
						issues: result.error.issues.map((issue) => ({
							field: issue.path.join("."),
							message: issue.message,
						})),
					},
					400,
				);
			}
		}),
		async (c) => {
			const { code, state } = c.req.valid("query");
			const expectedState = getCookie(c, OAUTH_STATE_COOKIE_NAME);

			deleteCookie(c, OAUTH_STATE_COOKIE_NAME, { path: "/" });

			if (!expectedState || state !== expectedState) {
				return c.json(
					{
						error: "invalid_state",
						message: "OAuth state mismatch or expired",
					},
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
		},
	);

	/**
	 * Logs out the current user by clearing the session cookie.
	 */
	router.post(
		"/logout",
		csrf({ origin: (origin, c) => origin === appOrigin(c.env, c.req.url) }),
		(c) => {
			deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
			return c.body(null, 204);
		},
	);

	return router;
};
