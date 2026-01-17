/**
 * Init command - initialize config
 */
import { stat } from "node:fs/promises";
import { readConfig, ensureConfigDir } from "../lib/config.js";
import { CONFIG_FILE, CONFIG_DIR, KNOWN_TARGETS } from "../lib/paths.js";
import { green, dim, bold } from "../lib/colors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function init(): Promise<void> {
  const configExists = await exists(CONFIG_FILE);

  if (configExists) {
    console.log(dim(`\nConfig already exists: ${CONFIG_FILE}\n`));
    return;
  }

  // Create config with defaults
  await readConfig();

  console.log(bold("\n✓ Initialized skillsync\n"));
  console.log(dim(`Config: ${CONFIG_FILE}`));
  console.log(dim(`Store:  ${CONFIG_DIR}/store/\n`));

  console.log("Default sources:");
  console.log(dim("  • anthropics/skills"));
  console.log(dim("  • vercel-labs/agent-skills\n"));

  console.log("Default targets:");
  console.log(dim("  • cursor, claude, codex, antigravity\n"));

  console.log(bold("Next steps:"));
  console.log(dim("  skills fetch    # Download skills"));
  console.log(dim("  skills sync     # Sync to targets"));
  console.log(dim("  skills status   # Check status\n"));
}
