# Skills Sync

> [English](./README.md)

同步 Agent Skills 到 Antigravity、Codex、Claude Code、Cursor 等工具。

## 快速开始

```bash
# 1. 从 Git 获取 skills
skills fetch

# 2. 同步到所有启用的目标工具
skills sync

# 3. 查看状态
skills status
```

## 命令列表

| 命令 | 说明 |
|------|------|
| `skills fetch` | 获取/更新所有 skills |
| `skills fetch -- anthropics/skills` | 获取指定源 |
| `skills sync` | 同步到所有启用的目标 |
| `skills status` | 查看同步状态 |
| `skills list` | 列出所有 skills |
| `skills config` | 显示当前配置 |

**向后兼容:**
- `npm run skills:fetch` 仍然可用
- `npm run skills:sync` 仍然可用
- `npm run skills:status` 仍然可用

## 配置

配置文件位置：`~/.skillsync/config.json`。你可以通过命令行管理，或手动编辑。

### 添加新的 Skills 源

```bash
skills source add owner/repo
# 或
skills source add https://github.com/owner/repo
```

手动编辑 `config.json`：

```typescript
sources: {
  // 从 GitHub 获取
  "owner/repo": {
    url: "https://github.com/owner/repo",
    subdir: "skills",  // 可选：如果 skills 在仓库的子目录
  },
  // 本地 skills（手动维护）
  "local/my-skills": {},
}
```

> ⚠️ **重要**: 如果 skills 在仓库的子目录中（如 [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) 的 skills 在 `skills/` 目录下），需要配置 `subdir: "skills"`，否则AI 工具无法识别 skills。

### 启用/禁用目标

```typescript
targets: {
  cursor: {
    path: join(home, ".cursor", "skills"),
    enabled: true,  // 改为 false 禁用
  },
}
```

## 目录结构

```
~/.skills/
├── anthropics/skills/          # 远程源
│   ├── doc-analyzer/
│   └── ...
├── vercel-labs/agent-skills/   # 远程源
│   └── ...
└── local/my-skills/            # 本地 skills
    └── my-custom-skill/
```

## 重要说明

- **远程源**: 每次 `fetch` 会**完全覆盖**本地内容
- **本地源**: `fetch` 会跳过，需要手动维护
- **添加本地 skill**: 在 `~/.skills/local/your-name/` 创建文件夹

## 默认配置

### 启用的目标

- ✅ Antigravity (`~/.gemini/antigravity/skills/`)
- ✅ Codex (`~/.codex/skills/`)
- ✅ Claude (`~/.claude/skills/`)
- ✅ Cursor (`~/.cursor/skills/`)
- ✅ Copilot (`~/.copilot/skills/`)

### 已禁用目标

- Gemini (`~/.gemini/skills/`)
- Windsurf (`~/.windsurf/skills/`)

## 依赖

- Node.js 18+
- Git
- tsx (通过 npx 自动安装)
