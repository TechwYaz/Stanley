import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search as SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { errMsg } from '../api'
import Avatar from '../components/Avatar'
import LoadMore from '../components/LoadMore'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

export default function Search() {
  const { user: me } = useAuth()
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(params.get('q') ?? '')
  const [q, setQ] = useState(input.trim())

  useEffect(() => {
    const t = setTimeout(() => {
      const v = input.trim()
      setQ(v)
      setParams(v ? { q: v } : {}, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [input, setParams])

  const enabled = q.length >= 2

  const people = useQuery({
    queryKey: ['search-users', q],
    enabled,
    queryFn: async () => (await api.get('/users/search', { params: { q } })).data.data.users,
  })
  const posts = useQuery({
    queryKey: ['posts', 'search', q],
    enabled,
    queryFn: async () => (await api.get('/posts', { params: { keyword: q, limit: 20 } })).data.data.posts,
  })

  const random = useInfiniteQuery({
    queryKey: ['posts', 'explore'],
    enabled: !enabled,
    staleTime: Infinity,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const r = (await api.get('/posts', { params: { page: pageParam, limit: 30 } })).data
      return { posts: r.data.posts.filter((p) => p.image).sort(() => Math.random() - 0.5), next: r.meta.pagination.nextPage }
    },
    getNextPageParam: (last) => last.next ?? undefined,
  })
  const tiles = random.data?.pages.flatMap((pg) => pg.posts) ?? []

  const loading = enabled && (people.isLoading || posts.isLoading)
  const empty = enabled && !loading && !people.data?.length && !posts.data?.length

  return (
    <div>
      <div className="feed-top"><h1 className="page-title">Search</h1></div>
      <div className="search-box">
        <SearchIcon size={18} />
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search people and posts"
          aria-label="Search"
        />
      </div>
      {!enabled && (
        <>
          {random.isLoading && <Spinner />}
          {random.error && <p className="msg-err">{errMsg(random.error)}</p>}
          <div className="explore-grid">
            {tiles.map((p) => (
              <Link key={p._id} to={`/posts/${p._id}`} className="explore-tile">
                <img src={p.image} alt="" loading="lazy" />
              </Link>
            ))}
          </div>
          <LoadMore hasNextPage={random.hasNextPage} isFetching={random.isFetchingNextPage} onLoad={random.fetchNextPage} />
        </>
      )}
      {loading && <Spinner />}
      {(people.error || posts.error) && <p className="msg-err">{errMsg(people.error || posts.error)}</p>}
      {empty && <p className="helper" style={{ padding: 8 }}>No results for “{q}”.</p>}

      {enabled && !!people.data?.length && (
        <section className="notif-list" style={{ marginBottom: 17 }}>
          <div className="search-head">People</div>
          {people.data.map((u) => (
            <Link key={u._id} to={u._id === me?._id ? '/profile' : `/users/${u._id}`} className="notif">
              <Avatar user={u} />
              <div className="notif-text">
                <b>{u.name}</b>
                <small>@{u.username}</small>
              </div>
            </Link>
          ))}
        </section>
      )}

      {enabled && !!posts.data?.length && (
        <>
          <div className="search-head" style={{ padding: '0 4px 10px' }}>Posts</div>
          {posts.data.map((p) => <PostCard key={p._id} post={p} />)}
        </>
      )}
    </div>
  )
}
