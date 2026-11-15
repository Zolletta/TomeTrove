import { Hono } from "hono";
import { createReferenceRouter } from "./routes/reference";
import type { AppEnv } from "./types/app-env";

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
app.route("/api", createReferenceRouter());

export default app;
