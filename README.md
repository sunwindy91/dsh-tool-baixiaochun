# @sunwindy/dsh-tool-baixiaochun

白小纯修仙工具插件 —— 把灵溪宗修士白小纯封装为 DeepSeek Harness (DSH) 可用工具。

![dsh-plugin](https://img.shields.io/badge/dsh--plugin-MIT-2f6f4e)

## 功能

| 工具 | 说明 | 数据来源 |
|------|------|---------|
| `baixiaochun fortune` | 今日灵签（上上签→下签，含动作） | 内置箴言（脱敏） |
| `baixiaochun lingqi` | 灵气检测（DSH 是否在运行；返回 `alive` + `status`） | 本地 HTTP 探测 |
| `baixiaochun xiuwei` | 修为汇报（当前会话轮次/步数/token/缓存） | 本地会话统计 |
| `baixiaochun show` | 调出白小纯桌宠 | 本地控制端口（桌宠壳） |
| `baixiaochun hide` | 关闭白小纯桌宠 | 本地控制端口（桌宠壳） |
| `baixiaochun toggle` | 切换桌宠显示 | 本地控制端口（桌宠壳） |
| `baixiaochun pet-status` | 查询桌宠显示状态 | 本地控制端口（桌宠壳） |

### 语义说明（0.2.1）

- `lingqi`：**任何 HTTP 响应都说明监听者活着**，`alive:true`，`status` 给出状态码。
  DSH Web 根路径对匿名请求返回 `401`，这是认证态而不是死亡；旧版"仅 200 算活"会误报。
- `xiuwei`：只按 `DSH_SESSION_ID` 取当前会话，返回 `sessionId`；
  当前会话尚未写入投影缓存时返回 `{ ok:false, reason:"current-session-not-projected" }`，
  不会拿另一个项目的历史会话冒充。

## 安装

### 从 GitHub 安装（推荐）

```bash
dsh plugin --profile web add github:sunwindy91/dsh-tool-baixiaochun
```

或固定版本：

```bash
dsh plugin --profile web add git+https://github.com/sunwindy91/dsh-tool-baixiaochun.git#v0.2.1
```

### 本地链接

```bash
dsh plugin --profile web add link:<本目录绝对路径>
```

安装后在 profile 的 `dsh.profile.bundles` 中启用 `@sunwindy/dsh-tool-baixiaochun`
（`plugin_manager` 的 `install_bundle` 会完成这一步，无需手改文件）。

## 使用（在 DSH 会话中）

```
"帮我抽个今日灵签" → 调用 baixiaochun { cmd: 'fortune' }
"检测下灵气"       → 调用 baixiaochun { cmd: 'lingqi' }
"汇报下修为"       → 调用 baixiaochun { cmd: 'xiuwei' }
"把白小纯叫出来"   → 调用 baixiaochun { cmd: 'show' }
"把白小纯收起来"   → 调用 baixiaochun { cmd: 'hide' }
"白小纯在吗"       → 调用 baixiaochun { cmd: 'pet-status' }
```

## 桌宠显示控制

`show` / `hide` / `toggle` / `pet-status` 通过**本地控制端口**（默认 `127.0.0.1:3090`，
可用环境变量 `DSH_PET_CTL_PORT` 修改）指挥 Electron 桌宠壳显示/隐藏白小纯窗口。

- 需要**桌面壳**（Electron 应用）正在运行——桌宠窗口由壳创建；
- 若直接用浏览器打开 DSH（未启动桌面壳），返回 `shell-not-running` 提示，不会报错；
- 其他操作方式：托盘菜单「白小纯桌宠」、全局快捷键 `Ctrl+Alt+B`、右键菜单。

## 安全与脱敏

- 灵签箴言为通用内容；灵气/修为数据只读本地统计，不收集、不发送；
- 除 DSH 自身服务与本地桌宠控制端口外，无网络请求；
- 不包含 API key、token、个人路径；`npm test` 会扫描 `C:\Users`、`23017` 与 `sk-` 模式；
- 可安全开源、可被任何人部署使用。

## 开发与测试

```bash
node --check lib/index.js
npm test        # 4 项契约测试：清单 / patch / 脱敏 / 工具面
```

- 基于 `@deepseek-ai/dsh-tools` 的 `defineTool` 模式（参照 `dsh-tool-todo`）；
- 纯 Node 标准库（http/fs/os/path），零运行时依赖；
- MIT License。

## 链接

- 仓库：https://github.com/sunwindy91/dsh-tool-baixiaochun
- 问题：https://github.com/sunwindy91/dsh-tool-baixiaochun/issues
- 生态话题：`dsh-plugin`

---

*@sunwindy/dsh-tool-baixiaochun v0.2.1 · 2026-10-20 · MIT*
