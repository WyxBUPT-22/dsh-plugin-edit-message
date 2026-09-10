/**
 * Edit-message plugin, browser half: registers the composer tool-row control.
 * Composing this plugin out of cordis.yml removes the surface entirely.
 */
import type { Context } from '@deepseek-ai/cordis'
// Declaration-merge triggers. Each of these merges is ambient only while a
// module importing it is loaded: ui-renderer declares the `ctx.slots` service,
// client-locale declares `ctx.locale` plus `LocaleNamespaceMap`, ui-conversation
// declares the `conversation.input.left` SlotMap member with the input standard
// kit, and ui-session / ui-chat merge the session-scoped hooks the entry reads.
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { EditTailMessageButton } from './EditTailMessageButton.tsx'
import { en, NS, zh, type EditMessageKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Edit-message tool-row copy. */
    'edit-message': EditMessageKey
  }
}

/** Required services: the slot registry and the locale dictionaries. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: register the dictionaries and the tool-row entry.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-plugin-edit-message: dictionaries')
  ctx.slots.inject(
    'conversation.input.left',
    () => ctx.slots.register({
      name: 'conversation.input.left',
      id: 'edit-tail-message',
      order: 100,
      locale: NS,
    }, EditTailMessageButton),
  )
}
