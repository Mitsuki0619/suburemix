import { User } from '@prisma/client/edge'
import {
  AppLoadContext,
  createCookieSessionStorage,
} from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleStrategy } from 'remix-auth-google'

type UserForClient = Omit<
  User,
  'password' | 'createdAt' | 'updatedAt' | 'provider'
>

let _authenticatedUser: Authenticator<UserForClient> | null = null

export function getAuthenticator(
  context: AppLoadContext
): Authenticator<UserForClient> {
  if (_authenticatedUser === null) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        name: '_session',
        sameSite: 'lax',
        path: '/',
        httpOnly: true,
        secrets: [context.cloudflare.env.SESSION_SECRET],
        secure: true,
      },
    })
    _authenticatedUser = new Authenticator<UserForClient>(sessionStorage)

    const formStrategy = new FormStrategy(async ({ form }) => {
      const email = form.get('email')
      const password = form.get('password')
      const user = await context.db.user.findUnique({
        where: { email: String(email) },
      })

      if (!user) {
        throw new AuthorizationError()
      }

      const passwordMatch = await bcrypt.compare(
        String(password),
        user.password
      )
      if (!passwordMatch) {
        throw new AuthorizationError()
      }
      const {
        password: _1,
        createdAt: _2,
        updatedAt: _3,
        provider: _4,
        ...userForClient
      } = user
      return userForClient
    })
    _authenticatedUser.use(formStrategy, 'user-pass')

    const googleStrategy = new GoogleStrategy(
      {
        clientID: context.cloudflare.env.GOOGLE_CLIENT_ID,
        clientSecret: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
        callbackURL: context.cloudflare.env.GOOGLE_CALLBACK_BASE_URL,
      },
      async ({ profile }) => {
        const user = await context.db.user.findUnique({
          where: { email: profile.emails[0].value },
        })
        if (user) {
          return user
        }
        const newUser = await context.db.user.create({
          data: {
            id: profile.id,
            email: profile.emails[0].value || '',
            password: '',
            name: profile.displayName,
            image: profile.photos[0].value || '',
            provider: 'google',
          },
        })
        const {
          password: _1,
          createdAt: _2,
          updatedAt: _3,
          provider: _4,
          ...userForClient
        } = newUser
        return userForClient
      }
    )
    _authenticatedUser.use(googleStrategy)
  }
  return _authenticatedUser
}
