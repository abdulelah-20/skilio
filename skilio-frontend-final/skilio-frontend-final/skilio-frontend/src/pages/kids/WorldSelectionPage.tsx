import { useNavigate } from 'react-router-dom'
import { useKidsStore, HEROES } from '@/store/kidsStore'
import { useModules } from '@/hooks/useModules'
import { useChildSummary } from '@/hooks/useChildren'
import { Spinner } from '@/components/ui/Spinner'

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  size: (i % 3) + 1,
  top: (i * 37 + 7) % 100,
  left: (i * 61 + 13) % 100,
  dur: 2.2 + (i % 3) * 0.8,
  del: (i % 5) * 0.4,
}))

const WORLD_CONFIGS = [
  {
    emoji: '🌍',
    title: 'Earthquake Safety',
    tagline: 'Learn what to do when the ground shakes — at school, home, and outside.',
    accentColor: '#f59e0b',
    cardBg: 'rgba(245,158,11,0.10)',
    cardBorder: 'rgba(245,158,11,0.28)',
    glow: 'rgba(245,158,11,0.18)',
    locked: false,
  },
  {
    emoji: '🌀',
    title: 'Hurricane Safety',
    tagline: 'Coming soon — prepare and stay safe when a storm approaches.',
    accentColor: 'rgba(255,255,255,0.25)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    glow: 'transparent',
    locked: true,
  },
  {
    emoji: '🌊',
    title: 'Flood Safety',
    tagline: 'Coming soon — know what to do when water rises fast.',
    accentColor: 'rgba(255,255,255,0.25)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.08)',
    glow: 'transparent',
    locked: true,
  },
]

export function WorldSelectionPage() {
  const navigate = useNavigate()
  const { selectedChild, hero, heroColor, heroName } = useKidsStore()
  const heroInfo = HEROES.find((h) => h.id === hero)

  const { data: modules, isLoading } = useModules(selectedChild?.age)
  const { data: childData } = useChildSummary(selectedChild?.id ?? 0)

  const totalXp = childData?.total_xp ?? 0
  const totalDone = childData?.module_progress.reduce((sum, p) => sum + p.lessons_completed, 0) ?? 0

  const eqModule = modules?.find((m) => m.title.toLowerCase().includes('earthquake')) ?? modules?.[0]

  return (
    <div className="kids-page flex flex-col" style={{ background: '#06071a' }}>

      {/* Star field */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: s.size, height: s.size,
              top: `${s.top}%`, left: `${s.left}%`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.del}s`,
              opacity: 0.12,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-10 md:py-14">

        {/* Top bar */}
        <div className="w-full max-w-5xl flex justify-between items-center gap-3 mb-8">
          <div className="flex gap-3">
            <span className="kids-pill">⭐ {totalXp} XP</span>
            {totalDone > 0 && (
              <span className="kids-pill hidden sm:inline-flex">
                🎯 {totalDone} mission{totalDone !== 1 ? 's' : ''} done
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/kids/hero-builder')}
            className="kids-pill shrink-0"
            style={{ background: `${heroColor}1f` }}
          >
            <span>{heroInfo?.emoji ?? '⭐'}</span>
            <span className="max-w-[120px] truncate">{heroName || selectedChild?.display_name}</span>
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="kids-title text-3xl md:text-4xl mb-2">Choose your world</h1>
          <p className="text-white/50 text-base font-bold">
            Pick a world and start your adventure!
          </p>
        </div>

        {/* World cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="border-white/20 border-t-amber-400" />
          </div>
        ) : (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORLD_CONFIGS.map((world, i) => {
              const isEq = i === 0

              return (
                <button
                  key={world.title}
                  onClick={() => {
                    if (!world.locked && eqModule) {
                      navigate(`/kids/worlds/${eqModule.id}/map`)
                    }
                  }}
                  disabled={world.locked}
                  className="text-left rounded-3xl border p-6 transition-all duration-200 animate-fade-up"
                  style={{
                    background: world.cardBg,
                    borderColor: world.cardBorder,
                    boxShadow: world.locked ? 'none' : `0 8px 32px ${world.glow}`,
                    animationDelay: `${i * 80}ms`,
                    animationFillMode: 'forwards',
                    cursor: world.locked ? 'default' : 'pointer',
                    opacity: world.locked ? 0.45 : 1,
                    ...(isEq ? {} : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!world.locked) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                  }}
                >
                  <div style={{ fontSize: 52, marginBottom: 12, filter: world.locked ? 'grayscale(1)' : 'none' }}>
                    {world.emoji}
                  </div>
                  <h2
                    className="font-display text-2xl mb-1"
                    style={{ color: world.locked ? 'rgba(255,255,255,0.35)' : '#fff' }}
                  >
                    {world.title}
                  </h2>
                  <p
                    className="text-sm font-semibold mb-4 leading-relaxed"
                    style={{ color: world.locked ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.55)' }}
                  >
                    {world.tagline}
                  </p>
                  <span
                    className="kids-pill text-xs"
                    style={{
                      color: world.locked ? 'rgba(255,255,255,0.22)' : world.accentColor,
                      minHeight: 0,
                      padding: '4px 12px',
                      background: world.locked ? 'rgba(255,255,255,0.05)' : undefined,
                      borderColor: world.locked ? 'rgba(255,255,255,0.08)' : undefined,
                    }}
                  >
                    {world.locked ? '🔒 Coming soon' : 'Explore →'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
