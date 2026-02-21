import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, parsePagination, safeAll, safeGet, tableExists } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    if (!tableExists(db, "projects")) {
      return NextResponse.json({
        entries: [],
        pagination: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
      });
    }

    const status = searchParams.get("status") || "all";
    const whereClause = status !== "all" ? "WHERE p.status = ?" : "";
    const params = status !== "all" ? [status] : [];

    const pageInfo = parsePagination(request, { pageSize: 50, maxPageSize: 200 });

    const total =
      safeGet<{ count: number }>(
        db,
        "projects",
        `SELECT COUNT(*) as count FROM projects p ${whereClause}`,
        params
      )?.count ?? 0;

    const entries = safeAll<Record<string, unknown>>(
      db,
      "projects",
      `SELECT p.*,
        (SELECT COUNT(*) FROM project_phases WHERE project_id = p.id AND status = 'completed') as phases_done
      FROM projects p
      ${whereClause}
      ORDER BY
        CASE p.status
          WHEN 'executing' THEN 1
          WHEN 'planning' THEN 2
          WHEN 'paused' THEN 3
          ELSE 4
        END,
        p.updated_at DESC,
        p.id DESC
      LIMIT ? OFFSET ?`,
      [...params, pageInfo.pageSize, pageInfo.offset]
    );

    return NextResponse.json({
      entries,
      pagination: {
        page: pageInfo.page,
        pageSize: pageInfo.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageInfo.pageSize)),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
