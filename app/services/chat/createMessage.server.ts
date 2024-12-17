import { Message, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const createMessage = async (
  context: AppLoadContext,
  request: {
    content: Message['content']
    userId: User['id']
  }
) => {
  const { content, userId } = request

  if (!content) {
    throw new Error('Invalid Request')
  }
  const newMessage = await context.db.message.create({
    data: { content, authorId: userId },
  })
  return { id: newMessage.id, content: newMessage.content }
}
