import { AppLoadContext } from '@remix-run/cloudflare'
import bcrypt from 'bcrypt'

export const createUser = async (
  context: AppLoadContext,
  data: Record<'name' | 'email' | 'password', string>
) => {
  const { name, email, password } = data

  if (!(name && email && password)) {
    throw new Error('Invalid input')
  }

  const existingUser = await context.db.user.findUnique({ where: { email } })

  if (existingUser) {
    return { error: { message: 'メールアドレスは既に登録済みです' } }
  }

  const hashedPassword = await bcrypt.hash(data.password, 12)
  const newUser = await context.db.user.create({
    data: { name, email, password: hashedPassword, image: '' },
  })

  return { id: newUser.id, email: newUser.email, name: newUser.name }
}
