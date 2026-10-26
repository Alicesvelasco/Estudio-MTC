import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadTests } from '../plugins/content'

// Valida los tests reales del repositorio con el mismo código que usa el build.
describe('content/tests', () => {
  it('todos los .md son válidos y sus ids únicos', () => {
    const { parsed } = loadTests(join(import.meta.dirname, '..', 'content', 'tests'))
    expect(parsed.length).toBeGreaterThan(0)
  })
})
