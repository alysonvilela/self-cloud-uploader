import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';


if (!process.env.DATABASE_URL) {
    throw new Error('Database URL is not set.');
}

export const db = drizzle({
    connection: process.env.DATABASE_URL ?? '',
    casing: 'snake_case',
    schema,
});
