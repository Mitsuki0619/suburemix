import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import babel from 'vite-plugin-babel'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getLoadContext } from './load-context'
import { ReactCompilerConfig } from './react-compiler.config'

export default defineConfig({
  optimizeDeps: { exclude: ['@mapbox/node-pre-gyp'] },
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    remix({
      ignoredRouteFiles: ['**/*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes)
      },
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ['@babel/preset-typescript'],
        plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
      },
    }),
  ],
})
