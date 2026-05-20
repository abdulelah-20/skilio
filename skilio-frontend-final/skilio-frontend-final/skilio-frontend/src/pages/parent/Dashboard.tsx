import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useQueries } from '@tanstack/react-query'

import { useAuthStore }       from '@/store/authStore'
import { useChildren }        from '@/hooks/useChildren'
import { useKidsStore }       from '@/store/kidsStore'
import { childrenApi }        from '@/api/children'
import { Avatar }             from '@/components/ui/Avatar'
import { XPBar }              from '@/components/ui/XPBar'
import { ProgressBar }        from '@/components/ui/ProgressBar'
import { Spinner }            from '@/components/ui/Spinner'
import { EmptyState }         from '@/components/ui/EmptyState'
import { ErrorMessage }       from '@/components/ui/ErrorMessage'
import { getApiErrorMessage } from '@/api/client'
import type { BadgeAward, ChildDashboard, ChildSummary, ModuleProgress } from '@/types'

// ── Module-level constants ────────────────────────────────────────────────────

const BANNER_STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  width: 2 + (i % 2),
  top: (i * 19 + 7) % 80,
  left: (i * 31 + 11) % 90,
  opacity: 0.15 + (i % 4) * 0.1,
}))

const RANK_MEDALS = ['🥇', '🥈', '🥉']

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const ms    = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(ms / 60_000)
  const hours = Math.floor(ms / 3_600_000)
  const days  = Math.floor(ms / 86_400_000)
  if (mins  < 2)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

type ActivityEvent =
  | { kind: 'badge';  childName: string; label: string; at: string }
  | { kind: 'module'; childName: string; label: string; pct: number; at: string }

