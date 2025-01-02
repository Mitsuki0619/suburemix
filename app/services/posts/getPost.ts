import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getPost = async (
  context: AppLoadContext,
  postId: Post['id'],
  userId?: User['id']
) => {
  const post = await context.db.post.findUnique({
    where: { id: postId, published: !userId ? true : undefined },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      publishedAt: true,
      authorId: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  if (!post) {
    throw new Error('Post not found')
  }
  if (post.authorId !== userId && !post.published) {
    throw new Error('Post not found')
  }
  return post
}
