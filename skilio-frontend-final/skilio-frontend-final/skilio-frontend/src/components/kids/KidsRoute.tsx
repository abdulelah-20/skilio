import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useKidsStore } from '@/store/kidsStore'
import { Spinner } from '@/components/ui/Spinner'

export function KidsRoute() {
  const { token, isLoading } = useAuthStore()
  const { selectedChild, hero, heroName, heroDate } = useKidsStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0a1a' }}>
        <Spinner size="lg" className="border-white/20 border-t-primary-400" />
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  if (!selectedChild) return <Navigate to="/dashboard" replace />

  const today = new Date().toISOString().slice(0, 10)
  const hasHeroForToday = !!hero && heroName.trim().length > 0 && heroDate === today
  const isHeroBuilder = location.pathname === '/kids/hero-builder'

  if (!hasHeroForToday && !isHeroBuilder) {
    return <Navigate to="/kids/hero-builder" replace />
  }

  return <Outlet />
}
