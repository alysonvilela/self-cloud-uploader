import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { SQL } from "drizzle-orm";
import { files, folders, users } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Please configure the PostgreSQL connection string.");
}

export const sql = databaseUrl
    ? postgres(databaseUrl, { max: 1 })
    : (undefined as unknown as ReturnType<typeof postgres>);

export const db = databaseUrl ? drizzle(sql, { schema: { users, folders, files } }) : (undefined as unknown as ReturnType<typeof drizzle>);

export async function ensureSchema() {
    if (!databaseUrl) return;
    // Minimal DDL to support the feature set
    await sql`
        create table if not exists users (
            id text primary key,
            name text not null,
            created_at timestamp default now() not null
        );
    `;
    await sql`
        create table if not exists folders (
            id text primary key,
            name text not null,
            parent_id text,
            created_at timestamp default now() not null
        );
    `;
    await sql`
        create table if not exists files (
            id text primary key,
            original_name text not null,
            s3_key text not null,
            mime_type text,
            size bigint,
            user_id text not null references users(id) on delete cascade,
            folder_id text references folders(id) on delete set null,
            created_at timestamp default now() not null
        );
    `;
}

export async function ensureDemoUser() {
    if (!databaseUrl) return;
    const existing = await sql`select id from users limit 1`;
    if ((existing as unknown as Array<{ id: string }>).length === 0) {
        await sql`insert into users (id, name) values ('demo', 'Demo User')`;
    }
}

