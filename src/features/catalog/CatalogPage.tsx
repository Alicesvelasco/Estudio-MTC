import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { tests } from '../../content/catalog'
import { useAttempts } from '../../db/useAttempts'
import { computeStats } from '../../domain/stats'
import type { Test } from '../../domain/types'
import { TestCard, type TestProgress } from './TestCard'

const NO_CATEGORY = 'Otros'

function groupByCategory(list: Test[]): [string, Test[]][] {
  const groups = new Map<string, Test[]>()
  for (const test of list) {
    const key = test.category ?? NO_CATEGORY
    groups.set(key, [...(groups.get(key) ?? []), test])
  }
  return [...groups.entries()].sort(([a], [b]) =>
    a === NO_CATEGORY ? 1 : b === NO_CATEGORY ? -1 : a.localeCompare(b, 'es'),
  )
}

export function CatalogPage() {
  const attempts = useAttempts()
  const stats = useMemo(() => computeStats(attempts ?? []), [attempts])

  const progress = useMemo(() => {
    const byTest = new Map<string, TestProgress>()
    // history viene ordenado del más reciente al más antiguo.
    for (const h of stats.history) {
      const p = byTest.get(h.testId)
      if (p) {
        p.attempts++
        p.bestPercent = Math.max(p.bestPercent, h.percent)
      } else {
        byTest.set(h.testId, { attempts: 1, lastPercent: h.percent, bestPercent: h.percent, lastAt: h.finishedAt })
      }
    }
    return byTest
  }, [stats])

  const weakest = stats.concepts[0]
  const groups = groupByCategory(tests)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Tests</h1>
        <p className="mt-1 text-stone-600">Elige un test para empezar. Tus resultados se guardan en este navegador.</p>
      </div>

      {weakest && (
        <Link
          to={`/repaso/${encodeURIComponent(weakest.key)}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 hover:border-amber-400"
        >
          <span className="text-sm">
            <span className="block text-amber-800">Concepto que más necesitas repasar</span>
            <strong className="text-amber-950">{weakest.tag}</strong>
          </span>
          <span className="shrink-0 text-sm font-medium text-amber-900">Practicar →</span>
        </Link>
      )}

      {groups.map(([category, list]) => (
        <section key={category}>
          {groups.length > 1 && (
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-stone-500 uppercase">{category}</h2>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((test) => (
              <TestCard key={test.id} test={test} progress={progress.get(test.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
