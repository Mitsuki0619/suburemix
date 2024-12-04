import { User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getPublicProfile = async (
  context: AppLoadContext,
  userId: User['id'],
  myUserId?: User['id']
) => {
  const isAuthUser = myUserId === userId
  const user = await context.db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      image: true,
      blogs: {
        where: {
          published: isAuthUser ? undefined : true,
        },
      },
    },
  })
  const profile = await context.db.profile.findUnique({
    where: { userId },
    select: {
      bio: true,
    },
  })
  if (!user) {
    throw new Error('User not found')
  }
  return { ...user, ...profile }
}
