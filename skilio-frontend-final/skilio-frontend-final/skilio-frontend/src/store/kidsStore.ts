import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChildSummary } from '@/types'

export type HeroType = 'nova' | 'marina' | 'leaf' | 'blaze'

export const HERO_COLORS = [
  '#c084fc',
  '#0ea5e9',
  '#16a34a',
  '#f97316',
  '#db2777',
  '#d97706',
  '#dc2626',
  '#0f766e',
]

export interface HeroDefinition {
  id: HeroType
  name: string
  title: string
  description: string
  emoji: string
  accentColor: string
  bgColor: string
}

export const HEROES: HeroDefinition[] = [
  {
    id: 'nova',
    name: 'Nova',
    title: 'Space Explorer',
    description: 'Brave, curious, loves stars and planets',
    emoji: '👩‍🚀',
    accentColor: '#a78bfa',
    bgColor: 'rgba(88,28,135,0.46)',
  },
  {
    id: 'marina',
    name: 'Marina',
    title: 'Sea Guardian',
    description: 'Kind, wise, protects the ocean world',
    emoji: '🧜‍♀️',
    accentColor: '#fbbf24',
    bgColor: 'rgba(88,28,135,0.52)',
  },
  {
    id: 'leaf',
    name: 'Leaf',
    title: 'Forest Sprite',
    description: 'Playful, clever, talks to animals',
    emoji: '🧚',
    accentColor: '#a78bfa',
    bgColor: 'rgba(88,28,135,0.42)',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    title: 'Hero in Training',
    description: 'Strong, loyal, never gives up',
    emoji: '🦸',
    accentColor: '#a78bfa',
    bgColor: 'rgba(88,28,135,0.42)',
  },
]

interface KidsState {
  selectedChild: ChildSummary | null
  hero: HeroType | null
  heroColor: string
  heroName: string
  heroDate: string   // YYYY-MM-DD — resets hero choice each new day

  setChild: (child: ChildSummary) => void
  setHero: (hero: HeroType, color: string, name: string) => void
  clearKidsMode: () => void
}

export const useKidsStore = create<KidsState>()(
  persist(
    (set) => ({
      selectedChild: null,
      hero: null,
      heroColor: HERO_COLORS[0],
      heroName: '',
      heroDate: '',

      setChild: (child) => set({ selectedChild: child }),
      setHero: (hero, heroColor, heroName) => {
        const today = new Date().toISOString().slice(0, 10)
        set({ hero, heroColor, heroName, heroDate: today })
      },
      clearKidsMode: () =>
        set({ selectedChild: null, hero: null, heroColor: HERO_COLORS[0], heroName: '', heroDate: '' }),
    }),
    { name: 'skilio-kids' },
  ),
)
