import { apiClient } from './client'

export interface AdminStats {
  total_parents: number
  total_children: number
  total_modules: number
  total_lessons: number
  total_attempts: number
  completed_attempts: number
  total_xp_earned: number
}

export interface AdminUser {
  id: number
  email: string
  full_name: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  child_count: number
}

export interface AdminChild {
  id: number
  display_name: string
  age: number
  total_xp: number
  parent_email: string
  is_active: boolean
}

export const adminApi = {
  getStats:    () => apiClient.get<AdminStats>('/admin/stats').then((r) => r.data),
  getUsers:    () => apiClient.get<AdminUser[]>('/admin/users').then((r) => r.data),
  getChildren: () => apiClient.get<AdminChild[]>('/admin/children').then((r) => r.data),
}
