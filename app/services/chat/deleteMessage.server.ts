import { Message, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const deleteMessage = async (
  context: AppLoadContext,
  request: {
    messageId: Message['id']
    userId: User['id']
  }
) => {
  const { messageId, userId } = request
  const postAuthorID = await context.db.message.findUnique({
    where: {
      id: messageId,
    },
    select: {
      authorId: true,
    },
  })
  if (postAuthorID?.authorId !== userId) {
    throw new Error('Invalid Request')
  }
  return await context.db.message.delete({
    where: {
      id: messageId,
    },
  })
}
