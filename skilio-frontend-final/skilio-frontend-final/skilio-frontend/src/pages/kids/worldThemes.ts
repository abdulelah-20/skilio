export interface WorldTheme {
  emoji: string
  bgFrom: string
  bgTo: string
  accentColor: string
  cardBg: string
  cardBorder: string
  sceneBg: string
  panelBg: string
  character: string
  characterName: string
  greeting: string
  tagline: string
  bgGlow: string
}

const THEMES: Record<string, WorldTheme> = {
  'Outer Space': {
    emoji: '🌌',
    bgFrom: '#0d1235',
    bgTo: '#1a0f35',
    accentColor: '#818cf8',
    cardBg: 'rgba(129,140,248,0.1)',
    cardBorder: 'rgba(129,140,248,0.25)',
    sceneBg: 'radial-gradient(circle at 85% 15%, rgba(251,191,36,0.28), transparent 22%), #111234',
    panelBg: 'linear-gradient(180deg, rgba(55,48,163,0.76), rgba(49,46,129,0.72))',
    character: '🚀',
    characterName: 'Cosmo the Astronaut',
    greeting:
      'Greetings, explorer! The solar system needs your help. Make smart, safe choices to protect the universe!',
    tagline: 'Mars wants help! The Sun teaches safety. Join the crew!',
    bgGlow: 'rgba(99,102,241,0.3)',
  },
  'The Deep Sea': {
    emoji: '🌊',
    bgFrom: '#012a4a',
    bgTo: '#023e72',
    accentColor: '#38bdf8',
    cardBg: 'rgba(56,189,248,0.1)',
    cardBorder: 'rgba(56,189,248,0.25)',
    sceneBg: 'radial-gradient(circle at 50% 100%, rgba(56,189,248,0.18), transparent 42%), #061d2f',
    panelBg: 'linear-gradient(180deg, rgba(8,113,148,0.82), rgba(14,116,144,0.78))',
    character: '🐬',
    characterName: 'Splash the Dolphin',
    greeting:
      'Splash splash! Welcome to my ocean. Some sea friends need help — will you make wise choices to keep them safe?',
    tagline: 'Dolphins need rescuing! Learn to stay safe underwater.',
    bgGlow: 'rgba(14,165,233,0.3)',
  },
  'Enchanted Forest': {
    emoji: '🌲',
    bgFrom: '#071d0f',
    bgTo: '#0f3320',
    accentColor: '#4ade80',
    cardBg: 'rgba(74,222,128,0.1)',
    cardBorder: 'rgba(74,222,128,0.25)',
    sceneBg: 'radial-gradient(circle at 70% 35%, rgba(74,222,128,0.13), transparent 35%), #04180f',
    panelBg: 'linear-gradient(180deg, rgba(21,128,61,0.84), rgba(20,83,45,0.8))',
    character: '🦁',
    characterName: 'Leo the Lion',
    greeting:
      'ROAR! Welcome to my forest. Some animals are lost and need smart choices. Are you ready to help?',
    tagline: 'The animals are lost! Help Leaf find them safely.',
    bgGlow: 'rgba(34,197,94,0.3)',
  },
}

const FALLBACK = THEMES['Outer Space']

export function getWorldTheme(title?: string | null): WorldTheme {
  if (!title) return FALLBACK
  return THEMES[title] ?? FALLBACK
}
