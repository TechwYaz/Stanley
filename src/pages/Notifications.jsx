import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api, { errMsg } from '../api'
import Avatar from '../components/Avatar'
import Spinner from '../components/Spinner'
import { timeAgo } from '../utils'

const TEXT = {
  follow_user: 'started following you',
  like_post: 'liked your post',
  comment_post: 'commented on your post',
  share_post: 'shared your post',
  like_comment: 'liked your comment',
  reply_comment: 'replied to your comment',
  mention_user: 'mentioned you',
  mention_post: 'mentioned you in a post',
  mention_comment: 'mentioned you in a comment',
}

const describe = (type = '') => TEXT[type] || type.replace(/_/g, ' ') || 'interacted with you'

const targetOf = (n) => {
  if (n.entityType === 'post') return `/posts/${n.entityId}`
  if (n.entityType === 'comment' && n.entity?.post) return `/posts/${n.entity.post._id ?? n.entity.post}`
  return `/users/${n.actor?._id}`
}

export default function Notifications() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data.data.notifications,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['unread-count'] })
  }

  const readOne = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: refresh,
  })
  const readAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: refresh,
  })

  const open = (n) => {
    if (!n.isRead) readOne.mutate(n._id)
    navigate(targetOf(n))
  }

  const hasUnread = data?.some((n) => !n.isRead)

  return (
    <div>
      <div className="feed-top">
        <h1 className="page-title">Notifications</h1>
        {hasUnread && (
          <button className="btn btn-secondary btn-sm" disabled={readAll.isPending} onClick={() => readAll.mutate()}>Mark all as read</button>
        )}
      </div>
      <section className="notif-list">
        {isLoading && <Spinner />}
        {error && <p className="msg-err">{errMsg(error)}</p>}
        {data?.map((n) => (
          <button key={n._id} className={`notif${n.isRead ? '' : ' unread'}`} onClick={() => open(n)}>
            <Avatar user={n.actor} />
            <div className="notif-text">
              <span><b>{n.actor?.name}</b> {describe(n.type)}</span>
              <small>{timeAgo(n.createdAt)}</small>
            </div>
            {!n.isRead && <span className="notif-dot" />}
          </button>
        ))}
        {data && !data.length && <p className="helper" style={{ padding: 20 }}>No notifications yet.</p>}
      </section>
    </div>
  )
}
