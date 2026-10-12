import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKidsStore, HEROES } from '@/store/kidsStore'
import { useModules, useModule } from '@/hooks/useModules'
import { useChildSummary } from '@/hooks/useChildren'
import { scenariosApi } from '@/api/scenarios'
import { useScenarioStore } from '@/store/scenarioStore'
import { Spinner } from '@/components/ui/Spinner'
import { getApiErrorMessage } from '@/api/client'
import type { Lesson } from '@/types'

// ── Star field ────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  size: (i % 3) + 1,
  top: (i * 37 + 7) % 100,
  left: (i * 61 + 13) % 100,
  dur: 2.2 + (i % 3) * 0.8,
  del: (i % 5) * 0.4,
}))

// ── Path geometry ─────────────────────────────────────────────────────────────

// Zigzag x-positions as fraction of container width (14 nodes: 3 lessons + 10 empty + 1 lock)
const NODE_XS = [0.70, 0.26, 0.70, 0.26, 0.70, 0.26, 0.70, 0.26, 0.70, 0.26, 0.70, 0.26, 0.70, 0.48]
const NODE_SPACING = 108 // vertical px between node centres
const NODE_R = 38        // node radius px
const PATH_W = 440       // SVG/layout reference width

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLessonEmoji(lesson: Lesson): string {
  const t = lesson.title.toLowerCase()
  if (t.includes('school') || t.includes('classroom') || t.includes('okul')) return '🏫'
  if (t.includes('street') || t.includes('road') || t.includes('outside') || t.includes('sokak')) return '🚶'
  if (t.includes('home') || t.includes('house') || t.includes('ev')) return '🏠'
  return '⭐'
}

// Cubic-bezier SVG path connecting consecutive node centres
function buildSvgPath(): string {
  return NODE_XS.slice(0, -1).map((_, i) => {
    const x1 = NODE_XS[i] * PATH_W
    const y1 = NODE_R + i * NODE_SPACING
    const x2 = NODE_XS[i + 1] * PATH_W
    const y2 = NODE_R + (i + 1) * NODE_SPACING
    const my = (y1 + y2) / 2
    // Start at bottom edge of this node, end at top edge of next node
    return `M ${x1} ${y1 + NODE_R} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2 - NODE_R}`
  }).join(' ')
}

const SVG_PATH_D = buildSvgPath()
const TOTAL_PATH_H = NODE_R + (NODE_XS.length - 1) * NODE_SPACING + NODE_R + 64

// ── Page ──────────────────────────────────────────────────────────────────────

