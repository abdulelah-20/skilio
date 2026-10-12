import { Navigate } from 'react-router-dom'
import { useKidsStore } from '@/store/kidsStore'

export function KidsIndex() {
  const hero     = useKidsStore((s) => s.hero)
  const heroName = useKidsStore((s) => s.heroName)
  const heroDate = useKidsStore((s) => s.heroDate)

  const today = new Date().toISOString().slice(0, 10)
  const isToday = heroDate === today

  if (!hero || !heroName.trim() || !isToday) {
    return <Navigate to="/kids/hero-builder" replace />
  }
  return <Navigate to="/kids/worlds" replace />
}
