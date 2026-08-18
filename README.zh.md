# dsh-plugin-edit-message

[English](README.md) · **中文**

**DSH（DeepSeek Harness）Web GUI 插件：智能体回复被中断后，一键把最后一条用户消息文本载回输入框，改完直接发送——不用再重新打一遍。**

## 为什么做这个

发出一条消息、停止回复、想稍微改一下再重新问，目前只能把整段提示词重新打一遍。本插件在输入框工具行加了一个「编辑上一条消息」按钮：点击后把最后一条用户消息的文本原样载入输入框并聚焦，直接修改、发送即可。

它是**纯客户端插件**——会话日志保持只追加（append-only）。发送编辑后的文本会作为新的一轮**追加**（原消息和被中断的回复仍保留在记录里）。它完全不触碰 host、会话日志或 agent 循环。

## 安装

插件以 `dsh.bundle` + `dsh.client` 包形式发布，两种方式：

### 从 npm 安装（已发布）

```sh
dsh plugin --profile <profile名> add dsh-plugin-edit-message
dsh --profile <profile名>
```

### 从源码构建安装

仓库完全自包含：devDependencies 从 npm 解析官方 harness 客户端包，**不需要**任何 `deepseek-harness` checkout。

```sh
pnpm install     # 从 npm 拉取官方客户端包
pnpm run build   # 产出 lib/index.js + lib/client.js + lib/types
dsh plugin --profile <profile名> add /path/to/dsh-plugin-edit-message
dsh --profile <profile名>
```

`dsh plugin` 的完整用法参见官方 checkout 的 `docs/user/develop/basic/publish.md`。

## 工作原理

- 注册一个客户端插件（`dsh.client` manifest，`platform: web`），向官方 `conversation.input.left`（输入框工具行左侧，一个文档化的多插件 list 插槽）贡献一个条目——**官方代码零改动**。
- 按钮**仅在以下条件同时成立时显示**：会话空闲、存在最后一条用户/steering 消息、且该消息为纯文本（草稿图片是浏览器 File 引用，无法从持久化日志中复活，因此含图片的消息保持仅复制）。
- 点击行为：`inputActions.setDraft(text)` 恢复文本并聚焦输入框。当部署的运行时暴露 `inputActions.focus` 时优先使用它，否则回退到 composer 文本框（GUI 中只有这一个）。
- 卸载插件（`dsh plugin remove dsh-plugin-edit-message`）后，功能完全消失，工具行恢复官方原样。

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
