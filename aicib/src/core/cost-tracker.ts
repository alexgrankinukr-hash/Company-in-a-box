import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export interface CostEntry {
  id: number;
  agent_role: string;
  session_id: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  timestamp: string;
}

export interface AgentCostSummary {
  role: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  entry_count: number;
}

export interface BackgroundJob {
  id: number;
  session_id: string;
  directive: string;
  status: "running" | "completed" | "failed";
  pid: number | null;
  started_at: string;
  completed_at: string | null;
  result_summary: string | null;
  error_message: string | null;
  total_cost_usd: number;
  num_turns: number;
  duration_ms: number;
}

export interface BackgroundLog {
  id: number;
  job_id: number;
  timestamp: string;
  message_type: string;
  agent_role: string;
  content: string;
}

// Approximate costs per million tokens (USD) — Updated Feb 2026
// See: https://platform.claude.com/docs/en/about-claude/pricing
const COST_PER_MILLION: Record<string, { input: number; output: number }> = {
  opus: { input: 5.0, output: 25.0 },       // Claude Opus 4.6 / 4.5
  sonnet: { input: 3.0, output: 15.0 },     // Claude Sonnet 4.5
  haiku: { input: 1.0, output: 5.0 },       // Claude Haiku 4.5
};

export class CostTracker {
  private db: Database.Database;

  constructor(projectDir: string) {
    const dataDir = path.join(projectDir, ".aicib");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(path.join(dataDir, "state.db"));
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("busy_timeout = 5000");
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cost_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_role TEXT NOT NULL,
        session_id TEXT NOT NULL,
        input_tokens INTEGER NOT NULL DEFAULT 0,
        output_tokens INTEGER NOT NULL DEFAULT 0,
        estimated_cost_usd REAL NOT NULL DEFAULT 0,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        ended_at TEXT,
        status TEXT NOT NULL DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS agent_status (
        agent_role TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'stopped',
        last_activity TEXT,
        current_task TEXT
      );

      CREATE TABLE IF NOT EXISTS session_data (
        session_id TEXT PRIMARY KEY,
        sdk_session_id TEXT,
        project_dir TEXT,
        company_name TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS background_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        directive TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'running',
        pid INTEGER,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        result_summary TEXT,
        error_message TEXT,
        total_cost_usd REAL NOT NULL DEFAULT 0,
        num_turns INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS background_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        message_type TEXT NOT NULL,
        agent_role TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        FOREIGN KEY (job_id) REFERENCES background_jobs(id)
      );

      CREATE INDEX IF NOT EXISTS idx_cost_agent ON cost_entries(agent_role);
      CREATE INDEX IF NOT EXISTS idx_cost_session ON cost_entries(session_id);
      CREATE INDEX IF NOT EXISTS idx_cost_timestamp ON cost_entries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_bg_jobs_session ON background_jobs(session_id);
      CREATE INDEX IF NOT EXISTS idx_bg_jobs_status ON background_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_bg_logs_job ON background_logs(job_id);
    `);
  }

  recordCost(
    agentRole: string,
    sessionId: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    const rates = COST_PER_MILLION[model] || COST_PER_MILLION.sonnet;
    const cost =
      (inputTokens / 1_000_000) * rates.input +
      (outputTokens / 1_000_000) * rates.output;

    this.db
      .prepare(
        `INSERT INTO cost_entries (agent_role, session_id, input_tokens, output_tokens, estimated_cost_usd)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(agentRole, sessionId, inputTokens, outputTokens, cost);
  }

  getCostByAgent(sessionId?: string): AgentCostSummary[] {
    const query = sessionId
      ? `SELECT agent_role as role,
                SUM(input_tokens) as total_input_tokens,
                SUM(output_tokens) as total_output_tokens,
                SUM(estimated_cost_usd) as total_cost_usd,
                COUNT(*) as entry_count
         FROM cost_entries WHERE session_id = ?
         GROUP BY agent_role ORDER BY total_cost_usd DESC`
      : `SELECT agent_role as role,
                SUM(input_tokens) as total_input_tokens,
                SUM(output_tokens) as total_output_tokens,
                SUM(estimated_cost_usd) as total_cost_usd,
                COUNT(*) as entry_count
         FROM cost_entries
         GROUP BY agent_role ORDER BY total_cost_usd DESC`;

    return sessionId
      ? (this.db.prepare(query).all(sessionId) as AgentCostSummary[])
      : (this.db.prepare(query).all() as AgentCostSummary[]);
  }

  getTotalCostToday(): number {
    const result = this.db
      .prepare(
        `SELECT COALESCE(SUM(estimated_cost_usd), 0) as total
         FROM cost_entries
         WHERE date(timestamp) = date('now')`
      )
      .get() as { total: number };
    return result.total;
  }

  getTotalCostThisMonth(): number {
    const result = this.db
      .prepare(
        `SELECT COALESCE(SUM(estimated_cost_usd), 0) as total
         FROM cost_entries
         WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')`
      )
      .get() as { total: number };
    return result.total;
  }

  // Session management
  createSession(sessionId: string): void {
    this.db
      .prepare(`INSERT OR REPLACE INTO sessions (id, status) VALUES (?, 'active')`)
      .run(sessionId);
  }

  endSession(sessionId: string): void {
    this.db
      .prepare(
        `UPDATE sessions SET ended_at = datetime('now'), status = 'ended' WHERE id = ?`
      )
      .run(sessionId);
  }

