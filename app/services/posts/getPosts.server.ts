import { AppLoadContext } from '@remix-run/cloudflare'

export const getPosts = async ({
  context,
  request,
}: {
  context: AppLoadContext
  request: {
    limit: number
    offset: number
    search?: string
    categoryId?: number
  }
}) => {
  const posts = await context.db.post.findMany({
    where: {
      published: true,
      publishedAt: { not: null },
      title: { contains: request.search },
      content: { contains: request.search },
      categories: { some: { id: request.categoryId } },
    },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      content: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: request.limit,
    skip: request.offset,
  })

  const totalPages = Math.ceil(
    (await context.db.post.count({
      where: {
        published: true,
        publishedAt: { not: null },
        title: { contains: request.search },
        content: { contains: request.search },
        categories: { some: { id: request.categoryId } },
      },
    })) / request.limit
  )
  return {
    posts,
    totalPages,
  }
}
