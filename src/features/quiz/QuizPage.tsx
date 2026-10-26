import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { NotFound } from '../../components/NotFound'
import { ProgressBar } from '../../components/ProgressBar'
import { buildPracticeTest, getTest } from '../../content/catalog'
import type { Test } from '../../domain/types'
import { OPTION_LABELS, QuestionView } from './QuestionView'
import { ResultView } from './ResultView'
import { useQuiz } from './useQuiz'

/** Ruta /test/:testId */
export function TestRoute() {
  const { testId = '' } = useParams()
  const test = getTest(testId)
  if (!test) return <NotFound message="No existe ningún test con ese identificador." />
  return <QuizPage key={test.id} test={test} />
}

/** Ruta /repaso/:tag — preguntas de todos los tests con esa etiqueta. */
export function PracticeRoute() {
  const { tag = '' } = useParams()
  const test = buildPracticeTest(tag)
  if (!test) return <NotFound message={`Ya no hay preguntas con la etiqueta «${tag}».`} />
  return <QuizPage key={test.id} test={test} />
}

function QuizPage({ test }: { test: Test }) {
  const { session, index, current, answer, answers, phase, saveState, select, next, restart } = useQuiz(test)

  // Atajos: 1-9 / A-J eligen opción; Enter o → pasan a la siguiente.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || !current) return
      if (phase === 'answering' && event.key.length === 1) {
        const key = event.key.toUpperCase()
        const position = /^[1-9]$/.test(key) ? Number(key) - 1 : OPTION_LABELS.indexOf(key)
        const originalIndex = current.order[position]
        if (position >= 0 && originalIndex !== undefined) select(originalIndex)
      } else if (phase === 'feedback' && (event.key === 'Enter' || event.key === 'ArrowRight')) {
        event.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [current, phase, select, next])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  if (phase === 'finished') {
    return <ResultView title={test.title} session={session} answers={answers} saveState={saveState} onRestart={restart} />
  }

  const isLast = index + 1 === session.length
  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <h1 className="truncate text-sm font-medium text-stone-500">{test.title}</h1>
          <span className="shrink-0 text-sm text-stone-500 tabular-nums">
            {index + 1} / {session.length}
          </span>
        </div>
        <ProgressBar value={(index + (answer ? 1 : 0)) / session.length} label="Progreso del test" />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        {current && <QuestionView item={current} answer={answer} onSelect={select} />}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Link to="/" className="text-sm text-stone-500 hover:text-stone-800">
          Abandonar
        </Link>
        {answer && (
          <Button onClick={next} autoFocus>
            {isLast ? 'Ver resultados' : 'Siguiente'} →
          </Button>
        )}
      </div>
    </div>
  )
}
