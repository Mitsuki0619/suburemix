import { Post } from '@prisma/client/edge'
import { SerializeFrom } from '@remix-run/cloudflare'

import { UserForClient } from '~/routes/_public+/_layout'

import { MyPostItem } from './MyPostItem'
import { PostItem } from './PostItem'

interface Props {
  posts: SerializeFrom<Post[]>
  user: UserForClient
}

export const PostList = ({ posts, user }: Props) => {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {user && user.id === post.authorId ? (
            <MyPostItem post={post} />
          ) : (
            <PostItem post={post} />
          )}
        </li>
      ))}
    </ul>
  )
}
