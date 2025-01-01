import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import {
  Form,
  useLoaderData,
  useSearchParams,
  useSubmit,
  Link,
} from '@remix-run/react'
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  SearchIcon,
  X,
} from 'lucide-react'
import { useEffect, useState, Fragment } from 'react'
import { z } from 'zod'
import { zx } from 'zodix'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { getCategories } from '~/services/posts/getCategories.server'
import { getPosts } from '~/services/posts/getPosts.server'

const getPostsSchema = z.object({
  search: z.string().optional(),
  categoryId: z.preprocess((v) => Number(v), z.number()).optional(),
  page: z.number().optional(),
})

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const queries = zx.parseQuery(url.searchParams, getPostsSchema)
  const page = queries.page ?? 1
  const limit = 10
  const offset = (page - 1) * limit
  const search = queries.search
  const categoryId = queries.categoryId
  const { posts, totalPages } = await getPosts({
    context,
    request: { limit, offset, search, categoryId },
  })
  const categories = await getCategories(context)
  return {
    posts,
    totalPages,
    categories,
  }
}

export default function HomePage() {
  const { posts, totalPages, categories } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const submit = useSubmit()
  const [localPosts, setLocalPosts] = useState(posts)
  const currentPage = Number(searchParams.get('page')) || 1

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    searchParams.set('search', e.currentTarget.search.value)
    setSearchParams(searchParams)
    submit(searchParams)
  }

  const handleCategoryClick = (categoryId: string) => {
    if (searchParams.get('categoryId') === categoryId) {
      searchParams.delete('categoryId')
      setSearchParams(searchParams)
      submit(searchParams)
      return
    }
    searchParams.set('categoryId', categoryId)
    setSearchParams(searchParams)
    submit(searchParams)
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    searchParams.set('page', nextPage.toString())
    setSearchParams(searchParams)
    submit(searchParams)
  }
  useEffect(() => {
    setLocalPosts(posts)
  }, [posts])
  return (
    <div className="w-full min-h-screen bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Form onSubmit={handleSearch} className="mb-8">
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
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Fragment key={category.id.toString()}>
                  <label>
                    <Badge
                      key={category.id.toString()}
                      variant={
                        searchParams.get('categoryId') ===
                        category.id.toString()
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer text-sm py-1 px-2"
                      defaultChecked={
                        searchParams.get('categoryId') ===
                        category.id.toString()
                      }
                      onClick={() =>
                        handleCategoryClick(category.id.toString())
                      }
                    >
                      {category.name}
                      {searchParams.get('categoryId') ===
                        category.id.toString() && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  </label>
                </Fragment>
              ))}
            </div>
          </div>
        </Form>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {localPosts.map((post) => (
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
                      <time dateTime={post.publishedAt ?? ''}>
                        {new Date(post.publishedAt ?? '').toLocaleDateString()}
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

        {currentPage < totalPages && (
          <div className="mt-8 text-center">
            <Button onClick={handleLoadMore}>Load More</Button>
          </div>
        )}
      </div>
    </div>
  )
}
