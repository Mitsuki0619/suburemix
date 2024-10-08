import { LoaderFunctionArgs, json } from '@remix-run/cloudflare'

import { getAuthenticator } from '~/services/auth.server'

import { SignInUpFormCard } from '../_components/SignInUpFormCard'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  return json({ user })
}
export const LoginPage: React.FC = () => {
  return (
    <div className="grid place-content-center ">
      <div className="mt-40">
        <SignInUpFormCard />
      </div>
    </div>
  )
}
export default LoginPage
