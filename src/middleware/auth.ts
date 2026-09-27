import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE_NAME } from "../constants";
import { authService } from "../services/auth-service";
import type { AuthEnv } from "../types";

/**
 * Authentication middleware for protecting endpoints under `/api/*`.
 * Extracts session JWT from either `tometrove_session` cookie or `Authorization: Bearer` header.
 * Attaches validated `userId` and `user` payload to the Hono request context.
 */
export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c, next) => {
	const cookieToken = getCookie(c, SESSION_COOKIE_NAME);
	const authHeader = c.req.header("Authorization");
	const bearerToken = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7).trim()
		: null;
	const token = cookieToken || bearerToken;

	if (!token) {
		return c.json(
			{ error: "unauthorized", message: "Authentication required" },
			401,
		);
	}

	const secret = c.env.JWT_SECRET;
	if (!secret) {
		return c.json(
			{ error: "internal_error", message: "JWT secret is not configured" },
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
