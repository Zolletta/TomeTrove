import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { AuthEnv, UserProfileResponse } from "../types";

export const userRouter = new Hono<AuthEnv>();

// Protect all /api/user routes with authMiddleware
userRouter.use("*", authMiddleware);

/**
 * GET /api/user/me
 * Retrieves current authenticated user's minimal identity and preferences status.
 * Per PRIVACY.md, returns only internal ID, GitHub numeric ID, and completion status.
 */
userRouter.get("/me", (c) => {
	const session = c.get("user");
	const response: UserProfileResponse = {
		user_id: session.sub,
		user_github_id: String(session.github_id),
		preferences_completed: false, // Updated by DB lookup in Issue #22
	};

	return c.json(response, 200);
});
