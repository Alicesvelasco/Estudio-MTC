import { useMemo } from 'react'
import { Button, ButtonLink } from '../../components/Button'
import { clearAttempts } from '../../db/attempts'
import { useAttempts } from '../../db/useAttempts'
import { computeStats } from '../../domain/stats'
import { ConceptsToReview } from './ConceptsToReview'
import { HistoryList } from './HistoryList'
import { OverviewCards } from './OverviewCards'

export function DashboardPage() {
  const attempts = useAttempts()
  const stats = useMemo(() => computeStats(attempts ?? []), [attempts])

  if (attempts === undefined) return null

  if (stats.attempts === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Estadísticas</h1>
        <p className="mb-6 text-stone-600">Todavía no has terminado ningún test.</p>
        <ButtonLink to="/">Empezar un test</ButtonLink>
      </div>
    )
  }

  async function onClear() {
    if (window.confirm('¿Borrar todo el historial y las estadísticas de este navegador? No se puede deshacer.')) {
      await clearAttempts()
    }
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Estadísticas</h1>
      <OverviewCards stats={stats} />
      <ConceptsToReview concepts={stats.concepts} />
      <HistoryList history={stats.history} />
      <div className="border-t border-stone-200 pt-6">
        <Button variant="danger" onClick={onClear}>
          Borrar estadísticas
        </Button>
      </div>
    </div>
  )
}
