/**
 * List command - list all skills
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { readConfig } from "../lib/config.js";
import { STORE_DIR } from "../lib/paths.js";
import { readSkillMetadata } from "../lib/skill.js";
import { green, dim, bold } from "../lib/colors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function list(filter?: string): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nSkills\n"));

  let totalSkills = 0;
  const sourcesWithSkills: Array<{ 
    name: string; 
    skills: Array<{ name: string; description?: string }>; 
    enabled: boolean 
  }> = [];

  for (const [name, source] of Object.entries(config.sources)) {
    // Filter by name if provided
    if (filter && !name.toLowerCase().includes(filter.toLowerCase())) {
      continue;
    }

    const sourceDir = join(STORE_DIR, name);
    const sourceExists = await exists(sourceDir);

    if (!sourceExists) {
      sourcesWithSkills.push({ name, skills: [], enabled: source.enabled });
      continue;
    }

    try {
      const items = await readdir(sourceDir, { withFileTypes: true });
      const skillDirs = items.filter((i) => i.isDirectory());
      
      // Read metadata for each skill
      const skillsWithMeta = await Promise.all(
        skillDirs.map(async (item) => {
          const skillPath = join(sourceDir, item.name);
          const metadata = await readSkillMetadata(skillPath);
          return {
            name: item.name,
            description: metadata?.description,
          };
        })
      );

      sourcesWithSkills.push({ name, skills: skillsWithMeta, enabled: source.enabled });
      if (source.enabled) {
        totalSkills += skillsWithMeta.length;
      }
    } catch {
      sourcesWithSkills.push({ name, skills: [], enabled: source.enabled });
    }
  }

  console.log(dim(`Total: ${totalSkills} skills (from enabled sources)\n`));

  for (const { name, skills, enabled } of sourcesWithSkills) {
    const enabledStr = enabled ? "" : dim(" (disabled)");

    if (skills.length === 0) {
      console.log(`${bold(name)} ${dim("(not fetched)")}${enabledStr}`);
      continue;
    }

    console.log(`${bold(name)} ${dim(`(${skills.length} skills)`)}${enabledStr}:`);
    for (const skill of skills) {
      if (skill.description) {
        console.log(`  ${green("•")} ${skill.name}`);
        console.log(`    ${dim(skill.description)}`);
      } else {
        console.log(`  ${green("•")} ${skill.name}`);
      }
    }
    console.log();
  }
}
