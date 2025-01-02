import { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  SearchIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { getPosts } from '~/services/posts/getPosts.server'

const getPostsSchema = z.object({
  search: z.string().optional(),
  categoryId: z.preprocess((v) => Number(v), z.number()).optional(),
  page: z.preprocess((v) => Number(v), z.number()).optional(),
})

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const queries = zx.parseQuery(url.searchParams, getPostsSchema)
  const page = queries.page ?? 1
  const limit = 10
  const offset = (page - 1) * limit
  const search = queries.search
  const categoryId = queries.categoryId
  const { posts, totalPages, currentPage } = await getPosts({
    context,
    request: { limit, offset, search, categoryId },
  })
  const formattedPosts = posts.map((post) => ({
    ...post,
    publishedAt: new Date(post.publishedAt ?? '').toLocaleDateString(),
  }))
  return {
    posts: formattedPosts,
    totalPages,
    currentPage,
  }
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Home | 素振りみっくす -suburemix-',
    },
    {
      name: 'description',
      content: 'Home page of suburemix',
    },
  ]
}

export default function HomePage() {
  const fetcher = useFetcher<typeof loader>()

  const { posts, totalPages, currentPage } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const [postsData, setPostsData] = useState({
    posts,
    totalPages,
    currentPage: currentPage || 1,
  })
  useEffect(() => {
    const fetcherData = fetcher.data
    if (!fetcherData || fetcher.state === 'loading') return
    setPostsData((prev) => {
      return {
        ...prev,
        posts:
          prev.currentPage !== fetcherData.currentPage
            ? [...prev.posts, ...fetcherData.posts]
            : fetcherData.posts,
        totalPages: fetcherData.totalPages,
        currentPage: fetcherData.currentPage,
      }
    })
  }, [currentPage, fetcher.data, fetcher.state])

  return (
    <div className="w-full min-h-screen bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <fetcher.Form className="mb-8" method="get">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-grow relative">
                <Input
                  type="text"
                  name="search"
                  placeholder="Search posts..."
                  defaultValue={searchParams.get('search') || ''}
                  className="pl-10"
                />
                <SearchIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <Button type="submit" className="md:w-auto">
                Search
              </Button>
            </div>
          </div>
        </fetcher.Form>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postsData.posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <Link
                  to={`/${post.author.id}/profile`}
                  className="flex items-center space-x-4"
                >
                  <Avatar className="w-8 h-8">
                    {post.author.image ? (
                      <AvatarImage src={post.author.image} alt="avatar" />
                    ) : (
                      <AvatarFallback>{post.author.name}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.author.name}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <time dateTime={post.publishedAt}>
                        {post.publishedAt}
                      </time>
                      <span className="mx-1">•</span>
                      <ClockIcon className="mr-1 h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={`/posts/${post.id}`}>
                    Read More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {postsData.currentPage < postsData.totalPages && (
          <fetcher.Form method="get">
            <div className="mt-8 text-center">
              <Button name="page" value={postsData.currentPage + 1}>
                Load More
              </Button>
            </div>
          </fetcher.Form>
        )}
      </div>
    </div>
  )
}
