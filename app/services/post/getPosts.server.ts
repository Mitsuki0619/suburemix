import { Prisma } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getPosts = async (context: AppLoadContext) => {
  const posts = await context.db.post.findMany({
    select: {
      id: true,
      content: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  })
  return posts
}

export type GetPostsResponse = Prisma.PromiseReturnType<typeof getPosts>
