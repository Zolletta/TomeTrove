import type { AppEnv } from "./app-env";
import type { SessionPayload } from "./session-payload";

/**
 * Hono application context environment definition for authenticated routes.
 * Defines runtime Bindings and Context Variables (userId, user).
 */
export interface AuthEnv {
	Bindings: AppEnv;
	Variables: {
		userId: string;
		user: SessionPayload;
	};
}
