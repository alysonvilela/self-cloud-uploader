import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const folders = pgTable("folders", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	parentFolderId: integer("parent_folder_id"),
	createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export const files = pgTable("files", {
	id: serial("id").primaryKey(),
	publicId: text("public_id").notNull().unique(),
	originalName: text("original_name").notNull(),
	s3Key: text("s3_key").notNull(),
	folderId: integer("folder_id"),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type FileItem = typeof files.$inferSelect;
export type NewFileItem = typeof files.$inferInsert;

