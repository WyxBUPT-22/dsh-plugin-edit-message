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

**English** · [中文](README.zh.md)

DSH (DeepSeek Harness) Web GUI plugin: **edit the last user message back into
the composer after stopping a turn** — no more retyping from scratch.

## Why

Sending a message, stopping the reply, and wanting to re-ask with a small
change currently means typing the whole prompt again. This plugin adds an
"Edit last message" button to the composer tool row: it restores the tail user
message text and focuses the input, ready to edit and send.

It is a **client-side plugin** — the conversation log stays append-only. Sending
the edited text appends a new turn (the original message and the interrupted
reply remain in the transcript). It never touches the host, the session log,
or the agent loop.

## Install

The plugin bundles as a `dsh.bundle` + `dsh.client` package. It works on any
DSH setup that loads third-party bundles (source `dsh web`, DSH Desktop,
custom profiles).

### From npm (published — recommended)

```sh
dsh plugin --profile web add dsh-plugin-edit-message
```

Restart the GUI (fully quit and reopen) after installing — client plugin
bundles register at startup.

**DSH Desktop users:** Desktop's `DSH_HOME` lives under
`%APPDATA%\dsh-desktop\harness`, so target that explicitly:

```bash
DSH_HOME="${APPDATA}/dsh-desktop/harness" \
dsh plugin --profile web add dsh-plugin-edit-message
```

Then quit and reopen DSH Desktop.

### From GitHub or a local checkout (unpublished builds)

```sh
# GitHub repository
dsh plugin --profile web add git+https://github.com/WyxBUPT-22/dsh-plugin-edit-message.git

# local checkout (pnpm install && pnpm run build first)
dsh plugin --profile web add /path/to/dsh-plugin-edit-message
```

### From this source checkout

The repository is self-contained: devDependencies resolve the official
harness client packages from the npm registry, so no `deepseek-harness`
checkout is needed.

```sh
pnpm install     # pulls the official client packages from npm
pnpm run build   # emits lib/index.js + lib/client.js + lib/types
dsh plugin --profile <name> add /path/to/dsh-plugin-edit-message
dsh --profile <name>
```

Uninstall with `dsh plugin --profile <name> remove dsh-plugin-edit-message`.
See `docs/user/develop/basic/publish.md` in the harness checkout for the
`dsh plugin` workflow.

## How it works

- Registers one client plugin (`dsh.client` manifest, `platform: web`) that
  contributes an entry to the official `conversation.input.left` composer
  tool-row slot (a documented multi-plugin list slot — zero official changes).
- The button renders only while the session is idle, a tail user/steering
  message exists, and that message is plain text (draft images are browser
  File-backed and cannot be resurrected from the durable log).
- On click: `inputActions.setDraft(text)` restores the text and the composer
  is focused. The plugin prefers `inputActions.focus` when the deployed
  runtime exposes it, otherwise it focuses the editable surface —
  `[data-composer-input]` on harness 0.1.2+ (a Lexical-driven
  `contenteditable`), with the legacy composer `<textarea>` as the last
  fallback.
- If you remove the plugin (`dsh plugin remove dsh-plugin-edit-message`), the
  surface disappears entirely — the tool row reverts to official chrome.

## Compatibility

The plugin tracks the harness client contract, which was reshaped in
**0.1.2-alpha**: the monolithic `@deepseek-ai/dsh-client-runtime` was split
into `dsh-client-store` + the `dsh-client-ui-*` family, and the transcript
moved off `SessionSnapshot` (whose `chat` field no longer exists) onto the Chat
target published per Conversation binding and reached through the `useChat`
standard hook.

| Plugin | Harness / DSH Desktop | Notes |
|---|---|---|
| 0.1.4+ | 0.1.2-alpha.2 or newer (DSH Desktop 0.7.x) | reads the transcript through `useChat` |
| ≤ 0.1.3 | 0.1.0-rc.x (DSH Desktop ≤ 0.5.0) | reads `session.chat`; the composer control silently does not render on 0.1.2 |

On 0.1.2+ the pre-0.1.4 builds fail their slot with
`Cannot read properties of undefined (reading 'order')` and the button never
appears.

## Differences from in-transcript editing (Codex style)

In-place replacement with a rewind of the log tail is a larger design
(log-truncation semantics, compaction checkpoints, session log format, dual
SDK projections) and is intentionally out of scope. This plugin provides the
interaction value — edit the text, resend — with zero blast radius.

## Develop

```sh
pnpm run typecheck   # tsc --noEmit (strict)
pnpm run test        # vitest (logic matrix + component behavior)
pnpm run build       # tsdown → lib/client.js + types
```

`pnpm publish` runs `prepublishOnly` (typecheck + test + build) first.

## License

MIT

## Friends

<p align="center">
    <a href="https://linux.do" alt="LINUX DO">
        <img
            src="https://img.shields.io/badge/LINUX-DO-FFB003.svg?logo=data:image/svg%2bxml;base64,DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik00Ni44Mi0uMDU1aDYuMjVxMjMuOTY5IDIuMDYyIDM4IDIxLjQyNmM1LjI1OCA3LjY3NiA4LjIxNSAxNi4xNTYgOC44NzUgMjUuNDV2Ni4yNXEtMi4wNjQgMjMuOTY4LTIxLjQzIDM4LTExLjUxMiA3Ljg4NS0yNS40NDUgOC44NzRoLTYuMjVxLTIzLjk3LTIuMDY0LTM4LjAwNC0yMS40M1EuOTcxIDY3LjA1Ni0uMDU0IDUzLjE4di02LjQ3M0MxLjM2MiAzMC43ODEgOC41MDMgMTguMTQ4IDIxLjM3IDguODE3IDI5LjA0NyAzLjU2MiAzNy41MjcuNjA0IDQ2LjgyMS0uMDU2IiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZWNlY2VjO2ZpbGwtb3BhY2l0eToxIi8+PHBhdGggZD0iTTQ3LjI2NiAyLjk1N3EyMi41My0uNjUgMzcuNzc3IDE1LjczOGE0OS43IDQ5LjcgMCAwIDEgNi44NjcgMTAuMTU3cS00MS45NjQuMjIyLTgzLjkzIDAgOS43NS0xOC42MTYgMzAuMDI0LTI0LjM4N2E2MSA2MSAwIDAgMSA5LjI2Mi0xLjUwOCIgc3R5bGU9InN0cm9rZTpub25lO2ZpbGwtcnVsZTpldmVub2RkO2ZpbGw6IzE5MTkxOTtmaWxsLW9wYWNpdHk6MSIvPjxwYXRoIGQ9Ik03Ljk4IDcwLjkyNmMyNy45NzctLjAzNSA1NS45NTQgMCA4My45My4xMTNRODMuNDI2IDg3LjQ3MyA2Ni4xMyA5NC4wODZxLTE4LjgxIDYuNTQ0LTM2LjgzMi0xLjg5OC0xNC4yMDMtNy4wOS0yMS4zMTctMjEuMjYyIiBzdHlsZT0ic3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOmV2ZW5vZGQ7ZmlsbDojZjlhZjAwO2ZpbGwtb3BhY2l0eToxIi8+PC9zdmc+" />
    </a>
</p>
<p align="center">
    <a href="https://linux.do">https://linux.do</a>
</p>
