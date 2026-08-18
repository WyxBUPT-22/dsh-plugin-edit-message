# dsh-plugin-edit-message

**DSH (DeepSeek Harness) Web GUI 插件：智能体回复被中断后，一键把最后一条用户消息文本载回输入框，改完直接发送——不用再重新打一遍。**

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

The plugin bundles as a `dsh.bundle` + `dsh.client` package. Two paths:

### From this source checkout

The repository is a pnpm workspace that links an official
`deepseek-harness` checkout (for types and runtime deps). It must be built
once (`pnpm run build` in the checkout) so `lib/types` and `lib/client.js`
exist.

```sh
# 1. install deps + link the official checkout as a workspace member
pnpm install

# 2. build the client bundle (emits lib/client.js)
pnpm run build

# 3. install the bundle into a dsh profile (see docs/user/develop/basic/publish.md)
dsh plugin --profile <name> add /path/to/dsh-plugin-edit-message
dsh --profile <name>
```

### From npm (once published)

```sh
dsh plugin --profile <name> add dsh-plugin-edit-message
```

## How it works

- Registers one client plugin (`dsh.client` manifest, `platform: web`) that
  contributes an entry to the official `conversation.input.left` composer
  tool-row slot (a documented multi-plugin list slot — zero official changes).
- The button renders only while the session is idle, a tail user/steering
  message exists, and that message is plain text (draft images are browser
  File-backed and cannot be resurrected from the durable log).
- On click: `inputActions.setDraft(text)` restores the text and the composer
  is focused. The plugin prefers `inputActions.focus` when the deployed
  runtime exposes it, otherwise falls back to the composer textarea (the GUI
  keeps exactly one).
- If you remove the plugin (`dsh plugin remove dsh-plugin-edit-message`), the
  surface disappears entirely — the tool row reverts to official chrome.

## Differences from in-transcript editing (Codex style)

In-place replacement with a rewind of the log tail is a larger design
(log-truncation semantics, compaction checkpoints, session log format, dual
SDK projections) and is intentionally out of scope. This plugin provides the
interaction value — edit the text, resend — with zero blast radius.

## Develop

```sh
pnpm run typecheck   # tsc --noEmit (strict)
pnpm run test        # vitest (logic matrix + component behavior)
pnpm run build       # tsdown → lib/client.js
```

The component test aliases `@deepseek-ai/dsh-client-ui-primitives` and `react`
to source/pinned versions so a single React instance renders; everything else
resolves through the linked harness checkout.

## License

MIT
