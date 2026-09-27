import { Hono } from "hono";
import { authRouter } from "./routes/auth";
import { userRouter } from "./routes/user";
import type { AppEnv } from "./types";

const app = new Hono<{ Bindings: AppEnv }>();

/**
 * Global error handler per ADR 0008.
 * Returns consistent JSON error format: `{ error: string, message: string }`.
 */
app.onError((err, c) => {
	console.error("Unhandled server error:", err);
	return c.json(
		{
			error: "internal_error",
			message: err instanceof Error ? err.message : "Internal server error",
		},
		500,
	);
});

// Mount route groups
app.route("/auth", authRouter);
app.route("/api/user", userRouter);

// Health check endpoint
app.get("/health", (c) => c.json({ status: "healthy" }));

export default app;
