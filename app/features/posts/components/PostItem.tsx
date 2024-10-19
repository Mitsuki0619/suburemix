import type { SerializeFrom } from '@remix-run/cloudflare'

import { Post } from '@prisma/client/edge'
import { Form, useNavigation } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { UserForClient } from '~/routes/_public+/_layout'

interface Props {
  post: SerializeFrom<Post>
  user: UserForClient
}

export const PostItem = ({ post, user }: Props) => {
  const navigation = useNavigation()
  return (
    <div className={cn('flex', 'items-center', 'justify-between')}>
      <div>{post.content}</div>
      {user.id === post.authorId && (
        <Form method="delete" action="/posts">
          <input type="hidden" name="id" value={post.id} />
          <Button type="submit" disabled={navigation.state === 'submitting'}>
            delete
          </Button>
        </Form>
      )}
    </div>
  )
}
