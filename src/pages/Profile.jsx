import { toast } from '@heroui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { errMsg } from '../api'
import Avatar from '../components/Avatar'
import Modal from '../components/Modal'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'

function PersonRow({ person, me, onClick }) {
  const id = typeof person === 'string' ? person : person._id
  const { data } = useQuery({
    queryKey: ['person', id],
    enabled: typeof person === 'string',
    queryFn: async () => (await api.get(`/users/${id}/profile`)).data.data.user,
  })
  const u = typeof person === 'string' ? data : person
  if (!u) return <div className="suggestion"><Spinner /></div>
  return (
    <Link to={id === me?._id ? '/profile' : `/users/${id}`} onClick={onClick} className="suggestion author-link">
      <Avatar user={u} size="sm" />
      <div className="grow">
        <b style={{ fontSize: 13 }}>{u.name}</b>
        {u.username && <div className="mini-handle">@{u.username}</div>}
      </div>
    </Link>
  )
}

export default function Profile() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user: me, updateUser } = useAuth()
  const isMe = !id || id === me?._id
  const [tab, setTab] = useState('posts')
  const [list, setList] = useState(null)
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  const profile = useQuery({
    queryKey: ['profile', isMe ? 'me' : id],
    queryFn: async () => {
      const { data } = await api.get(isMe ? '/users/profile-data' : `/users/${id}/profile`)
      return { ...data.data.user, isFollowing: data.data.isFollowing }
    },
  })

  const toggleFollow = async () => {
    try {
      await api.put(`/users/${userId}/follow`)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    } catch (e) {
      toast.danger(errMsg(e))
    }
  }

  const saved = useQuery({
    queryKey: ['saved'],
    enabled: isMe && tab === 'saved',
    queryFn: async () => (await api.get('/users/bookmarks')).data.data.bookmarks,
  })

  const userId = profile.data?._id
  const posts = useQuery({
    queryKey: ['user-posts', userId],
    enabled: !!userId,
    queryFn: async () =>
      (await api.get(`/users/${userId}/posts`, { params: { limit: 50 } })).data.data.posts,
  })

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const { data } = await api.put('/users/upload-photo', fd)
      updateUser({ photo: data.data.photo })
      toast.success('Profile picture updated')
      queryClient.invalidateQueries()
    } catch (err) {
      toast.danger(errMsg(err))
    } finally {
      setUploading(false)
    }
  }

  if (profile.isLoading) return <Spinner />
  if (profile.error) return <p className="msg-err">{errMsg(profile.error)}</p>
  const user = profile.data

  return (
    <div>
      <div className="feed-top">
        <h1 className="page-title">Profile</h1>
        {isMe
          ? <button className="btn btn-secondary btn-sm" onClick={() => navigate('/settings')}>Settings</button>
          : <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>Back</button>}
      </div>
      <div className="profile-body">
        <div className="profile-top">
          <div className="profile-id">
            <div className="avatar-wrap">
              <Avatar user={user} size="lg" />
              {isMe && <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />}
              {isMe && (
                <button className="avatar-edit" onClick={() => fileRef.current.click()} disabled={uploading} aria-label="Change profile picture">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <div className="profile-name">
              <h2>{user.name}</h2>
              <p>@{user.username}</p>
            </div>
          </div>
          {!isMe && (
            <button className={`btn btn-sm ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleFollow}>
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <div className="stats" style={{ marginTop: 18 }}>
          <button className="stat-btn" onClick={() => setList('following')}><b>{user.following?.length ?? 0}</b> Following</button>
          <button className="stat-btn" onClick={() => setList('followers')}><b>{user.followers?.length ?? 0}</b> Followers</button>
          <span><b>{posts.data?.length ?? 0}</b> Posts</span>
        </div>
        <div className="profile-tabs">
          <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')}>Posts</button>
          {isMe && <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>Saved</button>}
        </div>
        <div style={{ paddingTop: 17 }}>
          {tab === 'posts' || !isMe ? (
            <>
              {posts.isLoading && <Spinner />}
              {posts.error && <p className="msg-err">{errMsg(posts.error)}</p>}
              {posts.data?.map((p) => <PostCard key={p._id} post={p} />)}
              {posts.data && !posts.data.length && <p className="helper">No posts yet.</p>}
            </>
          ) : (
            <>
              {saved.isLoading && <Spinner />}
              {saved.error && <p className="msg-err">{errMsg(saved.error)}</p>}
              {saved.data?.map((p) => <PostCard key={p._id} post={{ ...p, bookmarked: true }} />)}
              {saved.data && !saved.data.length && <p className="helper">Nothing saved yet. Tap the bookmark on any post.</p>}
            </>
          )}
        </div>
      </div>
      {list && (
        <Modal title={list === 'followers' ? 'Followers' : 'Following'} onClose={() => setList(null)}>
          {user[list]?.map((u) => (
            <PersonRow key={typeof u === 'string' ? u : u._id} person={u} me={me} onClick={() => setList(null)} />
          ))}
          {!user[list]?.length && <p className="helper">Nobody here yet.</p>}
        </Modal>
      )}
    </div>
  )
}
