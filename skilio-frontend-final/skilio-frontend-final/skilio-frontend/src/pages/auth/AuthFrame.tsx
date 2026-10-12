import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthFrame({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div className="min-h-screen auth-page flex">
      <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 auth-orbit-pattern" />
        <Link to="/login" className="relative kids-logo-chip w-fit">Skilio</Link>
        <div className="relative max-w-xl">
          <p className="text-purple-200/70 text-sm font-black uppercase tracking-widest mb-5">{eyebrow}</p>
          <blockquote className="font-display text-4xl leading-tight mb-6">
            "Every child deserves the skills to <span className="text-purple-300">stay safe</span> and thrive."
          </blockquote>
          <p className="text-white/52 font-semibold">
            Scenario-based safety learning for children aged 4-17, with parent insight into every decision.
          </p>
          <div className="flex gap-3 mt-7">
            <span className="kids-pill">🌌 Space</span>
            <span className="kids-pill">🌊 Sea</span>
            <span className="kids-pill">🌲 Forest</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <section className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="kids-logo-chip">Skilio</span>
          </div>
          <div className="mb-8">
            <p className="text-primary-600 text-xs font-black uppercase tracking-widest mb-3">{eyebrow}</p>
            <h1 className="font-display text-4xl font-semibold text-surface-900 mb-2">{title}</h1>
            <p className="text-surface-500 text-sm font-semibold">{subtitle}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  )
}
