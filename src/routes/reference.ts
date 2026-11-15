import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createDb } from "../db/client";
import {
	InvalidCursorError,
	type Page,
	type PaginationQuery,
	paginationQuerySchema,
} from "../lib/pagination";
import {
	createReferenceSources,
	ReferenceService,
} from "../services/reference-service";
import type { AppEnv } from "../types/app-env";

export type ReferenceServiceFactory = (env: AppEnv) => ReferenceService;

const defaultServiceFactory: ReferenceServiceFactory = (env) => {
	if (!env.DATABASE_URL) {
		throw new Error("DATABASE_URL is not configured");
	}
	return new ReferenceService(
		createReferenceSources(createDb(env.DATABASE_URL)),
	);
};

type ListMethod = (
	service: ReferenceService,
) => (path: string, query: PaginationQuery) => Promise<Page<unknown>>;

const LISTS: Record<string, ListMethod> = {
	"/countries": (service) => service.listCountries,
	"/currencies": (service) => service.listCurrencies,
	"/languages": (service) => service.listLanguages,
	"/types": (service) => service.listTypes,
};

/**
 * Reference data for the preference selectors, cursor-paginated (ADR 0008).
 * Open until authMiddleware lands with #20; then mounted behind it.
 */
export const createReferenceRouter = (
	getService: ReferenceServiceFactory = defaultServiceFactory,
) => {
	const router = new Hono<{ Bindings: AppEnv }>();

	for (const [path, method] of Object.entries(LISTS)) {
		router.get(path, zValidator("query", paginationQuerySchema), async (c) => {
			try {
				const list = method(getService(c.env));
				return c.json(await list(c.req.path, c.req.valid("query")), 200);
			} catch (err) {
				if (err instanceof InvalidCursorError) {
					return c.json({ error: "invalid_cursor", message: err.message }, 400);
				}
				throw err;
			}
		});
	}

	return router;
};
