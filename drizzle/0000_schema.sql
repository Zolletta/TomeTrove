CREATE TABLE `country` (
	`country_id` char(2) NOT NULL,
	`country_name_en` varchar(128) NOT NULL,
	CONSTRAINT `country_country_id` PRIMARY KEY(`country_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `currency` (
	`currency_id` char(3) NOT NULL,
	`currency_name_en` varchar(128) NOT NULL,
	`currency_minor_units` tinyint unsigned,
	CONSTRAINT `currency_currency_id` PRIMARY KEY(`currency_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `language` (
	`language_id` char(2) NOT NULL,
	`language_name_en` varchar(128) NOT NULL,
	`language_name_native` varchar(128) NOT NULL,
	CONSTRAINT `language_language_id` PRIMARY KEY(`language_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `type` (
	`type_id` tinyint unsigned NOT NULL,
	`type_slug` varchar(32) NOT NULL,
	`type_name_en` varchar(64) NOT NULL,
	CONSTRAINT `type_type_id` PRIMARY KEY(`type_id`),
	CONSTRAINT `type_type_slug_unique` UNIQUE(`type_slug`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `user` (
	`user_id` bigint AUTO_RANDOM(5, 54) NOT NULL,
	`user_github_id` bigint NOT NULL,
	`user_last_login_at` datetime NOT NULL,
	`user_created_at` datetime NOT NULL,
	CONSTRAINT `user_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `user_user_github_id_unique` UNIQUE(`user_github_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `user_preference` (
	`user_id` bigint NOT NULL,
	`user_country_id` char(2),
	`user_currency_id` char(3),
	`user_alert_threshold_percentage` tinyint unsigned NOT NULL DEFAULT 5,
	`user_format_preference` json,
	`user_preference_updated_at` datetime NOT NULL,
	CONSTRAINT `user_preference_user_id` PRIMARY KEY(`user_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
CREATE TABLE `user_reading_language` (
	`user_id` bigint NOT NULL,
	`language_id` char(2) NOT NULL,
	`user_reading_language_preferred` boolean NOT NULL DEFAULT false,
	`user_reading_language_type_ids` json,
	CONSTRAINT `user_reading_language_user_id_language_id_pk` PRIMARY KEY(`user_id`,`language_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
--> statement-breakpoint
ALTER TABLE `user_preference` ADD CONSTRAINT `user_preference_user_id_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preference` ADD CONSTRAINT `user_preference_user_country_id_country_country_id_fk` FOREIGN KEY (`user_country_id`) REFERENCES `country`(`country_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preference` ADD CONSTRAINT `user_preference_user_currency_id_currency_currency_id_fk` FOREIGN KEY (`user_currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_reading_language` ADD CONSTRAINT `user_reading_language_user_id_user_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_reading_language` ADD CONSTRAINT `user_reading_language_language_id_language_language_id_fk` FOREIGN KEY (`language_id`) REFERENCES `language`(`language_id`) ON DELETE no action ON UPDATE no action;