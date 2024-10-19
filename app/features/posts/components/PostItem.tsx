import { Post } from '@prisma/client/edge'
import { type SerializeFrom } from '@remix-run/cloudflare'

interface Props {
  post: SerializeFrom<Post>
}

export const PostItem = ({ post }: Props) => {
  return <div>{post.content}</div>
}
