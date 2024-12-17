import { Prisma } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getMessages = async (context: AppLoadContext) => {
  const messages = await context.db.message.findMany({
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
  return messages
}

export type GetMessagesResponse = Prisma.PromiseReturnType<typeof getMessages>
