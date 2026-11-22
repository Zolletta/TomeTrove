CREATE TABLE `user` (
	`user_id` bigint AUTO_RANDOM(5, 54) NOT NULL,
	`user_github_id` bigint NOT NULL,
	`user_last_login_at` datetime NOT NULL,
	`user_created_at` datetime NOT NULL,
	CONSTRAINT `user_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `user_user_github_id_unique` UNIQUE(`user_github_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
