import { useState } from 'react'
import type { AttemptWithNode, ScenarioNode } from '@/types'
import { useSubmitChoice } from '@/hooks/useScenario'
import { getApiErrorMessage } from '@/api/client'
import { MissionTopBar } from './MissionTopBar'
import './earthquake-mission.css'

function FurnitureIcon({ index }: { index: number }) {
  const paths = [
    'M5 10h30v5H5z M9 15v19m22-19v19 M9 25h22',
    'M7 5h26v30H7z M20 5v30 M7 20h26',
    'M5 13v22m30-12v12 M5 23h30v7H5z M8 17h9v6H8z M17 19h18v4',
    'M7 5h26v30H7z M7 16h26 M7 27h26 M12 8v8m6-8v8m8-8 3 8 M12 19v8m6-8v8',
  ]
  return <svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index]} /></svg>
}

export function EarthquakeMission({ attempt, node, moduleId, heroEmoji, heroName, heroColor, onExit, onReplay }: {
  attempt: AttemptWithNode; node: ScenarioNode | null; moduleId: string;
  heroEmoji?: string; heroName: string; heroColor: string; onExit: () => void; onReplay: () => void;
}) {
  const submit = useSubmitChoice()
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [safe, setSafe] = useState(false)
  const completed = attempt.status === 'completed'
  const choices = [...(node?.choices ?? [])].sort((a, b) => a.order_index - b.order_index)

  function choose(index: number) {
    const choice = choices[index]
    if (!choice || submit.isPending || safe) return
    setSelected(index)
    setFeedback('')
    submit.mutate({ attemptId: attempt.id, choiceId: choice.id }, {
      onSuccess: (result) => {
        setSafe(choice.is_safe_choice)
        setFeedback(result.feedback ?? '')
      },
      onError: (error) => { setSelected(null); setFeedback(getApiErrorMessage(error)) },
    })
  }

  return (
    <div className="earthquake-mission-page">
      <MissionTopBar moduleId={moduleId} xp={attempt.xp_earned} heroEmoji={heroEmoji}
        heroName={heroName} heroColor={heroColor} accentColor="#a78bfa" onExit={onExit} />
      <main className="earthquake-mission-layout">
        <div className="earthquake-scene-space" aria-label="Illustrated bedroom with a child, sturdy table, window, bed, and shelves" role="img" />
        <section className="earthquake-question-card" aria-labelledby="earthquake-question">
          <p className="earthquake-eyebrow">EARTHQUAKE SAFETY · AT HOME</p>
          <h1 id="earthquake-question">{completed ? 'Great job! You made the safe choice.' : 'The room starts shaking. What should you do first?'}</h1>
          {completed ? (
            <>
              <div className="earthquake-answer is-safe">
                <span className="earthquake-answer-icon"><FurnitureIcon index={0} /></span>
                <span>Go under the sturdy table and hold on</span>
                <span className="earthquake-answer-mark" aria-hidden="true">✓</span>
              </div>
              <p className="earthquake-feedback" role="status">Great choice! Get under sturdy furniture, protect your head, and hold on until the shaking stops.</p>
              <p className="earthquake-action-copy">Stay under the sturdy table. Protect your head with one hand and firmly hold a table leg with the other. Wait until the shaking stops before moving.</p>
              <p className="earthquake-earned">+{attempt.xp_earned} XP earned</p>
              <button className="kids-primary-button" onClick={onExit}>Back to missions →</button>
              <button className="kids-pill" onClick={() => { setSelected(null); setSafe(false); setFeedback(''); onReplay() }}>Play again ↺</button>
            </>
          ) : (
            <>
              <p className="earthquake-hint">Take a breath. Look around and choose a safe place.</p>
              <div className="earthquake-answer-list" role="group" aria-label="Choose your safe action">
                {choices.map((choice, index) => (
                  <button key={choice.id} onClick={() => choose(index)} disabled={submit.isPending || safe}
                    aria-pressed={selected === index}
                    className={`earthquake-answer ${selected === index ? (safe ? 'is-safe' : 'is-retry') : ''}`}>
                    <span className="earthquake-answer-icon"><FurnitureIcon index={index} /></span>
                    <span>{choice.choice_text}</span>
                    {selected === index && <span className="earthquake-answer-mark" aria-hidden="true">{submit.isPending ? '…' : safe ? '✓' : '↺'}</span>}
                  </button>
                ))}
              </div>
              {feedback && <div className="earthquake-feedback" role="status" aria-live="polite">{feedback}{!safe && <p>Take another look. You can try again.</p>}</div>}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
