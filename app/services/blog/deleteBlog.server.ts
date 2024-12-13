import { Blog, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const deleteBlog = async (
  context: AppLoadContext,
  {
    blogId,
    userId,
  }: {
    blogId: Blog['id']
    userId: User['id']
  }
) => {
  const blog = await context.db.blog.findUnique({ where: { id: blogId } })
  if (!blog) {
    return { error: { message: 'Blog not found' } }
  }
  if (blog.authorId !== userId) {
    return {
      error: { message: 'You do not have permission to delete this blog' },
    }
  }

  await context.db.blog.delete({ where: { id: blogId } })

  return {}
}
