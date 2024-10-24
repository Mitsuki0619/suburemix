import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  useRevalidator,
} from '@remix-run/react'
import { Send } from 'lucide-react'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Textarea } from '~/components/ui/textarea'
import { PostItem } from '~/features/posts/components/PostItem'
import { getAuthenticator } from '~/services/auth/auth.server'
import { createPost } from '~/services/post/createPost.server'
import { deletePost } from '~/services/post/deletePost.server'
import { getPosts } from '~/services/post/getPosts.server'

import { UserForClient } from './_layout'

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
        return json(
          submission.reply({
            fieldErrors: { content: ['You must be signed in to post'] },
          })
        )
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
        return json(
          submission.reply({
            fieldErrors: { id: ['You must be signed in to delete a post'] },
          })
        )
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
  const posts = await getPosts(context)
  return json(posts)
}

export default function Index() {
  const lastResult = useActionData<typeof action>()
  const posts = useLoaderData<typeof loader>()
  const user = useOutletContext<UserForClient>()
  const revalidator = useRevalidator()
  const navigation = useNavigation()
  const [form, { content }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaForCreatePost })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  const postContentProps = getInputProps(content, { type: 'text' })

  return (
    <div className="w-full max-w-xl mx-auto h-[650px] flex flex-col bg-background ">
      <ScrollArea className="flex-grow p-4">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} user={user} />
        ))}
      </ScrollArea>
      <div className="w-full">
        <Button
          variant="ghost"
          className="flex gap-1 mx-auto"
          type="button"
          onClick={() => revalidator.revalidate()}
        >
          <span>Reload</span>
          <ReloadIcon />
        </Button>
      </div>
      <div className="p-4">
        <Form
          method="post"
          {...getFormProps(form)}
          className="flex w-full items-center space-x-2"
        >
          <div className="flex-grow">
            <Textarea
              {...postContentProps}
              key={postContentProps.key}
              disabled={navigation.state === 'submitting' || !user}
              className="min-h-[80px]"
            />
            {content.errors?.map((error, index) => (
              <p className="text-sm text-destructive mt-1" key={index}>
                {error}
              </p>
            ))}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!user || navigation.state === 'submitting'}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </Form>
      </div>
    </div>
  )
}
