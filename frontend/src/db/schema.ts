import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const folders = pgTable("folders", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const files = pgTable("files", {
    id: text("id").primaryKey(), // public random id exposed to UI
    originalName: text("original_name").notNull(),
    s3Key: text("s3_key").notNull(),
    mimeType: text("mime_type"),
    size: bigint("size", { mode: "number" }),
    userId: text("user_id").notNull(),
    folderId: text("folder_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    files: many(files),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
    files: many(files),
}));

export const filesRelations = relations(files, _ => ({}));

export type User = typeof users.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type FileRow = typeof files.$inferSelect;

