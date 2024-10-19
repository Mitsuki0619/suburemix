import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const deletePost = async (
  context: AppLoadContext,
  request: {
    postId: Post['id']
    userId: User['id']
  }
) => {
  const { postId, userId } = request
  const postAuthorID = await context.db.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  })
  if (postAuthorID?.authorId !== userId) {
    throw new Error('Invalid Request')
  }
  return await context.db.post.delete({
    where: {
      id: postId,
    },
  })
}
