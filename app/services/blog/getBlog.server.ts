import { Blog, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getBlog = async (
  context: AppLoadContext,
  blogId: Blog['id'],
  userId?: User['id']
) => {
  const blog = await context.db.blog.findUnique({
    where: { id: blogId },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      publishedAt: true,
      authorId: true,
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  if (!blog) {
    throw new Error('Blog not found')
  }
  if (userId && blog.authorId !== userId && !blog.published) {
    throw new Error('Blog not found')
  }
  return blog
}
