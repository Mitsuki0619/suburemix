import { AppLoadContext } from '@remix-run/cloudflare'

export const getCategories = async (context: AppLoadContext) => {
  const categories = await context.db.category.findMany({
    select: { id: true, name: true },
  })
  return categories
}
