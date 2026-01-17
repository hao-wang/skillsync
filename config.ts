/**
 * Skills Sync - Configuration File
 *
 * Edit this file to add/remove skills sources and sync targets
 */
import { homedir } from "os";
import { join } from "path";

const home = homedir();

// ============ Type Definitions ============

export interface Source {
  /** Git repository URL (optional for local skills) */
  url?: string;
  /** Subdirectory within the repository (if skills are not in root) */
  subdir?: string;
}

export interface Target {
  /** Target path */
  path: string;
  /** Whether enabled */
  enabled: boolean;
}

export interface Config {
  /** Skills storage root directory */
  storeRoot: string;
  /** Skills sources (key format: "account/repo" or "local/name") */
  sources: Record<string, Source>;
  /** Sync targets */
  targets: Record<string, Target>;
}

// ============ Configuration ============

const config: Config = {
  storeRoot: join(home, ".skills"),

  sources: {
    // Anthropic official skills
    "anthropics/skills": {
      url: "https://github.com/anthropics/skills",
    },
    // Vercel agent skills
    "vercel-labs/agent-skills": {
      url: "https://github.com/vercel-labs/agent-skills",
      subdir: "skills",
    },
    // Local skills (no URL, manually maintained)
    // "local/my-skills": {},
  },

  targets: {
    antigravity: {
      path: join(home, ".gemini", "antigravity", "skills"),
      enabled: true,
    },
    codex: {
      path: join(home, ".codex", "skills"),
      enabled: true,
    },
    claude: {
      path: join(home, ".claude", "skills"),
      enabled: true,
    },
    cursor: {
      path: join(home, ".cursor", "skills"),
      enabled: true,
    },
    gemini: {
      path: join(home, ".gemini", "skills"),
      enabled: false,
    },
    vscode: {
      path: join(home, ".copilot", "skills"),
      enabled: false,
    },
    windsurf: {
      path: join(home, ".windsurf", "skills"),
      enabled: false,
    },
  },
};

export default config;
