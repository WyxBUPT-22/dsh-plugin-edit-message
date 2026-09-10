/**
 * Pure edit-eligibility logic: which user message the composer edit action
 * addresses, and whether it can be resurrected as plain text.
 *
 * Harness 0.1.2 moved the transcript out of `SessionSnapshot` (which no longer
 * carries a `chat` field) and into the Chat target published per Conversation
 * binding, reached through the `useChat` standard hook. The node records
 * themselves are unchanged, so this module still reads the same
 * `order` / `nodes` / `data.content` shape — only the snapshot source moved.
 */
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'

/** Payload shape shared by the `user` and `steering` Chat node kinds. */
interface HumanMessageData {
  readonly content?: readonly unknown[]
}

/** Text blocks of a user/steering node, or null when the message cannot be
 *  resurrected (session running, no user message, image/unknown blocks). */
export function tailUserText(running: boolean, chat: ChatSnapshot | undefined): string | null {
  if (running || chat === undefined) return null
  const order = chat.order
  for (let index = order.length - 1; index >= 0; index--) {
    const key = order[index]
    if (key === undefined) continue
    const node = chat.nodes.get(key)
    if (node === undefined || (node.kind !== 'user' && node.kind !== 'steering')) continue
    const content = (node.data as HumanMessageData).content ?? []
    let text = ''
    for (const block of content) {
      const b = block as { type?: string; text?: string }
      if (b.type === 'text' && typeof b.text === 'string') {
        text += b.text
      } else {
        // Draft images are browser File-backed and cannot be resurrected from
        // the durable log; non-text blocks make the message copy-only.
        return null
      }
    }
    return text === '' ? null : text
  }
  return null
}
