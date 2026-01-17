/**
 * Status command - show sync status
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { readConfig } from "../lib/config.js";
import { STORE_DIR, collapsePath } from "../lib/paths.js";
import { green, dim, bold } from "../lib/colors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function isLocalSource(name: string): boolean {
  return name.startsWith("local/");
}

export async function status(): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nSkills Sync Status\n"));

  // Sources
  console.log(bold("Sources:"));
  for (const [name, source] of Object.entries(config.sources)) {
    const sourceDir = join(STORE_DIR, name);
    const sourceExists = await exists(sourceDir);

    let skillCount = 0;
    if (sourceExists) {
      try {
        const items = await readdir(sourceDir, { withFileTypes: true });
        skillCount = items.filter((i) => i.isDirectory()).length;
      } catch { /* ignore */ }
    }

    const enabledStr = source.enabled ? "" : dim(" (disabled)");
    const statusStr = sourceExists
      ? green(`${skillCount} skills`)
      : isLocalSource(name)
        ? dim("local")
        : dim("not fetched");

    console.log(`  ${name.padEnd(30)} ${statusStr}${enabledStr}`);
  }

  // Targets
  console.log(bold("\nTargets:"));
  for (const [name, target] of Object.entries(config.targets)) {
    if (!target.enabled) {
      console.log(`  ${name.padEnd(15)} ${dim("disabled")}`);
      continue;
    }

    const targetExists = await exists(target.path);
    let skillCount = 0;
    if (targetExists) {
      try {
        const items = await readdir(target.path, { withFileTypes: true });
        skillCount = items.filter((i) => i.isDirectory()).length;
      } catch { /* ignore */ }
    }

    const statusStr = targetExists
      ? skillCount > 0
        ? green(`${skillCount} skills`)
        : dim("empty")
      : dim("not created");

    console.log(`  ${name.padEnd(15)} ${statusStr.padEnd(15)} ${dim(collapsePath(target.path))}`);
  }

  console.log();
}
