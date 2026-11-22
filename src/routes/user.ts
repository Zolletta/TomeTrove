import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import type { AuthEnv, UserProfileResponse } from "../types";

export const userRouter = new Hono<AuthEnv>();

userRouter.use("*", authMiddleware);

/**
 * GET /api/user/me
 * Per PRIVACY.md, returns only the internal ID, the GitHub numeric ID and the
 * preferences status. `preferences_completed` is computed by #22.
 */
userRouter.get("/me", (c) => {
	const session = c.get("user");
	const response: UserProfileResponse = {
		user_id: session.sub,
		user_github_id: session.github_id,
		preferences_completed: false,
	};

	return c.json(response, 200);
});
