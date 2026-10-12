import { clsx } from 'clsx'
import { Spinner } from '@/components/ui/Spinner'
import type { ScenarioChoice } from '@/types'
import './mission-visuals.css'

const LETTER_LABELS = ['A', 'B', 'C', 'D', 'E']

export function VisualChoiceCard({
  choice,
  index,
  accentColor,
  isSubmitting,
  disabled,
  onClick,
}: {
  choice: ScenarioChoice
  index: number
  accentColor: string
  isSubmitting: boolean
  disabled: boolean
  onClick: () => void
}) {
  const glow = `0 0 20px ${accentColor}45, 0 4px 16px rgba(0,0,0,0.3)`
  const borderActive = `${accentColor}70`

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Choice ${index + 1}: ${choice.choice_text}`}
      className={clsx(
        'mission-choice-card',
        isSubmitting && 'mission-choice-submitting',
      )}
      style={
        isSubmitting
          ? { background: `${accentColor}22`, borderColor: accentColor, boxShadow: glow }
          : undefined
      }
      onMouseEnter={(e) => {
        if (disabled) return
        const el = e.currentTarget
        el.style.borderColor = borderActive
        el.style.background  = `${accentColor}15`
        el.style.boxShadow   = glow
      }}
      onMouseLeave={(e) => {
        if (disabled) return
        const el = e.currentTarget
        el.style.borderColor = 'rgba(56,189,248,0.1)'
        el.style.background  = 'rgba(8,47,73,0.62)'
        el.style.boxShadow   = ''
      }}
    >
      {/* Number badge */}
      <div
        className="shrink-0 flex items-center justify-center font-display text-lg font-bold"
        style={{
          width: 42, height: 42,
          borderRadius: 12,
          background: isSubmitting ? `${accentColor}35` : `${accentColor}24`,
          color: isSubmitting ? accentColor : `${accentColor}dd`,
          border: `1.5px solid ${isSubmitting ? accentColor : `${accentColor}20`}`,
          transition: 'all 150ms',
          fontSize: 18,
        }}
      >
        {LETTER_LABELS[index] ?? index + 1}
      </div>

      {/* Choice text */}
      <span className="flex-1 text-white font-semibold text-base leading-snug">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" className="border-white/30 border-t-white" />
            <span className="text-white/70">Choosing…</span>
          </span>
        ) : (
          choice.choice_text
        )}
      </span>

      {/* Arrow hint */}
      {!isSubmitting && !disabled && (
        <span className="shrink-0 text-white/25 text-lg">›</span>
      )}
    </button>
  )
}