export function EarthquakeRoadmapPage() {
  const navigate = useNavigate()
  const { selectedChild, hero, heroColor, heroName } = useKidsStore()
  const heroInfo = HEROES.find((h) => h.id === hero)

  const { data: modules, isLoading: listLoading } = useModules(selectedChild?.age)
  const { data: childData } = useChildSummary(selectedChild?.id ?? 0)
  const startScenario = useScenarioStore((s) => s.startScenario)
  const resetScenario = useScenarioStore((s) => s.resetScenario)

  const [selectedPos, setSelectedPos] = useState<number | null>(null)
  const [startingId, setStartingId] = useState<number | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  const eqModule =
    modules?.find((m) => m.title.toLowerCase().includes('earthquake')) ?? modules?.[0]

  const { data: fullModule, isLoading: detailLoading } = useModule(eqModule?.id ?? 0)
  const isLoading = listLoading || detailLoading

  const lessons = [...(fullModule?.lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
  const playable = lessons.slice(0, 3)

  const totalXp = childData?.total_xp ?? 0
  const totalDone = childData?.module_progress.reduce((sum, p) => sum + p.lessons_completed, 0) ?? 0

  // 14 nodes: positions 0-2 are lessons, 3-12 are empty, 13 is the lock
  const pathNodes = Array.from({ length: 14 }, (_, i) => ({
    kind: (i < playable.length ? 'lesson' : i < 13 ? 'empty' : 'lock') as 'lesson' | 'empty' | 'lock',
    lesson: i < playable.length ? playable[i] : null,
    pos: i,
  }))

  async function handleStart(lesson: Lesson) {
    if (!selectedChild || !lesson.entry_node_id || !eqModule) return
    setStartingId(lesson.id)
    setStartError(null)
    try {
      const attempt = await scenariosApi.startAttempt(selectedChild.id, lesson.id)
      startScenario(attempt)
      navigate(`/kids/play/${eqModule.id}/${lesson.id}`, {
        state: { returnTo: `/kids/worlds/${eqModule.id}/map` },
      })
    } catch (err) {
      resetScenario()
      setStartError(getApiErrorMessage(err))
    } finally {
      setStartingId(null)
    }
  }

  const previewLesson =
    selectedPos !== null && pathNodes[selectedPos]?.kind === 'lesson'
      ? pathNodes[selectedPos].lesson
      : null

  return (
    <div className="kids-page flex flex-col" style={{ background: '#06071a' }}>

      {/* Star field (identical to original) */}
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

        {/* Top bar (identical layout to original) */}
        <div className="w-full max-w-5xl flex justify-between items-center gap-3 mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/kids/worlds')}
              className="kids-pill"
              style={{ fontSize: 13 }}
            >
              ← Worlds
            </button>
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

        {/* Route header */}
        <div className="text-center mb-10 animate-fade-up">
          <div style={{ fontSize: 52, marginBottom: 10 }}>🌍</div>
          <h1 className="kids-title text-3xl md:text-4xl mb-2">Earthquake Safety</h1>
          <p className="text-white/50 text-base font-bold" style={{ maxWidth: 340, margin: '0 auto 0' }}>
            Hey {heroName || selectedChild?.display_name}! Learn what to do when the earth shakes
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <span
              className="kids-pill"
              style={{ fontSize: 12, minHeight: 0, padding: '4px 12px' }}
            >
              3 lessons ready
            </span>
            <span
              className="kids-pill"
              style={{ fontSize: 12, minHeight: 0, padding: '4px 12px', color: '#f59e0b' }}
            >
              ⭐ Earn XP
            </span>
          </div>
        </div>

        {/* Path */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="border-white/20 border-t-amber-400" />
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: PATH_W,
              height: TOTAL_PATH_H,
              margin: '0 auto',
            }}
          >
            {/* Dashed connecting path (SVG, scales with container) */}
            <svg
              width="100%"
              height={TOTAL_PATH_H}
              viewBox={`0 0 ${PATH_W} ${TOTAL_PATH_H}`}
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
              aria-hidden
            >
              <path
                d={SVG_PATH_D}
                stroke="rgba(245,158,11,0.28)"
                strokeWidth={5}
                strokeDasharray="10 7"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            {/* Nodes */}
            {pathNodes.map((node) => {
              const pct = NODE_XS[node.pos] * 100
              const top = NODE_R + node.pos * NODE_SPACING - NODE_R // circle's top edge

              return (
                <div
                  key={node.pos}
                  style={{
                    position: 'absolute',
                    left: `${pct}%`,
                    top,
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <RoadmapNode
                    kind={node.kind}
                    lesson={node.lesson}
                    index={node.pos + 1}
                    isSelected={selectedPos === node.pos}
                    onClick={() => {
                      if (node.kind === 'lesson') {
                        setSelectedPos(selectedPos === node.pos ? null : node.pos)
                        setStartError(null)
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom spacer so the fixed panel doesn't overlap last nodes */}
        <div style={{ height: previewLesson ? 248 : 40 }} />
      </div>

      {/* Lesson preview panel */}
      {previewLesson && (
        <LessonPreviewPanel
          lesson={previewLesson}
          startError={startError}
          isStarting={startingId === previewLesson.id}
          onStart={() => handleStart(previewLesson)}
          onClose={() => { setSelectedPos(null); setStartError(null) }}
        />
      )}
    </div>
  )
}

// ── RoadmapNode ───────────────────────────────────────────────────────────────

function RoadmapNode({
  kind, lesson, index, isSelected, onClick,
}: {
  kind: 'lesson' | 'empty' | 'lock'
  lesson: Lesson | null
  index: number
  isSelected: boolean
  onClick: () => void
}) {
  const d = NODE_R * 2

  if (kind === 'lock') {
    return (
      <>
        <div
          style={{
            width: d, height: d, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '2.5px dashed rgba(255,255,255,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}
        >
          🔒
        </div>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.26)',
          whiteSpace: 'nowrap',
        }}>
          More coming
        </span>
      </>
    )
  }

  if (kind === 'empty') {
    return (
      <div
        style={{
          width: d, height: d, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '2px dashed rgba(255,255,255,0.11)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: 'rgba(255,255,255,0.18)',
          userSelect: 'none',
        }}
      >
        ?
      </div>
    )
  }

  // Lesson node
  const hasContent = !!lesson?.entry_node_id
  const emoji = lesson ? getLessonEmoji(lesson) : '⭐'

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={onClick}
          disabled={!hasContent}
          aria-label={lesson?.title}
          style={{
            width: d, height: d, borderRadius: '50%',
            background: isSelected
              ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
              : 'linear-gradient(135deg, rgba(245,158,11,0.24), rgba(234,88,12,0.14))',
            border: `2.5px solid ${isSelected ? '#f59e0b' : 'rgba(245,158,11,0.52)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: hasContent ? 'pointer' : 'default',
            boxShadow: isSelected
              ? '0 0 30px rgba(245,158,11,0.65), 0 0 60px rgba(245,158,11,0.2)'
              : '0 0 14px rgba(245,158,11,0.22)',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, border-color 150ms ease',
            fontSize: 26,
            padding: 0,
          }}
        >
          {emoji}
        </button>
        {/* Number badge */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: -3, right: -3,
            width: 20, height: 20, borderRadius: '50%',
            background: isSelected ? '#f59e0b' : 'rgba(245,158,11,0.88)',
            color: '#1a0800',
            fontSize: 11, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #06071a',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          {index}
        </div>
      </div>
      {/* Lesson label */}
      <span style={{
        fontSize: 11, fontWeight: 800,
        color: isSelected ? '#f59e0b' : 'rgba(255,255,255,0.68)',
        textAlign: 'center',
        maxWidth: 92,
        lineHeight: 1.3,
        transition: 'color 150ms ease',
      }}>
        {lesson?.title ?? ''}
      </span>
    </>
  )
}

// ── LessonPreviewPanel ────────────────────────────────────────────────────────

function LessonPreviewPanel({
  lesson, startError, isStarting, onStart, onClose,
}: {
  lesson: Lesson
  startError: string | null
  isStarting: boolean
  onStart: () => void
  onClose: () => void
}) {
  const emoji = getLessonEmoji(lesson)
  const hasContent = !!lesson.entry_node_id

  return (
    <div
      className="animate-fade-up"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'linear-gradient(0deg, rgba(13,10,26,0.99) 0%, rgba(13,10,26,0.95) 100%)',
        borderTop: '1px solid rgba(245,158,11,0.28)',
        borderRadius: '20px 20px 0 0',
        padding: '22px 20px 36px',
        boxShadow: '0 -20px 64px rgba(0,0,0,0.58), 0 0 0 1px rgba(245,158,11,0.08)',
        backdropFilter: 'blur(18px)',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 14, right: 16,
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.13)',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 13, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Lesson header */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <div
            style={{
              width: 54, height: 54, borderRadius: 14, flexShrink: 0,
              background: 'rgba(245,158,11,0.14)',
              border: '1.5px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}
          >
            {emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10, fontWeight: 900, color: '#f59e0b',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              margin: '0 0 3px',
            }}>
              Earthquake Safety · Lesson
            </p>
            <h3 style={{
              fontSize: 20, fontFamily: "'Fredoka One', cursive",
              color: '#fff', margin: '0 0 7px', lineHeight: 1.2,
            }}>
              {lesson.title}
            </h3>
            <span
              className="kids-pill"
              style={{ fontSize: 11, minHeight: 0, padding: '2px 10px', color: '#f59e0b' }}
            >
              ⭐ {lesson.xp_reward} XP
            </span>
          </div>
        </div>

        {/* Description */}
        {lesson.description && (
          <p style={{
            color: 'rgba(255,255,255,0.58)',
            fontSize: 14, lineHeight: 1.65,
            marginBottom: 18, fontWeight: 600,
          }}>
            {lesson.description}
          </p>
        )}

        {/* Error */}
        {startError && (
          <p style={{
            color: '#fca5a5', fontSize: 13, marginBottom: 14,
            padding: '8px 12px',
            background: 'rgba(239,68,68,0.12)',
            borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.22)',
          }}>
            {startError}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={onStart}
          disabled={isStarting || !hasContent}
          style={{
            width: '100%', padding: '15px 0',
            borderRadius: 14,
            background: hasContent
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
              : 'rgba(255,255,255,0.07)',
            border: 0,
            color: hasContent ? '#1a0800' : 'rgba(255,255,255,0.28)',
            fontSize: 18, fontWeight: 900,
            fontFamily: "'Nunito', system-ui, sans-serif",
            cursor: hasContent && !isStarting ? 'pointer' : 'not-allowed',
            boxShadow: hasContent ? '0 10px 30px rgba(245,158,11,0.36)' : 'none',
            opacity: isStarting ? 0.72 : 1,
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={(e) => { if (hasContent) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
        >
          {isStarting ? '…' : hasContent ? "Let's go! →" : 'Coming soon'}
        </button>
      </div>
    </div>
  )
}
