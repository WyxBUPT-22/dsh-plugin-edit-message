/**
 * Edit-message plugin, browser half: registers the composer tool-row control.
 * Composing this plugin out of cordis.yml removes the surface entirely.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Declaration-merge triggers: ui-conversation's SlotMap and client-locale's
// Context.locale service are ambient unless a module importing them loads.
import type {} from '@deepseek-ai/dsh-client-locale/client'
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
export function apply(ctx: ClientContext): void {
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
