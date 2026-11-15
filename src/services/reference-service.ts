import { asc, count, gt, lte, type SQL } from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";
import type { Db } from "../db/client";
import { country, currency, language, type } from "../db/schema";
import {
	type CursorKey,
	type KeysetSource,
	type Page,
	type PaginationQuery,
	paginate,
} from "../lib/pagination";

export interface CountryRow {
	country_id: string;
	country_name_en: string;
}

export interface CurrencyRow {
	currency_id: string;
	currency_name_en: string;
	currency_minor_units: number | null;
}

export interface LanguageRow {
	language_id: string;
	language_name_en: string;
	language_name_native: string;
}

export interface TypeRow {
	type_id: number;
	type_slug: string;
	type_name_en: string;
}

export interface ReferenceSources {
	countries: KeysetSource<CountryRow, string>;
	currencies: KeysetSource<CurrencyRow, string>;
	languages: KeysetSource<LanguageRow, string>;
	types: KeysetSource<TypeRow, number>;
}

export const isStringKey = (value: unknown): value is string =>
	typeof value === "string";
export const isIntegerKey = (value: unknown): value is number =>
	Number.isInteger(value);

interface TableSourceOptions<TRow, TKey extends CursorKey> {
	table: MySqlTable;
	key: MySqlColumn;
	rows: (where: SQL | undefined, limit: number) => Promise<TRow[]>;
	keyOf: (row: TRow) => TKey;
	isKey: (value: unknown) => value is TKey;
}

const tableSource = <TRow, TKey extends CursorKey>(
	db: Db,
	options: TableSourceOptions<TRow, TKey>,
): KeysetSource<TRow, TKey> => {
	const countWhere = async (where?: SQL): Promise<number> => {
		const [result] = await db
			.select({ n: count() })
			.from(options.table)
			.where(where);
		return result?.n ?? 0;
	};

	return {
		rowsAfter: (after, limit) =>
			options.rows(
				after === undefined ? undefined : gt(options.key, after),
				limit,
			),
		countUpTo: (key) => countWhere(lte(options.key, key)),
		count: () => countWhere(),
		keyAt: async (offset) => {
			const [result] = await db
				.select({ key: options.key })
				.from(options.table)
				.orderBy(asc(options.key))
				.limit(1)
				.offset(offset);
			return options.isKey(result?.key) ? result.key : undefined;
		},
		keyOf: options.keyOf,
		isKey: options.isKey,
	};
};

export const createReferenceSources = (db: Db): ReferenceSources => ({
	countries: tableSource(db, {
		table: country,
		key: country.countryId,
		rows: (where, limit) =>
			db
				.select({
					country_id: country.countryId,
					country_name_en: country.countryNameEn,
				})
				.from(country)
				.where(where)
				.orderBy(asc(country.countryId))
				.limit(limit),
		keyOf: (row) => row.country_id,
		isKey: isStringKey,
	}),
	currencies: tableSource(db, {
		table: currency,
		key: currency.currencyId,
		rows: (where, limit) =>
			db
				.select({
					currency_id: currency.currencyId,
					currency_name_en: currency.currencyNameEn,
					currency_minor_units: currency.currencyMinorUnits,
				})
				.from(currency)
				.where(where)
				.orderBy(asc(currency.currencyId))
				.limit(limit),
		keyOf: (row) => row.currency_id,
		isKey: isStringKey,
	}),
	languages: tableSource(db, {
		table: language,
		key: language.languageId,
		rows: (where, limit) =>
			db
				.select({
					language_id: language.languageId,
					language_name_en: language.languageNameEn,
					language_name_native: language.languageNameNative,
				})
				.from(language)
				.where(where)
				.orderBy(asc(language.languageId))
				.limit(limit),
		keyOf: (row) => row.language_id,
		isKey: isStringKey,
	}),
	types: tableSource(db, {
		table: type,
		key: type.typeId,
		rows: (where, limit) =>
			db
				.select({
					type_id: type.typeId,
					type_slug: type.typeSlug,
					type_name_en: type.typeNameEn,
				})
				.from(type)
				.where(where)
				.orderBy(asc(type.typeId))
				.limit(limit),
		keyOf: (row) => row.type_id,
		isKey: isIntegerKey,
	}),
});

export class ReferenceService {
	constructor(private readonly sources: ReferenceSources) {}

	listCountries = (
		path: string,
		query: PaginationQuery,
	): Promise<Page<CountryRow>> => paginate(this.sources.countries, path, query);

	listCurrencies = (
		path: string,
		query: PaginationQuery,
	): Promise<Page<CurrencyRow>> =>
		paginate(this.sources.currencies, path, query);

	listLanguages = (
		path: string,
		query: PaginationQuery,
	): Promise<Page<LanguageRow>> =>
		paginate(this.sources.languages, path, query);

	listTypes = (path: string, query: PaginationQuery): Promise<Page<TypeRow>> =>
		paginate(this.sources.types, path, query);
}
