import { sql } from "drizzle-orm";
import { bigint, datetime, mysqlTable } from "drizzle-orm/mysql-core";

// Tables use CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci. Drizzle Kit
// emits neither table options nor AUTO_RANDOM, so the generated migrations
// are edited by hand to state them.

// user_id is BIGINT AUTO_RANDOM(5, 54) in the migration: generated values stay
// below 2^53, so they are safe as JavaScript numbers. Drizzle inserts the
// DEFAULT keyword for omitted columns, which TiDB rejects for AUTO_RANDOM
// (error 1364); NULL makes TiDB generate the value. Timestamps are written by
// the app in UTC.
export const user = mysqlTable("user", {
	userId: bigint("user_id", { mode: "number" })
		.autoincrement()
		.primaryKey()
		.$defaultFn(() => sql`NULL`),
	userGithubId: bigint("user_github_id", { mode: "number" }).notNull().unique(),
	userLastLoginAt: datetime("user_last_login_at").notNull(),
	userCreatedAt: datetime("user_created_at").notNull(),
});
