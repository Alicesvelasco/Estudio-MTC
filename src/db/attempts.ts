import type { Attempt } from '../domain/types'
import { db } from './database'

export function saveAttempt(attempt: Omit<Attempt, 'id'>): Promise<number> {
  return db.attempts.add(attempt) as Promise<number>
}

/** Todos los intentos, del más reciente al más antiguo. */
export function listAttempts(): Promise<Attempt[]> {
  return db.attempts.orderBy('finishedAt').reverse().toArray()
}

export function clearAttempts(): Promise<void> {
  return db.attempts.clear()
}
