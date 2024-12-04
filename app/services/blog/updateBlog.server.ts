import { Blog, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const updateBlog = async (
  context: AppLoadContext,
  request: {
    id: Blog['id']
    title: Blog['title']
    categories: number[]
    content: Blog['content']
    published: Blog['published']
    userId: User['id']
  }
) => {
  const { id, title, categories, content, published, userId } = request
  const blog = await context.db.blog.findUnique({
    where: { id },
    select: {
      authorId: true,
      publishedAt: true,
    },
  })
  if (!blog || blog.authorId !== userId) {
    throw new Error('Blog not found')
  }
  const updatedBlog = await context.db.blog.update({
    where: { id },
    data: {
      title,
      content,
      published,
      publishedAt: blog.publishedAt
        ? blog.publishedAt
        : published
          ? new Date()
          : null,
      categories: {
        set: categories.map((id) => ({ id: Number(id) })),
      },
    },
  })
  return {
    id: updatedBlog.id,
    title: updatedBlog.title,
    content: updatedBlog.content,
  }
}
