import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createAuthRouter, type UserRepositoryFactory } from "./routes/auth";
import { userRouter } from "./routes/user";
import type { AppEnv } from "./types";

export interface AppDependencies {
	readonly userRepositoryFor: UserRepositoryFactory;
}

export const createApp = ({ userRepositoryFor }: AppDependencies) => {
	const app = new Hono<{ Bindings: AppEnv }>();

	/**
	 * Global error handler per ADR 0008: `{ error, message }`.
	 * Details are logged; the response message is generic outside development.
	 */
	app.onError((err, c) => {
		if (err instanceof HTTPException && err.status === 403) {
			return c.json(
				{ error: "forbidden", message: "Cross-site request rejected" },
				403,
			);
		}
		console.error("Unhandled server error:", err);
		const message =
			c.env.ENVIRONMENT === "development" && err instanceof Error
				? err.message
				: "Internal server error";
		return c.json({ error: "internal_error", message }, 500);
	});

	app.notFound((c) =>
		c.json({ error: "not_found", message: "Route not found" }, 404),
	);

	// Public, like GET /api/lists/:token (api-endpoints.md).
	app.get("/api/health", (c) => c.json({ status: "ok" }));

	app.route("/auth", createAuthRouter(userRepositoryFor));
	app.route("/api/user", userRouter);

	return app;
};
