import Spinner from '../components/Spinner'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import api, { errMsg } from '../api'
import Comments from '../components/Comments'
import PostCard from '../components/PostCard'

export default function PostDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data.data.post,
  })

  return (
    <div>
      <div className="detail-top">
        <button className="back" onClick={() => navigate(-1)}>← Back</button>
        <span style={{ color: 'var(--muted)' }}>Post</span>
      </div>
      {isLoading && <Spinner />}
      {error && <p className="msg-err">{errMsg(error)}</p>}
      {post && (
        <>
          <PostCard key={post._id} post={post} detailed onDeleted={() => navigate('/')} />
          <Comments postId={id} />
        </>
      )}
    </div>
  )
}
