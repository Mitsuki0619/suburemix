import { Link, useFetcher } from '@remix-run/react'
import { Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { UserForClient } from '~/routes/_auth+/_layout'
import { GetMessagesResponse } from '~/services/chat/getMessages.server'

interface Props {
  message: GetMessagesResponse[number]
  user: UserForClient
}

export const MessageItem = ({ message, user }: Props) => {
  const isCurrentUser = !!user?.id && user.id === message.author.id
  const fetcher = useFetcher()
  return (
    <div
      className={`flex items-start space-x-2 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <Link to={`/${message.author.id}/profile`}>
        <Avatar className="w-8 h-8">
          {message.author.image ? (
            <AvatarImage src={message.author.image} alt="avatar" />
          ) : (
            <AvatarFallback>{message.author.name}</AvatarFallback>
          )}
        </Avatar>
      </Link>
      <div className="flex flex-col">
        <Link
          to={`/${message.author.id}/profile`}
          className={`text-sm font-medium hover:underline ${isCurrentUser ? 'text-right' : ''}`}
        >
          {message.author.name}
        </Link>
        {isCurrentUser ? (
          <Popover>
            <PopoverTrigger asChild>
              <div className="p-3 rounded-lg max-w-xs bg-primary text-primary-foreground ml-auto cursor-pointer whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <fetcher.Form method="delete">
                <input type="hidden" name="id" value={message.id} />
                <Button
                  variant="ghost"
                  className="flex items-center text-destructive"
                  type="submit"
                  disabled={fetcher.state === 'submitting'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </fetcher.Form>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="p-3 rounded-lg max-w-xs bg-muted whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}
      </div>
    </div>
  )
}
