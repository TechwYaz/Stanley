import { useEffect, useRef } from 'react'

export default function LoadMore({ hasNextPage, isFetching, onLoad, size }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasNextPage || isFetching) return
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) onLoad() }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [hasNextPage, isFetching, onLoad])

  if (!hasNextPage) return null
  return (
    <div className="center-load" ref={ref} style={{ minHeight: 40 }}>
      {isFetching && <span className="spinner" style={size ? { width: size, height: size } : undefined} />}
    </div>
  )
}
