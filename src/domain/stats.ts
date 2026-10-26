import { score, type Score } from './quiz'
import type { Attempt } from './types'

const DAY = 24 * 60 * 60 * 1000

export interface HistoryEntry extends Score {
  id?: number
  testId: string
  testTitle: string
  finishedAt: number
  durationMs: number
}

export interface ConceptStat {
  /** Etiqueta normalizada (minúsculas) usada para agrupar. */
  key: string
  /** Etiqueta tal y como aparece en el Markdown. */
  tag: string
  seen: number
  fails: number
  /** fails / seen, 0–1. */
  failRate: number
  /** Tasa de fallo ponderando más las respuestas recientes, 0–1. */
  recentFailRate: number
  lastFailedAt: number
  /** Cuanto mayor, más urgente es repasarlo. */
  priority: number
}

export interface Stats {
  attempts: number
  answered: number
  correct: number
  incorrect: number
  /** 0–100, o null si aún no hay respuestas. */
  accuracy: number | null
  history: HistoryEntry[]
  concepts: ConceptStat[]
}

export interface StatsOptions {
  now?: number
  /** Días tras los cuales una respuesta pesa la mitad en la prioridad. */
  halfLifeDays?: number
}

export function computeStats(attempts: readonly Attempt[], options: StatsOptions = {}): Stats {
  const { now = Date.now(), halfLifeDays = 14 } = options

  const history: HistoryEntry[] = attempts
    .map((a) => ({
      id: a.id,
      testId: a.testId,
      testTitle: a.testTitle,
      finishedAt: a.finishedAt,
      durationMs: a.finishedAt - a.startedAt,
      ...score(a.answers),
    }))
    .sort((a, b) => b.finishedAt - a.finishedAt)

  const answered = history.reduce((n, h) => n + h.total, 0)
  const correct = history.reduce((n, h) => n + h.correct, 0)

  return {
    attempts: attempts.length,
    answered,
    correct,
    incorrect: answered - correct,
    accuracy: answered === 0 ? null : Math.round((correct / answered) * 100),
    history,
    concepts: conceptsToReview(attempts, now, halfLifeDays),
  }
}

interface ConceptAccumulator {
  tag: string
  seen: number
  fails: number
  weight: number
  weightedFails: number
  lastFailedAt: number
}

/**
 * Agrupa las respuestas por etiqueta y devuelve solo los conceptos con algún
 * fallo, ordenados por prioridad.
 *
 * prioridad = tasa de fallo reciente × log2(1 + nº de fallos)
 *
 * - La tasa reciente pesa cada respuesta con 0.5^(antigüedad / vida media), así
 *   que un concepto que fallabas pero ahora aciertas va bajando solo.
 * - El logaritmo hace que fallar 6 veces pese más que fallar 1, sin que los
 *   conceptos muy preguntados acaparen la lista.
 */
function conceptsToReview(attempts: readonly Attempt[], now: number, halfLifeDays: number): ConceptStat[] {
  const byKey = new Map<string, ConceptAccumulator>()

  for (const attempt of attempts) {
    const ageDays = Math.max(0, now - attempt.finishedAt) / DAY
    const weight = 0.5 ** (ageDays / halfLifeDays)
    for (const answer of attempt.answers) {
      for (const tag of answer.tags) {
        const key = tag.toLowerCase()
        const acc = byKey.get(key) ?? { tag, seen: 0, fails: 0, weight: 0, weightedFails: 0, lastFailedAt: 0 }
        acc.seen++
        acc.weight += weight
        if (!answer.correct) {
          acc.fails++
          acc.weightedFails += weight
          acc.lastFailedAt = Math.max(acc.lastFailedAt, attempt.finishedAt)
        }
        byKey.set(key, acc)
      }
    }
  }

  return [...byKey.entries()]
    .filter(([, acc]) => acc.fails > 0)
    .map(([key, acc]) => {
      const recentFailRate = acc.weight === 0 ? 0 : acc.weightedFails / acc.weight
      return {
        key,
        tag: acc.tag,
        seen: acc.seen,
        fails: acc.fails,
        failRate: acc.fails / acc.seen,
        recentFailRate,
        lastFailedAt: acc.lastFailedAt,
        priority: recentFailRate * Math.log2(1 + acc.fails),
      }
    })
    .sort((a, b) => b.priority - a.priority || b.fails - a.fails || a.tag.localeCompare(b.tag, 'es'))
}
