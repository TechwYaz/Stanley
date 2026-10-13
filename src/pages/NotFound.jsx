import { ArrowLeft, House } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <span className="not-found-kicker">WRONG TURN</span>
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1 id="not-found-title">This page is out of reach.</h1>
        <p className="not-found-copy">
          It may have moved, been removed, or the link is no longer valid.
          Let’s get you back to your feed.
        </p>
        <div className="not-found-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/', { replace: true })}>
            <House size={18} aria-hidden="true" /> Go to your feed
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} aria-hidden="true" /> Go back
          </button>
        </div>
        <p className="not-found-footer">Stanley is better with you here.</p>
      </div>
    </section>
  )
}
