import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { ReloadIcon } from '@radix-ui/react-icons'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useRevalidator,
} from '@remix-run/react'
import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { jsonWithError } from 'remix-toast'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Textarea } from '~/components/ui/textarea'
import { MessageItem } from '~/features/chat/components/MessageItem'
import { UserForClient } from '~/routes/_auth+/_layout'
import { getAuthenticator } from '~/services/auth/auth.server'
import { createMessage } from '~/services/chat/createMessage.server'
import { deleteMessage } from '~/services/chat/deleteMessage.server'
import { getMessages } from '~/services/chat/getMessages.server'

export const schemaForCreateMessage = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .max(255, 'Content must be less than 255 characters'),
})
export const schemaForDeleteMessage = z.object({
  id: z.number({ required_error: 'ID is required' }),
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const formData = await request.clone().formData()
  switch (request.method) {
    case 'POST': {
      const submission = parseWithZod(formData, {
        schema: schemaForCreateMessage,
      })
      if (submission.status !== 'success') {
        return { result: submission.reply() }
      }
      if (!user) {
        return jsonWithError(
          {
            result: submission.reply(),
          },
          {
            message: 'You must be signed in to send a message',
          }
        )
      }
      await createMessage(context, {
        content: String(formData.get('content')),
        userId: user.id,
      })
      return json({ result: submission.reply() })
    }
    case 'DELETE': {
      const submission = parseWithZod(formData, {
        schema: schemaForDeleteMessage,
      })
      if (submission.status !== 'success') {
        return { result: submission.reply() }
      }
      if (!user) {
        return jsonWithError(
          {
            result: submission.reply(),
          },
          {
            message: 'You must be signed in to delete a message',
          }
        )
      }
      await deleteMessage(context, {
        messageId: Number(formData.get('id')),
        userId: user.id,
      })
      return json({ result: submission.reply() })
    }
  }
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const messages = await getMessages(context)
  return json(messages)
}

export default function Index() {
  const actionData = useActionData<typeof action>()
  const messages = useLoaderData<typeof loader>()
  const user = useOutletContext<UserForClient>()
  const $formRef = useRef<HTMLFormElement>(null)
  const fetcher = useFetcher()
  const revalidator = useRevalidator()
  const [form, { content }] = useForm({
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schemaForCreateMessage })
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })
  const messageContentProps = getInputProps(content, { type: 'text' })

  useEffect(() => {
    if (fetcher.state === 'idle') {
      $formRef.current?.reset()
    }
  }, [fetcher.state])

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col bg-background">
      <ScrollArea className="flex-grow p-4 max-h-[70vh]">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} user={user} />
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
        <fetcher.Form
          method="post"
          {...getFormProps(form)}
          className="flex w-full items-center space-x-2"
          ref={$formRef}
        >
          <div className="flex-grow">
            <Textarea
              {...messageContentProps}
              key={messageContentProps.key}
              disabled={fetcher.state === 'submitting' || !user}
              className="min-h-[80px]"
            />
            {content.errors && (
              <div className="max-h-10 h-10 mt-2 overflow-auto">
                {content.errors?.map((error, index) => (
                  <p className="text-sm text-destructive mt-1" key={index}>
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!user || fetcher.state === 'submitting'}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </fetcher.Form>
      </div>
    </div>
  )
}
