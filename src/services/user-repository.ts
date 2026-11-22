import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { user } from "../db/schema";

export interface UserRepository {
	/**
	 * Creates the user on first login or refreshes `user_last_login_at`,
	 * and returns the internal `user_id`. `now` is written as UTC.
	 */
	readonly upsertByGithubId: (githubId: number, now: Date) => Promise<number>;
}

export class DrizzleUserRepository implements UserRepository {
	constructor(private readonly db: Db) {}

	upsertByGithubId = async (githubId: number, now: Date): Promise<number> => {
		await this.db
			.insert(user)
			.values({
				userGithubId: githubId,
				userLastLoginAt: now,
				userCreatedAt: now,
			})
			.onDuplicateKeyUpdate({ set: { userLastLoginAt: now } });

		const [row] = await this.db
			.select({ userId: user.userId })
			.from(user)
			.where(eq(user.userGithubId, githubId))
			.limit(1);

		if (!row) {
			throw new Error("User upsert did not return a row");
		}
		return row.userId;
	};
}
