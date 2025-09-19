import { sql } from "drizzle-orm";
import { db, sqlClient } from "./client";

export async function bootstrapDatabase(): Promise<void> {
	if (!db || !sqlClient) return;

	// Create tables if they don't exist. This is a lightweight bootstrap in lieu of migrations.
	await sqlClient`create table if not exists users (
		id text primary key,
		name text not null,
		created_at timestamp not null default now()
	)`;

	await sqlClient`create table if not exists folders (
		id serial primary key,
		name text not null,
		parent_folder_id integer,
		created_at timestamp not null default now()
	)`;

	await sqlClient`create table if not exists files (
		id serial primary key,
		public_id text not null unique,
		original_name text not null,
		s3_key text not null,
		folder_id integer,
		user_id text not null references users(id) on delete restrict,
		created_at timestamp not null default now()
	)`;

	await sqlClient`create index if not exists files_created_at_idx on files (created_at desc)`;
	await sqlClient`create index if not exists files_user_id_idx on files (user_id)`;
	await sqlClient`create index if not exists files_folder_id_idx on files (folder_id)`;
}

