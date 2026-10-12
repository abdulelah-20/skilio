import React from 'react'
import './mission-visuals.css'

// Pre-computed positions — deterministic, avoids Math.random() on re-render

const STARS = Array.from({ length: 28 }, (_, i) => ({
  top:      `${(i * 17 + 3) % 90}%`,
  left:     `${(i * 31 + 7) % 95}%`,
  size:     0.9 + (i % 4) * 0.55,
  delay:    `${(i * 0.41) % 3.2}s`,
  duration: `${1.8 + (i * 0.22) % 2.2}s`,
}))

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  left:     `${(i * 23 + 5) % 88}%`,
  size:     7 + (i % 5) * 7,
  delay:    `${(i * 0.9) % 5}s`,
  duration: `${4.5 + (i * 0.6) % 4}s`,
  opacity:  0.25 + (i % 4) * 0.1,
}))

const FIREFLIES = Array.from({ length: 18 }, (_, i) => ({
  top:      `${18 + (i * 19 + 7) % 62}%`,
  left:     `${(i * 27 + 11) % 90}%`,
  delay:    `${(i * 0.47) % 3.5}s`,
  duration: `${1.4 + (i * 0.27) % 2.2}s`,
  size:     4 + (i % 3) * 2,
}))

const SEAWEEDS = Array.from({ length: 6 }, (_, i) => ({
  left:  `${5 + i * 16}%`,
  delay: `${(i * 0.6) % 2}s`,
  height: 40 + (i % 3) * 20,
}))

// ── Space Background ───────────────────────────────────────────────────────────

const SpaceBg = React.memo(function SpaceBg() {
  return (
    <div className="mission-bg-scene" aria-hidden>
      {/* Nebula glows */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)',
      }} />

      {/* Stars */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top, left: s.left,
          width: s.size * 4, height: s.size * 4,
          borderRadius: '50%',
          background: '#fff',
          animation: `star-bright ${s.duration} ${s.delay} ease-in-out infinite`,
        }} />
      ))}

      {/* Moon */}
      <div style={{
        position: 'absolute', top: '6%', right: '8%',
        fontSize: 64,
        animation: 'character-bob 6s ease-in-out infinite',
        filter: 'drop-shadow(0 0 16px rgba(226,232,240,0.5))',
      }}>🌕</div>

      {/* Earth */}
      <div style={{
        position: 'absolute', top: '45%', left: '4%',
        fontSize: 40,
        animation: 'character-bob 8s 1s ease-in-out infinite',
        filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.4))',
      }}>🌍</div>

      {/* Orbit ring */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        width: 180, height: 70,
        border: '1.5px solid rgba(129,140,248,0.2)',
        borderRadius: '50%',
        transform: 'translateX(-50%) rotateX(70deg)',
        animation: 'orbit-spin 20s linear infinite',
      }} />

      {/* Asteroid */}
      <div style={{
        position: 'absolute', top: '22%', left: '20%',
        fontSize: 26,
        animation: 'asteroid-drift 12s ease-in-out infinite alternate',
        filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.5))',
      }}>☄️</div>

      {/* Saturn-like planet */}
      <div style={{
        position: 'absolute', bottom: '15%', right: '12%',
        fontSize: 38,
        animation: 'character-bob 7s 2s ease-in-out infinite',
        opacity: 0.75,
      }}>🪐</div>
    </div>
  )
})

// ── Sea Background ─────────────────────────────────────────────────────────────

const SeaBg = React.memo(function SeaBg() {
  return (
    <div className="mission-bg-scene" aria-hidden>
      {/* Depth glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(14,165,233,0.15) 0%, transparent 100%)',
      }} />

      {/* Bubbles */}
      {BUBBLES.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: '-5%', left: b.left,
          width: b.size, height: b.size,
          borderRadius: '50%',
          border: '1.5px solid rgba(56,189,248,0.5)',
          background: 'rgba(56,189,248,0.08)',
          animation: `bubble-rise ${b.duration} ${b.delay} ease-in infinite`,
        }} />
      ))}

      {/* Waves bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        background: 'rgba(14,165,233,0.12)',
        borderRadius: '70% 70% 0 0 / 30% 30% 0 0',
        animation: 'wave-drift 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: '-5%', right: '-5%', height: 50,
        background: 'rgba(14,165,233,0.18)',
        borderRadius: '60% 60% 0 0 / 30% 30% 0 0',
        animation: 'wave-drift 7s 1s ease-in-out infinite',
      }} />

      {/* Seaweeds */}
      {SEAWEEDS.map((sw, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0, left: sw.left,
          width: 18, height: sw.height,
          background: 'rgba(74,222,128,0.35)',
          borderRadius: '50% 50% 0 0',
          animation: `seaweed-sway 3s ${sw.delay} ease-in-out infinite`,
          transformOrigin: 'bottom center',
        }} />
      ))}

      {/* Coral */}
      <div style={{ position: 'absolute', bottom: '2%', left: '4%', fontSize: 36, opacity: 0.8 }}>🪸</div>
      <div style={{ position: 'absolute', bottom: '2%', right: '5%', fontSize: 30, opacity: 0.7 }}>🪸</div>

      {/* Light rays */}
      <div style={{
        position: 'absolute', top: 0, left: '30%',
        width: 60, height: '55%',
        background: 'linear-gradient(180deg, rgba(56,189,248,0.1) 0%, transparent 100%)',
        transform: 'skewX(-10deg)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: '55%',
        width: 40, height: '40%',
        background: 'linear-gradient(180deg, rgba(56,189,248,0.08) 0%, transparent 100%)',
        transform: 'skewX(8deg)',
      }} />
    </div>
  )
})

