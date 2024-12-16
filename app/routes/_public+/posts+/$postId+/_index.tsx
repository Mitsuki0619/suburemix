import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json, Link, useLoaderData } from '@remix-run/react'
import { CalendarIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import styles from '~/features/posts/markdown.module.css'
import { getPublicPost } from '~/services/posts/getPublicPost.server'

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const { postId } = zx.parseParams(params, {
    postId: z.preprocess((v) => Number(v), z.number()),
  })
  const post = await getPublicPost(context, postId)
  return json(post)
}

export default function Index() {
  const post = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">
            {post.title}
          </CardTitle>
          <div className="flex justify-center gap-4 items-center mt-4">
            <Link
              to={`/${post.author.id}/profile`}
              className="flex gap-2 items-center"
            >
              <Avatar>
                {post.author.image ? (
                  <AvatarImage src={post.author.image} alt={post.author.name} />
                ) : (
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.author.name}</p>
              </div>
            </Link>
            |
            {post.publishedAt && (
              <div className="flex items-center text-sm text-muted-foreground">
                Published at
                <span className="flex items-center gap-1 ml-3">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                </span>
              </div>
            )}
          </div>
          <div>
            <ul className="flex gap-2 justify-center flex-wrap">
              {post.categories.map((category) => (
                <li key={category.id}>
                  <Badge variant="secondary">{category.name}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </CardHeader>
        <div className="px-6">
          <hr />
        </div>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown className={styles.md}>{post.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
