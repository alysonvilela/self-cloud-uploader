import { db } from "../db/client";
import { files, users } from "../db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

type BunRequest = Request & { params?: Record<string, string> };

export async function getFiles(req: BunRequest): Promise<Response> {
	try {
		if (!db) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 500 });

		const url = new URL(req.url);
		const search = url.searchParams.get("search")?.trim() ?? "";
		const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get("pageSize") ?? 20)));
		const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
		const offset = (page - 1) * pageSize;
		const userId = url.searchParams.get("userId")?.trim() || undefined;
		const folderId = url.searchParams.get("folderId") ? Number(url.searchParams.get("folderId")) : undefined;

		const whereClauses = [] as any[];
		if (search) whereClauses.push(ilike(files.originalName, `%${search}%`));
		if (userId) whereClauses.push(eq(files.userId, userId));
		if (folderId) whereClauses.push(eq(files.folderId, folderId));

		const whereExpr = whereClauses.length > 0 ? and(...whereClauses) : undefined;

		const rowsPromise = db
			.select({
				id: files.id,
				publicId: files.publicId,
				originalName: files.originalName,
				s3Key: files.s3Key,
				createdAt: files.createdAt,
				userId: files.userId,
				userName: users.name,
			})
			.from(files)
			.leftJoin(users, eq(files.userId, users.id))
			.where(whereExpr as any)
			.orderBy(desc(files.createdAt))
			.limit(pageSize)
			.offset(offset);

		const countRows = await db
			.select({ count: sql<number>`cast(count(*) as int)` })
			.from(files)
			.where(whereExpr as any);
		const total = countRows[0]?.count ?? 0;
		const rows = await rowsPromise;

		return Response.json({
			items: rows,
			page,
			pageSize,
			total,
		});
	} catch (error) {
		console.error("getFiles error", error);
		return new Response(JSON.stringify({ error: "Failed to fetch files" }), { status: 500 });
	}
}

export async function createFile(req: BunRequest): Promise<Response> {
	try {
		if (!db) return new Response(JSON.stringify({ error: "Database not configured" }), { status: 500 });

		const body = await req.json();
		const originalName = String(body?.originalName ?? "");
		const s3Key = String(body?.s3Key ?? "");
		const userId = String(body?.userId ?? "");
		const userName = String(body?.userName ?? "");
		const folderId = body?.folderId ? Number(body.folderId) : undefined;

		if (!originalName || !s3Key || !userId) {
			return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
		}

		// Upsert user (simple ensure exists)
		await db
			.insert(users)
			.values({ id: userId, name: userName || userId })
			.onConflictDoNothing();

		const publicId = nanoid(12);
		const inserted = await db
			.insert(files)
			.values({ publicId, originalName, s3Key, userId, folderId })
			.returning();

		return Response.json(inserted[0]);
	} catch (error) {
		console.error("createFile error", error);
		return new Response(JSON.stringify({ error: "Failed to create file" }), { status: 500 });
	}
}

