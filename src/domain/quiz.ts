import type { AnswerRecord, Question, Test } from './types'

export type Random = () => number

export interface SessionQuestion {
  question: Question
  /** `order[i]` es el índice original de la opción que se muestra en la posición `i`. */
  order: number[]
}

/** Fisher–Yates; no modifica el array original. */
export function shuffle<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j] as T, result[i] as T]
  }
  return result
}

/** Prepara el orden de preguntas y opciones según la configuración del test. */
export function createSession(test: Test, random: Random = Math.random): SessionQuestion[] {
  const questions = test.shuffleQuestions ? shuffle(test.questions, random) : test.questions
  return questions.map((question) => {
    const indexes = question.options.map((_, i) => i)
    return { question, order: test.shuffleOptions ? shuffle(indexes, random) : indexes }
  })
}

export function toAnswerRecord(question: Question, selectedIndex: number): AnswerRecord {
  return {
    questionId: question.id,
    prompt: question.prompt,
    tags: question.tags,
    selectedIndex,
    correctIndex: question.correctIndex,
    correct: selectedIndex === question.correctIndex,
  }
}

export interface Score {
  total: number
  correct: number
  incorrect: number
  /** 0–100, redondeado. */
  percent: number
}

export function score(answers: readonly AnswerRecord[]): Score {
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  return {
    total,
    correct,
    incorrect: total - correct,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
  }
}
