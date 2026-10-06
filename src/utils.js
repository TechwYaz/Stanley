export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]]
  for (const [label, secs] of units) {
    if (s >= secs) return `${Math.floor(s / secs)}${label}`
  }
}


const MOOD_RE = /\n*— ((?:feeling|eating|drinking|watching|listening to|playing|traveling|studying|celebrating)\b[^\n]*)$/

export function splitMood(body = '') {
  const m = body.match(MOOD_RE)
  return m ? { text: body.slice(0, m.index).trimEnd(), mood: m[1] } : { text: body, mood: '' }
}