// ── Forest Background ──────────────────────────────────────────────────────────

const ForestBg = React.memo(function ForestBg() {
  return (
    <div className="mission-bg-scene" aria-hidden>
      {/* Sky glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
        background: 'radial-gradient(ellipse at 70% 0%, rgba(74,222,128,0.12) 0%, transparent 70%)',
      }} />

      {/* Moon */}
      <div style={{
        position: 'absolute', top: '5%', right: '10%',
        fontSize: 32, opacity: 0.7,
        animation: 'character-bob 9s ease-in-out infinite',
      }}>🌙</div>

      {/* Fireflies */}
      {FIREFLIES.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: f.top, left: f.left,
          width: f.size, height: f.size,
          borderRadius: '50%',
          background: '#bbf7d0',
          boxShadow: '0 0 6px #4ade80, 0 0 12px #4ade80',
          animation: `firefly-glow ${f.duration} ${f.delay} ease-in-out infinite`,
        }} />
      ))}

      {/* Tree silhouettes - bottom left cluster */}
      <div style={{ position: 'absolute', bottom: 0, left: 0,  width: 0, height: 0,
        borderLeft: '45px solid transparent', borderRight: '45px solid transparent',
        borderBottom: '120px solid rgba(4,47,11,0.85)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 40, width: 0, height: 0,
        borderLeft: '38px solid transparent', borderRight: '38px solid transparent',
        borderBottom: '100px solid rgba(4,47,11,0.85)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 5, width: 0, height: 0,
        borderLeft: '32px solid transparent', borderRight: '32px solid transparent',
        borderBottom: '80px solid rgba(5,46,22,0.9)' }} />

      {/* Tree silhouettes - bottom right cluster */}
      <div style={{ position: 'absolute', bottom: 0, right: 0,  width: 0, height: 0,
        borderLeft: '45px solid transparent', borderRight: '45px solid transparent',
        borderBottom: '130px solid rgba(4,47,11,0.85)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 38, width: 0, height: 0,
        borderLeft: '35px solid transparent', borderRight: '35px solid transparent',
        borderBottom: '95px solid rgba(4,47,11,0.85)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '18%', width: 0, height: 0,
        borderLeft: '40px solid transparent', borderRight: '40px solid transparent',
        borderBottom: '110px solid rgba(5,46,22,0.9)' }} />

      {/* Forest floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 28,
        background: 'rgba(4,47,11,0.9)',
      }} />

      {/* Forest path */}
      <div style={{
        position: 'absolute', bottom: 0, left: '42%',
        width: 80, height: 55,
        background: 'rgba(21,128,61,0.2)',
        clipPath: 'polygon(25% 100%, 75% 100%, 100% 0%, 0% 0%)',
      }} />

      {/* Peeking owl */}
      <div style={{
        position: 'absolute', bottom: '12%', right: '7%',
        fontSize: 28, opacity: 0.85,
        animation: 'character-bob 4s 0.5s ease-in-out infinite',
      }}>🦉</div>

      {/* Mushrooms */}
      <div style={{ position: 'absolute', bottom: '4%', left: '22%', fontSize: 22, opacity: 0.7 }}>🍄</div>
      <div style={{ position: 'absolute', bottom: '4%', right: '26%', fontSize: 18, opacity: 0.6 }}>🍄</div>
    </div>
  )
})

// ── Exported component ─────────────────────────────────────────────────────────

export const WorldSceneBackground = React.memo(function WorldSceneBackground({
  worldName,
}: {
  worldName: 'space' | 'sea' | 'forest'
}) {
  if (worldName === 'sea')    return <SeaBg />
  if (worldName === 'forest') return <ForestBg />
  return <SpaceBg />
})
