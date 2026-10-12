import type { CharacterInfo } from './worldTheme'

export function StoryCharacter({ character }: { character: CharacterInfo }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-5 animate-fade-up" aria-hidden>
      {/* Glow ring */}
      <div
        style={{
          width: 76, height: 76,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${character.glowColor}18`,
          border: `2px solid ${character.glowColor}45`,
          boxShadow: `0 0 18px ${character.glowColor}40, inset 0 0 12px ${character.glowColor}15`,
          animation: 'glow-ring-pulse 2.5s ease-in-out infinite',
          fontSize: 36,
        }}
      >
        {character.emoji}
      </div>
      {/* Name badge */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: `${character.glowColor}cc`,
          background: `${character.glowColor}15`,
          border: `1px solid ${character.glowColor}30`,
          borderRadius: 20,
          padding: '2px 10px',
        }}
      >
        {character.name}
      </span>
    </div>
  )
}
