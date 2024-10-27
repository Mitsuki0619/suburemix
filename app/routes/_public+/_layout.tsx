import { json, LoaderFunctionArgs } from '@remix-run/cloudflare'
import {
  Outlet,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
} from '@remix-run/react'

import { Layout } from '~/components/layout'
import { getAuthenticator } from '~/services/auth/auth.server'

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    return null
  }
  const { email, name, id, role, image } = user
  return json({ email, name, id, role, image })
}

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (actionResult?.ok) {
    return false
  }
  return defaultShouldRevalidate
}

export default function App() {
  const user = useLoaderData<typeof loader>()
  return (
    <Layout user={user}>
      <Outlet context={user} />
    </Layout>
  )
}
