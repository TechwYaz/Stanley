import LoadMore from './LoadMore'
import Spinner from './Spinner'
import { toast } from '@heroui/react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import api, { errMsg } from '../api'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils'
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import LikeButton from './LikeButton'
import Modal from './Modal'
import { MentionInput, MentionText } from './Mention'

function Replies({ postId, commentId, show, replying, onDone }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const list = useQuery({
    queryKey: ['replies', commentId],
    enabled: show,
    queryFn: async () => (await api.get(`/posts/${postId}/comments/${commentId}/replies`)).data.data.replies,
  })
  const add = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/comments/${commentId}/replies`, { content: text }),
    onSuccess: () => {
      setText('')
      onDone()
      queryClient.invalidateQueries({ queryKey: ['replies', commentId] })
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: (e) => toast.danger(errMsg(e)),
  })
  const submit = () => {
    if (text.trim().length < 2) return toast.danger('Reply must be at least 2 characters')
    add.mutate()
  }
  return (
    <div className="replies">
      {show && list.isLoading && <Spinner size={18} />}
      {show && list.data?.map((r) => <Comment key={r._id} comment={r} postId={postId} isReply parentId={commentId} />)}
      {replying && (
        <div className="comment-compose reply-compose">
          <Avatar user={user} size="sm" />
          <MentionInput up emoji
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Write a reply…"
            aria-label="Write a reply"
          />
          <button className="btn btn-primary btn-sm" disabled={add.isPending} onClick={submit}>Send</button>
        </div>
      )}
    </div>
  )
}

function Comment({ comment, postId, isReply = false, parentId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [text, setText] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(false)
  const [replying, setReplying] = useState(false)
  const isOwner = comment.commentCreator?._id === user?._id
  const profilePath = isOwner ? '/profile' : `/users/${comment.commentCreator?._id}`
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    queryClient.invalidateQueries({ queryKey: ['post', postId] })
    if (parentId) queryClient.invalidateQueries({ queryKey: ['replies', parentId] })
  }

  const save = useMutation({
    mutationFn: () => api.put(`/posts/${postId}/comments/${comment._id}`, { content: text }),
    onSuccess: () => {
      toast.success('Comment updated')
      setEditing(false)
      refresh()
    },
    onError: (e) => toast.danger(errMsg(e)),
  })

  const remove = useMutation({
    mutationFn: () => api.delete(`/posts/${postId}/comments/${comment._id}`),
    onSuccess: () => {
      toast.success('Comment deleted')
      setDeleting(false)
      refresh()
    },
    onError: (e) => toast.danger(errMsg(e)),
  })

  return (
    <div className={`comment${isReply ? ' is-reply' : ''}`}>
      <Link to={profilePath}><Avatar user={comment.commentCreator} size="sm" /></Link>
      <div className="comment-body">
        <div className="comment-line">
          <Link to={profilePath} className="author-link"><strong>{comment.commentCreator?.name}</strong></Link>
          <span>{timeAgo(comment.createdAt)}</span>
        </div>
        {editing ? (
          <form
            style={{ display: 'flex', gap: 8, margin: '6px 0' }}
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate()
            }}
          >
            <input className="comment-edit" style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', background: 'var(--surface)', color: 'var(--text)' }} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn btn-primary btn-sm" disabled={save.isPending}>Save</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <MentionText text={comment.content} style={{ whiteSpace: 'pre-wrap' }} />
        )}
        {!editing && (
          <div className="comment-actions">
            <LikeButton
              small
              url={`/posts/${postId}/comments/${comment._id}/like`}
              initialLiked={comment.likes?.includes(user?._id) ?? false}
              initialCount={comment.likes?.length ?? 0}
            />
            {!isReply && <button onClick={() => { setReplying(true); setShowReplies(true) }}>Reply</button>}
            {isOwner && <button onClick={() => setEditing(true)}>Edit</button>}
            {isOwner && <button onClick={() => setDeleting(true)}>Delete</button>}
          </div>
        )}
        {!isReply && comment.repliesCount > 0 && (
          <button className="view-replies" onClick={() => setShowReplies((v) => !v)}>
            {showReplies ? 'Hide replies' : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
        {!isReply && (showReplies || replying) && (
          <Replies postId={postId} commentId={comment._id} show={showReplies} replying={replying} onDone={() => setReplying(false)} />
        )}
      </div>
      {deleting && (
        <Modal title="Delete comment?" onClose={() => setDeleting(false)}>
          <p className="danger-copy">This comment will be removed permanently.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleting(false)}>Cancel</button>
            <button className="btn btn-danger" disabled={remove.isPending} onClick={() => remove.mutate()}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function Comments({ postId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: async ({ pageParam }) =>
      (await api.get(`/posts/${postId}/comments`, { params: { limit: 50, page: pageParam } })).data,
    initialPageParam: 1,
    getNextPageParam: (last) => last.meta?.pagination?.nextPage ?? undefined,
  })
  const comments = data?.pages.flatMap((p) => p.data.comments) ?? []
  const total = data?.pages[0]?.meta?.pagination?.total ?? comments.length

  const add = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/comments`, { content }),
    onSuccess: () => {
      toast.success('Comment added')
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
    onError: (e) => toast.danger(errMsg(e)),
  })

  const submit = () => {
    if (content.trim().length < 2) return toast.danger('Comment must be at least 2 characters')
    add.mutate()
  }

  return (
    <section className="comments">
      <div className="comments-head">{total} comments</div>
      {isLoading && <Spinner size={22} />}
      {error && <p className="msg-err">{errMsg(error)}</p>}
      {comments.map((c) => <Comment key={c._id} comment={c} postId={postId} />)}
      <LoadMore hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onLoad={fetchNextPage} />
      {!isLoading && !comments.length && <p className="helper" style={{ padding: 20 }}>No comments yet.</p>}
      <div className="comment-compose">
        <Avatar user={user} size="sm" />
        <MentionInput up emoji
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Write a comment…"
          aria-label="Write a comment"
        />
        <button className="btn btn-primary btn-sm" disabled={add.isPending} onClick={submit}>Send</button>
      </div>
    </section>
  )
}
