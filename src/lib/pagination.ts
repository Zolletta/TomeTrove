import { z } from "zod";

export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

export const paginationQuerySchema = z.object({
	cursor: z.string().min(1).optional(),
	per_page: z.coerce
		.number()
		.int()
		.min(1)
		.max(MAX_PER_PAGE)
		.default(DEFAULT_PER_PAGE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type CursorKey = string | number;

export class InvalidCursorError extends Error {
	constructor() {
		super("Invalid pagination cursor");
		this.name = "InvalidCursorError";
	}
}

const cursorPayloadSchema = z.object({ k: z.union([z.string(), z.number()]) });

const toBase64Url = (text: string): string =>
	btoa(String.fromCharCode(...new TextEncoder().encode(text)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");

const fromBase64Url = (value: string): string => {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

export const encodeCursor = (key: CursorKey): string =>
	toBase64Url(JSON.stringify({ k: key }));

export const decodeCursor = (cursor: string): CursorKey => {
	try {
		return cursorPayloadSchema.parse(JSON.parse(fromBase64Url(cursor))).k;
	} catch {
		throw new InvalidCursorError();
	}
};

/** Keyset access to a collection ordered by its natural key, ascending. */
export interface KeysetSource<TRow, TKey extends CursorKey> {
	/** Rows with key > `after` (all rows when undefined), at most `limit`. */
	rowsAfter(after: TKey | undefined, limit: number): Promise<TRow[]>;
	/** Number of rows with key <= `key`. */
	countUpTo(key: TKey): Promise<number>;
	count(): Promise<number>;
	/** Key of the row at zero-based `offset`. */
	keyAt(offset: number): Promise<TKey | undefined>;
	keyOf(row: TRow): TKey;
	/** Narrows a decoded cursor to this collection's key type. */
	isKey(value: CursorKey): value is TKey;
}

export interface Link {
	href: string;
}

export interface PageLinks {
	self: Link;
	first: Link;
	prev?: Link;
	next?: Link;
	last: Link;
}

export interface Page<TRow> {
	data: TRow[];
	_links: PageLinks;
}

const href = (path: string, perPage: number, cursor?: string): Link => {
	const params = new URLSearchParams();
	if (cursor) params.set("cursor", cursor);
	params.set("per_page", String(perPage));
	return { href: `${path}?${params.toString()}` };
};

/** Link to the page starting at zero-based `start`; the first page has no cursor. */
const linkToStart = async <TKey extends CursorKey>(
	path: string,
	perPage: number,
	start: number,
	keyAt: (offset: number) => Promise<TKey | undefined>,
): Promise<Link> => {
	if (start <= 0) return href(path, perPage);
	const key = await keyAt(start - 1);
	return href(path, perPage, key === undefined ? undefined : encodeCursor(key));
};

export const paginate = async <TRow, TKey extends CursorKey>(
	source: KeysetSource<TRow, TKey>,
	path: string,
	query: PaginationQuery,
): Promise<Page<TRow>> => {
	const perPage = query.per_page;
	let after: TKey | undefined;
	if (query.cursor !== undefined) {
		const decoded = decodeCursor(query.cursor);
		if (!source.isKey(decoded)) throw new InvalidCursorError();
		after = decoded;
	}

	const [rows, total, position] = await Promise.all([
		source.rowsAfter(after, perPage + 1),
		source.count(),
		after === undefined ? Promise.resolve(0) : source.countUpTo(after),
	]);

	const data = rows.slice(0, perPage);
	const links: PageLinks = {
		self: href(path, perPage, query.cursor),
		first: href(path, perPage),
		last: await linkToStart(
			path,
			perPage,
			total === 0 ? 0 : Math.floor((total - 1) / perPage) * perPage,
			source.keyAt,
		),
	};
	if (position > 0) {
		links.prev = await linkToStart(
			path,
			perPage,
			position - perPage,
			source.keyAt,
		);
	}
	const lastRow = data.at(-1);
	if (rows.length > perPage && lastRow !== undefined) {
		links.next = href(path, perPage, encodeCursor(source.keyOf(lastRow)));
	}

	return { data, _links: links };
};
