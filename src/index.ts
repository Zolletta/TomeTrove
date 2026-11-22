import { createApp } from "./app";
import { createDb } from "./db/client";
import { DrizzleUserRepository } from "./services/user-repository";

export default createApp({
	userRepositoryFor: (env) => {
		if (!env.DATABASE_URL) {
			throw new Error("DATABASE_URL is not configured");
		}
		return new DrizzleUserRepository(createDb(env.DATABASE_URL));
	},
});
