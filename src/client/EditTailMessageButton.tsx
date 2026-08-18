/**
 * EditTailMessageButton: the `conversation.input.left` tool-row control that
 * loads the last user message back into the composer. Renders nothing while a
 * turn runs or when the tail user message cannot be resurrected as plain
 * text, so the tool row keeps its official chrome in every other state.
 */
import { useState, type CSSProperties, type MouseEvent } from 'react'
import { IconEditOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: loads ui-conversation's SlotMap merge so the
// `conversation.input.left` member resolves.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { NS } from './locales.ts'
import { tailUserText } from './tail-message.ts'

type Props = PropsRuntime<'conversation.input.left'> & PropsLocale<typeof NS>

/** Request composer focus. The official `InputActions.focus` is not released
 *  on all deployed versions, so prefer it when present and fall back to the
 *  composer textarea (the GUI keeps exactly one). */
function focusComposer(inputActions: Props['inputActions']): void {
  const focusable = inputActions as { focus?: () => void }
  if (typeof focusable.focus === 'function') {
    focusable.focus()
    return
  }
  document.querySelector<HTMLTextAreaElement>('textarea')?.focus()
}

export function EditTailMessageButton({ session, inputActions, t }: Props) {
  const [hovered, setHovered] = useState(false)
  const text = tailUserText(session)
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
