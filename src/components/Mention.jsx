import { useQuery } from '@tanstack/react-query'
import { Smile } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Avatar from './Avatar'

const EMOJIS = ['😀','😂','🤣','😊','😍','🥰','😘','😎','🤩','🥳','😢','😭','😡','😮','🤔','🙄','😴','🤗','👍','👎','👏','🙏','💪','🔥','❤️','💔','💯','🎉','✨','😅','😉','🤝']


export function MentionInput({ value, onChange, as: Tag = 'input', up = false, emoji = false, ...props }) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState(null)
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term ?? ''), 200)
    return () => clearTimeout(t)
  }, [term])

  const { data } = useQuery({
    queryKey: ['mention-search', debounced],
    enabled: term !== null && debounced.length > 0,
    queryFn: async () => (await api.get('/users/search', { params: { q: debounced } })).data.data.users.slice(0, 5),
  })

  const handleChange = (e) => {
    onChange(e)
    const el = e.target
    const before = el.value.slice(0, el.selectionStart ?? el.value.length)
    const m = before.match(/(?:^|\s)@([a-z0-9_]*)$/i)
    setTerm(m ? m[1] : null)
  }

  const pick = (u, el) => {
    const pos = el.selectionStart ?? value.length
    const before = value.slice(0, pos).replace(/@([a-z0-9_]*)$/i, `@${u.username} `)
    onChange({ target: { value: before + value.slice(pos) } })
    setTerm(null)
    el.focus()
  }

  const addEmoji = (em, wrap) => {
    const el = wrap.querySelector('input,textarea')
    const pos = el.selectionStart ?? value.length
    onChange({ target: { value: value.slice(0, pos) + em + value.slice(pos) } })
    setOpen(false)
    el.focus()
  }

  const show = term !== null && debounced.length > 0 && data?.length > 0

  return (
    <div className="mention-wrap">
      <Tag
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setTerm(null), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && show) {
            e.stopPropagation()
            setTerm(null)
            return
          }
          props.onKeyDown?.(e)
        }}
      />
      {emoji && (
        <button
          type="button"
          className="emoji-btn"
          aria-label="Add emoji"
          onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o) }}
        >
          <Smile size={18} />
        </button>
      )}
      {emoji && open && (
        <div className="emoji-pop" onMouseDown={(e) => e.preventDefault()}>
          {EMOJIS.map((em) => (
            <button key={em} type="button" onClick={(e) => addEmoji(em, e.currentTarget.closest('.mention-wrap'))}>{em}</button>
          ))}
        </div>
      )}
      {show && (
        <div className={`mention-list${up ? ' up' : ''}`}>
          {data.map((u) => (
            <button
              key={u._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                pick(u, e.currentTarget.closest('.mention-wrap').querySelector('input,textarea'))
              }}
            >
              <Avatar user={u} size="sm" />
              <span><b>{u.name}</b><small>@{u.username}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


export function MentionText({ text, as: Tag = 'p', ...props }) {
  const navigate = useNavigate()
  const parts = typeof text === 'string' ? text.split(/(@[a-z0-9_]{3,30})/g) : []

  const open = async (username) => {
    try {
      const { data } = await api.get('/users/search', { params: { q: username } })
      const u = data.data.users.find((x) => x.username === username)
      if (u) {
        navigate(`/users/${u._id}`)
      } else {
        navigate('/not-found')
      }
    } catch {
      navigate('/not-found')
    }
  }

  return (
    <Tag {...props}>
      {parts.map((part, i) =>
        i % 2 ? (
          <button key={i} type="button" className="mention" onClick={() => open(part.slice(1))}>{part}</button>
        ) : (
          part
        ),
      )}
    </Tag>
  )
}
