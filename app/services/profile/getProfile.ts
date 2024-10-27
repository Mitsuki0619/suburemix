import { Prisma, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getProfile = async (
  context: AppLoadContext,
  userId: User['id']
) => {
  const user = await context.db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
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

export type GetProfileResponse = Prisma.PromiseReturnType<typeof getProfile>
