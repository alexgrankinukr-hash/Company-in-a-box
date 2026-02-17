import fs from "node:fs";
import path from "node:path";

let cachedProjectDir: string | null = null;

/**
 * Detect the AICIB project directory.
 * 1. Check AICIB_PROJECT_DIR env var (set by `aicib ui` command)
 * 2. Fallback: walk up from cwd() looking for aicib.config.yaml
 */
export function getProjectDir(): string {
  if (cachedProjectDir) return cachedProjectDir;

  // Check env var first (set by `aicib ui`)
  const envDir = process.env.AICIB_PROJECT_DIR;
  if (envDir && fs.existsSync(path.join(envDir, "aicib.config.yaml"))) {
    cachedProjectDir = envDir;
    return envDir;
  }

  // Walk up from cwd looking for aicib.config.yaml
  let dir = process.cwd();
  const root = path.parse(dir).root;

  while (dir !== root) {
    if (fs.existsSync(path.join(dir, "aicib.config.yaml"))) {
      cachedProjectDir = dir;
      return dir;
    }
    dir = path.dirname(dir);
  }

  throw new Error(
    "Could not find aicib.config.yaml. Set AICIB_PROJECT_DIR or run from a project directory."
  );
}

/**
 * Like getProjectDir() but returns null instead of throwing.
 * When AICIB_PROJECT_DIR is set (e.g. by `aicib ui`), returns that directory
 * even if config doesn't exist yet — the wizard needs to know WHERE to create it.
 */
export function tryGetProjectDir(): string | null {
  // If we already resolved a project dir with config, return it
  if (cachedProjectDir) return cachedProjectDir;

  // When launched via `aicib ui`, this env var is always set
  const envDir = process.env.AICIB_PROJECT_DIR;
  if (envDir) return envDir;

  // Walk up from cwd looking for aicib.config.yaml
  let dir = process.cwd();
  const root = path.parse(dir).root;

  while (dir !== root) {
    if (fs.existsSync(path.join(dir, "aicib.config.yaml"))) {
      cachedProjectDir = dir;
      return dir;
    }
    dir = path.dirname(dir);
  }

  return null;
}
