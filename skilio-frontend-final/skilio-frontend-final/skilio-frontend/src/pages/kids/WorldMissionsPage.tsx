import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { useKidsStore, HEROES } from '@/store/kidsStore'
import { useModule } from '@/hooks/useModules'
import { useChildSummary } from '@/hooks/useChildren'
import { scenariosApi } from '@/api/scenarios'
import { useScenarioStore } from '@/store/scenarioStore'
import { getWorldTheme } from '@/pages/kids/worldThemes'
import { Spinner } from '@/components/ui/Spinner'
import { getApiErrorMessage } from '@/api/client'
import type { Lesson } from '@/types'

export function WorldMissionsPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { selectedChild, hero, heroColor, heroName } = useKidsStore()
  const heroInfo = HEROES.find((h) => h.id === hero)

  const parsedModuleId = Number(moduleId)
  const { data: module, isLoading } = useModule(isNaN(parsedModuleId) ? 0 : parsedModuleId)
  const { data: childData } = useChildSummary(selectedChild?.id ?? 0)
  const startScenario  = useScenarioStore((s) => s.startScenario)
  const resetScenario  = useScenarioStore((s) => s.resetScenario)

  const [startingId, setStartingId] = useState<number | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  const theme = getWorldTheme(module?.title)
  const progress = childData?.module_progress.find((p) => p.module_id === parsedModuleId)

  async function handlePlay(lesson: Lesson) {
    if (!selectedChild || !lesson.entry_node_id) return
    setStartingId(lesson.id)
    setStartError(null)
    try {
      const attempt = await scenariosApi.startAttempt(selectedChild.id, lesson.id)
      startScenario(attempt)
      navigate(`/kids/play/${moduleId}/${lesson.id}`)
    } catch (err) {
      resetScenario()
      setStartError(getApiErrorMessage(err))
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div
      className="kids-page flex flex-col"
      style={{ background: `linear-gradient(180deg, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)` }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={() => navigate('/kids/worlds')}
          className="kids-pill text-sm"
        >
          ← Map
        </button>
        <h2 className="font-display text-lg hidden sm:block" style={{ color: theme.accentColor }}>
          {theme.emoji} {module?.title}
        </h2>
        <div className="flex items-center gap-3">
          {/* XP */}
          <div className="kids-pill">
            <span>⭐</span>
            <span>{childData?.total_xp ?? 0} XP</span>
          </div>
          {/* Hero chip */}
          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border border-white/20"
            style={{ background: `${heroColor}25` }}
          >
            <span className="text-base">{heroInfo?.emoji ?? '⭐'}</span>
            <span className="text-white text-sm font-semibold">
              {heroName || selectedChild?.display_name}
            </span>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="border-white/20 border-t-white/60" />
        </div>
      ) : (
        <div className="flex-1 w-full">
          <section
            className="relative min-h-[220px] px-5 py-10 md:py-14 overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${theme.bgFrom}, ${theme.bgTo})` }}
          >
            <div className="absolute right-6 top-5 flex flex-col gap-5 text-5xl opacity-90">
              <span className="scene-float">{theme.character}</span>
              <span className="scene-float2">🦉</span>
            </div>
            <div className="relative z-10 max-w-5xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-3">{module?.title}</h1>
              <p className="font-bold mb-4" style={{ color: `${theme.accentColor}cc` }}>
                {theme.greeting.split('.')[0]}!
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="kids-pill" style={{ color: theme.accentColor }}>{module?.lessons?.length ?? 0} missions</span>
                <span className="kids-pill" style={{ color: '#fbbf24' }}>
                  Up to {(module?.lessons ?? []).reduce((sum, l) => sum + l.xp_reward, 0)} XP
                </span>
              </div>
            </div>
          </section>

          {/* Character speech bubble */}
          <div className="max-w-6xl mx-auto px-4 md:px-5 pt-7">
          <div className="flex gap-4 mb-7 animate-fade-up rounded-3xl border p-5" style={{ background: theme.cardBg, borderColor: theme.cardBorder }}>
            <span className="text-5xl shrink-0 mt-1 scene-float">{theme.character}</span>
            <div className="relative flex-1">
              {/* Speech bubble tail */}
              <div
                className="absolute -left-2 top-4 w-0 h-0 hidden"
                style={{
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '8px solid rgba(255,255,255,0.1)',
                }}
              />
              <p className="text-sm font-black mb-1" style={{ color: theme.accentColor }}>
                {theme.characterName}
              </p>
              <p className="text-white/82 leading-relaxed text-base font-semibold">{theme.greeting}</p>
            </div>
          </div>

          {/* World title */}
          <div className="mb-4 animate-fade-up animation-delay-100">
            <h2 className="font-display text-2xl mb-1" style={{ color: theme.accentColor }}>
              {theme.emoji} {module?.title?.includes('Forest') ? 'Forest Missions' : 'Missions'}
            </h2>
            {progress && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-white/10 rounded-full h-1.5 max-w-xs">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress.completion_percentage}%`,
                      background: theme.accentColor,
                    }}
                  />
                </div>
                <p className="text-white/40 text-xs">
                  {progress.lessons_completed}/{progress.total_lessons} done
                </p>
              </div>
            )}
          </div>

          {startError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm animate-scale-in">
              {startError}
            </div>
          )}

          {/* Missions list */}
          <div className="space-y-4 pb-10">
            {(module?.lessons ?? [])
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((lesson, i) => (
                <MissionCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i + 1}
                  theme={theme}
                  isStarting={startingId === lesson.id}
                  delay={i * 80}
                  onPlay={() => handlePlay(lesson)}
                />
              ))}
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MissionCard({
  lesson,
  index,
  theme,
  isStarting,
  delay,
  onPlay,
}: {
  lesson: Lesson
  index: number
  theme: ReturnType<typeof getWorldTheme>
  isStarting: boolean
  delay: number
  onPlay: () => void
}) {
  const hasContent = !!lesson.entry_node_id

  return (
    <div
      className={clsx(
        'rounded-3xl border flex items-center gap-4 p-4 md:p-5',
        'transition-all duration-200',
        'animate-fade-up opacity-0',
      )}
      style={{
        background: theme.cardBg,
        borderColor: theme.cardBorder,
        animationDelay: `${delay + 200}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Index badge */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-2xl font-bold shrink-0"
        style={{ background: `${theme.accentColor}30`, color: theme.accentColor }}
      >
        {index === 1 ? '🦊' : index === 2 ? '🦉' : index === 3 ? '🐻' : index}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-xl text-white leading-tight">{lesson.title}</h3>
        {lesson.description && (
          <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{lesson.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="kids-pill text-xs min-h-0 py-1 px-3" style={{ color: '#fbbf24' }}>
            ⭐ {lesson.xp_reward} XP
          </span>
          {index === 1 && <span className="kids-pill text-xs min-h-0 py-1 px-3" style={{ color: theme.accentColor }}>✓ Completed</span>}
        </div>
      </div>

      {/* Play button */}
      <button
        onClick={onPlay}
        disabled={!hasContent || isStarting}
        className={clsx(
          'shrink-0 px-4 py-2 rounded-xl font-bold text-sm',
          'transition-all duration-150',
          'hover:scale-105 active:scale-95',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
          'focus:outline-none',
        )}
        style={
          hasContent
            ? { background: theme.accentColor, color: '#0d0a1a' }
            : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
        }
      >
        {isStarting ? '…' : hasContent ? '▶ Play' : 'Soon'}
      </button>
    </div>
  )
}
