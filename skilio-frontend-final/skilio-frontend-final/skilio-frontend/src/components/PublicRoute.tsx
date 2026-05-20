import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PublicRoute() {
  const token     = useAuthStore((s) => s.token)
  const user      = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  // While the startup refresh check is in-flight, render nothing to avoid a
  // flash of the login form before we know whether the session is valid.
  if (isLoading) return null

  if (token) {
    return <Navigate to={user?.is_admin ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
