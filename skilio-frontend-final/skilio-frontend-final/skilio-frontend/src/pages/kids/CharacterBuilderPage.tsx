import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useKidsStore, HEROES, HERO_COLORS, type HeroType } from '@/store/kidsStore'

// Pre-computed star positions — avoids Math.random() on every re-render
const STARS = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  size: (i % 3) + 1,
  top: (i * 37 + 7) % 100,
  left: (i * 61 + 13) % 100,
  dur: 2.2 + (i % 3) * 0.8,
  del: (i % 5) * 0.4,
}))

function StarField() {
  return (
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
            opacity: 0.15,
          }}
        />
      ))}
    </div>
  )
}

export function CharacterBuilderPage() {
  const { setHero, hero: storedHero, heroColor: storedColor, heroName: storedName } =
    useKidsStore()
  const navigate = useNavigate()

  const [selectedHero, setSelectedHero] = useState<HeroType | null>(storedHero)
  const [selectedColor, setSelectedColor] = useState(storedColor || HERO_COLORS[0])
  const [heroName, setHeroName] = useState(storedName || '')
  const [error, setError] = useState('')

  function handleStart() {
    if (!selectedHero) { setError('Pick a hero first!'); return }
    if (!heroName.trim()) { setError('Give your hero a name!'); return }
    setHero(selectedHero, selectedColor, heroName.trim())
    navigate('/kids/worlds')
  }

  return (
    <div
      className="kids-page flex flex-col items-center px-4 py-8 md:py-10"
      style={{
        background:
          'radial-gradient(circle at 50% -12%, rgba(88,28,135,0.92), transparent 42%), linear-gradient(180deg, #1a0535 0%, #110622 100%)',
      }}
    >
      <StarField />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-9 animate-fade-up">
          <h1 className="kids-title text-4xl md:text-5xl mb-3">Who are you?</h1>
          <p className="text-white/58 text-base md:text-lg font-bold">
            Pick your hero — they guide you through every world!
          </p>
        </div>

        {/* Hero cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up animation-delay-100">
          {HEROES.map((hero) => {
            const isSelected = selectedHero === hero.id
            return (
              <button
                key={hero.id}
                onClick={() => { setSelectedHero(hero.id); setError('') }}
                className={clsx(
                  'relative flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 min-h-[248px]',
                  'transition-all duration-200 hover:-translate-y-1 focus:outline-none',
                  isSelected
                    ? 'border-amber-400'
                    : 'border-purple-500/45 hover:border-purple-300/70',
                )}
                style={{
                  background: hero.bgColor,
                  boxShadow: isSelected
                    ? `0 0 0 2px rgba(251,191,36,0.35), 0 0 34px rgba(251,191,36,0.38), 0 18px 42px rgba(0,0,0,0.34)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 36px rgba(0,0,0,0.22)',
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-surface-900 text-base font-black"
                    style={{ boxShadow: '0 0 18px rgba(251,191,36,0.72)' }}
                  >
                    ✓
                  </div>
                )}
                <span className="text-6xl mb-2">{hero.emoji}</span>
                <span className="font-display text-white text-2xl leading-tight">{hero.name}</span>
                <span className="text-xs text-purple-200/70 text-center leading-tight font-black uppercase tracking-wider">{hero.title}</span>
                <span className="text-sm text-white/58 text-center leading-relaxed max-w-[150px]">{hero.description}</span>
              </button>
            )
          })}
        </div>

        <section className="kids-glass-panel rounded-3xl p-6 md:p-8 animate-fade-up animation-delay-200">
          <h2 className="font-display text-2xl text-purple-200 mb-5">Make it yours ✨</h2>

          {/* Color picker */}
          <div className="mb-6">
            <p className="text-white/62 text-sm font-bold mb-3">Choose your colour</p>
            <div className="flex gap-3 flex-wrap">
              {HERO_COLORS.map((color) => {
                const isActive = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Color ${color}`}
                    className="transition-all duration-150 focus:outline-none"
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      background: color,
                      outline: isActive ? `4px solid white` : '2px solid transparent',
                      outlineOffset: isActive ? 2 : 0,
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isActive ? `0 0 20px ${color}` : 'none',
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Hero name input */}
          <div className="mb-6">
            <label className="block text-white/62 text-sm font-bold mb-2">
              Your hero name
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Enter your hero name..."
              value={heroName}
              onChange={(e) => { setHeroName(e.target.value); setError('') }}
              className="w-full rounded-2xl border border-purple-400/35 bg-purple-950/35 text-white
                         placeholder:text-white/30 px-5 py-4 text-lg
                         focus:outline-none focus:border-purple-300"
              style={{ caretColor: 'white' }}
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm mb-4 animate-scale-in">{error}</p>
          )}

          <button
            onClick={handleStart}
            className="kids-primary-button w-full"
          >
            🚀 Start my adventure!
          </button>
        </section>
      </div>
    </div>
  )
}
