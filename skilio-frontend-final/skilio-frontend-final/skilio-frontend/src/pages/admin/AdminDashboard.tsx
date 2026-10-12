import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { adminApi, type AdminUser, type AdminChild } from '@/api/admin'
import { Spinner } from '@/components/ui/Spinner'
import { authApi } from '@/api/auth'

export function AdminDashboardPage() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const user      = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<'overview' | 'users' | 'children'>('overview')

  const stats    = useQuery({ queryKey: ['admin-stats'],    queryFn: adminApi.getStats })
  const users    = useQuery({ queryKey: ['admin-users'],    queryFn: adminApi.getUsers,    enabled: tab === 'users' })
  const children = useQuery({ queryKey: ['admin-children'], queryFn: adminApi.getChildren, enabled: tab === 'children' })

  async function handleLogout() {
    try { await authApi.logout() } catch { /* ignore */ }
    clearAuth()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0c1d', fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#150f2e',
        borderRight: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', flexDirection: 'column',
        padding: '28px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(124,58,237,0.5)',
              fontFamily: '"Fredoka One", cursive', color: '#fff', fontSize: 16, fontWeight: 700,
            }}>S</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: 0 }}>Skilio</p>
              <p style={{ color: 'rgba(124,58,237,0.8)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', margin: 0 }}>ADMIN</p>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: 0 }}>{user?.email}</p>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {([['overview', '◈', 'Overview'], ['users', '◎', 'Parents'], ['children', '★', 'Children']] as const).map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer', marginBottom: 4,
                background: tab === key ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: tab === key ? '#a78bfa' : 'rgba(255,255,255,0.45)',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                transition: 'all 150ms',
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 12px', borderRadius: 10,
              border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer',
              background: 'rgba(239,68,68,0.08)',
              color: 'rgba(239,68,68,0.7)',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '36px 32px' }}>
        {tab === 'overview' && <OverviewTab stats={stats} />}
        {tab === 'users'    && <UsersTab users={users} />}
        {tab === 'children' && <ChildrenTab children={children} />}
      </main>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ stats }: { stats: ReturnType<typeof useQuery> }) {
  if (stats.isLoading) return <CenterSpinner />
  if (stats.isError)   return <ErrorBox msg="Failed to load stats" />
  const s = stats.data as ReturnType<typeof adminApi.getStats> extends Promise<infer T> ? T : never

  const cards = [
    { label: 'Parent Accounts', value: s.total_parents,       icon: '◎', color: '#818cf8' },
    { label: 'Children',        value: s.total_children,      icon: '★', color: '#4ade80' },
    { label: 'Skill Modules',   value: s.total_modules,       icon: '◈', color: '#f472b6' },
    { label: 'Total Lessons',   value: s.total_lessons,       icon: '📖', color: '#fb923c' },
    { label: 'Missions Played', value: s.total_attempts,      icon: '🎮', color: '#38bdf8' },
    { label: 'Missions Completed', value: s.completed_attempts, icon: '🏆', color: '#fbbf24' },
    { label: 'Total XP Earned', value: s.total_xp_earned.toLocaleString(), icon: '⭐', color: '#a78bfa' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: '"Fredoka One", cursive', fontSize: 30, color: '#fff', marginBottom: 4 }}>
        Platform Overview
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 14 }}>
        Live metrics across all Skilio users
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            background: '#1a1035', borderRadius: 16, padding: '22px 20px',
            border: `1px solid ${c.color}30`,
            boxShadow: `0 0 20px ${c.color}10`,
          }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontFamily: '"Fredoka One", cursive', fontSize: 32, color: c.color, lineHeight: 1, marginBottom: 6 }}>
              {c.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
              {c.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Users table ───────────────────────────────────────────────────────────────

function UsersTab({ users }: { users: ReturnType<typeof useQuery> }) {
  if (users.isLoading) return <CenterSpinner />
  if (users.isError)   return <ErrorBox msg="Failed to load users" />
  const list = users.data as AdminUser[]

  return (
    <div>
      <h1 style={{ fontFamily: '"Fredoka One", cursive', fontSize: 30, color: '#fff', marginBottom: 4 }}>
        Parent Accounts
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontSize: 14 }}>
        {list.length} registered accounts
      </p>
      <div style={{ background: '#1a1035', borderRadius: 16, border: '1px solid rgba(124,58,237,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
              {['Name', 'Email', 'Children', 'Status', 'Role', 'Joined'].map((h) => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: 14 }}>{u.full_name}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700 }}>
                    {u.child_count}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: u.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
                    color: u.is_active ? '#4ade80' : '#f87171',
                    borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                  }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: u.is_admin ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                    color: u.is_admin ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                    borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                  }}>
                    {u.is_admin ? 'Admin' : 'Parent'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Children table ────────────────────────────────────────────────────────────

function ChildrenTab({ children }: { children: ReturnType<typeof useQuery> }) {
  if (children.isLoading) return <CenterSpinner />
  if (children.isError)   return <ErrorBox msg="Failed to load children" />
  const list = children.data as AdminChild[]

  return (
    <div>
      <h1 style={{ fontFamily: '"Fredoka One", cursive', fontSize: 30, color: '#fff', marginBottom: 4 }}>
        Children
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontSize: 14 }}>
        {list.length} child profiles · sorted by XP
      </p>
      <div style={{ background: '#1a1035', borderRadius: 16, border: '1px solid rgba(124,58,237,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
              {['Name', 'Age', 'XP', 'Parent', 'Status'].map((h) => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: 14 }}>{c.display_name}</td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{c.age}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>⭐</span>
                    <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 15 }}>{c.total_xp}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{c.parent_email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: c.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
                    color: c.is_active ? '#4ade80' : '#f87171',
                    borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                  }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CenterSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <Spinner size="lg" />
    </div>
  )
}
function ErrorBox({ msg }: { msg: string }) {
  return <div style={{ color: '#f87171', padding: 24, background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>{msg}</div>
}
