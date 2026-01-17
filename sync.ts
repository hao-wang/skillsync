#!/usr/bin/env npx tsx
/**
 * Skills Sync - Main Program
 *
 * Commands:
 *   fetch [source]  - Fetch/update skills from Git
 *   sync            - Sync to all enabled targets
 *   status          - View status
 */
import { execSync } from "child_process";
import { cp, rm, readdir, mkdir, stat, rename } from "fs/promises";
import { join, basename } from "path";
import config from "./config";

// ============ Color Output ============

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

// ============ Utility Functions ============

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

function isLocalSource(name: string): boolean {
  return name.startsWith("local/");
}

// ============ fetch command ============

async function fetch(sourceName?: string) {
  const sources = sourceName
    ? { [sourceName]: config.sources[sourceName] }
    : config.sources;

  if (sourceName && !config.sources[sourceName]) {
    console.log(red(`Error: Source "${sourceName}" not found in config`));
    process.exit(1);
  }

  console.log(bold("\nFetching skills...\n"));

  for (const [name, source] of Object.entries(sources)) {
    // Skip local skills
    if (isLocalSource(name)) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("local (skipped)")}`);
      continue;
    }

    if (!source.url) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("no URL")}`);
      continue;
    }

    const targetDir = join(config.storeRoot, name);

    try {
      // Ensure parent directory exists
      await mkdir(join(config.storeRoot, name.split("/")[0]), { recursive: true });

      // Delete if exists
      if (await exists(targetDir)) {
        await rm(targetDir, { recursive: true, force: true });
      }

      // Clone repository
      const tempDir = `${targetDir}_temp`;
      execSync(`git clone --depth 1 "${source.url}" "${tempDir}"`, {
        stdio: "pipe",
      });

      // If subdir exists, keep only subdirectory
      if (source.subdir) {
        const subdirPath = join(tempDir, source.subdir);
        if (await exists(subdirPath)) {
          await cp(subdirPath, targetDir, { recursive: true });
        } else {
          throw new Error(`Subdir "${source.subdir}" not found`);
        }
        await rm(tempDir, { recursive: true, force: true });
      } else {
        await rename(tempDir, targetDir);
        // Remove .git directory
        const gitDir = join(targetDir, ".git");
        if (await exists(gitDir)) {
          await rm(gitDir, { recursive: true, force: true });
        }
      }

      console.log(`  ${green("✓")} ${name.padEnd(30)} ${green("fetched")}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ${red("✗")} ${name.padEnd(30)} ${red(msg.split("\n")[0])}`);
    }
  }

  console.log(`\n${dim(`Stored at: ${config.storeRoot}`)}\n`);
}

// ============ sync command ============

