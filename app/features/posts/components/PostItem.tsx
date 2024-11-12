import { useFetcher } from '@remix-run/react'
import { Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { UserForClient } from '~/routes/_auth+/_layout'
import { GetPostsResponse } from '~/services/post/getPosts.server'

interface Props {
  post: GetPostsResponse[number]
  user: UserForClient
}

export const PostItem = ({ post, user }: Props) => {
  const isCurrentUser = !!user?.id && user.id === post.author.id
  const fetcher = useFetcher()
  return (
    <div
      className={`flex items-start space-x-2 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <Avatar className="w-8 h-8">
        {post.author.image ? (
          <AvatarImage src={post.author.image} alt="avatar" />
        ) : (
          <AvatarFallback>{post.author.name}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex flex-col">
        <span
          className={`text-sm font-medium ${isCurrentUser ? 'text-right' : ''}`}
        >
          {post.author.name}
        </span>
        {isCurrentUser ? (
          <Popover>
            <PopoverTrigger asChild>
              <div className="p-3 rounded-lg max-w-xs bg-primary text-primary-foreground ml-auto cursor-pointer whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <fetcher.Form method="delete">
                <input type="hidden" name="id" value={post.id} />
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
            {post.content}
          </div>
        )}
      </div>
    </div>
  )
}
