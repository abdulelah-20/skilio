// ─────────────────────────────────────────────────────────────────────────────
// src/api/client.ts
// Configured Axios instance used by every API module.
//
// Responsibilities:
//   1. Base URL — empty string so Vite's proxy forwards /api/* to FastAPI
//   2. Request interceptor — injects Authorization: Bearer <token> header
//      from the Zustand auth store on every request
//   3. Response interceptor — on 401, clears auth state and redirects to /login
//
// All other Axios instances in this project should be avoided — import this
// client instead so interceptors always run.
// ─────────────────────────────────────────────────────────────────────────────

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// We import the store atom directly (not the hook) so this module can run
// outside of React components (e.g. in api modules, utility functions).
import { useAuthStore } from '@/store/authStore'

// ── Axios instance ────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  // Empty baseURL — Vite's dev server proxy handles forwarding /api to :8000
  // In production, set VITE_API_BASE_URL and use it here.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

// ── Request interceptor — attach Bearer token ─────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token directly from Zustand store state (no hook required)
    const token = useAuthStore.getState().token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ── Response interceptor — handle 401 ────────────────────────────────────────

apiClient.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Auth endpoints (login, register, refresh, me, etc.) handle their own
      // 401s — let the calling mutation show the error message instead of
      // hard-redirecting to landing. Only redirect on protected-resource 401s.
      const isAuthEndpoint = (error.config as { url?: string })?.url?.startsWith('/api/auth/')
      useAuthStore.getState().clearAuth()

      if (!isAuthEndpoint && window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  },
)

// ── Helper: extract error message from API response ───────────────────────────

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (!data) return error.message

    // FastAPI validation errors: { detail: [{ msg, type, loc }] }
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((e: { msg: string }) => e.msg)
        .join(', ')
    }

    // FastAPI HTTP exceptions: { detail: "string" }
    if (typeof data.detail === 'string') {
      return data.detail
    }
  }

  if (error instanceof Error) return error.message

  return 'An unexpected error occurred'
}

export default apiClient
