import ThemeToggle from './ThemeToggle'

export default function AuthLayout({ heading, copy, title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="brand">
          <img className="stanley-logo auth-logo" src="/stanley-logo.png" alt="Stanley" />
        </div>
        <div className="auth-copy">
          <h1>{heading}</h1>
          <p>{copy}</p>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>Built with the Route Posts API</div>
      </div>
      <div className="auth-card-wrap">
        <ThemeToggle className="auth-theme-toggle" />
        <div className="auth-card">
          <img className="stanley-logo auth-mobile-logo" src="/stanley-logo.png" alt="Stanley" />
          <h2>{title}</h2>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
