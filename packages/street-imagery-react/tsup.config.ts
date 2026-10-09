import { readFile } from 'node:fs/promises'
import { transformAsync } from '@babel/core'
import { defineConfig, type Options } from 'tsup'

/**
 * Runs the React Compiler over the sources before esbuild, so the published components and hooks
 * are memoized like in an app that compiles them itself. Babel only parses TypeScript and JSX
 * here; esbuild still turns them into JavaScript.
 */
const reactCompiler: NonNullable<Options['esbuildPlugins']>[number] = {
  name: 'react-compiler',
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async ({ path }) => {
      if (path.includes('/node_modules/')) return null
      const result = await transformAsync(await readFile(path, 'utf8'), {
        filename: path,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ['typescript', 'jsx'] },
        plugins: ['babel-plugin-react-compiler'],
      })
      if (result?.code == null) return null
      return { contents: result.code, loader: path.endsWith('x') ? 'tsx' : 'ts' }
    })
  },
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'photo-details': 'src/photo-details/index.ts',
    'viewer-panels': 'src/viewer-panels/index.ts',
    'panoramax-web-viewer': 'src/panoramax-web-viewer/index.ts',
  },
  format: ['esm'],
  dts: false,
  clean: true,
  treeshake: true,
  sourcemap: false,
  splitting: true,
  external: [
    /@osm-editor-kit\//,
    /^@tanstack\//,
    /^@panoramax\//,
    'mapillary-js',
    'maplibre-gl',
    'react',
    'react-dom',
    'react-map-gl',
    'zustand',
  ],
  esbuildPlugins: [reactCompiler],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
