# @sunwindy/dsh-tool-baixiaochun

白小纯修仙工具插件 —— 把灵溪宗修士白小纯封装为 DeepSeek Harness (DSH) 可用工具。

## 功能

| 工具 | 说明 | 数据来源 |
|------|------|---------|
| `baixiaochun fortune` | 今日灵签（上上签→下签，含动作） | 内置箴言（脱敏） |
| `baixiaochun lingqi` | 灵气检测（DSH 服务是否运行） | 本地 3080 端口探测 |
| `baixiaochun xiuwei` | 修为汇报（会话轮次/步数/token/缓存命中率） | 本地 session_projcache.json |

## 安装

```bash
# 在 DSH 的 web profile 下安装（用 pnpm，dsh plugin 命令会转发）
cd ~/.dsh/profiles/web
pnpm add <本插件路径或 npm 包名>

# 或通过 dsh 命令
dsh plugin --profile web add <包路径>
```

安装后在 `cordis.patch.yml` 或 profile 配置中启用插件。

## 使用（在 DSH 会话中）

```
"帮我抽个今日灵签" → 调用 baixiaochun { cmd: 'fortune' }
"检测下灵气"       → 调用 baixiaochun { cmd: 'lingqi' }
"汇报下修为"       → 调用 baixiaochun { cmd: 'xiuwei' }
```

## 脱敏声明

本插件**不包含任何个人真实信息**：
- 灵签箴言为通用内容
- 灵气/修为数据只读本地统计（不收集、不发送）
- 无网络请求（除 DSH 自身服务）
- 可安全开源、可被任何人部署使用

## 与桌宠的关系

本插件 = 白小纯的"harness 能力层"（任何会话可调用）
桌宠（desktop-shell/pet.html + chat.html）= 白小纯的"可视化表现层"
两者共享同一个"灵魂"（人设/修仙能力），插件负责能力，桌宠负责形象。

## 开发说明

- 基于 `@deepseek-ai/dsh-tools` 的 `defineTool` 模式（参照 `dsh-tool-todo`）
- 纯 Node 标准库实现（http/fs/os/path），零额外依赖
- MIT License

---

*@sunwindy/dsh-tool-baixiaochun v0.1.0 · 2026-08-16 · 脱敏开源版*
