import { toast } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../api'
import Avatar from './Avatar'

function Suggestion({ person }) {
  const [following, setFollowing] = useState(false)
  const toggle = async () => {
    try {
      const { data } = await api.put(`/users/${person._id}/follow`)
      setFollowing(data.data.following)
    } catch (e) {
      toast.danger(errMsg(e))
    }
  }
  return (
    <div className="suggestion">
      <Link to={`/users/${person._id}`}><Avatar user={person} size="sm" /></Link>
      <Link to={`/users/${person._id}`} className="grow author-link" style={{ minWidth: 0 }}>
        <b style={{ fontSize: 13 }}>{person.name}</b>
        <div className="mini-handle">@{person.username}</div>
      </Link>
      <button className={following ? 'on' : ''} onClick={toggle}>{following ? 'Following' : 'Follow'}</button>
    </div>
  )
}


function Trending() {
  const { data } = useQuery({
    queryKey: ['trending'],
    staleTime: 60_000,
    queryFn: async () => {
      const posts = (await api.get('/posts', { params: { limit: 50 } })).data.data.posts
      const score = (p) => (p.likesCount ?? 0) + (p.commentsCount ?? 0) + (p.sharesCount ?? 0)
      return posts
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
    },
  })

  return (
    <div className="right-card">
      <h4>Trending</h4>
      {data?.map(({ p, s }, i) => (
        <Link key={p._id} to={`/posts/${p._id}`} className="trend-item">
          <b><span className="trend-rank">{i + 1}</span>{(p.body || 'Photo post').slice(0, 60)}</b>
          <small>by {p.user?.name} · {s} interactions</small>
        </Link>
      ))}
      {data && !data.length && <p className="helper">Nothing is trending yet.</p>}
    </div>
  )
}

export default function Rightbar() {
  const { data } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => (await api.get('/users/suggestions', { params: { limit: 5 } })).data.data.suggestions,
  })

  return (
    <aside className="rightbar">
      <Trending />
      <div className="right-card">
        <h4>People to follow</h4>
        {data?.map((p) => <Suggestion key={p._id} person={p} />)}
        {data && !data.length && <p className="helper">No suggestions right now.</p>}
      </div>
    </aside>
  )
}
