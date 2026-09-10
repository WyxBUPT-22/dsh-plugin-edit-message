/**
 * tailUserText eligibility matrix: idle-only, tail-user-message-only,
 * plain-text-only.
 */
import { describe, expect, it } from 'vitest'
import type { ChatConversationViewNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client'
import { tailUserText } from '../src/client/tail-message.ts'

interface NodeSpec {
  key: string
  kind: string
  content?: readonly unknown[]
}

/** Minimal Chat target snapshot over the node specs (order = spec order). */
function chat(nodes: readonly NodeSpec[]): ChatSnapshot {
  const byKey = new Map<string, ChatConversationViewNode>()
  for (const spec of nodes) {
    byKey.set(spec.key, {
      key: spec.key,
      kind: spec.kind,
      id: spec.key,
      target: 'chat',
      anchorSeq: 0,
      visibility: 'visible',
      data: spec.content === undefined ? {} : { content: spec.content },
    } as ChatConversationViewNode)
  }
  return {
    order: nodes.map(spec => spec.key),
    nodes: {
      get: (key: string) => byKey.get(key),
      values: () => [...byKey.values()],
    },
    locations: {
      getTurn: () => [],
      getStep: () => [],
    },
    navigation: { items: () => [] },
    timeline: { turnOrder: [], turns: new Map() },
    legacy: { nodes: [], partial: null, runningCalls: [], turnTimings: new Map(), turnEnds: new Map() },
  } as unknown as ChatSnapshot
}

const user = (key: string, content?: readonly unknown[]): NodeSpec => ({ key, kind: 'user', content })
const steering = (key: string, text: string): NodeSpec => ({
  key, kind: 'steering', content: [{ type: 'text', text }],
})
const assistant = (key: string): NodeSpec => ({ key, kind: 'assistant-step' })

describe('tailUserText', () => {
  it('returns the tail user message text of an idle session', () => {
    expect(tailUserText(false, chat([user('u1', [{ type: 'text', text: 'build it' }])]))).toBe('build it')
  })

  it('skips a trailing assistant reply and finds the last user message', () => {
    expect(tailUserText(false, chat([
      user('u1', [{ type: 'text', text: 'first' }]),
      assistant('a1'),
    ]))).toBe('first')
  })

  it('takes the newest user message when several exist', () => {
    expect(tailUserText(false, chat([
      user('u1', [{ type: 'text', text: 'old' }]),
      assistant('a1'),
      user('u2', [{ type: 'text', text: 'new' }]),
      assistant('a2'),
    ]))).toBe('new')
  })

  it('treats an admitted steering message as the tail user message', () => {
    expect(tailUserText(false, chat([
      user('u1', [{ type: 'text', text: 'first' }]),
      assistant('a1'),
      steering('s1', 'interrupt now'),
    ]))).toBe('interrupt now')
  })

  it('returns null while a turn is running', () => {
    expect(tailUserText(true, chat([
      user('u1', [{ type: 'text', text: 'build it' }]),
    ]))).toBeNull()
  })

  it('returns null before any Chat target snapshot exists', () => {
    expect(tailUserText(false, undefined)).toBeNull()
  })

  it('returns null without any user message', () => {
    expect(tailUserText(false, chat([assistant('a1')]))).toBeNull()
    expect(tailUserText(false, chat([]))).toBeNull()
  })

  it('returns null for image-carrying messages (draft images cannot be resurrected)', () => {
    expect(tailUserText(false, chat([user('u1', [
      { type: 'text', text: 'look at this' },
      { type: 'image', attachment: { id: 'img-1' } },
    ])]))).toBeNull()
  })

  it('returns null for empty-text messages', () => {
    expect(tailUserText(false, chat([user('u1', [])]))).toBeNull()
  })
})
