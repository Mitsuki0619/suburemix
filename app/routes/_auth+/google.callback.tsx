import { LoaderFunctionArgs } from '@remix-run/cloudflare'

import { getAuthenticator } from '~/services/auth/auth.server'

export const loader = ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context)

  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/signin',
  })
}
