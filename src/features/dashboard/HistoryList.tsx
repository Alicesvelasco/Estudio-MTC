import { useState } from 'react'
import type { HistoryEntry } from '../../domain/stats'
import { formatDateTime, formatDuration, scoreColor } from '../../lib/format'

const PAGE_SIZE = 10

export function HistoryList({ history }: { history: HistoryEntry[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Historial</h2>
      <ul className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
        {history.slice(0, visible).map((h) => (
          <li key={h.id ?? h.finishedAt} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{h.testTitle}</p>
              <p className="text-xs text-stone-500">
                {formatDateTime(h.finishedAt)} · {formatDuration(h.durationMs)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-semibold tabular-nums ${scoreColor(h.percent)}`}>
                {h.percent}%
              </p>
              <p className="text-xs text-stone-500 tabular-nums">
                {h.correct}/{h.total}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {history.length > visible && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-3 text-sm text-stone-600 hover:text-stone-900"
        >
          Ver más ({history.length - visible} restantes)
        </button>
      )}
    </section>
  )
}
