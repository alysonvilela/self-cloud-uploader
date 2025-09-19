import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.warn("DATABASE_URL is not set. API routes depending on DB will fail until it's configured.");
}

export const sqlClient = databaseUrl
	? postgres(databaseUrl, {
		prepare: true,
		max: 5,
		// Accept both local and cloud Postgres; users can disable TLS via the URL.
		ssl: undefined,
	})
	: null;

export const db = sqlClient ? drizzle(sqlClient) : null;

