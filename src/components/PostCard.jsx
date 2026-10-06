import { toast } from '@heroui/react'
import { useQueryClient } from '@tanstack/react-query'
import { Bookmark, MessageCircle, Repeat2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errMsg } from '../api'
import { useAuth } from '../context/AuthContext'
import { splitMood, timeAgo } from '../utils'
import Avatar from './Avatar'
import LikeButton from './LikeButton'
import Lightbox from './Lightbox'
import Modal from './Modal'
import { MentionInput, MentionText } from './Mention'
import PostModal from './PostModal'

function Author({ user, date, extra, plain, mood }) {
  const Wrap = plain ? 'span' : Link
  const to = plain ? {} : { to: `/users/${user?._id}` }
  return (
    <div className="author">
      <Wrap {...to}><Avatar user={user} /></Wrap>
      <div>
        <div className="author-name"><Wrap {...to} className="author-link"><strong>{user?.name}</strong></Wrap>{mood && <span className="author-mood"> is {mood}</span>}</div>
        <span>@{user?.username} · {timeAgo(date)}{extra}</span>
      </div>
    </div>
  )
}

export default function PostCard({ post, onDeleted, detailed }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [menu, setMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareText, setShareText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const sendReply = async () => {
    if (replyText.trim().length < 2) return toast.danger('Reply must be at least 2 characters')
    setSendingReply(true)
    try {
      await api.post(`/posts/${post._id}/comments/${post.topComment._id}/replies`, { content: replyText })
      toast.success('Reply added')
      setReplyText('')
      setReplying(false)
    } catch (e) {
      toast.danger(errMsg(e))
    } finally {
      setSendingReply(false)
    }
  }
  const [bookmarked, setBookmarked] = useState(post.bookmarked ?? false)
  const isOwner = post.user?._id === user?._id
  const shared = post.isShare ? post.sharedPost : null

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
    queryClient.invalidateQueries({ queryKey: ['user-posts'] })
    queryClient.invalidateQueries({ queryKey: ['saved'] })
  }

  const remove = async () => {
    try {
      await api.delete(`/posts/${post._id}`)
      toast.success('Post deleted')
      setDeleting(false)
      refresh()
      onDeleted?.(post._id)
    } catch (e) {
      toast.danger(errMsg(e))
    }
  }

  const share = async () => {
    try {
      await api.post(`/posts/${post._id}/share`, shareText.trim() ? { body: shareText } : {})
      toast.success('Post shared')
      setSharing(false)
      setShareText('')
      refresh()
    } catch (e) {
      toast.danger(errMsg(e))
    }
  }

  const sendComment = async () => {
    if (commentText.trim().length < 2) return toast.danger('Comment must be at least 2 characters')
    setSendingComment(true)
    try {
      await api.post(`/posts/${post._id}/comments`, { content: commentText })
      toast.success('Comment added')
      setCommentText('')
      setCommenting(false)
      refresh()
      queryClient.invalidateQueries({ queryKey: ['saved'] })
    } catch (e) {
      toast.danger(errMsg(e))
    } finally {
      setSendingComment(false)
    }
  }

  const toggleBookmark = async () => {
    const prev = bookmarked
    setBookmarked(!prev)
    try {
      const { data } = await api.put(`/posts/${post._id}/bookmark`)
      setBookmarked(data.data.bookmarked)
      toast.success(data.data.bookmarked ? 'Saved' : 'Removed from saved')
    } catch (e) {
      setBookmarked(prev)
      toast.danger(errMsg(e))
    }
  }

  return (
    <article className={`post ${detailed ? 'detail-post' : ''}`}>
      <div className="post-head">
        <Author user={post.user} mood={splitMood(post.body).mood} date={post.createdAt} extra={post.isShare ? ' · shared' : ''} />
        {isOwner && (
          <div className="post-menu-wrap">
            <button className="more" aria-label="Post actions" onClick={() => setMenu(!menu)}>•••</button>
            <div className={`st-dropdown ${menu ? 'show' : ''}`}>
              <button onClick={() => { setMenu(false); setEditing(true) }}>Edit post</button>
              <button className="danger" onClick={() => { setMenu(false); setDeleting(true) }}>Delete post</button>
            </div>
          </div>
        )}
      </div>

      {splitMood(post.body).text && <MentionText text={splitMood(post.body).text} style={{ marginTop: 14, whiteSpace: 'pre-wrap' }} />}
      {shared ? (
        <Link to={`/posts/${shared._id}`} className="shared-box">
          <Author plain user={shared.user} mood={splitMood(shared.body).mood} date={shared.createdAt} />
          {splitMood(shared.body).text && <MentionText text={splitMood(shared.body).text} style={{ marginTop: 10, whiteSpace: 'pre-wrap' }} />}
          {shared.image && <img className="post-img" src={shared.image} alt="" />}
        </Link>
      ) : (
        post.image && <img className="post-img zoomable" src={post.image} alt="" onClick={() => setViewing(true)} />
      )}

      <div className="post-actions">
        <LikeButton
          url={`/posts/${post._id}/like`}
          initialLiked={post.likes?.some((l) => (l._id ?? l) === user?._id) ?? false}
          initialCount={post.likesCount ?? post.likes?.length ?? 0}
        />
        {detailed ? (
          <span className="icon-btn"><MessageCircle size={18} />{post.commentsCount > 0 && post.commentsCount}</span>
        ) : (
          <button className={`icon-btn ${commenting ? 'active' : ''}`} onClick={() => setCommenting(!commenting)} aria-label="Write a comment">
            <MessageCircle size={18} />{post.commentsCount > 0 && post.commentsCount}
          </button>
        )}
        <button className="icon-btn" onClick={() => setSharing(!sharing)}>
          <Repeat2 size={18} />{post.sharesCount > 0 ? post.sharesCount : 'Share'}
        </button>
        <button className={`icon-btn bookmark ${bookmarked ? 'active' : ''}`} onClick={toggleBookmark} aria-label="Save">
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {sharing && (
        <div className="share-row">
          <input value={shareText} onChange={(e) => setShareText(e.target.value)} placeholder="Say something about this post (optional)" />
          <button className="btn btn-primary btn-sm" onClick={share}>Share</button>
        </div>
      )}

      {commenting && !detailed && (
        <div className="quick-comment">
          <Avatar user={user} size="sm" />
          <MentionInput up emoji
            autoFocus
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendComment()}
            placeholder="Write a comment…"
            aria-label="Write a comment"
          />
          <button className="btn btn-primary btn-sm" disabled={sendingComment} onClick={sendComment}>Send</button>
        </div>
      )}

      {!detailed && post.commentsCount > 0 && (
        <Link to={`/posts/${post._id}`} className="view-comments">View all comments</Link>
      )}

      {!detailed && post.topComment && (
        <div className="top-comment">
          <div className="top-comment-row">
            <Link to={post.topComment.commentCreator?._id === user?._id ? '/profile' : `/users/${post.topComment.commentCreator?._id}`}>
              <Avatar user={post.topComment.commentCreator} size="sm" />
            </Link>
            <div>
              <Link to={post.topComment.commentCreator?._id === user?._id ? '/profile' : `/users/${post.topComment.commentCreator?._id}`} className="author-link"><b>{post.topComment.commentCreator?.name}</b></Link> {post.topComment.content}
            </div>
          </div>
          <div className="comment-actions">
            <LikeButton
              small
              url={`/posts/${post._id}/comments/${post.topComment._id}/like`}
              initialLiked={post.topComment.likes?.includes(user?._id) ?? false}
              initialCount={post.topComment.likes?.length ?? 0}
            />
            <button onClick={() => setReplying((v) => !v)}>Reply</button>
            {post.topComment.repliesCount > 0 && (
              <Link to={`/posts/${post._id}`}>{post.topComment.repliesCount} {post.topComment.repliesCount === 1 ? 'reply' : 'replies'}</Link>
            )}
          </div>
          {replying && (
            <div className="comment-compose reply-compose">
              <Avatar user={user} size="sm" />
              <MentionInput up emoji
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                placeholder={`Reply to ${post.topComment.commentCreator?.name ?? 'comment'}…`}
                aria-label="Write a reply"
              />
              <button className="btn btn-primary btn-sm" disabled={sendingReply} onClick={sendReply}>Send</button>
            </div>
          )}
        </div>
      )}

      {viewing && <Lightbox src={post.image} onClose={() => setViewing(false)} />}
      {editing && <PostModal post={post} onClose={() => setEditing(false)} />}
      {deleting && (
        <Modal title="Delete post?" onClose={() => setDeleting(false)}>
          <p className="danger-copy">This removes the post from your profile and feed. It can’t be undone.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleting(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={remove}>Delete post</button>
          </div>
        </Modal>
      )}
    </article>
  )
}
