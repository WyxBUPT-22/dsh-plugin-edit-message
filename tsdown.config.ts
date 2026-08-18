/**
 * Client bundle for the plugin, plus the node half the host Loader imports.
 * Mirrors the official client-bundle contract: the browser half is a closure
 * factory handed to window.__ModuleLoader__.load, with every runtime value
 * dependency external (react and ui-primitives are platform modules; all other
 * harness imports are type-only and erase).
 */
import { defineConfig } from 'tsdown'

const ID = 'dsh-plugin-edit-message'

export default defineConfig([
  {
    name: ID,
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    target: 'es2024',
    dts: false,
    clean: true,
    fixedExtension: false,
  },
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    external: [
      'react',
      'react/jsx-runtime',
      // Runtime value imports resolve from the GUI's module table: ui-primitives
      // is a platform module (the primitives' Icon/Tooltip values), and
      // runtime/client is the documented store-engine exemption. All harness
      // package imports are otherwise type-only and erase at build time.
      '@deepseek-ai/dsh-client-ui-primitives',
      '@deepseek-ai/dsh-client-runtime/client',
    ],
    // Anything not listed above inlines into the bundle (the plugin has no
    // other runtime dependencies).
    noExternal: /.*/,
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])
