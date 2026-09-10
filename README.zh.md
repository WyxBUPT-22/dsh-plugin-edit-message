# dsh-plugin-edit-message

<p align="center">
    <a href="https://www.npmjs.com/package/dsh-plugin-edit-message" alt="npm version">
        <img src="https://img.shields.io/npm/v/dsh-plugin-edit-message" />
    </a>
    <a href="https://www.npmjs.com/package/dsh-plugin-edit-message" alt="npm license">
        <img src="https://img.shields.io/npm/l/dsh-plugin-edit-message" />
    </a>
</p>
<p align="center">
    <a href="https://linux.do" alt="LINUX DO">
        <img
            src="https://img.shields.io/badge/LINUX-DO-FFB003.svg?logo=data:image/svg%2bxml;base64,DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik00Ni44Mi0uMDU1aDYuMjVxMjMuOTY5IDIuMDYyIDM4IDIxLjQyNmM1LjI1OCA3LjY3NiA4LjIxNSAxNi4xNTYgOC44NzUgMjUuNDV2Ni4yNXEtMi4wNjQgMjMuOTY4LTIxLjQzIDM4LTExLjUxMiA3Ljg4NS0yNS40NDUgOC44NzRoLTYuMjVxLTIzLjk3LTIuMDY0LTM4LjAwNC0yMS40M1EuOTcxIDY3LjA1Ni0uMDU0IDUzLjE4di02LjQ3M0MxLjM2MiAzMC43ODEgOC41MDMgMTguMTQ4IDIxLjM3IDguODE3IDI5LjA0NyAzLjU2MiAzNy41MjcuNjA0IDQ2LjgyMS0uMDU2IiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZWNlY2VjO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZD0iTTQ3LjI2NiAyLjk1N3EyMi41My0uNjUgMzcuNzc3IDE1LjczOGE0OS43IDQ5LjcgMCAwIDEgNi44NjcgMTAuMTU3cS00MS45NjQuMjIyLTgzLjkzIDAgOS43NS0xOC42MTYgMzAuMDI0LTI0LjM4N2E2MSA2MSAwIDAgMSA5LjI2Mi0xLjUwOCIgc3R5bGU9InN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzE5MTkxOTtmaWxsLW9wYWNpdHk6MSIvPjxwYXRoIGQ9Ik03Ljk4IDcwLjkyNmMyNy45NzctLjAzNSA1NS45NTQgMCA4My45My4xMTNRODMuNDI2IDg3LjQ3MyA2Ni4xMyA5NC4wODZxLTE4LjgxIDYuNTQ0LTM2LjgzMi0xLjg5OC0xNC4yMDMtNy4wOS0yMS4zMTctMjEuMjYyIiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZjlhZjAwO2ZpbGwtb3BhY2l0eToxIi8+PC9zdmc+" />
    </a>
</p>

[English](README.md) · **中文**

**DSH（DeepSeek Harness）Web GUI 插件：智能体回复被中断后，一键把最后一条用户消息文本载回输入框，改完直接发送——不用再重新打一遍。**

## 为什么做这个

发出一条消息、停止回复、想稍微改一下再重新问，目前只能把整段提示词重新打一遍。本插件在输入框工具行加了一个「编辑上一条消息」按钮：点击后把最后一条用户消息的文本原样载入输入框并聚焦，直接修改、发送即可。

它是**纯客户端插件**——会话日志保持只追加（append-only）。发送编辑后的文本会作为新的一轮**追加**（原消息和被中断的回复仍保留在记录里）。它完全不触碰 host、会话日志或 agent 循环。

## 安装

插件以 `dsh.bundle` + `dsh.client` 包形式发布，适用于任何能加载第三方 bundle 的 DSH 环境（源码 `dsh web`、DSH Desktop、自定义 profile）。

### 从 npm 安装（已发布，推荐）

```sh
dsh plugin --profile web add dsh-plugin-edit-message
```

装完后**完全退出并重新打开 GUI**——客户端插件 bundle 在启动时注册。

**DSH Desktop 用户**：Desktop 的 `DSH_HOME` 位于 `%APPDATA%\dsh-desktop\harness`，需显式指定：

```bash
DSH_HOME="${APPDATA}/dsh-desktop/harness" \
dsh plugin --profile web add dsh-plugin-edit-message
```

然后退出重开 DSH Desktop。

### 从 GitHub 或本地源码安装（未发布版本）

```sh
# GitHub 仓库
dsh plugin --profile web add git+https://github.com/WyxBUPT-22/dsh-plugin-edit-message.git

# 本地 checkout（先 pnpm install && pnpm run build）
dsh plugin --profile web add /path/to/dsh-plugin-edit-message
```

### 从源码构建安装

仓库完全自包含：devDependencies 从 npm 解析官方 harness 客户端包，**不需要**任何 `deepseek-harness` checkout。

```sh
pnpm install     # 从 npm 拉取官方客户端包
pnpm run build   # 产出 lib/index.js + lib/client.js + lib/types
dsh plugin --profile <profile名> add /path/to/dsh-plugin-edit-message
dsh --profile <profile名>
```

