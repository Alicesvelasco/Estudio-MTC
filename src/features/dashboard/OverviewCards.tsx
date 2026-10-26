import { ProgressBar } from '../../components/ProgressBar'
import type { Stats } from '../../domain/stats'

export function OverviewCards({ stats }: { stats: Stats }) {
  const accuracy = stats.accuracy ?? 0
  return (
    <section className="space-y-3">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm text-stone-500">Aciertos globales</span>
          <span className="text-3xl font-bold tabular-nums">{accuracy}%</span>
        </div>
        <ProgressBar value={accuracy / 100} barClassName="bg-green-600" className="bg-red-200" label="Aciertos globales" />
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-green-700">{stats.correct} aciertos</span>
          <span className="text-red-700">
            {stats.incorrect} fallos ({100 - accuracy}%)
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Tests realizados" value={stats.attempts} />
        <Stat label="Preguntas respondidas" value={stats.answered} />
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
