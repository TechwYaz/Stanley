const tones = ['', 'a2', 'a3']

export default function Avatar({ user, size = 'md' }) {
  const isDefault = !user?.photo || user.photo.includes('default-profile')
  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const tone = tones[(user?._id?.charCodeAt(user._id.length - 1) ?? 0) % 3]

  return (
    <div className={`st-avatar ${size === 'sm' ? 'sm' : ''} ${size === 'lg' ? 'lg' : ''} ${tone}`}>
      {isDefault ? initials : <img src={user.photo} alt="" />}
    </div>
  )
}