卸载：`dsh plugin --profile <profile名> remove dsh-plugin-edit-message`。`dsh plugin` 的完整用法参见官方 checkout 的 `docs/user/develop/basic/publish.md`。

## 工作原理

- 注册一个客户端插件（`dsh.client` manifest，`platform: web`），向官方 `conversation.input.left`（输入框工具行左侧，一个文档化的多插件 list 插槽）贡献一个条目——**官方代码零改动**。
- 按钮**仅在以下条件同时成立时显示**：会话空闲、存在最后一条用户/steering 消息、且该消息为纯文本（草稿图片是浏览器 File 引用，无法从持久化日志中复活，因此含图片的消息保持仅复制）。
- 点击行为：`inputActions.setDraft(text)` 恢复文本并聚焦输入框。当部署的运行时暴露 `inputActions.focus` 时优先使用它，否则聚焦可编辑表面——harness 0.1.2+ 上是 `[data-composer-input]`（Lexical 驱动的 `contenteditable`），旧版 composer `<textarea>` 作为最后回退。
- 卸载插件（`dsh plugin remove dsh-plugin-edit-message`）后，功能完全消失，工具行恢复官方原样。

## 兼容性

本插件跟随 harness 客户端契约，而该契约在 **0.1.2-alpha** 被重构：单体包
`@deepseek-ai/dsh-client-runtime` 被拆成 `dsh-client-store` 加 `dsh-client-ui-*`
一族，同时会话记录从 `SessionSnapshot`（其 `chat` 字段已不存在）搬到了按
Conversation binding 发布的 Chat target 上，需经 `useChat` 标准 hook 读取。

| 插件版本 | Harness / DSH Desktop | 说明 |
|---|---|---|
| 0.1.4+ | 0.1.2-alpha.2 及以后（DSH Desktop 0.7.x） | 经 `useChat` 读取会话记录 |
| ≤ 0.1.3 | 0.1.0-rc.x（DSH Desktop ≤ 0.5.0） | 读 `session.chat`；在 0.1.2 上按钮静默不显示 |

在 0.1.2+ 上，0.1.4 之前的版本会让所在插槽崩溃：
`Cannot read properties of undefined (reading 'order')`，按钮永远不出现。

## 与"原处替换编辑"（Codex 风格）的差异

在原处替换并截断日志尾部属于更大的设计（日志截断语义、压缩检查点、会话日志格式、双 SDK 投影），有意不在此范围。本插件提供交互价值——编辑文本、重新发送——且零副作用。

## 开发

```sh
pnpm run typecheck   # tsc --noEmit（strict）
pnpm run test        # vitest（逻辑矩阵 + 组件行为）
pnpm run build       # tsdown → lib/client.js + 类型声明
```

`pnpm publish` 会先自动执行 `prepublishOnly`（typecheck + test + build）。

## License

MIT

## 友情链接

<p align="center">
    <a href="https://linux.do" alt="LINUX DO">
        <img
            src="https://img.shields.io/badge/LINUX-DO-FFB003.svg?logo=data:image/svg%2bxml;base64,DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik00Ni44Mi0uMDU1aDYuMjVxMjMuOTY5IDIuMDYyIDM4IDIxLjQyNmM1LjI1OCA3LjY3NiA4LjIxNSAxNi4xNTYgOC44NzUgMjUuNDV2Ni4yNXEtMi4wNjQgMjMuOTY4LTIxLjQzIDM4LTExLjUxMiA3Ljg4NS0yNS40NDUgOC44NzRoLTYuMjVxLTIzLjk3LTIuMDY0LTM4LjAwNC0yMS40M1EuOTcxIDY3LjA1Ni0uMDU0IDUzLjE4di02LjQ3M0MxLjM2MiAzMC43ODEgOC41MDMgMTguMTQ4IDIxLjM3IDguODE3IDI5LjA0NyAzLjU2MiAzNy41MjcuNjA0IDQ2LjgyMS0uMDU2IiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZWNlY2VjO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZD0iTTQ3LjI2NiAyLjk1N3EyMi41My0uNjUgMzcuNzc3IDE1LjczOGE0OS43IDQ5LjcgMCAwIDEgNi44NjcgMTAuMTU3cS00MS45NjQuMjIyLTgzLjkzIDAgOS43NS0xOC42MTYgMzAuMDI0LTI0LjM4N2E2MSA2MSAwIDAgMSA5LjI2Mi0xLjUwOCIgc3R5bGU9InN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzE5MTkxOTtmaWxsLW9wYWNpdHk6MSIvPjxwYXRoIGQ9Ik03Ljk4IDcwLjkyNmMyNy45NzctLjAzNSA1NS45NTQgMCA4My45My4xMTNRODMuNDI2IDg3LjQ3MyA2Ni4xMyA5NC4wODZxLTE4LjgxIDYuNTQ0LTM2LjgzMi0xLjg5OC0xNC4yMDMtNy4wOS0yMS4zMTctMjEuMjYyIiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZjlhZjAwO2ZpbGwtb3BhY2l0eToxIi8+PC9zdmc+" />
    </a>
</p>
<p align="center">
    <a href="https://linux.do">https://linux.do</a>
</p>
