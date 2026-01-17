# Skills Sync

> [中文文档](./README.zh-CN.md)

Sync AI skills to Antigravity, Codex, Claude Code, Cursor and other tools.

## Quick Start

```bash
# 1. Fetch skills from Git
npm run skills fetch

# 2. Sync to all enabled targets
npm run skills sync

# 3. View status
npm run skills status
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run skills fetch` | Fetch/update all skills from Git |
| `npm run skills fetch -- anthropics/skills` | Fetch specific source |
| `npm run skills sync` | Sync to all enabled targets |
| `npm run skills status` | View sync status |
| `npm run skills ls` | List all skills |
| `npm run skills config` | Show configuration |

**Backward compatible:**
- `npm run skills:fetch` still works
- `npm run skills:sync` still works
- `npm run skills:status` still works

## Configuration

Edit `skills-sync/config.ts` to modify settings:

### Add New Skills Source

```typescript
sources: {
  // From GitHub
  "owner/repo": {
    url: "https://github.com/owner/repo",
    subdir: "skills",  // Optional: if skills are in subdirectory
  },
  // Local skills (manually maintained)
  "local/my-skills": {},
}
```

> ⚠️ **Important**: If skills are in a subdirectory of the repository (e.g., `vercel-labs/agent-skills` has skills in `skills/` directory), you **must** configure `subdir: "skills"`, otherwise the synced content will be incorrect and AI tools won't recognize the skills.

### Enable/Disable Targets

```typescript
targets: {
  cursor: {
    path: join(home, ".cursor", "skills"),
    enabled: true,  // Set to false to disable
  },
}
```

## Directory Structure

```
~/.skills/
├── anthropics/skills/          # Remote source
│   ├── doc-analyzer/
│   └── ...
├── vercel-labs/agent-skills/   # Remote source
│   └── ...
└── local/my-skills/            # Local skills
    └── my-custom-skill/
```

## Important Notes

- **Remote sources**: Each `fetch` will **completely overwrite** local content
- **Local sources**: `fetch` will skip them, must be maintained manually
- **Add local skill**: Create folder in `~/.skills/local/your-name/`

## Default Configuration

### Enabled Targets

- ✅ Antigravity (`~/.gemini/antigravity/skills/`)
- ✅ Codex (`~/.codex/skills/`)
- ✅ Claude (`~/.claude/skills/`)
- ✅ Cursor (`~/.cursor/skills/`)

### Disabled Targets

- Gemini (`~/.gemini/skills/`)
- VS Code / Copilot (`~/.copilot/skills/`)
- Windsurf (`~/.windsurf/skills/`)

## Dependencies

- Node.js 18+
- Git
- tsx (auto-installed via npx)
