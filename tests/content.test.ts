import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseTest } from '../src/content/parseTest'

// Valida todos los tests reales del repositorio. Como `npm run build` ejecuta
// Vitest primero, un Markdown mal formado impide publicar.
const dir = join(import.meta.dirname, '..', 'content', 'tests')
const files = readdirSync(dir).filter((f) => f.endsWith('.md'))

describe('content/tests', () => {
  it('contiene al menos un test', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s tiene un formato válido', (file) => {
    expect(() => parseTest(readFileSync(join(dir, file), 'utf8'), file)).not.toThrow()
  })

  it('no hay dos tests con el mismo id', () => {
    const ids = files.map((f) => parseTest(readFileSync(join(dir, f), 'utf8'), f).id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
