import './tailwind.css'

import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  Meta,
  Links,
  ScrollRestoration,
  Scripts,
  useLoaderData,
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from '@remix-run/react'
import { useEffect } from 'react'
import { getToast } from 'remix-toast'

import { Button } from '~/components/ui/button'

import { Toaster } from './components/ui/toaster'
import { toast as showToast } from './hooks/use-toast'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { toast, headers } = await getToast(request)
  return json({ toast }, { headers })
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { toast } = useLoaderData<typeof loader>()

  useEffect(() => {
    if (toast) {
      showToast({
        title: toast.message,
        description: toast.description,
      })
    }
  }, [toast])

  return <Outlet />
}

export function ErrorBoundary() {
  const error = useRouteError()

  let errorMessage: string

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data || error.statusText
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else {
    console.error(error)
    errorMessage = 'Unknown error'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-xl mb-8 text-center">{errorMessage}</p>
      <div className="space-x-4">
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
