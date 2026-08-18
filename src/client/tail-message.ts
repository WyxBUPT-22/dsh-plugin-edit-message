/**
 * Pure edit-eligibility logic: which user message the composer edit action
 * addresses, and whether it can be resurrected as plain text.
 */
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client'

/** Text blocks of a user/steering node, or null when the message cannot be
 *  resurrected (session running, no user message, image/unknown blocks). */
export function tailUserText(session: ConversationSnapshot): string | null {
  if (session.running) return null
  const order = session.chat.order
  for (let index = order.length - 1; index >= 0; index--) {
    const key = order[index]
    if (key === undefined) continue
    const node = session.chat.nodes.get(key)
    if (node === undefined || (node.kind !== 'user' && node.kind !== 'steering')) continue
    const content = (node.data as { readonly content?: readonly unknown[] }).content ?? []
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
