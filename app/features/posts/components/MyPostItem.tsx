import type { SerializeFrom } from '@remix-run/cloudflare'

import { Post } from '@prisma/client/edge'
import { Form } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface Props {
  post: SerializeFrom<Post>
}

export const MyPostItem = ({ post }: Props) => {
  return (
    <div className={cn('flex', 'items-center', 'justify-between')}>
      <div>{post.content}</div>
      <Form method="delete" action="/posts">
        <input type="hidden" name="id" value={post.id} />
        <Button type="submit">delete</Button>
      </Form>
    </div>
  )
}
