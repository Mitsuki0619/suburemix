import { User } from '@prisma/client/edge'
import { AppLoadContext } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'

export type UpdatePasswordInput = {
  userId: User['id']
  currentPassword: User['password']
  newPassword: User['password']
}

export const updatePassword = async (
  context: AppLoadContext,
  request: UpdatePasswordInput
) => {
  const { currentPassword, newPassword } = request

  if (!currentPassword || !newPassword) {
    throw new Error('Invalid Request')
  }

  const updateUser = await context.db.user.findUnique({
    where: { id: request.userId },
    select: {
      password: true,
    },
  })

  if (!updateUser) {
    throw new Error('User not found')
  }

  const passwordMatch = await bcrypt.compare(
    String(currentPassword),
    updateUser.password
  )

  if (!passwordMatch) {
    throw new Error('Invalid password')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await context.db.user.update({
    where: { id: request.userId },
    data: {
      password: hashedPassword,
    },
  })

  return null
}
