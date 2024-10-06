import type { LoaderFunction } from '@remix-run/cloudflare'

import { Form } from '@remix-run/react'

import { getAuthenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = getAuthenticator(context)
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })
  return {}
}
export const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login Page</h1>
      <Form action="/google" method="post">
        <button>sign in with google</button>
      </Form>
    </div>
  )
}
export default LoginPage
