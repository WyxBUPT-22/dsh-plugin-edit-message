import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const harness = fileURLToPath(new URL('../deepseek-harness', import.meta.url))

export default defineConfig({
  esbuild: {
    // Pin the JSX injection to the aliased runtime; exact-match aliases are
    // required because vite's object-form keys are prefix-matching (a bare
    // `react` key would swallow `react/jsx-runtime`).
    jsx: 'automatic',
    jsxDev: false,
  },
  resolve: {
    // Object form is prefix-matching in this vite major, so use exact regexes.
    alias: [
      {
        find: /^@deepseek-ai\/dsh-client-ui-primitives$/,
        replacement: `${harness}/packages/client/ui-primitives/src/index.ts`,
      },
      { find: /^react$/, replacement: fileURLToPath(new URL('node_modules/react/index.js', import.meta.url)) },
      { find: /^react\/jsx-runtime$/, replacement: fileURLToPath(new URL('node_modules/react/jsx-runtime.js', import.meta.url)) },
      { find: /^react-dom$/, replacement: fileURLToPath(new URL('node_modules/react-dom/index.js', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    // Component specs opt into jsdom with the standard per-file pragma.
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
})
