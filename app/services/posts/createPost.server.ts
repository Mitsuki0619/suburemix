import { Post, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const createPost = async (
  context: AppLoadContext,
  request: {
    title: Post['title']
    categories: number[]
    content: Post['content']
    published: Post['published']
    userId: User['id']
  }
) => {
  const { title, categories, content, published, userId } = request
  const newPost = await context.db.post.create({
    data: {
      title,
      content,
      authorId: userId,
      published,
      publishedAt: published ? new Date() : null,
      categories: {
        connect: categories.map((id) => ({ id: Number(id) })),
      },
    },
  })
  return { id: newPost.id, title: newPost.title, content: newPost.content }
}