  getActiveSession(): string | null {
    const result = this.db
      .prepare(`SELECT id FROM sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1`)
      .get() as { id: string } | undefined;
    return result?.id ?? null;
  }

  // Agent status
  setAgentStatus(
    agentRole: string,
    status: string,
    currentTask?: string
  ): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO agent_status (agent_role, status, last_activity, current_task)
         VALUES (?, ?, datetime('now'), ?)`
      )
      .run(agentRole, status, currentTask ?? null);
  }

  getAgentStatuses(): Array<{
    agent_role: string;
    status: string;
    last_activity: string | null;
    current_task: string | null;
  }> {
    return this.db
      .prepare(`SELECT * FROM agent_status ORDER BY agent_role`)
      .all() as Array<{
      agent_role: string;
      status: string;
      last_activity: string | null;
      current_task: string | null;
    }>;
  }

  // SDK session mapping — bridges local session IDs to SDK session IDs
  // so that `brief` can resume the session started by `start`

  saveSDKSessionId(
    sessionId: string,
    sdkSessionId: string,
    projectDir: string,
    companyName: string
  ): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO session_data (session_id, sdk_session_id, project_dir, company_name)
         VALUES (?, ?, ?, ?)`
      )
      .run(sessionId, sdkSessionId, projectDir, companyName);
  }

  getActiveSDKSessionId(): {
    sessionId: string;
    sdkSessionId: string;
  } | null {
    const activeSession = this.getActiveSession();
    if (!activeSession) return null;

    const result = this.db
      .prepare(
        `SELECT session_id, sdk_session_id FROM session_data WHERE session_id = ?`
      )
      .get(activeSession) as
      | { session_id: string; sdk_session_id: string }
      | undefined;

    if (!result?.sdk_session_id) return null;
    return {
      sessionId: result.session_id,
      sdkSessionId: result.sdk_session_id,
    };
  }

  clearSDKSessionData(sessionId: string): void {
    this.db
      .prepare(`DELETE FROM session_data WHERE session_id = ?`)
      .run(sessionId);
  }

  // Background job management

  createBackgroundJob(sessionId: string, directive: string): number {
    const result = this.db
      .prepare(
        `INSERT INTO background_jobs (session_id, directive, status) VALUES (?, ?, 'running')`
      )
      .run(sessionId, directive);
    return Number(result.lastInsertRowid);
  }

  getBackgroundJob(jobId: number): BackgroundJob | null {
    return (
      (this.db
        .prepare(`SELECT * FROM background_jobs WHERE id = ?`)
        .get(jobId) as BackgroundJob | undefined) ?? null
    );
  }

  getActiveBackgroundJob(sessionId: string): BackgroundJob | null {
    return (
      (this.db
        .prepare(
          `SELECT * FROM background_jobs WHERE session_id = ? AND status = 'running' ORDER BY started_at DESC LIMIT 1`
        )
        .get(sessionId) as BackgroundJob | undefined) ?? null
    );
  }

  listBackgroundJobs(sessionId?: string): BackgroundJob[] {
    if (sessionId) {
      return this.db
        .prepare(
          `SELECT * FROM background_jobs WHERE session_id = ? ORDER BY started_at DESC`
        )
        .all(sessionId) as BackgroundJob[];
    }
    return this.db
      .prepare(`SELECT * FROM background_jobs ORDER BY started_at DESC`)
      .all() as BackgroundJob[];
  }

  private static readonly ALLOWED_BG_JOB_FIELDS = new Set([
    "status",
    "pid",
    "completed_at",
    "result_summary",
    "error_message",
    "total_cost_usd",
    "num_turns",
    "duration_ms",
  ]);

  updateBackgroundJob(
    jobId: number,
    fields: Partial<
      Pick<
        BackgroundJob,
        | "status"
        | "pid"
        | "completed_at"
        | "result_summary"
        | "error_message"
        | "total_cost_usd"
        | "num_turns"
        | "duration_ms"
      >
    >
  ): void {
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(fields)) {
      if (!CostTracker.ALLOWED_BG_JOB_FIELDS.has(key)) {
        throw new Error(`Invalid background job field: ${key}`);
      }
      sets.push(`${key} = ?`);
      values.push(value);
    }

    if (sets.length === 0) return;
    values.push(jobId);

    this.db
      .prepare(`UPDATE background_jobs SET ${sets.join(", ")} WHERE id = ?`)
      .run(...values);
  }

  logBackgroundMessage(
    jobId: number,
    type: string,
    role: string,
    content: string
  ): void {
    this.db
      .prepare(
        `INSERT INTO background_logs (job_id, message_type, agent_role, content) VALUES (?, ?, ?, ?)`
      )
      .run(jobId, type, role, content);
  }

  getBackgroundLogs(jobId: number, limit?: number): BackgroundLog[] {
    if (limit) {
      return this.db
        .prepare(
          `SELECT * FROM background_logs WHERE job_id = ? ORDER BY id ASC LIMIT ?`
        )
        .all(jobId, limit) as BackgroundLog[];
    }
    return this.db
      .prepare(
        `SELECT * FROM background_logs WHERE job_id = ? ORDER BY id ASC`
      )
      .all(jobId) as BackgroundLog[];
  }

  close(): void {
    this.db.close();
  }
}
