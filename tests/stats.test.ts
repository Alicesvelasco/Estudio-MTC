import { describe, expect, it } from 'vitest'
import { computeStats } from '../src/domain/stats'
import type { AnswerRecord, Attempt } from '../src/domain/types'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 0, 31)

const answer = (correct: boolean, tags: string[]): AnswerRecord => ({
  questionId: 'q',
  prompt: 'q',
  tags,
  selectedIndex: correct ? 0 : 1,
  correctIndex: 0,
  correct,
})

const attempt = (daysAgo: number, answers: AnswerRecord[], testId = 't'): Attempt => ({
  testId,
  testTitle: testId.toUpperCase(),
  testVersion: 1,
  startedAt: NOW - daysAgo * DAY - 60_000,
  finishedAt: NOW - daysAgo * DAY,
  answers,
})

describe('computeStats', () => {
  it('sin intentos', () => {
    const s = computeStats([], { now: NOW })
    expect(s).toMatchObject({ attempts: 0, answered: 0, accuracy: null, history: [], concepts: [] })
  })

  it('calcula totales e historial ordenado del más reciente al más antiguo', () => {
    const s = computeStats(
      [
        attempt(5, [answer(true, ['A']), answer(false, ['B'])], 'viejo'),
        attempt(1, [answer(true, ['A']), answer(true, ['B']), answer(true, ['C'])], 'nuevo'),
      ],
      { now: NOW },
    )
    expect(s).toMatchObject({ attempts: 2, answered: 5, correct: 4, incorrect: 1, accuracy: 80 })
    expect(s.history.map((h) => h.testId)).toEqual(['nuevo', 'viejo'])
    expect(s.history[1]).toMatchObject({ total: 2, correct: 1, percent: 50, durationMs: 60_000 })
  })

  it('solo lista conceptos con fallos y agrupa sin distinguir mayúsculas', () => {
    const s = computeStats(
      [attempt(0, [answer(false, ['Zang-Fu']), answer(true, ['zang-fu']), answer(true, ['Yin-Yang'])])],
      { now: NOW },
    )
    expect(s.concepts).toHaveLength(1)
    expect(s.concepts[0]).toMatchObject({ key: 'zang-fu', tag: 'Zang-Fu', seen: 2, fails: 1, failRate: 0.5 })
  })

  it('prioriza fallos recientes sobre fallos antiguos ya corregidos', () => {
    const s = computeStats(
      [
        // "Antiguo": 2 fallos hace 60 días, aciertos esta semana.
        attempt(60, [answer(false, ['Antiguo']), answer(false, ['Antiguo'])]),
        attempt(2, [answer(true, ['Antiguo']), answer(true, ['Antiguo'])]),
        // "Reciente": 1 fallo ayer.
        attempt(1, [answer(false, ['Reciente']), answer(true, ['Reciente'])]),
      ],
      { now: NOW },
    )
    expect(s.concepts.map((c) => c.tag)).toEqual(['Reciente', 'Antiguo'])
    expect(s.concepts[1]?.failRate).toBe(0.5)
    expect(s.concepts[1]?.recentFailRate).toBeLessThan(0.1)
  })

  it('a igual tasa reciente, pesa más quien acumula más fallos', () => {
    const s = computeStats(
      [attempt(0, [answer(false, ['Uno']), answer(false, ['Tres']), answer(false, ['Tres']), answer(false, ['Tres'])])],
      { now: NOW },
    )
    expect(s.concepts.map((c) => c.tag)).toEqual(['Tres', 'Uno'])
  })

  it('guarda la fecha del último fallo', () => {
    const s = computeStats([attempt(10, [answer(false, ['A'])]), attempt(3, [answer(false, ['A'])])], { now: NOW })
    expect(s.concepts[0]?.lastFailedAt).toBe(NOW - 3 * DAY)
  })
})
