import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    // Pin the JSX injection to the production runtime (the dev variant
    // historically bypassed resolution cleanly here).
    jsx: 'automatic',
    jsxDev: false,
  },
  test: {
    environment: 'node',
    // Component specs opt into jsdom with the standard per-file pragma.
    include: ['tests/**/*.spec.{ts,tsx}'],
    // The published ui-primitives lib imports third-party CSS (katex).
    // Route it through vite's pipeline (which stubs CSS) instead of letting
    // Node load the ESM raw, where ".css" is an unknown extension.
    server: {
      deps: {
        inline: [/@deepseek-ai\/dsh-client-ui-primitives/],
      },
    },
  },
})
