import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/cloudflare'
import {
  ClientActionFunctionArgs,
  useActionData,
  useLoaderData,
} from '@remix-run/react'
import { z } from 'zod'

import { BlogEditor } from '~/features/blogs/BlogEditor'
import { toast } from '~/hooks/use-toast'
import { getAuthenticator } from '~/services/auth/auth.server'
import { createBlog } from '~/services/blog/createBlog.server'
import { getCategories } from '~/services/blog/getCategories.server'

const postBlogSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  categories: z.array(z.string()),
  content: z.string({ required_error: 'Content is required' }),
  published: z.boolean().default(false),
})

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    return redirect('/')
  }
  const categories = await getCategories(context)
  const categoriesOptions = categories.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }))
  return json({ categoriesOptions })
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: postBlogSchema })
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    return submission.reply()
  }
  if (submission.status !== 'success') {
    return submission.reply()
  }
  await createBlog(context, {
    title: String(formData.get('title')),
    categories: formData.getAll('categories').map(String),
    content: String(formData.get('content')),
    published: Boolean(formData.get('published')),
    userId: user.id,
  })
  return submission.reply({ resetForm: true })
}

export async function clientAction({ serverAction }: ClientActionFunctionArgs) {
  const data = await serverAction<typeof action>()
  if (data.status === 'error') return data
  toast({ title: 'Success', description: 'Blog created successfully' })
  return data
}

export default function Index() {
  const { categoriesOptions } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: postBlogSchema })
    },
    defaultValue: {
      title: '',
      content: '',
      categories: [],
      published: false,
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  return (
    <>
      <BlogEditor
        title={fields.title}
        content={fields.content}
        categories={fields.categories}
        published={fields.published}
        categoriesOptions={categoriesOptions}
        form={form}
        key={form.key}
      />
    </>
  )
}
