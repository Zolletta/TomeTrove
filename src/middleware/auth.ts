import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE_NAME } from "../constants";
import { authService } from "../services/auth-service";
import type { AuthEnv } from "../types";

/**
 * Authentication middleware for protecting endpoints under `/api/*`.
 * Reads the session JWT from the `tometrove_session` cookie only and attaches
 * the validated `userId` and `user` payload to the Hono request context.
 */
export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c, next) => {
	const token = getCookie(c, SESSION_COOKIE_NAME);
	if (!token) {
		return c.json(
			{ error: "unauthorized", message: "Authentication required" },
			401,
		);
	}

	const secret = c.env.JWT_SECRET;
	if (!secret) {
		return c.json(
			{ error: "configuration_error", message: "JWT_SECRET is not configured" },
			500,
		);
	}

	const session = await authService.verifySessionToken(token, secret);
	if (!session) {
		return c.json(
			{ error: "unauthorized", message: "Invalid or expired session token" },
			401,
		);
	}

	c.set("userId", session.sub);
	c.set("user", session);

	await next();
};
