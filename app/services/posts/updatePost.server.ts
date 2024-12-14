import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const updatePost = async (
  context: AppLoadContext,
  request: {
    id: Post['id']
    title: Post['title']
    categories: number[]
    content: Post['content']
    published: Post['published']
    userId: User['id']
  }
) => {
  const { id, title, categories, content, published, userId } = request
  const post = await context.db.post.findUnique({
    where: { id },
    select: {
      authorId: true,
      publishedAt: true,
    },
  })
  if (!post || post.authorId !== userId) {
    throw new Error('Post not found')
  }
  const updatedPost = await context.db.post.update({
    where: { id },
    data: {
      title,
      content,
      published,
      publishedAt: post.publishedAt
        ? post.publishedAt
        : published
          ? new Date()
          : null,
      categories: {
        set: categories.map((id) => ({ id: Number(id) })),
      },
    },
  })
  return {
    id: updatedPost.id,
    title: updatedPost.title,
    content: updatedPost.content,
  }
}
