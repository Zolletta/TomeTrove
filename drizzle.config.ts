import { defineConfig } from "drizzle-kit";

// `drizzle-kit migrate` connects over TCP with TLS. The database defaults to
// tometrove_staging (ADR 0024); set TIDB_DATABASE=tometrove_production only
// after the migration has been verified on staging.
export default defineConfig({
	dialect: "mysql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		host: process.env.TIDB_HOST ?? "",
		port: Number(process.env.TIDB_PORT ?? 4000),
		user: process.env.TIDB_USER ?? "",
		password: process.env.TIDB_PASSWORD ?? "",
		database: process.env.TIDB_DATABASE ?? "tometrove_staging",
		ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
	},
});
