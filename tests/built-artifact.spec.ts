// @vitest-environment jsdom
/**
 * Built-artifact contract. `lib/client.js` is the file the GUI actually loads,
 * so this spec evaluates it exactly the way the module loader does — capture
 * the `__ModuleLoader__.load` registration, build the factory's exports, and
 * drive `apply` against a fake client context — instead of trusting a syntax
 * check. (A bundle can be perfectly valid JavaScript and still register the
 * wrong thing, which is how this plugin shipped broken once already.)
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { en, NS, zh } from '../src/client/locales.ts'

interface Registration {
  id: string
  factory: (require: (specifier: string) => unknown) => {
    apply?: (ctx: unknown) => void
    inject?: readonly string[]
    [key: string]: unknown
  }
}

/** Evaluate the built bundle and return its loader registration. */
function loadBuiltBundle(): Registration {
  // jsdom's environment serves modules over a non-file URL, so the build
  // output is addressed from the project root instead of import.meta.url.
  const code = readFileSync(resolve(process.cwd(), 'lib/client.js'), 'utf8')
  let captured: Registration | undefined
  const loader = {
    load: (registration: Registration) => {
      captured = registration
    },
  }
  // The bundle is a closure factory: its only inputs are `window` (the loader
  // hand-off) and the `require` the factory receives. Nothing else is global.
  const evaluate = new Function('window', code) as (window: unknown) => void
  evaluate({ __ModuleLoader__: loader })
  if (captured === undefined) throw new Error('lib/client.js did not register through __ModuleLoader__.load')
  return captured
}

/** The platform module table the factory is handed: exactly the three
 *  specifiers the bundle requires, and no others. */
const platformRequire = (specifier: string): unknown => {
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') return primitives
  if (specifier === 'react') return React
  if (specifier === 'react/jsx-runtime') return jsxRuntime
  throw new Error(`unexpected runtime require("${specifier}")`)
}

interface SlotRegistrationOptions {
  name: string
  id: string
  order: number
  locale: string
}

/** Fake client context recording everything `apply` touches. */
function fakeContext() {
  const calls = {
    effects: [] as string[],
    dictionaries: [] as unknown[],
    injected: [] as string[],
    registrations: [] as SlotRegistrationOptions[],
    component: undefined as unknown,
  }
  const ctx = {
    effect: (callback: () => unknown, label: string) => {
      calls.effects.push(label)
      callback()
      return () => {}
    },
    locale: {
      register: (...args: unknown[]) => {
        calls.dictionaries.push(args)
        return () => {}
      },
    },
    slots: {
      inject: (key: string, callback: () => unknown) => {
        calls.injected.push(key)
        callback()
        return () => {}
      },
      register: (options: SlotRegistrationOptions, component: unknown) => {
        calls.registrations.push(options)
        calls.component = component
        return () => {}
      },
    },
  }
  return { ctx, calls }
}

/** Standard props a session-scoped composer entry receives from the renderer. */
function entryProps(over: { running?: boolean; useChat?: unknown } = {}) {
  const inputActions = {
    setDraft: vi.fn(),
    addImages: () => true,
    removeImage: () => {},
    pruneImages: () => {},
    submit: () => {},
  }
  const nodes = new Map<string, unknown>([
    ['u1', { key: 'u1', kind: 'user', data: { content: [{ type: 'text', text: 'build it' }] } }],
    ['a1', { key: 'a1', kind: 'assistant-step', data: {} }],
  ])
  const chat = { order: ['u1', 'a1'], nodes: { get: (key: string) => nodes.get(key) } }
  const useChat = <Selected,>(selector: (snapshot: unknown) => Selected): Selected => selector(chat)
  const useSession = <Selected,>(selector: (session: unknown) => Selected): Selected =>
    selector({ running: over.running ?? false })
  return {
    inputActions,
    // Standard props only: on harness 0.1.2-rc.1 the slot passes no owner
    // share, so the entry must not read one.
    props: {
      inputActions,
      sessionId: 's1',
      useChat: 'useChat' in over ? over.useChat : useChat,
      useConversation: () => undefined,
      useInput: () => undefined,
      useSession,
      useSessions: () => undefined,
      useSessionPendingInteraction: () => undefined,
      useWorkspaces: () => undefined,
      useProjection: () => undefined,
      // The framework's synthesized `t` seat for the registered namespace.
      t: (key: string) => zh[key as keyof typeof zh] ?? key,
    },
  }
}

afterEach(cleanup)

describe('lib/client.js', () => {
  it('registers under the package name with the client plugin surface', () => {
    const registration = loadBuiltBundle()
    expect(registration.id).toBe('dsh-plugin-edit-message')
    const exports = registration.factory(platformRequire)
    expect(exports.inject).toEqual(['slots', 'locale'])
    expect(typeof exports.apply).toBe('function')
    // Every value import resolves from the platform module table.
    expect(() => registration.factory(platformRequire)).not.toThrow()
  })

  it('registers the dictionaries and the tool-row entry through the client context', () => {
    const exports = loadBuiltBundle().factory(platformRequire)
    const { ctx, calls } = fakeContext()
    exports.apply?.(ctx)
    expect(calls.effects).toEqual(['dsh-plugin-edit-message: dictionaries'])
    expect(calls.dictionaries).toEqual([[NS, { zh, en }]])
    expect(calls.injected).toEqual(['conversation.input.left'])
    expect(calls.registrations).toEqual([
      { name: 'conversation.input.left', id: 'edit-tail-message', order: 100, locale: NS },
    ])
  })

  it('renders the edit control and reloads the tail user message on click', () => {
    const exports = loadBuiltBundle().factory(platformRequire)
    const { ctx, calls } = fakeContext()
    exports.apply?.(ctx)
    const Component = calls.component as (props: unknown) => unknown
    const { inputActions, props } = entryProps()
    const editor = document.createElement('div')
    editor.setAttribute('data-composer-input', '')
    editor.tabIndex = -1
    document.body.appendChild(editor)
    const view = render(Component(props) as never)
    fireEvent.click(view.getByRole('button', { name: '编辑上一条消息' }))
    expect(inputActions.setDraft).toHaveBeenCalledWith('build it')
    expect(document.activeElement).toBe(editor)
    editor.remove()
  })

  it('renders nothing while the turn runs, and survives a shell without ui-chat', () => {
    const exports = loadBuiltBundle().factory(platformRequire)
    const { ctx, calls } = fakeContext()
    exports.apply?.(ctx)
    const Component = calls.component as (props: unknown) => unknown
    const running = render(Component(entryProps({ running: true }).props) as never)
    expect(running.queryByRole('button', { name: '编辑上一条消息' })).toBeNull()
    const noChat = render(Component(entryProps({ useChat: undefined }).props) as never)
    expect(noChat.queryByRole('button', { name: '编辑上一条消息' })).toBeNull()
  })
})
