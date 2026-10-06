import { toast } from '@heroui/react'
import { useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Smile, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import api, { errMsg } from '../api'
import { useAuth } from '../context/AuthContext'
import { splitMood } from '../utils'
import Avatar from './Avatar'
import Modal from './Modal'
import { MentionInput } from './Mention'

const MOODS = [
  'feeling happy 😊', 'feeling blessed 🙏', 'feeling loved 🥰', 'feeling excited 🤩', 'feeling sad 😢',
  'feeling tired 😴', 'feeling cool 😎', 'feeling thankful 💙',
  'eating 🍔', 'drinking ☕', 'watching 🎬', 'listening to 🎧', 'playing 🎮', 'traveling ✈️', 'studying 📚', 'celebrating 🎉',
]


export default function PostModal({ post, onClose, onSaved }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const initial = splitMood(post?.body)
  const [body, setBody] = useState(initial.text)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState(initial.mood)
  const [showMoods, setShowMoods] = useState(false)

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : post?.image || null), [image, post])

  const pickFile = (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (!f.type.startsWith('image/')) return toast.danger('Only image files are supported')
    if (f.size > 5 * 1024 * 1024) return toast.danger('Image must be 5MB or smaller')
    setImage(f)
  }

  const submit = async () => {
    if (!body.trim() && !image && !post?.image) return toast.danger('Write something or add a photo')
    setLoading(true)
    try {
      const fd = new FormData()
      const text = (mood ? `${body.trim()}\n\n— ${mood}` : body).trim()
      if (text) fd.append('body', text)
      if (image) fd.append('image', image)
      const { data } = post
        ? await api.put(`/posts/${post._id}`, fd)
        : await api.post('/posts', fd)
      toast.success(post ? 'Post updated' : 'Post published')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['user-posts'] })
      queryClient.invalidateQueries({ queryKey: ['post'] })
      onSaved?.(data.data.post)
      onClose()
    } catch (e) {
      toast.danger(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={post ? 'Edit post' : 'Create post'} onClose={onClose}>
      <div className="pm-user">
        <Avatar user={user} />
        <div>
          <b>{user?.name}</b>
          {mood && <span className="pm-mood"> is {mood} <button type="button" className="pm-x" onClick={() => setMood('')} aria-label="Remove feeling">×</button></span>}
        </div>
      </div>
      <MentionInput
        as="textarea"
        className="pm-text"
        aria-label="Post text"
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`What's on your mind, ${user?.name?.split(' ')[0] ?? ''}?`}
      />
      {preview && (
        <div className="pm-preview">
          <img src={preview} alt="" />
          {image && <button type="button" aria-label="Remove photo" onClick={() => setImage(null)}><X size={16} /></button>}
        </div>
      )}
      {showMoods && (
        <div className="chips">
          {MOODS.map((m) => (
            <button key={m} type="button" className={`chip ${m === mood ? 'active' : ''}`} onClick={() => { setMood(m === mood ? '' : m); setShowMoods(false) }}>{m}</button>
          ))}
        </div>
      )}
      <div className="pm-add">
        <span>Add to your post</span>
        <label className="composer-icon" title="Photo" style={{ cursor: 'pointer' }}>
          <ImagePlus size={24} color="#22a45d" />
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pickFile} />
        </label>
        <button type="button" className="composer-icon" title="Feeling / activity" onClick={() => setShowMoods(!showMoods)}>
          <Smile size={24} color="#f08a24" />
        </button>
      </div>
      <button className="btn btn-primary pm-submit" disabled={loading} onClick={submit}>
        {loading ? <><span className="spinner" />Saving</> : post ? 'Save' : 'Post'}
      </button>
    </Modal>
  )
}
