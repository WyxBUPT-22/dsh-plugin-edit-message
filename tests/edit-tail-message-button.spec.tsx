// @vitest-environment jsdom
/**
 * EditTailMessageButton behavior: render conditions and the click handler
 * (setDraft + composer focus, preferring the official focus verb when the
 * deployed runtime has it).
 */
import type * as React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: loads ui-conversation's SlotMap merge for the input.left member.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
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

function chat(nodes: readonly NodeSpec[]) {
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
      replace: () => {},
    },
    locations: { getTurn: () => [], getStep: () => [], replace: () => {} },
    timeline: { turnOrder: [], turns: new Map() },
    legacy: { nodes: [], partial: null, runningCalls: [], turnTimings: new Map(), turnEnds: new Map() },
  }
}

function renderButton(over: {
  running?: boolean
  nodes?: readonly NodeSpec[]
  inputActions?: Partial<Props['inputActions']>
} = {}) {
  const session = {
    running: over.running ?? false,
    chat: chat(over.nodes ?? [
      { key: 'u1', kind: 'user', content: [{ type: 'text', text: 'build it' }] },
      { key: 'a1', kind: 'assistant-step' },
    ]),
  } as unknown as ConversationSnapshot
  const inputActions = {
    setDraft: vi.fn(),
    addImages: () => true,
    removeImage: () => {},
    pruneImages: () => {},
    submit: () => {},
    ...over.inputActions,
  } as Props['inputActions']
  const view = render((
    <EditTailMessageButton
        session={session}
        input={{} as never}
        inputActions={inputActions}
        t={t}
        sessionId={'s1' as never}
        useInput={vi.fn()}
        useSession={vi.fn()}
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

  it('loads the tail user message into the composer on click', () => {
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
