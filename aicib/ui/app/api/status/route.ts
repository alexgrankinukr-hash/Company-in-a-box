import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();

    // Company config — read from aicib.config.yaml via simple YAML parse
    const { getProjectDir } = await import("@/lib/config");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const projectDir = getProjectDir();
    const configPath = path.join(projectDir, "aicib.config.yaml");

    let company = { name: "Unknown", template: "unknown" };
    let settings = {
      cost_limit_daily: 50,
      cost_limit_monthly: 500,
    };
    let configuredAgents: Array<{
      role: string;
      model: string;
      department: string;
      enabled: boolean;
    }> = [];

    if (fs.existsSync(configPath)) {
      // Simple YAML parsing for config (avoid importing js-yaml)
      const raw = fs.readFileSync(configPath, "utf-8");

      // Extract company name
      const nameMatch = raw.match(/^\s*name:\s*(.+)$/m);
      const templateMatch = raw.match(/^\s*template:\s*(.+)$/m);
      if (nameMatch) company.name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
      if (templateMatch)
        company.template = templateMatch[1].trim().replace(/^["']|["']$/g, "");

      // Extract settings
      const dailyMatch = raw.match(/cost_limit_daily:\s*(\d+\.?\d*)/);
      const monthlyMatch = raw.match(/cost_limit_monthly:\s*(\d+\.?\d*)/);
      if (dailyMatch) settings.cost_limit_daily = parseFloat(dailyMatch[1]);
      if (monthlyMatch)
        settings.cost_limit_monthly = parseFloat(monthlyMatch[1]);

      // Extract agents section (simple parsing)
      const agentsSection = raw.match(
        /^agents:\s*\n((?:[ ]{2,}.*\n)*)/m
      );
      if (agentsSection) {
        const agentLines = agentsSection[1].matchAll(
          /^\s{2}(\S+):\s*\n(?:\s{4}(.+)\n?)*/gm
        );
        for (const match of agentLines) {
          const role = match[0].match(/^\s{2}(\S+):/)?.[1];
          if (!role) continue;
          const modelMatch = match[0].match(/model:\s*(\S+)/);
          const enabledMatch = match[0].match(/enabled:\s*(true|false)/);
          configuredAgents.push({
            role,
            model: modelMatch?.[1] || "sonnet",
            department: role,
            enabled: enabledMatch ? enabledMatch[1] === "true" : true,
          });

          // Check for workers
          const workersBlock = match[0].match(
            /workers:\s*\n((?:\s{6,}.*\n?)*)/
          );
          if (workersBlock) {
            const workerMatches = workersBlock[1].matchAll(
              /^\s+-\s+(\S+):\s*\n\s+model:\s*(\S+)/gm
            );
            for (const wm of workerMatches) {
              configuredAgents.push({
                role: wm[1],
                model: wm[2] || "sonnet",
                department: role,
                enabled: true,
              });
            }
          }
        }
      }
    }

    // Session info
    const activeSession = db
      .prepare(
        "SELECT id FROM sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1"
      )
      .get() as { id: string } | undefined;

    let sdkSessionId: string | null = null;
    if (activeSession) {
      const sd = db
        .prepare(
          "SELECT sdk_session_id FROM session_data WHERE session_id = ?"
        )
        .get(activeSession.id) as { sdk_session_id: string } | undefined;
      sdkSessionId = sd?.sdk_session_id || null;
    }

    // Agent statuses from DB
    const dbStatuses = db
      .prepare("SELECT * FROM agent_status ORDER BY agent_role")
      .all() as Array<{
      agent_role: string;
      status: string;
      last_activity: string | null;
      current_task: string | null;
    }>;

    const statusMap = new Map(dbStatuses.map((s) => [s.agent_role, s]));

    const agents = configuredAgents.map((agent) => {
      const dbStatus = statusMap.get(agent.role);
      return {
        role: agent.role,
        model: agent.model,
        department: agent.department,
        enabled: agent.enabled,
        status: dbStatus?.status || "stopped",
        lastActivity: dbStatus?.last_activity || null,
        currentTask: dbStatus?.current_task || null,
      };
    });

    // If no config agents found, fall back to DB statuses
    if (agents.length === 0 && dbStatuses.length > 0) {
      for (const s of dbStatuses) {
        agents.push({
          role: s.agent_role,
          model: "unknown",
          department: s.agent_role,
          enabled: true,
          status: s.status,
          lastActivity: s.last_activity,
          currentTask: s.current_task,
        });
      }
    }

    // Costs
    const todayResult = db
      .prepare(
        "SELECT COALESCE(SUM(estimated_cost_usd), 0) as total FROM cost_entries WHERE date(timestamp) = date('now')"
      )
      .get() as { total: number };

    const monthResult = db
      .prepare(
        "SELECT COALESCE(SUM(estimated_cost_usd), 0) as total FROM cost_entries WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')"
      )
      .get() as { total: number };

    const costs = {
      today: todayResult.total,
      month: monthResult.total,
      dailyLimit: settings.cost_limit_daily,
      monthlyLimit: settings.cost_limit_monthly,
    };

    // Task summary
    let tasks = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
      cancelled: 0,
      total: 0,
    };

    try {
      const taskRows = db
        .prepare("SELECT status, COUNT(*) as count FROM tasks GROUP BY status")
        .all() as Array<{ status: string; count: number }>;

      for (const row of taskRows) {
        if (row.status in tasks) {
          (tasks as Record<string, number>)[row.status] = row.count;
        }
        tasks.total += row.count;
      }
    } catch {
      // tasks table may not exist yet
    }

    // Recent logs
    let recentLogs: unknown[] = [];
    try {
      recentLogs = db
        .prepare(
          "SELECT * FROM background_logs ORDER BY id DESC LIMIT 20"
        )
        .all();
    } catch {
      // table may not exist
    }

    // Recent jobs
    let recentJobs: unknown[] = [];
    try {
      recentJobs = db
        .prepare(
          "SELECT * FROM background_jobs ORDER BY started_at DESC LIMIT 5"
        )
        .all();
    } catch {
      // table may not exist
    }

    return NextResponse.json({
      company,
      session: activeSession
        ? {
            active: true,
            sessionId: activeSession.id,
            sdkSessionId,
          }
        : { active: false },
      agents,
      costs,
      tasks,
      recentLogs,
      recentJobs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
