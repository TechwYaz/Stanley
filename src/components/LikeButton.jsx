import { toast } from '@heroui/react'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import api, { errMsg } from '../api'


export default function LikeButton({ url, initialLiked, initialCount, small }) {
  const [state, setState] = useState(null)
  const liked = state?.liked ?? initialLiked
  const count = state?.count ?? initialCount

  const toggle = async () => {
    const prev = { liked, count }
    setState({ liked: !liked, count: count + (liked ? -1 : 1) })
    try {
      const { data } = await api.put(url)
      setState({ liked: data.data.liked, count: data.data.likesCount })
    } catch (e) {
      setState(prev)
      toast.danger(errMsg(e))
    }
  }

  return (
    <button className={`icon-btn like ${liked ? 'active' : ''}`} style={small ? { minHeight: 26, padding: '0 6px', fontSize: 12 } : undefined} onClick={toggle}>
      <Heart size={small ? 14 : 18} fill={liked ? 'currentColor' : 'none'} />
      {count > 0 && count}
    </button>
  )
}
