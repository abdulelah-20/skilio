import type { WorldTheme } from '@/pages/kids/worldThemes'
import { getWorldTheme } from '@/pages/kids/worldThemes'

export interface CharacterInfo {
  emoji: string
  name: string
  glowColor: string
}

export interface MissionVisualConfig {
  theme: WorldTheme
  worldName: 'space' | 'sea' | 'forest'
  character: CharacterInfo
  dangerEmoji: string
}

// ── Character detection ────────────────────────────────────────────────────────

const SPACE_CHARACTERS: Array<[RegExp, CharacterInfo]> = [
  [/\bmoon\b/i,     { emoji: '🌕', name: 'the Moon',    glowColor: '#e2e8f0' }],
  [/\bsun\b/i,      { emoji: '☀️',  name: 'the Sun',     glowColor: '#fbbf24' }],
  [/\basteroid\b/i, { emoji: '☄️',  name: 'asteroid',   glowColor: '#f97316' }],
  [/\balien\b/i,    { emoji: '👾',  name: 'alien',      glowColor: '#a78bfa' }],
  [/\bplanet\b/i,   { emoji: '🪐',  name: 'the Planet', glowColor: '#818cf8' }],
  [/\bcomet\b/i,    { emoji: '☄️',  name: 'comet',      glowColor: '#f97316' }],
  [/\bstar\b/i,     { emoji: '⭐',  name: 'a Star',     glowColor: '#fbbf24' }],
]

const SEA_CHARACTERS: Array<[RegExp, CharacterInfo]> = [
  [/\bwhale\b/i,      { emoji: '🐋', name: 'the Whale',    glowColor: '#38bdf8' }],
  [/\bdolphin\b/i,    { emoji: '🐬', name: 'Splash',       glowColor: '#0ea5e9' }],
  [/\bjellyfish\b/i,  { emoji: '🪼', name: 'the Jellyfish',glowColor: '#c084fc' }],
  [/\boctopus\b/i,    { emoji: '🐙', name: 'the Octopus',  glowColor: '#f97316' }],
  [/\bfish\b/i,       { emoji: '🐠', name: 'a Fish',       glowColor: '#22c55e' }],
  [/\bturtle\b/i,     { emoji: '🐢', name: 'the Turtle',   glowColor: '#4ade80' }],
  [/\bshark\b/i,      { emoji: '🦈', name: 'the Shark',    glowColor: '#94a3b8' }],
  [/\bcrab\b/i,       { emoji: '🦀', name: 'the Crab',     glowColor: '#ef4444' }],
]

const FOREST_CHARACTERS: Array<[RegExp, CharacterInfo]> = [
  [/\blion\b/i,    { emoji: '🦁', name: 'Leo',        glowColor: '#fbbf24' }],
  [/\bfox\b/i,     { emoji: '🦊', name: 'the Fox',    glowColor: '#f97316' }],
  [/\bowl\b/i,     { emoji: '🦉', name: 'the Owl',    glowColor: '#a78bfa' }],
  [/\bbear\b/i,    { emoji: '🐻', name: 'the Bear',   glowColor: '#a16207' }],
  [/\bdeer\b/i,    { emoji: '🦌', name: 'the Deer',   glowColor: '#78716c' }],
  [/\brabbit\b/i,  { emoji: '🐰', name: 'the Rabbit', glowColor: '#f9a8d4' }],
  [/\bwolf\b/i,    { emoji: '🐺', name: 'the Wolf',   glowColor: '#94a3b8' }],
  [/\bbird\b/i,    { emoji: '🐦', name: 'the Bird',   glowColor: '#38bdf8' }],
  [/\bdragon\b/i,  { emoji: '🐉', name: 'the Dragon', glowColor: '#4ade80' }],
]

function detectCharacter(
  text: string,
  title: string,
  worldName: 'space' | 'sea' | 'forest',
): CharacterInfo {
  const haystack = `${text} ${title}`
  const list =
    worldName === 'space' ? SPACE_CHARACTERS :
    worldName === 'sea'   ? SEA_CHARACTERS :
    FOREST_CHARACTERS

  for (const [pattern, info] of list) {
    if (pattern.test(haystack)) return info
  }

  const defaults: Record<typeof worldName, CharacterInfo> = {
    space:  { emoji: '🚀', name: 'Cosmo',       glowColor: '#818cf8' },
    sea:    { emoji: '🐬', name: 'Splash',       glowColor: '#38bdf8' },
    forest: { emoji: '🦁', name: 'Leo',          glowColor: '#4ade80' },
  }
  return defaults[worldName]
}

function detectWorldName(title?: string | null): 'space' | 'sea' | 'forest' {
  if (!title) return 'space'
  const t = title.toLowerCase()
  if (t.includes('sea') || t.includes('ocean') || t.includes('deep')) return 'sea'
  if (t.includes('forest') || t.includes('enchant')) return 'forest'
  return 'space'
}

export function buildMissionConfig(
  moduleTitle: string | undefined | null,
  storyText: string,
  lessonTitle: string,
): MissionVisualConfig {
  const theme = getWorldTheme(moduleTitle)
  const worldName = detectWorldName(moduleTitle)
  const character = detectCharacter(storyText, lessonTitle, worldName)

  const dangerEmoji =
    worldName === 'space'  ? '☄️' :
    worldName === 'sea'    ? '🌊' :
    '🔥'

  return { theme, worldName, character, dangerEmoji }
}
