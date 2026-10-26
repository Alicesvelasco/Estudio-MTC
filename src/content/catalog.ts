import type { Test } from '../domain/types'
import { parseTest } from './parseTest'

// Vite incrusta el contenido de cada .md en el bundle durante el build.
const sources = import.meta.glob<string>('/content/tests/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const tests: Test[] = Object.entries(sources)
  .map(([file, source]) => parseTest(source, file))
  .sort((a, b) => a.title.localeCompare(b.title, 'es'))

export function getTest(id: string): Test | undefined {
  return tests.find((t) => t.id === id)
}
