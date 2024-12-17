import { Post } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getPublicPost = async (
  context: AppLoadContext,
  postId: Post['id']
) => {
  const post = await context.db.post.findUnique({
    where: { id: postId, published: true, publishedAt: { not: null } },
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
  return post
}
