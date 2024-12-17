import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const deletePost = async (
  context: AppLoadContext,
  {
    postId,
    userId,
  }: {
    postId: Post['id']
    userId: User['id']
  }
) => {
  const post = await context.db.post.findUnique({ where: { id: postId } })
  if (!post) {
    return { error: { message: 'Post not found' } }
  }
  if (post.authorId !== userId) {
    return {
      error: { message: 'You do not have permission to delete this post' },
    }
  }

  await context.db.post.delete({ where: { id: postId } })

  return {}
}
