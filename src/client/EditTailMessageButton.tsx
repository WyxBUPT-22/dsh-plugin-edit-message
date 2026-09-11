/**
 * EditTailMessageButton: the `conversation.input.left` tool-row control that
 * loads the last user message back into the composer. Renders nothing while a
 * turn runs or when the tail user message cannot be resurrected as plain
 * text, so the tool row keeps its official chrome in every other state.
 */
import { useState, type CSSProperties, type MouseEvent } from 'react'
import { IconEditOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only merges. ui-conversation declares the `conversation.input.left`
// SlotMap member and the input standard kit; ui-session and ui-chat merge the
// session-scoped hooks (`sessionId`, `useSession`, `useChat`) this entry reads.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type { NS } from './locales.ts'
import { tailUserText } from './tail-message.ts'

type Props = PropsRuntime<'conversation.input.left'> & PropsLocale<typeof NS>

/** Request composer focus. The official `InputActions.focus` is not released
 *  on all deployed versions, so prefer it when present and fall back to the
 *  editable surface itself.
 *
 *  Harness 0.1.2 replaced the composer `<textarea>` with a Lexical-driven
 *  `contenteditable` host marked `[data-composer-input]`; the old textarea
 *  probe finds nothing there (or, worse, focuses an unrelated textarea
 *  elsewhere in the shell), so the marker is the primary fallback and the
 *  textarea stays only for older deployments. */
function focusComposer(inputActions: Props['inputActions']): void {
  const focusable = inputActions as { focus?: () => void }
  if (typeof focusable.focus === 'function') {
    focusable.focus()
    return
  }
  const editable = document.querySelector('[data-composer-input]')
  if (editable instanceof HTMLElement) {
    editable.focus()
    return
  }
  document.querySelector<HTMLTextAreaElement>('textarea')?.focus()
}

/** Defer absence of the standard Chat hook to a hook-free outer shell: the
 *  `useChat` seat is supplied by ui-chat, and a composer tool row can render
 *  without it. Declining keeps the rest of the tool row alive instead of
 *  crashing the entry. */
export function EditTailMessageButton(props: Props) {
  if (props.useChat === undefined) return null
  return <TailEditButton {...props} useChat={props.useChat} />
}

function TailEditButton({ useSession, useChat, inputActions, t }: Props) {
  const [hovered, setHovered] = useState(false)
  // Lifecycle comes from the standard Session hook, never from the slot's owner
  // props. Harness 0.1.2-alpha passed `InputZone` ({session, input}) here, but
  // 0.1.2-rc.1 stopped: the responder now calls
  // renderSlot("conversation.input.left", {}) and the owner share is gone.
  // `useSession` is contributed by ui-session for every session-scoped slot on
  // every 0.1.2 build, so reading it keeps this entry working across the line.
  const running = useSession((session) => session.running)
  const text = useChat((chat) => tailUserText(running, chat))
  if (text === null) return null
  const onEdit = (event: MouseEvent): void => {
    event.preventDefault()
    inputActions.setDraft(text)
    focusComposer(inputActions)
  }
  const style: CSSProperties = {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    borderRadius: 6,
    background: hovered ? 'rgba(128, 128, 128, 0.18)' : 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    flex: 'none',
  }
  return (
    <Tooltip label={t('edit.tail')} side="top">
      <button
        type="button"
        style={style}
        aria-label={t('edit.tail')}
        onMouseEnter={() => { setHovered(true) }}
        onMouseLeave={() => { setHovered(false) }}
        onMouseDown={(event) => { event.preventDefault() }}
        onClick={onEdit}
      >
        <IconEditOutline16 />
      </button>
    </Tooltip>
  )
}
