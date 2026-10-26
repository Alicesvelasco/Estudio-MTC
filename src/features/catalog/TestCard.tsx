import { Link } from 'react-router-dom'
import type { Test } from '../../domain/types'
import { formatRelativeDay, pluralize } from '../../lib/format'

export interface TestProgress {
  attempts: number
  lastPercent: number
  bestPercent: number
  lastAt: number
}

const difficultyStyles = {
  baja: 'bg-green-100 text-green-800',
  media: 'bg-amber-100 text-amber-800',
  alta: 'bg-red-100 text-red-800',
}

export function TestCard({ test, progress }: { test: Test; progress?: TestProgress }) {
  return (
    <Link
      to={`/test/${test.id}`}
      className="group block rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold group-hover:underline">{test.title}</h3>
        {test.difficulty && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyStyles[test.difficulty]}`}>
            {test.difficulty}
          </span>
        )}
      </div>
      {test.description && <p className="mt-1 text-sm text-stone-600">{test.description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
        <span>{pluralize(test.questions.length, 'pregunta')}</span>
        {progress ? (
          <>
            <span>
              Última: <strong className="text-stone-700">{progress.lastPercent}%</strong> ·{' '}
              {formatRelativeDay(progress.lastAt)}
            </span>
            <span>
              Mejor: <strong className="text-stone-700">{progress.bestPercent}%</strong>
            </span>
          </>
        ) : (
          <span>Sin hacer</span>
        )}
      </div>
    </Link>
  )
}
