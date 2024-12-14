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
import { zx } from 'zodix'

import { PostEditor } from '~/features/posts/PostEditor'
import { getAuthenticator } from '~/services/auth/auth.server'
import { getCategories } from '~/services/posts/getCategories.server'
import { getPost } from '~/services/posts/getPost.server'
import { updatePost } from '~/services/posts/updatePost.server'

const patchPostSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  categories: z.array(z.string()),
  content: z.string({ required_error: 'Content is required' }),
  published: z.boolean().default(false),
})

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  if (!user) {
    return redirectWithError('/', {
      message: 'You must be signed in to edit a post',
    })
  }
  const categories = await getCategories(context)
  const categoriesOptions = categories.map((category) => ({
    value: category.id.toString(),
    label: category.name,
  }))
  const { postId } = zx.parseParams(params, {
    postId: z.preprocess((v) => Number(v), z.number()),
  })
  const post = await getPost(context, postId, user.id)
  return json({ categoriesOptions, post })
}

export const action = async ({
  context,
  request,
  params,
}: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: patchPostSchema })
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const { postId } = zx.parseParams(params, {
    postId: z.preprocess((v) => Number(v), z.number()),
  })
  if (!user) {
    return jsonWithError(
      { result: submission.reply() },
      {
        message: 'You must be signed in to edit a post',
      }
    )
  }
  if (submission.status !== 'success') {
    return json({ result: submission.reply() })
  }
  await updatePost(context, {
    id: postId,
    title: String(formData.get('title')),
    categories: formData.getAll('categories').map(Number),
    content: String(formData.get('content')),
    published: Boolean(formData.get('published')),
    userId: user.id,
  })
  return jsonWithSuccess(
    { result: submission.reply() },
    {
      message: 'Post updated successfully',
      description: 'Your post has been updated successfully',
    }
  )
}

export default function Index() {
  const { categoriesOptions, post } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: patchPostSchema })
    },
    defaultValue: {
      title: post.title,
      content: post.content,
      categories: post.categories.map((category) => category.id.toString()),
      published: post.published,
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  return (
    <>
      <PostEditor
        type="edit"
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
