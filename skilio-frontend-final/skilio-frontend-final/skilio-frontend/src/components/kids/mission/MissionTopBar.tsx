interface MissionTopBarProps {
  moduleId: string
  xp: number
  heroEmoji?: string
  heroName: string
  heroColor: string
  accentColor: string
  onExit: () => void
}

export function MissionTopBar({
  xp,
  heroEmoji,
  heroName,
  heroColor,
  accentColor,
  onExit,
}: MissionTopBarProps) {
  return (
    <header
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(5,7,26,0.72)',
        backdropFilter: 'blur(6px)',
        flexShrink: 0,
        gap: 14,
      }}
    >
      {/* Exit */}
      <button
        onClick={onExit}
        style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 12,
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
      >
        ← Exit
      </button>

      <div style={{
        height: 12,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: xp > 0 ? '56%' : '26%',
          height: '100%',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accentColor}, #a78bfa)`,
          boxShadow: `0 0 18px ${accentColor}70`,
        }} />
      </div>

      {/* Right pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* XP */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 999,
          padding: '5px 12px',
        }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <span style={{
            color: '#fff', fontWeight: 800, fontSize: 13,
            fontFamily: '"Fredoka One", cursive',
          }}>
            {xp} XP
          </span>
        </div>

        {/* Hero chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: `${heroColor}20`,
          border: `1px solid ${heroColor}40`,
          borderRadius: 999,
          padding: '5px 12px',
        }}>
          <span style={{ fontSize: 15 }}>{heroEmoji ?? '⭐'}</span>
          <span style={{
            color: '#fff', fontWeight: 700, fontSize: 13,
            maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {heroName}
          </span>
        </div>

        {/* Accent dot indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}`,
        }} />
      </div>
    </header>
  )
}
