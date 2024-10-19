import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const createPost = async (
  context: AppLoadContext,
  request: {
    content: Post['content']
    userId: User['id']
  }
) => {
  const { content, userId } = request

  if (!content) {
    throw new Error('Invalid Request')
  }
  const newPost = await context.db.post.create({
    data: { content, authorId: userId },
  })
  return { id: newPost.id, content: newPost.content }
}
