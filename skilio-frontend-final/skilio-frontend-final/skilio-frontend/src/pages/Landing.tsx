import { useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import '@/components/disaster-hero.css'

// ── Shared style tokens ───────────────────────────────────────────────────
const BTN_PRIMARY: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.7rem 1.6rem',
  background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  color: '#fff', fontWeight: 800, fontSize: '0.95rem',
  borderRadius: '10px', textDecoration: 'none',
  boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
  letterSpacing: '-0.01em',
}

const BTN_GHOST: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.7rem 1.6rem',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(248,250,252,0.82)', fontWeight: 700, fontSize: '0.95rem',
  borderRadius: '10px', textDecoration: 'none',
}

const EYEBROW: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
  background: 'rgba(110,231,216,0.1)',
  border: '1px solid rgba(110,231,216,0.24)',
  borderRadius: '100px', padding: '0.3rem 1rem',
  fontSize: '0.72rem', fontWeight: 800, color: '#6ee7d8',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  marginBottom: '1.25rem',
}

const H2: CSSProperties = {
  fontFamily: '"Fredoka One", cursive',
  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
  lineHeight: 1.12, fontWeight: 900,
  color: '#f8fafc', marginBottom: '1rem',
}

// ── Data ─────────────────────────────────────────────────────────────────
const WORLDS = [
  {
    emoji: '🏚️', name: 'Quake Zone', tagline: 'EARTHQUAKE SAFETY',
    desc: 'Children learn what to do before, during, and after an earthquake — from preparing emergency supplies to drop, cover, and hold on.',
    gradient: 'linear-gradient(140deg, #0d1235 0%, #1e1b4b 55%, #312e81 100%)',
    accent: '#818cf8', missions: '4 missions', ages: 'Ages 5–10',
    border: 'rgba(129,140,248,0.22)', glow: 'rgba(129,140,248,0.12)',
  },
  {
    emoji: '🌊', name: 'Rising Waters', tagline: 'FLOODS & WATER SAFETY',
    desc: 'Kids practise spotting flood risks, avoiding dangerous water, and following safe evacuation guidance when water levels rise.',
    gradient: 'linear-gradient(140deg, #012a4a 0%, #0c4a6e 55%, #0369a1 100%)',
    accent: '#38bdf8', missions: '4 missions', ages: 'Ages 6–12',
    border: 'rgba(56,189,248,0.22)', glow: 'rgba(56,189,248,0.1)',
  },
  {
    emoji: '🔥', name: 'Fireline Forest', tagline: 'WILDFIRES & EVACUATION',
    desc: 'Children learn how to respond to smoke, prepare essentials, and understand when and how to leave safely during wildfire emergencies.',
    gradient: 'linear-gradient(140deg, #071d0f 0%, #14532d 55%, #166534 100%)',
    accent: '#4ade80', missions: '4 missions', ages: 'Ages 4–9',
    border: 'rgba(74,222,128,0.22)', glow: 'rgba(74,222,128,0.08)',
  },
]

const FEATURES = [
  { emoji: '🌿', title: 'Branching Scenarios', desc: 'Every mission includes real decision points. Kids see the consequences of each choice and build stronger safety instincts over time.' },
  { emoji: '🦸', title: 'Hero Guide System', desc: 'Children choose a familiar guide for their missions, making the experience more personal, engaging, and supportive.' },
  { emoji: '🛡️', title: 'Age-Appropriate Learning', desc: 'Disaster missions are adapted for ages 4–17, with content and decisions matched to the child’s developmental level.' },
  { emoji: '📊', title: 'Parent Insight Dashboard', desc: 'After every mission, parents receive a clear summary of what was practised, what choices were made, and what to reinforce at home.' },
  { emoji: '⭐', title: 'XP & Badge System', desc: 'Safe choices earn experience points and unlock badges, helping preparedness feel rewarding instead of overwhelming.' },
  { emoji: '🔒', title: 'Fully Child-Safe', desc: 'No ads, no social features, and no distracting content — just a focused environment where children can practise emergency readiness safely.' },
]

const STEPS = [
  { num: '01', emoji: '👤', title: 'Create a child profile', desc: 'Add each child with their name and age. Skilio adapts missions and safety guidance to match their stage.' },
  { num: '02', emoji: '🎮', title: 'Child plays the mission', desc: 'Kids choose a guide, enter a disaster world, and make branching decisions that teach them how to respond safely.' },
  { num: '03', emoji: '📋', title: 'Parents review progress', desc: 'See every mission, skill signal, and suggested discussion point in one calm, easy-to-follow dashboard.' },
]

