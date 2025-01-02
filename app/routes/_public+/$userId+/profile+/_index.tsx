import { parseWithZod } from '@conform-to/zod'
import { PopoverClose } from '@radix-ui/react-popover'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { Clock, Edit, Pencil, Trash2 } from 'lucide-react'
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { getAuthenticator } from '~/services/auth/auth.server'
import { deletePost } from '~/services/posts/deletePost.server'
import { getPublicProfile } from '~/services/profile/getPublicProfile.server'

export const loader = async ({
  context,
  params,
  request,
}: LoaderFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const me = await authenticator.isAuthenticated(request)
  const { userId } = zx.parseParams(params, {
    userId: z.string(),
  })
  const thisUser = await getPublicProfile(context, userId, me?.id)

  return json({
    me,
    thisUser,
  })
}

const deleteMessageSchema = z.object({
  id: z.number(),
})

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { authenticator } = getAuthenticator(context)
  const user = await authenticator.isAuthenticated(request)
  const formData = await request.clone().formData()
  const submission = parseWithZod(formData, { schema: deleteMessageSchema })
  if (submission.status !== 'success') {
    return { result: submission.reply() }
  }
  switch (request.method) {
    case 'DELETE': {
      if (!user) {
        return jsonWithError(
          {
            result: submission.reply(),
          },
          {
            message: 'You must be signed in to delete a post',
          }
        )
      }
      await deletePost(context, {
        postId: Number(formData.get('id')),
        userId: user.id,
      })
      return jsonWithSuccess({ result: 'success' }, { message: 'Post deleted' })
    }
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.thisUser.name}'s Profile | 素振りみっくす -suburemix-`,
    },
    {
      name: 'description',
      content: `Profile page of ${data?.thisUser.name}`,
    },
  ]
}

export default function ProfilePage() {
  const {
    me,
    thisUser: { name, image, id, bio, posts },
  } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            {image ? (
              <AvatarImage src={image} alt={name} />
            ) : (
              <AvatarFallback>
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">{name}</CardTitle>
            <p className="text-muted-foreground">@{id}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center whitespace-pre-wrap">{bio}</p>
          {me?.id === id && (
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link to="./edit">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Posts</h2>
            <div className="space-y-4">
              {posts.length ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/posts/${post.id}`}>
                          <h3 className="text-xl font-semibold">
                            {post.title}
                          </h3>
                        </Link>
                        {me?.id === id && (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground"
                              asChild
                            >
                              <Link to={`/posts/${post.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4">
                                <h4 className="font-semibold mb-2">
                                  Delete this post?
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-2">
                                  <PopoverClose asChild>
                                    <Button variant="outline" size="sm">
                                      Cancel
                                    </Button>
                                  </PopoverClose>
                                  <fetcher.Form method="delete">
                                    <Input
                                      type="hidden"
                                      name="id"
                                      value={post.id}
                                    />
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      type="submit"
                                      disabled={fetcher.state === 'submitting'}
                                      onClick={() => {}}
                                    >
                                      Delete
                                    </Button>
                                  </fetcher.Form>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {post.content.slice(0, 100)}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(post.publishedAt!).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No posts yet. Stay tuned for future updates!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
