import {
	bigint,
	boolean,
	char,
	datetime,
	json,
	mysqlTable,
	primaryKey,
	tinyint,
	varchar,
} from "drizzle-orm/mysql-core";

// Every table is created with CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
// (ADR 0025). Drizzle Kit does not emit table options, so the generated
// migrations are edited to state them explicitly.

export const ACCEPTED_FORMATS = ["new", "used", "ebook"] as const;
export type AcceptedFormat = (typeof ACCEPTED_FORMATS)[number];

export const type = mysqlTable("type", {
	typeId: tinyint("type_id", { unsigned: true }).primaryKey(),
	typeSlug: varchar("type_slug", { length: 32 }).notNull().unique(),
	typeNameEn: varchar("type_name_en", { length: 64 }).notNull(),
});

export const language = mysqlTable("language", {
	languageId: char("language_id", { length: 2 }).primaryKey(),
	languageNameEn: varchar("language_name_en", { length: 128 }).notNull(),
	languageNameNative: varchar("language_name_native", {
		length: 128,
	}).notNull(),
});

export const country = mysqlTable("country", {
	countryId: char("country_id", { length: 2 }).primaryKey(),
	countryNameEn: varchar("country_name_en", { length: 128 }).notNull(),
});

export const currency = mysqlTable("currency", {
	currencyId: char("currency_id", { length: 3 }).primaryKey(),
	currencyNameEn: varchar("currency_name_en", { length: 128 }).notNull(),
	currencyMinorUnits: tinyint("currency_minor_units", { unsigned: true }),
});

// user_id is BIGINT AUTO_RANDOM(5, 54) in the migration: TiDB keeps the
// generated values below 2^53, so they are safe as JavaScript numbers.
// `.autoincrement()` only makes the column optional on insert.
export const user = mysqlTable("user", {
	userId: bigint("user_id", { mode: "number" }).autoincrement().primaryKey(),
	userGithubId: bigint("user_github_id", { mode: "number" }).notNull().unique(),
	userLastLoginAt: datetime("user_last_login_at").notNull(),
	userCreatedAt: datetime("user_created_at").notNull(),
});

export const userPreference = mysqlTable("user_preference", {
	userId: bigint("user_id", { mode: "number" })
		.primaryKey()
		.references(() => user.userId, { onDelete: "cascade" }),
	userCountryId: char("user_country_id", { length: 2 }).references(
		() => country.countryId,
	),
	userCurrencyId: char("user_currency_id", { length: 3 }).references(
		() => currency.currencyId,
	),
	userAlertThresholdPercentage: tinyint("user_alert_threshold_percentage", {
		unsigned: true,
	})
		.notNull()
		.default(5),
	userFormatPreference: json("user_format_preference").$type<
		AcceptedFormat[]
	>(),
	userPreferenceUpdatedAt: datetime("user_preference_updated_at").notNull(),
});

export const userReadingLanguage = mysqlTable(
	"user_reading_language",
	{
		userId: bigint("user_id", { mode: "number" })
			.notNull()
			.references(() => user.userId, { onDelete: "cascade" }),
		languageId: char("language_id", { length: 2 })
			.notNull()
			.references(() => language.languageId),
		userReadingLanguagePreferred: boolean("user_reading_language_preferred")
			.notNull()
			.default(false),
		userReadingLanguageTypeIds: json("user_reading_language_type_ids").$type<
			number[]
		>(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.languageId] })],
);
