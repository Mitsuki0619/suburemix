import { Prisma, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export const getProfile = async (
  context: AppLoadContext,
  userId: User['id']
) => {
  const profile = await context.db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  })
  return profile
}

export type GetProfileResponse = Prisma.PromiseReturnType<typeof getProfile>
