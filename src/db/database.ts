import Dexie, { type EntityTable } from 'dexie'
import type { Attempt } from '../domain/types'

export const db = new Dexie('estudio-mtc') as Dexie & {
  attempts: EntityTable<Attempt, 'id'>
}

// Solo se indexan los campos por los que se consulta; el resto se guarda igual.
// Para cambiar el esquema, añade db.version(2) en lugar de editar esta.
db.version(1).stores({
  attempts: '++id, testId, finishedAt',
})
