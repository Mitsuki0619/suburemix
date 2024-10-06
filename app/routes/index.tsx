import type { LoaderFunction, MetaFunction } from '@remix-run/cloudflare'

import { useLoaderData } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export const loader: LoaderFunction = async ({ context }) => {
  console.time('query')
  const users = await context.db.post.findMany()
  console.timeEnd('query')
  return { message: 'Hello, world!', users }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Remix</h1>
      Hi
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
