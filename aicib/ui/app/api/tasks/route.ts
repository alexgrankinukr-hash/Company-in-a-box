import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, parsePagination, safeAll, tableExists } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
] as const;
const VALID_PRIORITIES = ["critical", "high", "medium", "low"] as const;

interface TaskRow {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  reviewer: string | null;
  department: string | null;
  project: string | null;
  parent_id: number | null;
  deadline: string | null;
  created_by: string;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  blocker_count: number;
  comment_count: number;
}

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    if (!tableExists(db, "tasks")) {
      return NextResponse.json({
        tasks: [],
        statusCounts: {
          backlog: 0,
          todo: 0,
          in_progress: 0,
          in_review: 0,
          done: 0,
          cancelled: 0,
        },
        pagination: {
          page: 1,
          pageSize: 50,
          total: 0,
          totalPages: 1,
        },
      });
    }

    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const assignee = searchParams.get("assignee") || "all";
    const department = searchParams.get("department") || "all";

    const whereParts: string[] = [];
    const params: unknown[] = [];

    if (status !== "all" && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      whereParts.push("t.status = ?");
      params.push(status);
    }

    if (
      priority !== "all" &&
      VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
    ) {
      whereParts.push("t.priority = ?");
      params.push(priority);
    }

    if (assignee !== "all") {
      whereParts.push("COALESCE(t.assignee, '') = ?");
      params.push(assignee === "unassigned" ? "" : assignee);
    }

    if (department !== "all") {
      whereParts.push("COALESCE(t.department, '') = ?");
      params.push(department === "none" ? "" : department);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const pageInfo = parsePagination(request, { pageSize: 50, maxPageSize: 200 });

    const total =
      (db
        .prepare(`SELECT COUNT(*) as count FROM tasks t ${whereClause}`)
        .get(...params) as { count: number })?.count ?? 0;

    const tasks = safeAll<TaskRow>(
      db,
      "tasks",
      `SELECT t.*,
        (SELECT COUNT(*) FROM task_blockers WHERE task_id = t.id) as blocker_count,
        (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) as comment_count
      FROM tasks t
      ${whereClause}
      ORDER BY
        CASE t.priority
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        t.updated_at DESC,
        t.id DESC
      LIMIT ? OFFSET ?`,
      [...params, pageInfo.pageSize, pageInfo.offset]
    );

    const statusRows = safeAll<{ status: string; count: number }>(
      db,
      "tasks",
      "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
    );

    const statusCounts: Record<string, number> = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
      cancelled: 0,
    };

    for (const row of statusRows) {
      if (row.status in statusCounts) {
        statusCounts[row.status] = row.count;
      }
    }

    const assignees = safeAll<{ assignee: string | null }>(
      db,
      "tasks",
      "SELECT DISTINCT assignee FROM tasks ORDER BY assignee"
    )
      .map((row) => row.assignee)
      .filter((value): value is string => !!value);

    const departments = safeAll<{ department: string | null }>(
      db,
      "tasks",
      "SELECT DISTINCT department FROM tasks ORDER BY department"
    )
      .map((row) => row.department)
      .filter((value): value is string => !!value);

    return NextResponse.json({
      tasks,
      statusCounts,
      filters: {
        assignees,
        departments,
      },
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
