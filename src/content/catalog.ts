import parsedTests from 'virtual:tests'
import type { Test } from '../domain/types'

// Los .md se parsean y validan durante el build (ver plugins/content.ts).
export const tests: Test[] = [...parsedTests].sort((a, b) => a.title.localeCompare(b.title, 'es'))

export function getTest(id: string): Test | undefined {
  return tests.find((t) => t.id === id)
}

/** Los intentos de repaso se guardan con este prefijo en `testId`. */
export const PRACTICE_PREFIX = 'repaso:'

/**
 * Test virtual con todas las preguntas, de cualquier test, que tienen la
 * etiqueta indicada (sin distinguir mayúsculas).
 */
export function buildPracticeTest(tag: string): Test | undefined {
  const key = tag.toLowerCase()
  const questions = tests.flatMap((t) => t.questions.filter((q) => q.tags.some((x) => x.toLowerCase() === key)))
  if (questions.length === 0) return undefined
  const label = questions[0]?.tags.find((x) => x.toLowerCase() === key) ?? tag
  return {
    id: PRACTICE_PREFIX + key,
    title: `Repaso: ${label}`,
    description: `Preguntas de todos los tests con la etiqueta «${label}».`,
    version: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    questions,
  }
}
