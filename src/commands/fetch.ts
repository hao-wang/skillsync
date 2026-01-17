/**
 * Fetch command - fetch skills from Git repositories
 */
import { execSync } from "node:child_process";
import { cp, rm, mkdir, stat, rename } from "node:fs/promises";
import { join } from "node:path";
import { readConfig } from "../lib/config.js";
import { STORE_DIR } from "../lib/paths.js";
import { green, red, dim, bold } from "../lib/colors.js";

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

export async function fetch(sourceName?: string): Promise<void> {
  const config = await readConfig();

  const sources = sourceName
    ? { [sourceName]: config.sources[sourceName] }
    : config.sources;

  if (sourceName && !config.sources[sourceName]) {
    console.log(red(`Error: Source "${sourceName}" not found`));
    process.exit(1);
  }

  console.log(bold("\nFetching skills...\n"));

  for (const [name, source] of Object.entries(sources)) {
    // Skip disabled sources
    if (!source.enabled) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("disabled")}`);
      continue;
    }

    // Skip local skills
    if (isLocalSource(name)) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("local (skipped)")}`);
      continue;
    }

    if (!source.url) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("no URL")}`);
      continue;
    }

    const targetDir = join(STORE_DIR, name);

    try {
      // Ensure parent directory exists
      await mkdir(join(STORE_DIR, name.split("/")[0]), { recursive: true });

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

  console.log(`\n${dim(`Stored at: ${STORE_DIR}`)}\n`);
}
