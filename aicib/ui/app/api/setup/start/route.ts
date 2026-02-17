import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { tryGetProjectDir } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const projectDir = tryGetProjectDir();
    if (!projectDir) {
      return NextResponse.json(
        { error: "No project directory found" },
        { status: 400 }
      );
    }

    // Verify config exists
    if (!fs.existsSync(path.join(projectDir, "aicib.config.yaml"))) {
      return NextResponse.json(
        { error: "Project not initialized. Complete setup first." },
        { status: 400 }
      );
    }

    // Spawn `aicib start` as a detached subprocess
    const child = spawn("npx", ["aicib", "start", "-d", projectDir], {
      detached: true,
      stdio: "ignore",
      cwd: projectDir,
    });

    const pid = child.pid;
    child.unref();

    return NextResponse.json({
      success: true,
      pid: pid || null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
