import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useKidsStore, HEROES } from '@/store/kidsStore'
import { useModules } from '@/hooks/useModules'
import { useChildSummary } from '@/hooks/useChildren'
import { Spinner } from '@/components/ui/Spinner'
import { getWorldTheme, type WorldTheme } from '@/pages/kids/worldThemes'
import type { SkillModule } from '@/types'

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  size: (i % 3) + 1,
  top: (i * 37 + 7) % 100,
  left: (i * 61 + 13) % 100,
  dur: 2.2 + (i % 3) * 0.8,
  del: (i % 5) * 0.4,
}))

export function WorldSelectionPage() {
  const navigate = useNavigate()
  const { selectedChild, hero, heroColor, heroName } = useKidsStore()
  const heroInfo = HEROES.find((h) => h.id === hero)

  const { data: modules, isLoading } = useModules(selectedChild?.age)
  const { data: childData } = useChildSummary(selectedChild?.id ?? 0)
  const totalDone = childData?.module_progress.reduce((sum, p) => sum + p.lessons_completed, 0) ?? 0

  return (
    <div className="kids-page flex flex-col" style={{ background: '#06071a' }}>

      {/* Star field */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: s.size,
              height: s.size,
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.del}s`,
              opacity: 0.12,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-5 py-10 md:py-14">
        <div className="w-full max-w-5xl flex justify-between items-center gap-3 mb-8">
          <div className="flex gap-3">
            <span className="kids-pill">⭐ {childData?.total_xp ?? 0} XP</span>
            {totalDone > 0 && (
              <span className="kids-pill hidden sm:inline-flex">🎯 {totalDone} mission{totalDone !== 1 ? 's' : ''} done</span>
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
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="kids-title text-4xl md:text-5xl mb-3">Choose your world</h1>
          <p className="text-white/48 text-lg font-bold">
            Hey {heroName || selectedChild?.display_name}! Where do you want to explore today?
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="border-white/20 border-t-primary-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {(modules ?? []).map((module, i) => {
              const theme = getWorldTheme(module.title)
              const progress = childData?.module_progress.find((p) => p.module_id === module.id)
              const done = progress?.lessons_completed ?? 0
              const total = progress?.total_lessons ?? 0

              return (
                <WorldCard
                  key={module.id}
                  module={module}
                  theme={theme}
                  done={done}
                  total={total}
                  delay={i * 100}
                  onClick={() => navigate(`/kids/worlds/${module.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function WorldCard({
  module,
  theme,
  done,
  total,
  delay,
  onClick,
}: {
  module: SkillModule
  theme: WorldTheme
  done: number
  total: number
  delay: number
  onClick: () => void
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-3xl flex flex-col text-left w-full min-h-[360px]',
        'border hover:border-white/30',
        'transition-all duration-200 hover:-translate-y-1',
        'animate-fade-up opacity-0 focus:outline-none',
      )}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards',
        background: `linear-gradient(180deg, ${theme.bgFrom}, ${theme.bgTo})`,
        borderColor: theme.cardBorder,
        boxShadow: `0 4px 32px ${theme.bgGlow}`,
      }}
    >
      <div className="relative h-48 overflow-hidden" style={{ background: theme.sceneBg }}>
        <WorldPreview theme={theme} title={module.title} />
      </div>

      <div className="flex-1 p-5" style={{ background: theme.panelBg }}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-2xl text-white leading-tight">{module.title}</h3>
          <span className="kids-pill text-xs py-1 min-h-0 px-3">
            {total > 0 ? `${done}/${total} done` : 'Ready'}
          </span>
        </div>
        <p className="text-white/55 text-sm leading-relaxed mb-4">
          {theme.tagline}
        </p>

        {total > 0 && (
          <>
            <div className="w-full bg-black/20 rounded-full h-2 mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: theme.accentColor }}
              />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: Math.max(total, 3) }).slice(0, 4).map((_, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: i < done ? theme.accentColor : 'rgba(255,255,255,0.16)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </button>
  )
}

function WorldPreview({ theme, title }: { theme: WorldTheme; title: string }) {
  const isSpace = title.toLowerCase().includes('space')
  const isSea = title.toLowerCase().includes('sea')

  if (isSpace) {
    return (
      <>
        <span className="absolute left-6 top-8 text-6xl scene-float">🔴</span>
        <span className="absolute right-4 top-0 text-7xl scene-float2">🟡</span>
        <span className="absolute right-16 top-10 text-7xl scene-float">🟠</span>
        <span className="absolute left-1/2 top-24 text-3xl scene-float">👩‍🚀</span>
        <span className="absolute left-[54%] bottom-8 text-5xl scene-float2">🌕</span>
      </>
    )
  }

  if (isSea) {
    return (
      <>
        <span className="absolute left-8 top-10 text-4xl scene-float">🐠</span>
        <span className="absolute left-1/2 top-10 text-4xl scene-float2">🧜‍♀️</span>
        <span className="absolute right-10 top-12 text-3xl scene-float">🐡</span>
        <span className="absolute left-1/2 bottom-10 text-4xl scene-float">🐙</span>
        <span className="absolute left-8 bottom-7 text-3xl">🪸</span>
        <span className="absolute left-32 bottom-7 text-3xl">🌿</span>
      </>
    )
  }

  return (
    <>
      <span className="absolute left-8 bottom-7 text-5xl scene-sway">🌲</span>
      <span className="absolute left-1/2 bottom-7 text-5xl scene-sway">🍄</span>
      <span className="absolute right-8 bottom-7 text-6xl scene-sway">🌳</span>
      <span className="absolute left-1/2 top-10 text-4xl scene-float">🧚</span>
      <span className="absolute right-20 top-4 text-2xl scene-float2">🦉</span>
      <span className="absolute left-20 top-5 text-2xl scene-float">🦅</span>
    </>
  )
}
