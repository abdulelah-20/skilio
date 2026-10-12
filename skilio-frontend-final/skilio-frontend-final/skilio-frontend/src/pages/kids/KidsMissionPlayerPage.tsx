import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useScenarioStore } from '@/store/scenarioStore'
import { useKidsStore, HEROES } from '@/store/kidsStore'
import { useSubmitChoice } from '@/hooks/useScenario'
import { useModule } from '@/hooks/useModules'
import { scenariosApi } from '@/api/scenarios'
import { getApiErrorMessage } from '@/api/client'
import { Spinner } from '@/components/ui/Spinner'
import type { ScenarioChoice } from '@/types'

import { buildMissionConfig } from '@/components/kids/mission/worldTheme'
import { WorldSceneBackground } from '@/components/kids/mission/WorldSceneBackground'
import { VisualChoiceCard }     from '@/components/kids/mission/VisualChoiceCard'
import { FeedbackPanel }        from '@/components/kids/mission/FeedbackPanel'
import { MissionTopBar }        from '@/components/kids/mission/MissionTopBar'
import '@/components/kids/mission/mission-visuals.css'

export function KidsMissionPlayerPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
    ?? `/kids/worlds/${moduleId}`

  const { hero, heroColor, heroName } = useKidsStore()
  const heroInfo = HEROES.find((h) => h.id === hero)

  const { data: module } = useModule(Number(moduleId))

  const attempt         = useScenarioStore((s) => s.attempt)
  const currentNode     = useScenarioStore((s) => s.currentNode)
  const pendingFeedback = useScenarioStore((s) => s.pendingFeedback)
  const isAdvancing     = useScenarioStore((s) => s.isAdvancing)
  const clearFeedback        = useScenarioStore((s) => s.clearFeedback)
  const startScenario        = useScenarioStore((s) => s.startScenario)
  const resetScenario        = useScenarioStore((s) => s.resetScenario)
  const newlyAwardedBadgeIds = useScenarioStore((s) => s.newlyAwardedBadgeIds)

  const submitChoice = useSubmitChoice()
  const [submittingChoiceId, setSubmittingChoiceId] = useState<number | null>(null)
  const [lastChoiceWasSafe,  setLastChoiceWasSafe]  = useState<boolean | null>(null)
  const [nodeVisible,  setNodeVisible]  = useState(true)
  const [isResuming,   setIsResuming]   = useState(false)
  const [pageError,    setPageError]    = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMsg,  setFeedbackMsg]  = useState<string | null>(null)
  const [isTalking,    setIsTalking]    = useState(false)

  useEffect(() => {
    if (attempt) return
    setIsResuming(true)
    navigate(returnTo, { replace: true })
  }, [attempt, moduleId, navigate])

  useEffect(() => {
    if (!pendingFeedback) return
    setFeedbackMsg(pendingFeedback)
    setShowFeedback(true)
    const t = setTimeout(() => {
      setShowFeedback(false)
      clearFeedback()
    }, 3200)
    return () => clearTimeout(t)
  }, [pendingFeedback, clearFeedback])

  // Trigger talking animation when node changes
  useEffect(() => {
    if (!currentNode) return
    setIsTalking(true)
    const t = setTimeout(() => setIsTalking(false), 2000)
    return () => clearTimeout(t)
  }, [currentNode?.id])

  const handleChoice = useCallback(
    (choice: ScenarioChoice) => {
      if (!attempt || isAdvancing || submittingChoiceId !== null) return
      setSubmittingChoiceId(choice.id)
      setLastChoiceWasSafe(choice.is_safe_choice)
      submitChoice.mutate(
        { attemptId: attempt.id, choiceId: choice.id },
        {
          onSuccess: () => {
            setNodeVisible(false)
            setTimeout(() => { setNodeVisible(true); setSubmittingChoiceId(null) }, 320)
          },
          onError: (err) => {
            setSubmittingChoiceId(null)
            setPageError(getApiErrorMessage(err))
          },
        },
      )
    },
    [attempt, isAdvancing, submittingChoiceId, submitChoice],
  )

  async function handlePlayAgain() {
    if (!attempt) return
    resetScenario()
    try {
      const fresh = await scenariosApi.startAttempt(attempt.child_id, attempt.lesson_id)
      startScenario(fresh)
      setNodeVisible(true)
      setSubmittingChoiceId(null)
      setPageError(null)
    } catch (err) {
      setPageError(getApiErrorMessage(err))
    }
  }

  const storyText = currentNode?.content_text ?? ''
  const config = buildMissionConfig(module?.title, storyText, '')

  const bgStyle = {
    background: `linear-gradient(180deg, ${config.theme.bgFrom} 0%, ${config.theme.bgTo} 100%)`,
  }

  if (isResuming || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <Spinner size="lg" className="border-white/20 border-t-white" />
      </div>
    )
  }

  const isComplete = attempt.status === 'completed'

  // ── Completion screen ────────────────────────────────────────────────────────
  if (isComplete) {
    const isCorrectPath = attempt.xp_earned >= 40
    return (
      <div style={{ ...bgStyle, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <WorldSceneBackground worldName={config.worldName} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <MissionTopBar
            moduleId={moduleId!}
            xp={attempt.xp_earned}
            heroEmoji={heroInfo?.emoji}
            heroName={heroName}
            heroColor={heroColor}
            accentColor={config.theme.accentColor}
            onExit={() => { resetScenario(); navigate(returnTo) }}
          />
          <div className="flex-1 flex flex-col items-center px-6 py-10 text-center animate-fade-in">
            <div
              className="w-28 h-28 rounded-[28px] flex items-center justify-center text-6xl mb-7"
              style={{
                background: 'rgba(14,165,233,0.18)',
                border: `2px solid ${config.theme.accentColor}55`,
                boxShadow: `0 0 34px ${config.theme.accentColor}30`,
              }}
            >
              {isCorrectPath ? '🏆' : '📖'}
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              {isCorrectPath ? 'Mission Complete! 🎉' : 'Well tried!'}
            </h2>
            <p className="text-white/58 text-lg mb-8 max-w-lg leading-relaxed">
              {isCorrectPath
                ? '"SQUEEEE! Baby Whale is back with his mum and the whole ocean is celebrating! You made perfect choices — always get the right help!"'
                : 'Every try teaches you something new. Keep going!'}
            </p>

            <div
              className="rounded-3xl px-16 py-7 mb-5"
              style={{
                background: 'rgba(8,47,73,0.72)',
                border: `1px solid ${config.theme.accentColor}35`,
              }}
            >
              <p className="text-white/38 text-xs font-black uppercase tracking-widest mb-2">XP Earned</p>
              <p className="font-display text-6xl leading-none" style={{ color: config.theme.accentColor }}>
                +{attempt.xp_earned}
              </p>
            </div>

            {newlyAwardedBadgeIds.length > 0 && (
              <div
                className="rounded-3xl px-10 py-5 mb-5 animate-scale-in"
                style={{
                  background: 'rgba(251,191,36,0.12)',
                  border: '1px solid rgba(251,191,36,0.4)',
                }}
              >
                <p style={{ color: '#fbbf24', fontWeight: 800, fontSize: 15, textAlign: 'center', margin: 0 }}>
                  🏅 {newlyAwardedBadgeIds.length === 1 ? 'New badge earned!' : `${newlyAwardedBadgeIds.length} new badges earned!`}
                </p>
              </div>
            )}

            <div
              className="text-left rounded-3xl p-5 mb-6 w-full max-w-md"
              style={{ background: 'rgba(8,47,73,0.56)', border: `1px solid ${config.theme.accentColor}22` }}
            >
              <p className="font-black text-sm mb-2" style={{ color: config.theme.accentColor }}>✓ Safe choices</p>
              <ul className="space-y-2 text-white/58 text-sm font-semibold">
                <li>✓ Called the right helper instead of acting alone</li>
                <li>✓ Avoided unsafe shortcuts and unknown places</li>
                <li>✓ Got qualified help for the rescue</li>
              </ul>
            </div>

            <div className="text-5xl mb-8 rounded-2xl px-4 py-3 border border-amber-400/35 bg-amber-400/10">
              {config.character.emoji}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { resetScenario(); navigate(returnTo) }}
                className="kids-primary-button min-w-[210px]"
              >
                More missions!
              </button>
              <button onClick={handlePlayAgain} className="kids-pill min-h-[58px] px-8 text-lg">
                Play again ↺
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <Spinner size="lg" className="border-white/20 border-t-white" />
      </div>
    )
  }

  const choices = [...(currentNode.choices ?? [])].sort((a, b) => a.order_index - b.order_index)

  // ── Active play ──────────────────────────────────────────────────────────────
  return (
    <div style={{ ...bgStyle, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <WorldSceneBackground worldName={config.worldName} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <MissionTopBar
          moduleId={moduleId!}
          xp={attempt.xp_earned}
          heroEmoji={heroInfo?.emoji}
          heroName={heroName}
          heroColor={heroColor}
          accentColor={config.theme.accentColor}
          onExit={() => { resetScenario(); navigate(returnTo) }}
        />

        {/* Story + choices */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 20px',
            paddingBottom: showFeedback ? '170px' : '24px',
            transition: 'opacity 300ms ease, transform 300ms ease',
            opacity: nodeVisible ? 1 : 0,
            transform: nodeVisible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          <div style={{ width: '100%', maxWidth: 760 }}>

            {/* ── Talking Character + Speech Bubble ── */}
            <TalkingScene
              character={config.character}
              storyText={currentNode.content_text}
              nodeType={currentNode.node_type}
              accentColor={config.theme.accentColor}
              isTalking={isTalking}
            />

            {/* Choices */}
            {choices.length > 0 ? (
              <>
                <p style={{
                  textAlign: 'center', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: 12, fontSize: 11,
                  color: `${config.theme.accentColor}80`,
                }}>
                  What do you do?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {choices.map((choice, i) => (
                    <VisualChoiceCard
                      key={choice.id}
                      choice={choice}
                      index={i}
                      accentColor={config.theme.accentColor}
                      isSubmitting={submittingChoiceId === choice.id}
                      disabled={isAdvancing || submittingChoiceId !== null}
                      onClick={() => handleChoice(choice)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => { resetScenario(); navigate(returnTo) }}
                  className="btn-primary btn-lg"
                >
                  Back to missions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback panel */}
      {showFeedback && feedbackMsg && (
        <FeedbackPanel
          message={feedbackMsg}
          isSafe={lastChoiceWasSafe ?? false}
          xpEarned={attempt.xp_earned}
          accentColor={config.theme.accentColor}
        />
      )}

      {/* Page error */}
      {pageError && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] rounded-xl px-4 py-3 border text-red-300 text-sm animate-scale-in"
          style={{ background: 'rgba(127,29,29,0.9)', borderColor: 'rgba(239,68,68,0.4)' }}
        >
          {pageError}
        </div>
      )}
    </div>
  )
}

// ── TalkingCharacter — animated emoji with glow ring ─────────────────────────

function TalkingCharacter({
  emoji, name, glowColor, isTalking, size = 72,
}: {
  emoji: string
  name: string
  glowColor: string
  isTalking: boolean
  size?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.52,
          background: `${glowColor}18`,
          border: `2px solid ${glowColor}50`,
          boxShadow: isTalking
            ? `0 0 30px ${glowColor}70, 0 0 60px ${glowColor}30`
            : `0 0 16px ${glowColor}40`,
          animation: isTalking
            ? 'character-bob 0.5s ease-in-out infinite'
            : 'character-bob 3s ease-in-out infinite',
          transition: 'box-shadow 400ms ease',
        }}
      >
        {emoji}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: `${glowColor}cc`,
        background: `${glowColor}12`,
        border: `1px solid ${glowColor}30`,
        borderRadius: 20, padding: '2px 10px',
      }}>
        {name}
      </span>
    </div>
  )
}

// ── TalkingScene — character + speech bubble ─────────────────────────────────

function TalkingScene({
  character, storyText, nodeType, accentColor, isTalking,
}: {
  character: { emoji: string; name: string; glowColor: string }
  storyText: string
  nodeType: string
  accentColor: string
  isTalking: boolean
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Scene label */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '5px 16px', borderRadius: 999,
          background: `${accentColor}20`,
          color: accentColor,
          border: `1px solid ${accentColor}35`,
        }}>
          {nodeType === 'start' ? '✨ Story begins' : '🤔 What happens next…'}
        </span>
      </div>

      {/* Character + speech bubble layout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, position: 'relative' }}>

        {/* Character on left */}
        <div style={{ flexShrink: 0 }}>
          <TalkingCharacter
            emoji={character.emoji}
            name={character.name}
            glowColor={character.glowColor}
            isTalking={isTalking}
            size={76}
          />
        </div>

        {/* Speech bubble on right */}
        <div style={{ flex: 1, position: 'relative', paddingLeft: 8, maxWidth: 620 }}>
          {/* Bubble tail pointing left toward character */}
          <div style={{
            position: 'absolute', left: -2, top: 20,
            width: 0, height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: `10px solid ${accentColor}25`,
          }} />
          <div style={{
            position: 'absolute', left: 0, top: 20,
            width: 0, height: 0,
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            borderRight: '9px solid rgba(255,255,255,0.08)',
          }} />

          {/* Bubble body */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1.5px solid ${accentColor}30`,
            borderRadius: 18,
            padding: '18px 22px',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}>
            <p style={{
              color: '#fff',
              fontSize: 17,
              lineHeight: 1.7,
              margin: 0,
              fontWeight: 600,
            }}>
              {storyText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
