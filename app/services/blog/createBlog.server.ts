import { Blog, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const createBlog = async (
  context: AppLoadContext,
  request: {
    title: Blog['title']
    categories: number[]
    content: Blog['content']
    published: Blog['published']
    userId: User['id']
  }
) => {
  const { title, categories, content, published, userId } = request
  const newBlog = await context.db.blog.create({
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
  return { id: newBlog.id, title: newBlog.title, content: newBlog.content }
}