async function sync() {
  console.log(bold("\nSyncing skills to targets...\n"));

  // Get all skills
  const allSkills: string[] = [];
  for (const [name] of Object.entries(config.sources)) {
    const sourceDir = join(config.storeRoot, name);
    if (!(await exists(sourceDir))) continue;

    try {
      const items = await readdir(sourceDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          allSkills.push(join(sourceDir, item.name));
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  if (allSkills.length === 0) {
    console.log(dim("  No skills found. Run 'fetch' first.\n"));
    return;
  }

  console.log(dim(`  Source: ${allSkills.length} skills from ${Object.keys(config.sources).length} sources\n`));

  // Sync to each enabled target
  for (const [name, target] of Object.entries(config.targets)) {
    if (!target.enabled) {
      console.log(`  ${dim("○")} ${name.padEnd(15)} ${dim("disabled")}`);
      continue;
    }

    try {
      await mkdir(target.path, { recursive: true });

      // Clear target directory
      const existingFiles = await readdir(target.path);
      for (const file of existingFiles) {
        await rm(join(target.path, file), { recursive: true, force: true });
      }

      // Copy all skills
      for (const skillPath of allSkills) {
        const skillName = basename(skillPath);
        await cp(skillPath, join(target.path, skillName), { recursive: true });
      }

      console.log(`  ${green("✓")} ${name.padEnd(15)} ${green("synced")}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ${red("✗")} ${name.padEnd(15)} ${red(msg)}`);
    }
  }

  console.log(bold("\nDone.\n"));
}

// ============ status command ============

async function status() {
  console.log(bold("\nSkills Sync Status\n"));

  // Sources
  console.log(bold("Sources:"));
  for (const [name, source] of Object.entries(config.sources)) {
    const sourceDir = join(config.storeRoot, name);
    const sourceExists = await exists(sourceDir);

    let skillCount = 0;
    if (sourceExists) {
      try {
        const items = await readdir(sourceDir, { withFileTypes: true });
        skillCount = items.filter((i) => i.isDirectory()).length;
      } catch {}
    }

    const statusStr = sourceExists
      ? green(`${skillCount} skills`)
      : isLocalSource(name)
      ? dim("local")
      : dim("not fetched");

    const typeStr = source.url ? "" : dim(" (local)");
    console.log(`  ${name.padEnd(30)} ${statusStr}${typeStr}`);
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
      } catch {}
    }

    const statusStr = targetExists
      ? skillCount > 0
        ? green(`${skillCount} skills`)
        : dim("empty")
      : dim("not created");

    console.log(`  ${name.padEnd(15)} ${statusStr.padEnd(20)} ${dim(target.path)}`);
  }

  console.log();
}

// ============ list command ============

async function list() {
  console.log(bold("\nSkills\n"));

  let totalSkills = 0;
  const sourcesWithSkills: Array<{ name: string; skills: string[] }> = [];

  for (const [name] of Object.entries(config.sources)) {
    const sourceDir = join(config.storeRoot, name);
    const sourceExists = await exists(sourceDir);

    if (!sourceExists) {
      sourcesWithSkills.push({ name, skills: [] });
      continue;
    }

    try {
      const items = await readdir(sourceDir, { withFileTypes: true });
      const skills = items.filter((i) => i.isDirectory()).map((i) => i.name);
      sourcesWithSkills.push({ name, skills });
      totalSkills += skills.length;
    } catch {
      sourcesWithSkills.push({ name, skills: [] });
    }
  }

  console.log(dim(`Total: ${totalSkills} skills\n`));

  for (const { name, skills } of sourcesWithSkills) {
    if (skills.length === 0) {
      console.log(`${bold(name)} ${dim("(not fetched)")}`);
      continue;
    }

    console.log(`${bold(name)} ${dim(`(${skills.length} skills)`)}:`);
    for (const skill of skills) {
      console.log(`  ${green("•")} ${skill}`);
    }
    console.log();
  }
}

// ============ config command ============

async function showConfig() {
  console.log(bold("\nConfiguration\n"));

  // Sources
  console.log(bold("Sources:"));
  const activeSourcesCount = Object.values(config.sources).filter((s) => s.url).length;
  console.log(dim(`  ${activeSourcesCount} active\n`));

  for (const [name, source] of Object.entries(config.sources)) {
    if (!source.url) {
      console.log(`  ${dim("○")} ${name} ${dim("(local)")}`);
      continue;
    }

    console.log(`  ${green("✓")} ${name}`);
    console.log(`    ${dim(source.url)}`);
    if (source.subdir) {
      console.log(`    ${dim(`Subdir: ${source.subdir}`)}`);
    }
    console.log();
  }

  // Targets
  console.log(bold("Targets:"));
  const enabledCount = Object.values(config.targets).filter((t) => t.enabled).length;
  const disabledCount = Object.values(config.targets).length - enabledCount;
  console.log(dim(`  ${enabledCount} enabled, ${disabledCount} disabled\n`));

  for (const [name, target] of Object.entries(config.targets)) {
    const symbol = target.enabled ? green("✓") : dim("○");
    const status = target.enabled ? "" : dim(" (disabled)");
    console.log(`  ${symbol} ${name.padEnd(15)} ${dim(target.path)}${status}`);
  }

  console.log();
  console.log(dim(`Config file: ${join(process.cwd(), "skills-sync/config.ts")}`));
  console.log();
}

// ============ help ============

function printHelp() {
  console.log(`
${bold("Skills Sync")} - Sync AI skills to various tools

${bold("Usage:")}
  npx tsx skills-sync/sync.ts <command> [options]
  npm run skills <command> [options]

${bold("Commands:")}
  fetch [source]   Fetch/update skills from Git
  sync             Sync to all enabled targets
  status           View sync status
  list, ls         List all skills
  config           Show configuration

${bold("Examples:")}
  npm run skills fetch                    # Fetch all sources
  npm run skills fetch anthropics/skills  # Fetch specific source
  npm run skills sync                     # Sync to targets
  npm run skills status                   # View status
  npm run skills ls                       # List all skills
  npm run skills config                   # Show config
`);
}

// ============ Main Program ============

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case "fetch":
      await fetch(arg);
      break;
    case "sync":
      await sync();
      break;
    case "status":
      await status();
      break;
    case "list":
    case "ls":
      await list();
      break;
    case "config":
      await showConfig();
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      if (command) {
        console.log(red(`Unknown command: ${command}\n`));
      }
      printHelp();
      process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(red(`Error: ${error.message}`));
  process.exit(1);
});
