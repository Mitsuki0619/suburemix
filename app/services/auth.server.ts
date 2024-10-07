import { User } from '@prisma/client/edge'
import {
  AppLoadContext,
  createCookieSessionStorage,
} from '@remix-run/cloudflare'
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'

let _authenticatedUser: Authenticator<User> | null = null

export function getAuthenticator(context: AppLoadContext): Authenticator<User> {
  if (_authenticatedUser === null) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        name: '_session',
        sameSite: 'lax',
        path: '/',
        httpOnly: true,
        secrets: [context.cloudflare.env.SESSION_SECRET],
        secure: import.meta.env.PROD,
      },
    })
    _authenticatedUser = new Authenticator<User>(sessionStorage)
    const googleStrategy = new GoogleStrategy(
      {
        clientID: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        callbackURL: context.cloudflare.env.GOOGLE_CALLBACK_BASE_URL,
      },
      async ({ profile }) => {
        const db = context.db
        const user = await db.user.findUnique({
          where: { email: profile.emails[0].value },
        })
        if (user) {
          return user
        }
        const newUser = await db.user.create({
          data: {
            id: profile.id,
            email: profile.emails[0].value || '',
            password: '',
            name: profile.displayName,
            image: profile.photos[0].value || '',
            provider: 'google',
          },
        })
        return newUser
      }
    )
    _authenticatedUser.use(googleStrategy)
  }
  return _authenticatedUser
}
