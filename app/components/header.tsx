import { Form, Link } from '@remix-run/react'

import { UserForClient } from '~/routes/_public+/_layout'

import { Button } from './ui/button'

interface Props {
  user: UserForClient | null
}

export const Header = ({ user }: Props) => {
  return (
    <header>
      <h1>Hello {user?.name}!</h1>
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/posts/create">New Post</Link>
            <Form method="post" action="/signout">
              <Button variant="outline">Sign out</Button>
            </Form>
          </>
        ) : (
          <Button variant="secondary" asChild>
            <Link to="/signin">Sign in</Link>
          </Button>
        )}
      </nav>
    </header>
  )
}
