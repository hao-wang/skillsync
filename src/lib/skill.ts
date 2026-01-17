/**
 * Skill metadata parser - parse SKILL.md frontmatter
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface SkillMetadata {
  name?: string;
  description?: string;
  author?: string;
  version?: string;
}

/**
 * Parse YAML frontmatter from SKILL.md
 */
function parseYamlFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, any> = {};

  // Simple YAML parser for our use case
  const lines = yaml.split('\n');
  let inMetadata = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for metadata section
    if (trimmed === 'metadata:') {
      inMetadata = true;
      result.metadata = {};
      continue;
    }

    // Parse key-value pairs
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();

    // Remove quotes
    value = value.replace(/^["']|["']$/g, '');

    if (inMetadata && line.startsWith('  ')) {
      // Metadata field
      result.metadata[key] = value;
    } else {
      // Top-level field
      result[key] = value;
      inMetadata = false;
    }
  }

  return result;
}

/**
 * Read skill metadata from SKILL.md
 */
export async function readSkillMetadata(skillPath: string): Promise<SkillMetadata | null> {
  try {
    const skillMdPath = join(skillPath, "SKILL.md");
    const content = await readFile(skillMdPath, "utf-8");
    const frontmatter = parseYamlFrontmatter(content);

    return {
      name: frontmatter.name,
      description: frontmatter.description,
      author: frontmatter.metadata?.author,
      version: frontmatter.metadata?.version,
    };
  } catch {
    return null;
  }
}
