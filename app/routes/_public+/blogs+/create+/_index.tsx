import { getInputProps, getSelectProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/cloudflare'
import { useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { BlogEditor } from '~/features/blogs/BlogEditor'
import { getAuthenticator } from '~/services/auth/auth.server'
import { createBlog } from '~/services/blog/createBlog.server'
import { getCategories } from '~/services/blog/getCategories.server'

const postBlogSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  categories: z.array(z.string()),
  content: z.string({ required_error: 'Content is required' }),
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
  createBlog(context, {
    title: String(formData.get('title')),
    categories: formData.getAll('categories').map(String),
    content: String(formData.get('content')),
    userId: user.id,
  })
  return submission.reply()
}

export default function Index() {
  const { categoriesOptions } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, { title, categories, content }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: postBlogSchema })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  return (
    <>
      <BlogEditor
        categoriesOptions={categoriesOptions}
        titleInputProps={getInputProps(title, { type: 'text' })}
        categoriesSelectProps={}
        contentInputProps={getInputProps(content, { type: 'text' })}
      />
    </>
  )
}
