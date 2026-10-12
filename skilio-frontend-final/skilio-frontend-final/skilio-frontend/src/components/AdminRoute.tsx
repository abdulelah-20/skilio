import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function AdminRoute() {
  const { token, isLoading, user } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0c1d' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
