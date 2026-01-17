/**
 * Config command - show current configuration
 */
import { readConfig } from "../lib/config.js";
import { CONFIG_FILE, collapsePath } from "../lib/paths.js";
import { green, dim, bold } from "../lib/colors.js";

export async function showConfig(): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nConfiguration\n"));

  // Sources
  console.log(bold("Sources:"));
  const activeSources = Object.values(config.sources).filter((s) => s.enabled).length;
  console.log(dim(`  ${activeSources} active\n`));

  for (const [name, source] of Object.entries(config.sources)) {
    if (!source.enabled) {
      console.log(`  ${dim("○")} ${name} ${dim("(disabled)")}`);
      continue;
    }

    console.log(`  ${green("✓")} ${name}`);
    if (source.url) {
      console.log(`    ${dim(source.url)}`);
    }
    if (source.subdir) {
      console.log(`    ${dim(`Subdir: ${source.subdir}`)}`);
    }
  }

  console.log();

  // Targets
  console.log(bold("Targets:"));
  const enabledCount = Object.values(config.targets).filter((t) => t.enabled).length;
  const disabledCount = Object.values(config.targets).length - enabledCount;
  console.log(dim(`  ${enabledCount} enabled, ${disabledCount} disabled\n`));

  for (const [name, target] of Object.entries(config.targets)) {
    const symbol = target.enabled ? green("✓") : dim("○");
    const status = target.enabled ? "" : dim(" (disabled)");
    console.log(`  ${symbol} ${name.padEnd(15)} ${dim(collapsePath(target.path))}${status}`);
  }

  console.log();
  console.log(dim(`Config file: ${CONFIG_FILE}`));
  console.log();
}
