import { Link } from 'react-router-dom'
import { ProgressBar } from '../../components/ProgressBar'
import { buildPracticeTest } from '../../content/catalog'
import type { ConceptStat } from '../../domain/stats'
import { formatRelativeDay, pluralize } from '../../lib/format'

const MAX_VISIBLE = 10

export function ConceptsToReview({ concepts }: { concepts: ConceptStat[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">Conceptos a repasar</h2>
      <p className="mb-4 text-sm text-stone-500">
        Ordenados por prioridad: cuentan más los fallos recientes y los conceptos que fallas a menudo.
      </p>
      {concepts.length === 0 ? (
        <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          No tienes fallos registrados. ¡Sigue así!
        </p>
      ) : (
        <ol className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          {concepts.slice(0, MAX_VISIBLE).map((c, i) => (
            <ConceptRow key={c.key} concept={c} rank={i + 1} />
          ))}
        </ol>
      )}
    </section>
  )
}

function ConceptRow({ concept, rank }: { concept: ConceptStat; rank: number }) {
  const percent = Math.round(concept.failRate * 100)
  // Una etiqueta puede haber desaparecido del Markdown aunque siga en el historial.
  const canPractice = buildPracticeTest(concept.key) !== undefined
  return (
    <li className="flex items-center gap-4 p-4">
      <span className="w-5 shrink-0 text-right text-sm font-semibold text-stone-400 tabular-nums">{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 font-medium break-words">{concept.tag}</span>
          <span className="shrink-0 text-sm text-red-700 tabular-nums">{percent}% fallos</span>
        </div>
        <ProgressBar value={concept.failRate} barClassName="bg-red-500" className="my-1.5" label={`Fallos en ${concept.tag}`} />
        <p className="text-xs text-stone-500">
          {pluralize(concept.fails, 'fallo')} en {pluralize(concept.seen, 'respuesta')} · último fallo{' '}
          {formatRelativeDay(concept.lastFailedAt)}
        </p>
      </div>
      {canPractice && (
        <Link
          to={`/repaso/${encodeURIComponent(concept.key)}`}
          className="shrink-0 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-100"
        >
          Practicar
        </Link>
      )}
    </li>
  )
}
