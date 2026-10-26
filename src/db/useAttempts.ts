import { useLiveQuery } from 'dexie-react-hooks'
import type { Attempt } from '../domain/types'
import { listAttempts } from './attempts'

/** Intentos guardados (se actualiza solo). `undefined` mientras carga. */
export function useAttempts(): Attempt[] | undefined {
  return useLiveQuery(listAttempts, [])
}
