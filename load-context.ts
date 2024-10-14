import { PrismaClient } from '@prisma/client/edge'
import { type PlatformProxy } from 'wrangler'

type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare
    db: PrismaClient
  }
}
