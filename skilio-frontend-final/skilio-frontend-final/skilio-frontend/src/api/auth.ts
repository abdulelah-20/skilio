// src/api/auth.ts
import apiClient from './client'
import type {
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  RegisterPayload,
  ResetPasswordPayload,
  Token,
  User,
} from '@/types'

export const authApi = {
  /**
   * POST /api/auth/login
   * FastAPI uses OAuth2PasswordRequestForm — credentials must be form-encoded,
   * not JSON. The 'username' field maps to email on the backend.
   */
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const form = new URLSearchParams()
    form.append('username', credentials.username)
    form.append('password', credentials.password)

    const { data } = await apiClient.post<Token>('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  /** POST /api/auth/register */
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/auth/register', payload)
    return data
  },

  /** POST /api/auth/forgot-password */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/api/auth/forgot-password', payload)
    return data
  },

  /** POST /api/auth/reset-password */
  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>('/api/auth/reset-password', payload)
    return data
  },

  /** GET /api/auth/me */
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/auth/me')
    return data
  },

  /** POST /api/auth/refresh — exchanges the httpOnly refresh cookie for a new access token */
  refresh: async (): Promise<Token> => {
    const { data } = await apiClient.post<Token>('/api/auth/refresh')
    return data
  },

  /** POST /api/auth/logout */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },
}
