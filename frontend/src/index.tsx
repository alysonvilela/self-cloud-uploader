import { serve } from "bun";
import index from "./index.html";
import { nanoid } from "nanoid";
import { db, ensureSchema, ensureDemoUser } from "./db/client";
import { files, users } from "./db/schema";
import { and, desc, eq, ilike, sql as dsql } from "drizzle-orm";

await ensureSchema();
await ensureDemoUser();

const server = serve({
    routes: {
        // Serve index.html for all unmatched routes.
        "/api/files": {
            async GET(req) {
                try {
                    if (!process.env.DATABASE_URL) {
                        return new Response("Database not configured", { status: 503 });
                    }
                    const url = new URL(req.url);
                    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
                    const pageSize = Math.max(20, Math.min(100, Number(url.searchParams.get("pageSize") || 20)));
                    const search = url.searchParams.get("q") || "";
                    const userId = url.searchParams.get("userId");
                    const folderId = url.searchParams.get("folderId");

                    const whereClauses = [] as any[];
                    if (search) {
                        whereClauses.push(ilike(files.originalName, `%${search}%`));
                    }
                    if (userId) {
                        whereClauses.push(eq(files.userId, userId));
                    }
                    if (folderId) {
                        whereClauses.push(eq(files.folderId, folderId));
                    }

                    const whereExpr = whereClauses.length > 0 ? and(...whereClauses) : undefined;

                    const countRows = await db
                        .select({ count: dsql<number>`count(*)` })
                        .from(files)
                        .where(whereExpr as any);
                    const totalCount = Number((countRows as any)?.[0]?.count ?? 0);

                    const data = await db
                        .select()
                        .from(files)
                        .where(whereExpr as any)
                        .orderBy(desc(files.createdAt))
                        .limit(pageSize)
                        .offset((page - 1) * pageSize);

                    return Response.json({
                        data,
                        page,
                        pageSize,
                        total: totalCount,
                        totalPages: Math.ceil(totalCount / pageSize),
                    });
                } catch (err) {
                    console.error(err);
                    return new Response("Internal Server Error", { status: 500 });
                }
            },
            async POST(req) {
                try {
                    if (!process.env.DATABASE_URL) {
                        return new Response("Database not configured", { status: 503 });
                    }
                    const body = await req.json();
                    const parsed = await validateCreateFile(body);
                    const id = nanoid(12);
                    const [inserted] = await db
                        .insert(files)
                        .values({
                            id,
                            originalName: parsed.originalName,
                            s3Key: parsed.s3Key,
                            mimeType: parsed.mimeType ?? null,
                            size: parsed.size ?? null,
                            userId: parsed.userId,
                            folderId: parsed.folderId ?? null,
                        })
                        .returning();
                    return Response.json(inserted, { status: 201 });
                } catch (err: any) {
                    console.error(err);
                    const message = err?.message || "Bad Request";
                    return new Response(message, { status: 400 });
                }
            },
        },

        "/api/users": async _req => {
            try {
                if (!process.env.DATABASE_URL) {
                    return new Response("Database not configured", { status: 503 });
                }
                const all = await db.select().from(users).orderBy(users.name);
                return Response.json(all);
            } catch (err) {
                console.error(err);
                return new Response("Internal Server Error", { status: 500 });
            }
        },

        "/*": index,

        "/api/hello": {
            async GET(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "GET",
                });
            },
            async PUT(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "PUT",
                });
            },
        },

        "/api/hello/:name": async req => {
            const name = req.params.name;
            return Response.json({
                message: `Hello, ${name}!`,
            });
        },
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

async function validateCreateFile(body: any) {
    // Lightweight validation without a dedicated library to avoid extra deps in route
    if (!body || typeof body !== "object") throw new Error("Invalid body");
    const originalName = String(body.originalName || body.name || "");
    const s3Key = String(body.s3Key || body.key || originalName);
    const userId = String(body.userId || "demo");
    const folderId = body.folderId ? String(body.folderId) : undefined;
    const size = body.size != null ? Number(body.size) : undefined;
    const mimeType = body.mimeType ? String(body.mimeType) : undefined;
    if (!originalName) throw new Error("originalName is required");
    if (!s3Key) throw new Error("s3Key is required");
    if (!userId) throw new Error("userId is required");
    return { originalName, s3Key, userId, folderId, size, mimeType } as const;
}

console.log(`🚀 Server running at ${server.url}`);
