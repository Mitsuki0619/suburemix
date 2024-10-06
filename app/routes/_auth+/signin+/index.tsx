import type { LoaderFunction } from '@remix-run/cloudflare'

import { redirect, json } from '@remix-run/cloudflare'
import { Form } from '@remix-run/react'

import { getAuthenticator } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (user) {
    return redirect('/')
  }
  return json({})
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
