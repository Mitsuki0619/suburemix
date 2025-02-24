import type {
  RequestHandler,
  AppLoadContext,
  ServerBuild,
} from '@remix-run/cloudflare'

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { poweredBy } from 'hono/powered-by'
import { staticAssets } from 'remix-hono/cloudflare'
import { remix } from 'remix-hono/handler'

const app = new Hono<{
  Bindings: Env
}>()

let handler: RequestHandler | undefined

app.use(poweredBy())
// app.use(
//   '*',
//   basicAuth({
//     username: 'soobooremix',
//     password: 'asdfjkl;',
//   })
// )
app.use(
  async (c, next) => {
    if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
      return staticAssets()(c, next)
    }
    await next()
  },
  async (c, next) => {
    const db = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
    }).$extends(withAccelerate())

    if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
      const serverBuild = (await import(
        './build/server'
      )) as unknown as ServerBuild
      return remix({
        build: serverBuild,
        mode: 'production',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        getLoadContext(c) {
          return {
            cloudflare: {
              env: c.env,
            },
            db,
          }
        },
      })(c, next)
    } else {
      if (!handler) {
        // @ts-expect-error it's not typed
        // eslint-disable-next-line import/no-unresolved
        const build = await import('virtual:remix/server-build')
        const { createRequestHandler } = await import('@remix-run/cloudflare')
        handler = createRequestHandler(build, 'development')
      }
      const remixContext = {
        cloudflare: {
          env: c.env,
        },
        db,
      } as unknown as AppLoadContext
      return handler(c.req.raw, remixContext)
    }
  }
)

export default app
