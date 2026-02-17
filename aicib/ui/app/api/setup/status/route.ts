import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { tryGetProjectDir } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projectDir = tryGetProjectDir();

    if (!projectDir) {
      return NextResponse.json({
        configExists: false,
        dbExists: false,
        sessionActive: false,
      });
    }

    const configExists = fs.existsSync(
      path.join(projectDir, "aicib.config.yaml")
    );
    const dbPath = path.join(projectDir, ".aicib", "state.db");
    const dbExists = fs.existsSync(dbPath);

    let sessionActive = false;
    if (dbExists) {
      let db: { close(): void; pragma(source: string): unknown; prepare(source: string): { get(): unknown } } | null = null;
      try {
        const Database = (await import("better-sqlite3")).default;
        db = new Database(dbPath, { readonly: true });
        db.pragma("journal_mode = WAL");
        db.pragma("busy_timeout = 5000");

        const row = db
          .prepare(
            "SELECT id FROM sessions WHERE status = 'active' ORDER BY started_at DESC LIMIT 1"
          )
          .get() as { id: string } | undefined;

        sessionActive = !!row;
      } catch {
        // DB may not have sessions table yet
      } finally {
        db?.close();
      }
    }

    return NextResponse.json({
      configExists,
      dbExists,
      sessionActive,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