function buildFeed(summaries: ChildDashboard[], limit = 10): ActivityEvent[] {
  const events: ActivityEvent[] = []
  for (const s of summaries) {
    for (const award of s.badges_earned) {
      events.push({ kind: 'badge', childName: s.display_name, label: award.badge.name, at: award.awarded_at })
    }
    for (const mod of s.module_progress) {
      if (mod.last_activity_at) {
        events.push({
          kind: 'module',
          childName: s.display_name,
          label: mod.module_title,
          pct: mod.completion_percentage,
          at: mod.last_activity_at,
        })
      }
    }
  }
  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const user    = useAuthStore((s) => s.user)
  const { data, isLoading, error } = useChildren()
  const setChild  = useKidsStore((s) => s.setChild)
  const navigate  = useNavigate()
  const [showKidsPicker, setShowKidsPicker] = useState(false)

  const firstName = user?.full_name.split(' ')[0] ?? 'there'
  const timeGreeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Load full dashboard summary for each child in parallel (React Query caches each one)
  const summaryResults = useQueries({
    queries: (data ?? []).map((child) => ({
      queryKey: ['children', child.id, 'summary'] as const,
      queryFn: () => childrenApi.getSummary(child.id),
      enabled: !!data && child.id > 0,
      staleTime: 60_000,
    })),
  })
  const summaries = summaryResults.map((r) => r.data).filter(Boolean) as ChildDashboard[]
  const summariesLoading = summaryResults.some((r) => r.isLoading)

  // Derived data for the 4 feature sections
  const leaderboard = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.total_xp - a.total_xp),
    [data],
  )
  const activityFeed = useMemo(() => buildFeed(summaries), [summaries])
  const allBadges = useMemo(
    () => summaries.flatMap((s) => s.badges_earned.map((a) => ({ ...a, childName: s.display_name }))),
    [summaries],
  )

  function enterKidsMode(child: ChildSummary) {
    setChild(child)
    navigate('/kids')
  }

  const hasChildren = !!data && data.length > 0

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-surface-400 text-sm font-medium mb-1">
            {timeGreeting}, {firstName}
          </p>
          <h1 className="page-title">Your children</h1>
        </div>
        <Link to="/children" className="btn-outline btn-sm">
          Manage profiles
        </Link>
      </div>

      {/* ── Kids Mode Banner ── */}
      {hasChildren && !showKidsPicker && (
        <div
          className="mb-8 rounded-3xl overflow-hidden animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0f35 60%, #0d1235 100%)',
            border: '1px solid rgba(129,140,248,0.3)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
          }}
        >
          <div style={{ position: 'relative' }}>
            {BANNER_STARS.map((s) => (
              <div key={s.id} style={{
                position: 'absolute', width: s.width, height: s.width,
                borderRadius: '50%', background: '#fff',
                top: `${s.top}%`, left: `${s.left}%`, opacity: s.opacity,
              }} />
            ))}
            <div className="flex items-center justify-between p-6 gap-4">
              <div className="flex items-center gap-5">
                <div style={{
                  width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                  background: 'rgba(129,140,248,0.15)',
                  border: '2px solid rgba(129,140,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, boxShadow: '0 0 20px rgba(129,140,248,0.3)',
                }}>🎮</div>
                <div>
                  <p style={{ fontFamily: '"Fredoka One", cursive', fontSize: 22, color: '#fff', margin: 0, marginBottom: 4 }}>
                    Ready to play?
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
                    Switch to Kids Mode — choose a child and start a mission
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKidsPicker(true)}
                style={{
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #7c3aed, #818cf8)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  borderRadius: 14, padding: '12px 24px',
                  fontFamily: '"Fredoka One", cursive',
                  fontSize: 16, fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
                  display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                }}
              >
                🚀 Kids Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kids Mode child picker ── */}
      {showKidsPicker && hasChildren && (
        <div
          className="mb-8 rounded-3xl overflow-hidden animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, #0d0a1a 0%, #1a0f35 100%)',
            border: '2px solid rgba(129,140,248,0.4)',
            boxShadow: '0 8px 40px rgba(99,102,241,0.25)',
            padding: '24px',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <p style={{ fontFamily: '"Fredoka One", cursive', fontSize: 22, color: '#fff', margin: 0 }}>
              🌟 Who's playing today?
            </p>
            <button
              onClick={() => setShowKidsPicker(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
            >✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {(data ?? []).map((child) => (
              <button
                key={child.id}
                onClick={() => enterKidsMode(child)}
                style={{
                  background: 'rgba(129,140,248,0.1)', border: '2px solid rgba(129,140,248,0.2)',
                  borderRadius: 18, padding: '20px 16px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(129,140,248,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.6)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(129,140,248,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Avatar name={child.display_name} imageUrl={child.avatar_url} size="lg" />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: 0 }}>{child.display_name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Age {child.age}</p>
                  <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, margin: '4px 0 0' }}>⭐ {child.total_xp} XP</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <ErrorMessage message={getApiErrorMessage(error)} className="mb-6" />
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && data?.length === 0 && (
        <EmptyState
          icon="👶"
          title="No children yet"
          description="Add your first child profile to start tracking their learning journey."
          action={
            <Link to="/children" className="btn-primary">
              Add first child
            </Link>
          }
        />
      )}

      {/* ── Child cards grid ── */}
      {hasChildren && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(data ?? []).map((child, i) => (
            <ChildCard
              key={child.id}
              child={child}
              delay={i * 80}
              onEnterKidsMode={() => enterKidsMode(child)}
            />
          ))}
          <Link
            to="/children"
            className={clsx(
              'card border-dashed border-surface-300 bg-transparent',
              'flex flex-col items-center justify-center gap-2',
              'p-8 text-center cursor-pointer',
              'hover:border-primary-400 hover:bg-primary-50 transition-all duration-200',
              'group animate-fade-up',
            )}
            style={{ animationDelay: `${(data?.length ?? 0) * 80}ms` }}
          >
            <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-surface-300 group-hover:border-primary-400 flex items-center justify-center transition-colors">
              <span className="text-2xl text-surface-300 group-hover:text-primary-400 transition-colors">+</span>
            </div>
            <span className="text-sm font-semibold text-surface-400 group-hover:text-primary-600 transition-colors">
              Add another child
            </span>
          </Link>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          Feature sections — only shown once children exist
          ════════════════════════════════════════════════════════════════════════ */}

      {hasChildren && (
        <>
          {/* ── XP Leaderboard (siblings only) ──────────────────────────────── */}
          {leaderboard.length > 1 && (
            <section className="mt-10 animate-fade-up">
              <h2 className="section-heading mb-4">🏆 XP Leaderboard</h2>
              <div className="card p-5 space-y-4">
                {leaderboard.map((child, i) => {
                  const maxXp = leaderboard[0].total_xp || 1
                  const pct   = Math.round((child.total_xp / maxXp) * 100)
                  return (
                    <div key={child.id} className="flex items-center gap-4">
                      <span className="text-2xl w-8 text-center shrink-0">
                        {RANK_MEDALS[i] ?? `#${i + 1}`}
                      </span>
                      <Avatar name={child.display_name} imageUrl={child.avatar_url} size="sm" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-surface-800 truncate">
                            {child.display_name}
                          </span>
                          <span className="text-xs font-bold text-primary-600 ml-2 shrink-0">
                            ⭐ {child.total_xp} XP
                          </span>
                        </div>
                        <ProgressBar value={pct} size="sm" colour="primary" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Two-column grid: Activity Feed + Progress Overview ─────────── */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Recent Activity ───────────────────────────────────────────── */}
            <section className="animate-fade-up animation-delay-100">
              <h2 className="section-heading mb-4">📋 Recent Activity</h2>
              <div className="card p-5">
                {summariesLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="sm" />
                  </div>
                ) : activityFeed.length === 0 ? (
                  <p className="text-surface-400 text-sm py-4 text-center">
                    No activity yet — start a mission to see updates here!
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {activityFeed.map((event, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-lg mt-0.5 shrink-0">
                          {event.kind === 'badge' ? '🏅' : '📚'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-surface-800 font-medium leading-snug">
                            <span className="font-bold text-primary-600">{event.childName}</span>
                            {event.kind === 'badge'
                              ? ` earned "${event.label}"`
                              : ` played in ${event.label}`}
                            {event.kind === 'module' && event.pct === 100 && (
                              <span className="ml-1 text-green-600 font-bold">✓ Complete</span>
                            )}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">{timeAgo(event.at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* ── Module Progress Overview ──────────────────────────────────── */}
            <section className="animate-fade-up animation-delay-200">
              <h2 className="section-heading mb-4">📊 Module Progress</h2>
              <div className="card p-5">
                {summariesLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="sm" />
                  </div>
                ) : summaries.length === 0 ? (
                  <p className="text-surface-400 text-sm py-4 text-center">
                    No modules started yet.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {summaries.map((s) => (
                      <ChildProgressBlock key={s.child_id} summary={s} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Badge Gallery ─────────────────────────────────────────────────── */}
          {(summariesLoading || allBadges.length > 0) && (
            <section className="mt-10 animate-fade-up animation-delay-300">
              <h2 className="section-heading mb-4">🏅 Badges Earned</h2>
              {summariesLoading ? (
                <div className="card p-8 flex justify-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {allBadges.map((award) => (
                    <BadgeTile key={award.id} award={award} childName={award.childName} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Quick actions ───────────────────────────────────────────────── */}
          <div className="mt-10">
            <h2 className="section-heading">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickAction
                icon="◈"
                title="Browse modules"
                description="Explore all available skill modules"
                to="/learn"
                colour="green"
              />
              <QuickAction
                icon="◎"
                title="Manage children"
                description="Add, edit, or view child profiles"
                to="/children"
                colour="amber"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Child card ─────────────────────────────────────────────────────────────────

function ChildCard({
  child, delay, onEnterKidsMode,
}: {
  child: ChildSummary
  delay: number
  onEnterKidsMode: () => void
}) {
  return (
    <div
      className="card p-5 flex flex-col gap-4 animate-fade-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-3">
        <Avatar name={child.display_name} imageUrl={child.avatar_url} size="lg" />
        <div>
          <p className="font-semibold text-surface-900 text-base leading-tight">{child.display_name}</p>
          <p className="text-surface-400 text-sm">Age {child.age}</p>
        </div>
      </div>
      <XPBar current={child.total_xp} showLabel />
      <div className="flex items-center justify-between pt-1 gap-2">
        <Link to={`/children/${child.id}`} className="badge-green text-xs">
          View progress →
        </Link>
        <button onClick={onEnterKidsMode} className="btn-primary btn-sm">
          ▶ Play as {child.display_name}
        </button>
      </div>
    </div>
  )
}

// ── Per-child module progress block ────────────────────────────────────────────

function ChildProgressBlock({ summary }: { summary: ChildDashboard }) {
  if (summary.module_progress.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={summary.display_name} size="sm" />
        <span className="text-sm font-bold text-surface-800">{summary.display_name}</span>
      </div>
      <div className="space-y-2 pl-7">
        {summary.module_progress.map((m) => (
          <ProgressBar
            key={m.module_id}
            value={m.completion_percentage}
            label={`${m.module_title} (${m.lessons_completed}/${m.total_lessons})`}
            size="sm"
            colour={m.completion_percentage === 100 ? 'accent' : 'primary'}
          />
        ))}
      </div>
    </div>
  )
}

// ── Badge tile ─────────────────────────────────────────────────────────────────

function BadgeTile({ award, childName }: { award: BadgeAward; childName: string }) {
  return (
    <div className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-card transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center text-2xl">
        ⭐
      </div>
      <p className="text-xs font-bold text-surface-800 leading-tight line-clamp-2">
        {award.badge.name}
      </p>
      <p className="text-[11px] text-surface-400 font-medium">{childName}</p>
    </div>
  )
}

// ── Quick action card ──────────────────────────────────────────────────────────

function QuickAction({
  icon, title, description, to, colour,
}: {
  icon: string
  title: string
  description: string
  to: string
  colour: 'green' | 'amber'
}) {
  const colours = {
    green: 'bg-primary-50 border-primary-200 hover:border-primary-400',
    amber: 'bg-accent-50 border-accent-200 hover:border-accent-400',
  }
  const iconColours = {
    green: 'text-primary-500',
    amber: 'text-accent-500',
  }
  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-card',
        colours[colour],
      )}
    >
      <span className={clsx('text-2xl', iconColours[colour])}>{icon}</span>
      <div>
        <p className="font-semibold text-surface-800 text-sm">{title}</p>
        <p className="text-surface-400 text-xs">{description}</p>
      </div>
      <span className="ml-auto text-surface-300">→</span>
    </Link>
  )
}
