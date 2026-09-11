// @vitest-environment jsdom
/**
 * EditTailMessageButton behavior: render conditions and the click handler
 * (setDraft + composer focus, preferring the official focus verb when the
 * deployed runtime has it).
 */
import type * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import type { SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
// Type-only: loads the merges that declare the input.left member and the
// session-scoped standard kit the component reads.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { EditTailMessageButton } from '../src/client/EditTailMessageButton.tsx'
import { zh } from '../src/client/locales.ts'

type Props = PropsRuntime<'conversation.input.left'> & PropsLocale<'edit-message'>

const t: Props['t'] = (key) => zh[key as keyof typeof zh] ?? key

interface NodeSpec {
  key: string
  kind: string
  content?: readonly unknown[]
}

function chat(nodes: readonly NodeSpec[]): ChatSnapshot {
  const byKey = new Map(nodes.map(spec => [spec.key, {
    key: spec.key,
    kind: spec.kind,
    data: spec.content === undefined ? {} : { content: spec.content },
  }]))
  return {
    order: nodes.map(spec => spec.key),
    nodes: {
      get: (key: string) => byKey.get(key),
      values: () => [...byKey.values()],
    },
    locations: { getTurn: () => [], getStep: () => [] },
    navigation: { items: () => [] },
    timeline: { turnOrder: [], turns: new Map() },
    legacy: { nodes: [], partial: null, runningCalls: [], turnTimings: new Map(), turnEnds: new Map() },
  } as unknown as ChatSnapshot
}

/** The framework's selector hook bound to one fixed snapshot. */
function useChatOf(snapshot: ChatSnapshot | undefined): Props['useChat'] {
  return (<Selected,>(selector: (chat: ChatSnapshot) => Selected): Selected =>
    selector(snapshot as ChatSnapshot)) as Props['useChat']
}

/** The standard Session hook bound to one fixed lifecycle state. */
function useSessionOf(running: boolean): Props['useSession'] {
  return (<Selected,>(selector: (session: SessionSnapshot) => Selected): Selected =>
    selector({ running } as unknown as SessionSnapshot)) as Props['useSession']
}

function renderButton(over: {
  running?: boolean
  nodes?: readonly NodeSpec[]
  /** Omit the Chat target entirely (a shell without ui-chat). */
  noChatHook?: boolean
  inputActions?: Partial<Props['inputActions']>
} = {}) {
  const inputActions = {
    setDraft: vi.fn(),
    addImages: () => true,
    removeImage: () => {},
    pruneImages: () => {},
    submit: () => {},
    ...over.inputActions,
  } as Props['inputActions']
  const useChat = useChatOf(chat(over.nodes ?? [
    { key: 'u1', kind: 'user', content: [{ type: 'text', text: 'build it' }] },
    { key: 'a1', kind: 'assistant-step' },
  ]))
  // Standard props only. `conversation.input.left` carries no owner share on
  // harness 0.1.2-rc.1 (the responder calls renderSlot with `{}`), so every
  // value this entry reads must come from the standard kit — omitting the owner
  // props here is what stops that dependency from creeping back in.
  const view = render((
    <EditTailMessageButton
        inputActions={inputActions}
        t={t}
        sessionId={'s1' as never}
        useChat={over.noChatHook === true ? undefined as never : useChat}
        useConversation={vi.fn()}
        useInput={vi.fn()}
        useSession={useSessionOf(over.running ?? false)}
        useSessionPendingInteraction={vi.fn()}
        useSessions={vi.fn()}
        useWorkspaces={vi.fn()}
        useProjection={vi.fn()}
      />
  ) as unknown as React.JSX.Element)
  return { view, inputActions }
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('EditTailMessageButton', () => {
  it('renders for an idle session with a text tail user message', () => {
    const { view } = renderButton()
    expect(view.getByRole('button', { name: '编辑上一条消息' })).toBeTruthy()
  })

  it('renders nothing while a turn is running', () => {
    const { view } = renderButton({ running: true })
    expect(view.queryByRole('button', { name: '编辑上一条消息' })).toBeNull()
  })

  it('renders nothing when the tail user message carries images', () => {
    const { view } = renderButton({ nodes: [
      { key: 'u1', kind: 'user', content: [
        { type: 'text', text: 'look' },
        { type: 'image', attachment: { id: 'img-1' } },
      ] },
    ] })
    expect(view.queryByRole('button', { name: '编辑上一条消息' })).toBeNull()
  })

  it('renders nothing instead of crashing without the ui-chat standard hook', () => {
    const { view } = renderButton({ noChatHook: true })
    expect(view.queryByRole('button', { name: '编辑上一条消息' })).toBeNull()
  })

  it('loads the tail user message into the composer on click', () => {
    const { view, inputActions } = renderButton()
    const editor = document.createElement('div')
    editor.setAttribute('data-composer-input', '')
    editor.tabIndex = -1
    document.body.appendChild(editor)
    fireEvent.click(view.getByRole('button', { name: '编辑上一条消息' }))
    expect(inputActions.setDraft).toHaveBeenCalledWith('build it')
    expect(document.activeElement).toBe(editor)
  })

  it('falls back to the legacy textarea composer when no editable marker exists', () => {
    const { view, inputActions } = renderButton()
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    fireEvent.click(view.getByRole('button', { name: '编辑上一条消息' }))
    expect(inputActions.setDraft).toHaveBeenCalledWith('build it')
    expect(document.activeElement).toBe(textarea)
  })

  it('prefers the official focus verb over DOM focus when deployed', () => {
    const focus = vi.fn()
    // The published InputActions has no focus member: a deployed fork that
    // adds it (or a future rc) is simulated by overlaying it.
    const { view, inputActions } = renderButton({ inputActions: { focus } as never })
    fireEvent.click(view.getByRole('button', { name: '编辑上一条消息' }))
    expect(inputActions.setDraft).toHaveBeenCalledWith('build it')
    expect(focus).toHaveBeenCalledTimes(1)
  })
})
