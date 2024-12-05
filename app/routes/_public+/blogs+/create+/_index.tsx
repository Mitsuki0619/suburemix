import { useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { useActionData, useLoaderData } from '@remix-run/react'
import { jsonWithError, jsonWithSuccess, redirectWithError } from 'remix-toast'
import { z } from 'zod'

import { BlogEditor } from '~/features/blogs/BlogEditor'
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
    return redirectWithError('/', {
      message: 'You must be signed in to create a blog',
    })
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
    return jsonWithError(
      { result: submission.reply() },
      {
        message: 'You must be signed in to create a blog',
      }
    )
  }
  if (submission.status !== 'success') {
    return json({ result: submission.reply() })
  }
  await createBlog(context, {
    title: String(formData.get('title')),
    categories: formData.getAll('categories').map(Number),
    content: String(formData.get('content')),
    published: Boolean(formData.get('published')),
    userId: user.id,
  })
  return jsonWithSuccess(
    { result: submission.reply({ resetForm: true }) },
    {
      message: 'Blog created successfully',
      description: 'Your blog has been created successfully',
    }
  )
}
export default function Index() {
  const { categoriesOptions } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult: actionData?.result,
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
        type="create"
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
