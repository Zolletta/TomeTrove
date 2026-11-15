import type { CursorKey, KeysetSource } from "../../src/lib/pagination";

/** In-memory keyset source over rows already sorted by key. */
export const memorySource = <TRow, TKey extends CursorKey>(
	rows: TRow[],
	keyOf: (row: TRow) => TKey,
	isKey: (value: unknown) => value is TKey,
): KeysetSource<TRow, TKey> => ({
	rowsAfter: async (after, limit) =>
		rows
			.filter((row) => after === undefined || keyOf(row) > after)
			.slice(0, limit),
	countUpTo: async (key) => rows.filter((row) => keyOf(row) <= key).length,
	count: async () => rows.length,
	keyAt: async (offset) => {
		const row = rows[offset];
		return row === undefined ? undefined : keyOf(row);
	},
	keyOf,
	isKey,
});
