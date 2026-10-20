# Changelog

## 0.2.1 — 2026-10-20

### Fixed

- `lingqi`：把"HTTP 200 才算活"改成"任何 HTTP 响应都算监听者活着"，并返回 `status`
  （401/403 是认证态，不是死亡）。此前在 DSH Web 根路径返回 401 时必然误报 `alive:false`。
- `xiuwei`：按 `DSH_SESSION_ID` 取当前会话，不再回退到投影缓存里的"第一个键"。
  取不到时返回 `{ ok: false, reason: "current-session-not-projected", sessionId }`，
  不再把别的项目的历史会话当成当前会话。

### Added

- `LICENSE`（MIT）、`CHANGELOG.md`、`test/contract.test.mjs`、仓库/关键词/peerDependencies 元数据。
- `npm test` 契约测试：清单、bundle patch、无本机路径与密钥。

## 0.2.0 — 2026-10-19

### Added

- 桌宠显示控制：`show` / `hide` / `toggle` / `pet-status`，经本地控制端口
  （`DSH_PET_CTL_PORT`，默认 3090）指挥 Electron 桌宠壳；壳未运行时返回 `shell-not-running`。

## 0.1.5 — 2026-08-18

### Added

- 首个公开版本：`fortune` / `lingqi` / `xiuwei`。
