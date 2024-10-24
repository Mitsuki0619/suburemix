import { json, LoaderFunction, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'

import { getProfile } from '~/services/profile/getProfile'

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { userId } = zx.parseParams(params, {
    userId: z.string(),
  })
  const profile = await getProfile(context, userId)
  return json(profile)
}

export default function Index() {
  const profile = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.email}</p>
    </div>
  )
}
