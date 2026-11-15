import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import * as schema from "./schema";

export const createDb = (databaseUrl: string) =>
	drizzle({ client: connect({ url: databaseUrl }), schema });

export type Db = ReturnType<typeof createDb>;
