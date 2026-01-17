# Skills Sync

> [中文文档](./README.zh-CN.md)

Sync **Agent Skills** to **Cursor**, **Claude**, **Codex**, and more.

## Quick Start

```bash
# 1. Fetch skills from Git
skills fetch

# 2. Sync to all enabled targets
skills sync

# 3. View status
skills status
```

## Commands

| Command | Description |
|---------|-------------|
| `skills fetch` | Fetch/update all skills from Git |
| `skills fetch -- anthropics/skills` | Fetch specific source |
| `skills sync` | Sync to all enabled targets |
| `skills status` | View sync status |
| `skills list` | List all skills |
| `skills config` | Show configuration |

**Backward compatible:**
- `npm run skills:fetch` still works
- `npm run skills:sync` still works
- `npm run skills:status` still works

## Configuration

Configuration is stored in `~/.skillsync/config.json`. You can manage it via CLI commands or edit it manually.

### Add New Skills Source

```bash
skills source add owner/repo
# or
skills source add https://github.com/owner/repo
```

Manually in `config.json`:

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
- ✅ Copilot (`~/.copilot/skills/`)

### Disabled Targets

- Gemini (`~/.gemini/skills/`)
- Windsurf (`~/.windsurf/skills/`)

## Dependencies

- Node.js 18+
- Git
- tsx (auto-installed via npx)
