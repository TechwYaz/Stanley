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
        <p className="auth-credit auth-visual-credit">Made by Yazan Sofian · Powered by Route Posts API</p>
      </div>
      <div className="auth-card-wrap">
        <ThemeToggle className="auth-theme-toggle" />
        <div className="auth-card">
          <img className="stanley-logo auth-mobile-logo" src="/stanley-logo.png" alt="Stanley" />
          <h2>{title}</h2>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-credit auth-mobile-credit">Made by Yazan Sofian · Powered by Route Posts API</p>
        </div>
      </div>
    </div>
  )
}
