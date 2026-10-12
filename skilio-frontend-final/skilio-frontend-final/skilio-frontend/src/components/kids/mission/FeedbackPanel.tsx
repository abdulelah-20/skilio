import './mission-visuals.css'

interface FeedbackPanelProps {
  message: string
  isSafe: boolean
  xpEarned: number
  accentColor: string
}

export function FeedbackPanel({ message, isSafe, xpEarned, accentColor }: FeedbackPanelProps) {
  const safeGradient   = 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)'
  const unsafeGradient = 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)'

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 60,
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
        background: isSafe ? safeGradient : unsafeGradient,
        borderTop: `2px solid ${isSafe ? 'rgba(74,222,128,0.35)' : 'rgba(239,68,68,0.35)'}`,
        animation: 'feedback-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        boxShadow: isSafe
          ? '0 -8px 32px rgba(74,222,128,0.2)'
          : '0 -8px 32px rgba(239,68,68,0.2)',
      }}
    >
      <div className="max-w-lg mx-auto flex items-start gap-4">
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
          background: isSafe ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)',
          border: `1.5px solid ${isSafe ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
        }}>
          {isSafe ? '🛡️' : '⚠️'}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p style={{
            fontFamily: '"Fredoka One", cursive',
            fontSize: 20,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {isSafe ? 'Great choice!' : 'Think it through…'}
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14,
            lineHeight: 1.5,
          }}>
            {message}
          </p>
        </div>

        {/* XP badge */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: `${accentColor}25`,
          border: `1.5px solid ${accentColor}50`,
          borderRadius: 14, padding: '6px 12px',
        }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={{
            color: accentColor,
            fontFamily: '"Fredoka One", cursive',
            fontSize: 15,
            lineHeight: 1.1,
            marginTop: 2,
          }}>
            +{xpEarned}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700 }}>XP</span>
        </div>
      </div>
    </div>
  )
}
