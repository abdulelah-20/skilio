import React, { Component, useEffect, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { router } from './router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import './styles/globals.css'

// ── React Query client configuration ─────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// ── Error boundary — prevents a white screen on uncaught render errors ───────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#f8f7ff' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1a1035' }}>Something went wrong</h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Reload the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── AuthProvider — recovers session from httpOnly refresh cookie on startup ──
// On every page load (or hard refresh) this component calls /api/auth/refresh.
// If the cookie is valid the user stays logged in without re-entering credentials.
// While the check is in flight, isLoading=true makes ProtectedRoute show a spinner.
function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    authApi
      .refresh()
      .then(async (token) => {
        // Temporarily write the token so the getMe() interceptor can use it
        useAuthStore.setState({ token: token.access_token })
        const user = await authApi.getMe()
        useAuthStore.getState().setAuth(user, token.access_token)
      })
      .catch(() => {
        // No valid session — clear any stale state
        useAuthStore.getState().clearAuth()
      })
  }, [])

  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
