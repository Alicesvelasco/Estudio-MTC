import { describe, expect, it } from 'vitest'
import { createSession, score, shuffle, toAnswerRecord } from '../src/domain/quiz'
import type { Question, Test } from '../src/domain/types'

const question = (id: string): Question => ({
  id,
  prompt: `Pregunta ${id}`,
  options: ['a', 'b', 'c', 'd'],
  correctIndex: 2,
  explanation: '...',
  tags: ['Yin-Yang'],
})

const test: Test = {
  id: 't',
  title: 'T',
  version: 1,
  shuffleQuestions: false,
  shuffleOptions: false,
  questions: [question('1'), question('2'), question('3')],
}

/** Generador determinista para que los tests sean reproducibles. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31
    return seed / 2 ** 31
  }
}

describe('shuffle', () => {
  it('devuelve una permutación sin modificar el original', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = shuffle(items, seeded(1))
    expect(items).toEqual([1, 2, 3, 4, 5, 6])
    expect([...result].sort()).toEqual(items)
  })
})

describe('createSession', () => {
  it('respeta el orden original si no se baraja', () => {
    const session = createSession(test)
    expect(session.map((s) => s.question.id)).toEqual(['1', '2', '3'])
    expect(session[0]?.order).toEqual([0, 1, 2, 3])
  })

  it('baraja preguntas y opciones cuando se pide', () => {
    const session = createSession({ ...test, shuffleQuestions: true, shuffleOptions: true }, seeded(7))
    expect(session.map((s) => s.question.id).sort()).toEqual(['1', '2', '3'])
    for (const s of session) expect([...s.order].sort()).toEqual([0, 1, 2, 3])
  })
})

describe('toAnswerRecord y score', () => {
  it('corrige y puntúa', () => {
    const q = question('1')
    const answers = [toAnswerRecord(q, 2), toAnswerRecord(q, 0), toAnswerRecord(q, 2)]
    expect(answers.map((a) => a.correct)).toEqual([true, false, true])
    expect(score(answers)).toEqual({ total: 3, correct: 2, incorrect: 1, percent: 67 })
  })

  it('devuelve 0 % sin respuestas', () => {
    expect(score([]).percent).toBe(0)
  })
})
