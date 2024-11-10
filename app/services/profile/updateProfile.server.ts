import { Profile, User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'

export type UpdateProfileRequest = {
  userId: User['id']
  name: User['name']
  email: User['email']
  image: User['image']
  bio: Profile['bio']
}

export const updateProfile = async (
  context: AppLoadContext,
  request: UpdateProfileRequest
) => {
  const { userId, name, email, image, bio } = request

  if (!name || !email) {
    throw new Error('Invalid Request')
  }
  const updatedProfileWithUser = await context.db.$transaction(
    async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          image: image || undefined,
        },
      })

      const updatedProfile = await prisma.profile.upsert({
        where: { userId },
        create: {
          bio,
          user: { connect: { id: userId } },
        },
        update: {
          bio,
        },
      })

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedProfile.bio,
      }
    }
  )

  return updatedProfileWithUser
}
