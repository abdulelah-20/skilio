import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'

const NAV = [
  { to: '/dashboard', label: 'Home', icon: '⬡', end: true },
]

export function MobileNav() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  function handleLogout() {
    clearAuth()
    qc.clear()
    navigate('/', { replace: true })
  }

  return (
    <nav className="mob-nav" style={{ display: 'grid' }}>
      {NAV.map(item => (
        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `mob-btn${isActive ? ' on' : ''}`}>
          <span className="mob-ic">{item.icon}</span>
          <span className="mob-lb">{item.label}</span>
        </NavLink>
      ))}
      <button className="mob-btn" onClick={handleLogout}>
        <span className="mob-ic">↪</span>
        <span className="mob-lb">Sign out</span>
      </button>
    </nav>
  )
}
