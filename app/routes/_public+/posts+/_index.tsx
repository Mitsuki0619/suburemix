import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
} from '@remix-run/react'
import { z } from 'zod'

import { Textarea } from '~/components/ui/textarea'
import { PostList } from '~/features/posts/components/PostList'
import { getAuthenticator } from '~/services/auth/auth.server'
import { createPost } from '~/services/post/createPost.server'
import { deletePost } from '~/services/post/deletePost.server'

import { UserForClient } from '../_layout'

export const schemaForCreatePost = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .max(255, 'Content must be less than 255 characters'),
})
export const schemaForDeletePost = z.object({
  id: z.number({ required_error: 'ID is required' }),
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const authenticator = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const formData = await request.clone().formData()
  switch (request.method) {
    case 'POST': {
      const submission = parseWithZod(formData, { schema: schemaForCreatePost })
      if (submission.status !== 'success') {
        return submission.reply()
      }
      if (!user) {
        return json(submission.reply())
      }
      await createPost(context, {
        content: String(formData.get('content')),
        userId: user.id,
      })
      return json(submission.reply({ resetForm: true }))
    }
    case 'DELETE': {
      const submission = parseWithZod(formData, { schema: schemaForDeletePost })
      if (submission.status !== 'success') {
        return submission.reply()
      }
      if (!user) {
        return json(submission.reply())
      }
      await deletePost(context, {
        postId: Number(formData.get('id')),
        userId: user.id,
      })
      return json(submission.reply())
    }
  }
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const posts = await context.db.post.findMany()
  return json(posts)
}

export default function PostListPage() {
  const lastResult = useActionData<typeof action>()
  const posts = useLoaderData<typeof loader>()
  const user = useOutletContext<UserForClient>()

  const [form, { content }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaForCreatePost })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <div>
      <h1>Posts</h1>
      <div>
        <PostList posts={posts} user={user} />
      </div>
      <Form method="post" {...getFormProps(form)}>
        <div>
          <Textarea
            {...getInputProps(content, { type: 'text' })}
            key={getInputProps(content, { type: 'text' }).key}
          />
          {content.errors && (
            <div>
              {content.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>
        <button type="submit">Post</button>
      </Form>
    </div>
  )
}
