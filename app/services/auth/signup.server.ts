import { AppLoadContext } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'

export const createUser = async (
  context: AppLoadContext,
  data: Record<'name' | 'email' | 'password', string>
) => {
  const { name, email, password } = data

  const existingUser = await context.db.user.findUnique({ where: { email } })

  if (existingUser) {
    return { error: { message: 'メールアドレスは既に登録済みです' } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const newUser = await context.db.user.create({
    data: { name, email, password: hashedPassword, image: '' },
  })

  return { id: newUser.id, email: newUser.email, name: newUser.name }
}
