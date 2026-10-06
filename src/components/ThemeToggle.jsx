import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button type="button" onClick={toggle} className={`theme-toggle ${className}`} aria-label="Toggle color theme">
      <Icon size={17} className="theme-icon" />
      <span className="theme-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}