// Deterministic star positions — stable across re-renders
function makeStars(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    w: i % 3 === 0 ? 2.5 : 1.5,
    top: (i * 37 + 13) % 100,
    left: (i * 61 + 7) % 100,
    opacity: 0.2 + (i % 6) * 0.08,
    dur: 2 + (i % 4) * 0.6,
    delay: (i % 7) * 0.45,
    teal: i % 6 === 0,
  }))
}

// ── Component ─────────────────────────────────────────────────────────────
export function LandingPage() {
  const token = useAuthStore((s) => s.token)
  const user  = useAuthStore((s) => s.user)
  const dashPath = user?.is_admin ? '/admin' : '/dashboard'
  const stars = useMemo(() => makeStars(55), [])

  // globals.css sets body to a light theme; override it for the dark landing page
  useEffect(() => {
    const prev = { bg: document.body.style.background, color: document.body.style.color }
    document.body.style.background = '#07050f'
    document.body.style.color = '#f8fafc'
    return () => {
      document.body.style.background = prev.bg
      document.body.style.color = prev.color
    }
  }, [])

  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: '#07050f', color: '#f8fafc', minHeight: '100vh' }}>

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)',
        background: 'rgba(7,5,15,0.88)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          padding: '0 clamp(1rem,4vw,2rem)',
          height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Fredoka One", cursive', fontWeight: 900, fontSize: '1.1rem', color: '#fff',
              boxShadow: '0 2px 10px rgba(124,58,237,0.5)',
            }}>S</div>
            <span style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.25rem', color: '#f8fafc' }}>Skilio</span>
          </Link>

          {/* Links — hidden on mobile via Tailwind */}
          <div className="hidden md:flex" style={{ gap: '2rem', alignItems: 'center' }}>
            {[['#worlds','Worlds'],['#kids','For Kids'],['#parents','For Parents'],['#how','How It Works']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'rgba(248,250,252,0.57)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700 }}>
                {label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexShrink: 0 }}>
            {token ? (
              <Link to={dashPath} style={BTN_PRIMARY}>Open app</Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline" style={{ color: 'rgba(248,250,252,0.6)', textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', padding: '0.5rem' }}>Sign in</Link>
                <Link to="/register" style={BTN_PRIMARY}>Start free →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="disaster-hero-section" style={{
        position: 'relative', overflow: 'hidden',
        minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        padding: 'clamp(3rem,8vh,5rem) clamp(1rem,4vw,2rem)',
      }}>
        {/* Star field */}
        {stars.map((s) => (
          <div key={s.id} style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: s.w, height: s.w,
            top: `${s.top}%`, left: `${s.left}%`,
            background: s.teal ? '#6ee7d8' : 'rgba(255,255,255,0.85)',
            opacity: s.opacity,
            animation: `twinkle ${s.dur}s ease-in-out infinite ${s.delay}s`,
          }} />
        ))}

        <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(2rem,6vw,5rem)', alignItems: 'center' }}>

            {/* Copy */}
            <div>
              <div style={EYEBROW}>✦ NATURAL DISASTERS LEARNING PLATFORM</div>

              <h1 style={{
                fontFamily: '"Fredoka One", cursive',
                fontSize: 'clamp(2.4rem,5.5vw,3.75rem)',
                lineHeight: 1.07, fontWeight: 900, color: '#f8fafc',
                marginBottom: '1.2rem',
              }}>
                Where kids practise{' '}
                <span style={{
                  background: 'linear-gradient(125deg, #a78bfa 0%, #6ee7d8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>real safety skills.</span>
              </h1>

              <p style={{ fontSize: 'clamp(0.95rem,2vw,1.1rem)', color: 'rgba(248,250,252,0.62)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 510 }}>
                Skilio is a scenario-based learning platform where children explore real-life natural disaster situations — like earthquakes, floods, fires, and storms — and practise safe decisions while parents get a clear view of their progress.
              </p>

              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
                {token ? (
                  <>
                    <Link to="/kids" style={BTN_PRIMARY}>🎮 Enter kids mode</Link>
                    <Link to={dashPath} style={BTN_GHOST}>View dashboard →</Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" style={BTN_PRIMARY}>Get started free →</Link>
                    <a href="#how" style={BTN_GHOST}>How it works</a>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
                {[['🔒','No ads, ever'],['🧒','Ages 4–17'],['✨','Free to start']].map(([ico, txt]) => (
                  <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(248,250,252,0.4)', fontSize: '0.83rem', fontWeight: 700 }}>
                    <span>{ico}</span>{txt}
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ══ STATS STRIP ══════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '1.6rem clamp(1rem,4vw,2rem)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '1.5rem', textAlign: 'center' }}>
            {[['6','Disaster Worlds'],['24','Branching Missions'],['Ages 4–17','Age-Appropriate Learning'],['100%','Child-Safe & Ad-Free']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.75rem', color: '#f8fafc', fontWeight: 900, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(248,250,252,0.42)', fontWeight: 700, marginTop: '0.2rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STORY WORLDS ═════════════════════════════════════════════════ */}
      <section id="worlds" style={{ padding: 'clamp(4rem,8vh,6rem) clamp(1rem,4vw,2rem)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={EYEBROW}>DISASTER WORLDS</div>
            <h2 style={H2}>Every world prepares kids for a different kind of disaster.</h2>
            <p style={{ color: 'rgba(248,250,252,0.52)', maxWidth: 530, margin: '0 auto', lineHeight: 1.7, fontSize: '0.975rem' }}>
              From earthquakes and floods to storms and wildfires, each themed world uses interactive missions to help children build calm, practical safety skills for real life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.25rem' }}>
            {WORLDS.map((w) => (
              <div key={w.name} style={{
                background: w.gradient,
                border: `1px solid ${w.border}`,
                borderRadius: 20, padding: '1.75rem 1.6rem 1.5rem',
                boxShadow: `0 16px 48px ${w.glow}`,
              }}>
                <div style={{ fontSize: '2.6rem', marginBottom: '0.9rem', lineHeight: 1 }}>{w.emoji}</div>
                <div style={{ fontSize: '0.68rem', color: w.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{w.tagline}</div>
                <h3 style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.35rem', color: '#f8fafc', fontWeight: 900, marginBottom: '0.65rem', lineHeight: 1.2 }}>{w.name}</h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(248,250,252,0.63)', lineHeight: 1.65, marginBottom: '1.4rem' }}>{w.desc}</p>
                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '0.22rem 0.75rem', fontSize: '0.76rem', color: w.accent, fontWeight: 800 }}>{w.missions}</span>
                  <span style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: '0.22rem 0.75rem', fontSize: '0.76rem', color: 'rgba(248,250,252,0.5)', fontWeight: 700 }}>{w.ages}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOR KIDS ═════════════════════════════════════════════════════ */}
      <section id="kids" style={{
        padding: 'clamp(4rem,8vh,6rem) clamp(1rem,4vw,2rem)',
        background: 'radial-gradient(ellipse 70% 70% at 5% 50%, rgba(124,58,237,0.13) 0%, transparent 60%), rgba(255,255,255,0.015)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' }}>
            {/* Copy */}
            <div>
              <div style={EYEBROW}>For Kids</div>
              <h2 style={H2}>Not school software.<br />A real mission adventure.</h2>
              <p style={{ color: 'rgba(248,250,252,0.58)', lineHeight: 1.75, fontSize: '0.975rem', marginBottom: '2rem' }}>
                Kids Mode is designed to feel like entering a world — not filling out a worksheet. Children choose their guide, step into a disaster mission, make real decisions, and discover what happens next.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { e: '🦸', t: 'Hero Guide',      d: 'Pick Nova, Marina, Leaf, or Blaze. A familiar guide makes every mission feel more personal, supportive, and fun.' },
                  { e: '📖', t: 'Story-First Missions',  d: 'Each mission places kids inside a real-life emergency moment and lets them explore choices — not just memorise answers.' },
                  { e: '⭐', t: 'XP & Badges',         d: 'Safe decisions earn XP and unlock achievement badges. Rewards help children stay engaged while building practical preparedness skills.' },
                ].map((f) => (
                  <div key={f.t} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>{f.e}</div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem', marginBottom: '0.18rem' }}>{f.t}</div>
                      <div style={{ fontSize: '0.865rem', color: 'rgba(248,250,252,0.52)', lineHeight: 1.65 }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero-selector mockup */}
            <div>
              <div style={{
                background: 'linear-gradient(140deg, #1e1b4b 0%, #0d0a1a 100%)',
                border: '1px solid rgba(129,140,248,0.18)',
                borderRadius: 22, padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(124,58,237,0.18)',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>CHOOSE YOUR GUIDE</div>
                <div className="grid grid-cols-2" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {[
                    { e: '🚀', n: 'Nova',   c: '#818cf8', sel: true },
                    { e: '🐬', n: 'Marina', c: '#38bdf8', sel: false },
                    { e: '🌿', n: 'Leaf',   c: '#4ade80', sel: false },
                    { e: '🔥', n: 'Blaze',  c: '#fb923c', sel: false },
                  ].map((h) => (
                    <div key={h.n} style={{
                      background: h.sel ? 'rgba(129,140,248,0.12)' : 'rgba(255,255,255,0.04)',
                      border: h.sel ? '1.5px solid rgba(129,140,248,0.45)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 13, padding: '0.9rem 1rem',
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                    }}>
                      <span style={{ fontSize: '1.55rem' }}>{h.e}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: h.sel ? h.c : 'rgba(248,250,252,0.62)' }}>{h.n}</span>
                      {h.sel && <span style={{ marginLeft: 'auto', color: '#818cf8', fontSize: '0.8rem' }}>✓</span>}
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.17)',
                  borderRadius: 13, padding: '1rem 1.1rem',
                }}>
                  <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Nova is ready for your next mission!</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(248,250,252,0.5)' }}>Earthquake World · Mission 1 of 4 · "The Ground Starts Shaking"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOR PARENTS ══════════════════════════════════════════════════ */}
      <section id="parents" style={{ padding: 'clamp(4rem,8vh,6rem) clamp(1rem,4vw,2rem)', background: '#fff', color: '#0f172a' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' }}>
            {/* Dashboard mockup */}
            <div style={{
              background: '#f8fafc', borderRadius: 22, padding: '1.6rem',
              boxShadow: '0 4px 32px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
            }}>
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.1rem', color: '#0f172a', fontWeight: 900 }}>Maya’s preparedness</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Age 8 · Earthquake World</div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '0.22rem 0.75rem', fontSize: '0.74rem', color: '#15803d', fontWeight: 800 }}>● Active</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3" style={{ gap: '0.65rem', marginBottom: '1.1rem' }}>
                {[
                  { l: 'Total XP',   v: '1,240', c: '#7c3aed', bg: '#faf5ff' },
                  { l: 'Badges',     v: '12',    c: '#0284c7', bg: '#f0f9ff' },
                  { l: 'Preparedness Confidence', v: '78%',   c: '#15803d', bg: '#f0fdf4' },
                ].map((s) => (
                  <div key={s.l} style={{ background: s.bg, borderRadius: 11, padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.35rem', color: s.c, fontWeight: 900 }}>{s.v}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Module progress bars */}
              <div style={{ marginBottom: '1rem' }}>
                {[
                  { n: '🏚️ Earthquake World',       p: 80, c: '#0284c7' },
                  { n: '🌊 Flood Safety',         p: 50, c: '#7c3aed' },
                  { n: '🔥 Wildfire Readiness',    p: 20, c: '#16a34a' },
                ].map((m) => (
                  <div key={m.n} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.18rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{m.n}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{m.p}%</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${m.p}%`, height: '100%', background: m.c, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Next practice tip */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '0.8rem 0.95rem', display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.05rem', marginTop: '0.05rem' }}>💡</span>
                <div>
                  <div style={{ fontSize: '0.73rem', fontWeight: 800, color: '#92400e', marginBottom: '0.18rem' }}>Next practice at home</div>
                  <div style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.55 }}>Talk about where Maya should go during an earthquake and what items belong in a family emergency kit.</div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div>
              <div style={{ ...EYEBROW, background: 'rgba(124,58,237,0.07)', borderColor: 'rgba(124,58,237,0.2)', color: '#7c3aed' }}>For Parents</div>
              <h2 style={{ ...H2, color: '#0f172a' }}>A calm, clear view of how your child responds in emergencies.</h2>
              <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '0.975rem', marginBottom: '2rem' }}>
                After every mission, parents receive a simple summary of what was practised, how decisions were made, and which preparedness skills may need more support at home.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { e: '📊', t: 'Preparedness Progress',        d: 'Track confidence, completed missions, and safety-skill development in one clear, easy-to-read view.' },
                  { e: '🔍', t: 'Decision History',           d: 'Review the choices your child made during each scenario and see how they responded to different disaster situations.' },
                  { e: '💬', t: 'Home Practice Prompts',    d: 'Skilio suggests practical follow-up conversations and simple preparedness reminders to continue the learning at home.' },
                ].map((f) => (
                  <div key={f.t} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>{f.e}</div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.18rem' }}>{f.t}</div>
                      <div style={{ fontSize: '0.865rem', color: '#475569', lineHeight: 1.65 }}>{f.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section id="how" style={{ padding: 'clamp(4rem,8vh,6rem) clamp(1rem,4vw,2rem)', background: '#07050f' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={EYEBROW}>How It Works</div>
            <h2 style={H2}>One loop connects play, preparedness, and home.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '2rem', position: 'relative' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ textAlign: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block" style={{
                    position: 'absolute', top: 27, left: '60%', width: '74%', height: 1,
                    background: 'linear-gradient(90deg, rgba(124,58,237,0.35), rgba(110,231,216,0.18))',
                    zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 1.5rem',
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.45rem', position: 'relative', zIndex: 1,
                  boxShadow: '0 0 0 6px rgba(124,58,237,0.1)',
                }}>{s.emoji}</div>
                <div style={{ fontFamily: '"Fredoka One", cursive', fontSize: '0.75rem', color: '#7c3aed', fontWeight: 900, letterSpacing: '0.12em', marginBottom: '0.45rem' }}>STEP {s.num}</div>
                <h3 style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 900, marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.865rem', color: 'rgba(248,250,252,0.52)', lineHeight: 1.7, maxWidth: 255, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(4rem,8vh,6rem) clamp(1rem,4vw,2rem)',
        background: 'rgba(255,255,255,0.018)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <div style={EYEBROW}>Platform Features</div>
            <h2 style={H2}>Built specifically for child disaster preparedness.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.1rem' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '1.5rem',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.emoji}</div>
                <h3 style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.94rem', marginBottom: '0.45rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.845rem', color: 'rgba(248,250,252,0.48)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem,10vh,8rem) clamp(1rem,4vw,2rem)',
        background: 'radial-gradient(ellipse 80% 100% at 50% 60%, rgba(124,58,237,0.24) 0%, transparent 65%), #07050f',
        textAlign: 'center',
        borderTop: '1px solid rgba(124,58,237,0.12)',
      }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ fontSize: '2.6rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{
            fontFamily: '"Fredoka One", cursive',
            fontSize: 'clamp(1.85rem,4vw,2.8rem)',
            color: '#f8fafc', fontWeight: 900, marginBottom: '1.1rem', lineHeight: 1.14,
          }}>
            Start your child’s preparedness journey today.
          </h2>
          <p style={{ fontSize: '1.02rem', color: 'rgba(248,250,252,0.58)', marginBottom: '2.25rem', lineHeight: 1.72 }}>
            Free to start. No credit card. No ads. Just a safe, focused place for children to build confidence and practise what to do during real-world disasters.
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {token ? (
              <Link to={dashPath} style={{ ...BTN_PRIMARY, fontSize: '1rem', padding: '0.85rem 2.25rem' }}>Open the app →</Link>
            ) : (
              <>
                <Link to="/register" style={{ ...BTN_PRIMARY, fontSize: '1rem', padding: '0.85rem 2.25rem' }}>Create a free account →</Link>
                <Link to="/login" style={{ ...BTN_GHOST, fontSize: '1rem', padding: '0.85rem 1.75rem' }}>Sign in</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem clamp(1rem,4vw,2rem)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Fredoka One", cursive', fontSize: '0.9rem', fontWeight: 900, color: '#fff',
            }}>S</div>
            <span style={{ fontFamily: '"Fredoka One", cursive', fontSize: '1.05rem', color: '#f8fafc' }}>Skilio</span>
          </Link>
          <p style={{ color: 'rgba(248,250,252,0.32)', fontSize: '0.8rem', margin: 0 }}>Kids practise disaster readiness. Parents understand the signals.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['hello@skilio.app','support@skilio.app'].map((e) => (
              <a key={e} href={`mailto:${e}`} style={{ color: 'rgba(248,250,252,0.42)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>{e}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
