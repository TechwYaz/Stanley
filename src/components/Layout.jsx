import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from '@heroui/react'
import { Bell, Home, LogOut, PlusSquare, Search, Settings, User } from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import PostModal from './PostModal'
import Rightbar from './Rightbar'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const { data: unread = 0 } = useQuery({
    queryKey: ['unread-count'],
    enabled: !!token,
    refetchInterval: 30000,
    queryFn: async () => (await api.get('/notifications/unread-count')).data.data.unreadCount,
  })
  const badge = unread > 0 && <span className="nav-badge">{unread > 99 ? '99+' : unread}</span>

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) < 8) return
      setNavHidden(y > last && y > 80)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!token) return <Navigate to="/login" replace />

  const cls = ({ isActive }) => (isActive ? 'active' : '')
  const doLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-card">
          <div className="brand sidebar-brand">
            <NavLink to="/" aria-label="Home"><img className="stanley-logo sidebar-logo" src="/stanley-logo.png" alt="Stanley" /></NavLink>
          </div>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end className={cls}><Home size={20} /> Home</NavLink>
            <NavLink to="/search" className={cls}><Search size={20} /> Search</NavLink>
            <NavLink to="/notifications" className={cls}><Bell size={20} /> Notifications{badge}</NavLink>
            <NavLink to="/profile" className={cls}><User size={20} /> Profile</NavLink>
            <NavLink to="/settings" className={cls}><Settings size={20} /> Settings</NavLink>
          </nav>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={() => setCreating(true)}>
            <PlusSquare size={18} /> Create post
          </button>
          <ThemeToggle className="sidebar-theme-toggle" />
        </div>
        <div className="sidebar-card" style={{ marginTop: 'auto' }}>
          <div className="user-mini">
            <Avatar user={user} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mini-name">{user?.name}</div>
              <div className="mini-handle">@{user?.username}</div>
            </div>
            <button className="more" onClick={doLogout} aria-label="Log out" title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <NavLink to="/notifications" className={`top-bell ${navHidden ? 'hidden' : ''}`} aria-label="Notifications" title="Notifications"><Bell size={20} />{badge}</NavLink>

      <main id="mainContent">
        <Outlet context={{ openCreate: () => setCreating(true) }} />
        <footer className="app-footer">
          <span>© 2026 Stanley</span>
          <span aria-hidden="true">·</span>
          <span>Made by Yazan Sofian</span>
        </footer>
      </main>

      <Rightbar />

      <nav className={`mobile-nav ${navHidden ? 'hidden' : ''}`}>
        <NavLink to="/" end className={cls}><Home size={20} />Home</NavLink>
        <NavLink to="/search" className={cls}><Search size={20} />Search</NavLink>
        <NavLink to="/profile" className={cls}><User size={20} />Profile</NavLink>
        <a href="#create" onClick={(e) => { e.preventDefault(); setCreating(true) }}><PlusSquare size={20} />Post</a>
        <NavLink to="/settings" className={cls}><Settings size={20} />Settings</NavLink>
      </nav>

      {creating && <PostModal onClose={() => setCreating(false)} />}
    </div>
  )
}
