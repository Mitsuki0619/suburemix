import { json, LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { Clock, Edit } from 'lucide-react'
import { z } from 'zod'
import { zx } from 'zodix'

import { BackButtonLayout } from '~/components/back-button-layout'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { getAuthenticator } from '~/services/auth/auth.server'
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

export default function Index() {
  const {
    me,
    thisUser: { name, image, id, bio, blogs },
  } = useLoaderData<typeof loader>()

  return (
    <BackButtonLayout>
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
            {/* <div className="flex flex-wrap justify-center gap-2">
            {location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </Badge>
            )}
            {website && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {new URL(website).hostname}
                </a>
              </Badge>
            )}
            <Badge variant="secondary" className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              Joined {joinDate}
            </Badge>
          </div> */}
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
              <h2 className="text-2xl font-bold mb-4">Blogs</h2>
              <div className="space-y-4">
                {blogs.length ? (
                  blogs.map((blog) => (
                    <Card key={blog.id}>
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {blog.title}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          {blog.content.slice(0, 100)}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(blog.publishedAt!).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        No blogs yet. Stay tuned for future updates!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BackButtonLayout>
  )
}
