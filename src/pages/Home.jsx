import { useInfiniteQuery } from '@tanstack/react-query'
import { ImagePlus, Smile } from 'lucide-react'
import { useState } from 'react'
import api, { errMsg } from '../api'
import LoadMore from '../components/LoadMore'
import Spinner from '../components/Spinner'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import PostModal from '../components/PostModal'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [creating, setCreating] = useState(false)

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: async ({ pageParam }) =>
        (await api.get('/posts', { params: { page: pageParam, limit: 10 } })).data,
      initialPageParam: 1,
      getNextPageParam: (last) => last.meta.pagination.nextPage ?? undefined,
    })

  const posts = data?.pages.flatMap((p) => p.data.posts) ?? []

  return (
    <div>
      <div className="feed-top">
        <h1 className="page-title">Home</h1>
      </div>
      <div className="composer">
        <div className="composer-row">
          <Avatar user={user} />
          <button className="composer-input" onClick={() => setCreating(true)}>
            What’s on your mind, {user?.name?.split(' ')[0]}?
          </button>
          <button className="composer-icon" aria-label="Photo or video" onClick={() => setCreating(true)}><ImagePlus size={24} color="#22a45d" /></button>
          <button className="composer-icon" aria-label="Feeling or activity" onClick={() => setCreating(true)}><Smile size={24} color="#f08a24" /></button>
        </div>
      </div>

      {isLoading && <Spinner />}
      {error && <p className="msg-err">{errMsg(error)}</p>}
      {posts.map((post) => <PostCard key={post._id} post={post} />)}
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onLoad={fetchNextPage} />
      {creating && <PostModal onClose={() => setCreating(false)} />}
    </div>
  )
}
