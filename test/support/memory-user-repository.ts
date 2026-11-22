import type { UserRepository } from "../../src/services/user-repository";

interface StoredUser {
	userId: number;
	userGithubId: number;
	userLastLoginAt: Date;
	userCreatedAt: Date;
}

export class MemoryUserRepository implements UserRepository {
	readonly users = new Map<number, StoredUser>();
	private nextId = 1_000_001;

	upsertByGithubId = async (githubId: number, now: Date): Promise<number> => {
		const existing = this.users.get(githubId);
		if (existing) {
			existing.userLastLoginAt = now;
			return existing.userId;
		}
		const created: StoredUser = {
			userId: this.nextId++,
			userGithubId: githubId,
			userLastLoginAt: now,
			userCreatedAt: now,
		};
		this.users.set(githubId, created);
		return created.userId;
	};
}
