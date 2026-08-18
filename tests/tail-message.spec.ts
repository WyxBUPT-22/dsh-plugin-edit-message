/**
 * tailUserText eligibility matrix: idle-only, tail-user-message-only,
 * plain-text-only.
 */
import { describe, expect, it } from 'vitest'
import type {
  ChatConversationViewNode, ConversationSnapshot,
} from '@deepseek-ai/dsh-client-runtime/client'
import { tailUserText } from '../src/client/tail-message.ts'

interface NodeSpec {
  key: string
  kind: string
  content?: readonly unknown[]
}

/** Minimal chat snapshot over the node specs (order = spec order). */
function snapshot(nodes: readonly NodeSpec[], running = false): ConversationSnapshot {
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
  const order = nodes.map(spec => spec.key)
  return {
    running,
    chat: {
      order,
      nodes: {
        get: (key: string) => byKey.get(key),
        values: () => [...byKey.values()],
        replace: () => {},
      },
      locations: {
        getTurn: () => [],
        getStep: () => [],
        replace: () => {},
      },
      timeline: { turnOrder: [], turns: new Map() },
      legacy: { nodes: [], partial: null, runningCalls: [], turnTimings: new Map(), turnEnds: new Map() },
    },
  } as unknown as ConversationSnapshot
}

const user = (key: string, content?: readonly unknown[]): NodeSpec => ({ key, kind: 'user', content })
const steering = (key: string, text: string): NodeSpec => ({
  key, kind: 'steering', content: [{ type: 'text', text }],
})
const assistant = (key: string): NodeSpec => ({ key, kind: 'assistant-step' })

describe('tailUserText', () => {
  it('returns the tail user message text of an idle session', () => {
    expect(tailUserText(snapshot([user('u1', [{ type: 'text', text: 'build it' }])]))).toBe('build it')
  })

  it('skips a trailing assistant reply and finds the last user message', () => {
    expect(tailUserText(snapshot([
      user('u1', [{ type: 'text', text: 'first' }]),
      assistant('a1'),
    ]))).toBe('first')
  })

  it('takes the newest user message when several exist', () => {
    expect(tailUserText(snapshot([
      user('u1', [{ type: 'text', text: 'old' }]),
      assistant('a1'),
      user('u2', [{ type: 'text', text: 'new' }]),
      assistant('a2'),
    ]))).toBe('new')
  })

  it('treats an admitted steering message as the tail user message', () => {
    expect(tailUserText(snapshot([
      user('u1', [{ type: 'text', text: 'first' }]),
      assistant('a1'),
      steering('s1', 'interrupt now'),
    ]))).toBe('interrupt now')
  })

  it('returns null while a turn is running', () => {
    expect(tailUserText(snapshot([
      user('u1', [{ type: 'text', text: 'build it' }]),
    ], true))).toBeNull()
  })

  it('returns null without any user message', () => {
    expect(tailUserText(snapshot([assistant('a1')]))).toBeNull()
    expect(tailUserText(snapshot([]))).toBeNull()
  })

  it('returns null for image-carrying messages (draft images cannot be resurrected)', () => {
    expect(tailUserText(snapshot([user('u1', [
      { type: 'text', text: 'look at this' },
      { type: 'image', attachment: { id: 'img-1' } },
    ])]))).toBeNull()
  })

  it('returns null for empty-text messages', () => {
    expect(tailUserText(snapshot([user('u1', [])]))).toBeNull()
  })
})
