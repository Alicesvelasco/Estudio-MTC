import { Button, ButtonLink } from '../../components/Button'
import { Markdown } from '../../components/Markdown'
import { TagList } from '../../components/TagList'
import { score, type SessionQuestion } from '../../domain/quiz'
import type { AnswerRecord } from '../../domain/types'
import { pluralize, scoreColor } from '../../lib/format'
import type { SaveState } from './useQuiz'

interface Props {
  title: string
  session: SessionQuestion[]
  answers: AnswerRecord[]
  saveState: SaveState
  onRestart: () => void
}

function verdict(percent: number): string {
  if (percent === 100) return '¡Perfecto!'
  if (percent >= 80) return '¡Muy bien!'
  if (percent >= 50) return 'Vas por buen camino'
  return 'Toca repasar'
}

export function ResultView({ title, session, answers, saveState, onRestart }: Props) {
  const result = score(answers)
  const failed = session
    .map((item, i) => ({ item, answer: answers[i] }))
    .filter((x): x is { item: SessionQuestion; answer: AnswerRecord } => x.answer !== undefined && !x.answer.correct)

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm text-stone-500">{title}</p>
        <p className={`my-2 text-5xl font-bold ${scoreColor(result.percent)}`}>
          {result.percent}%
        </p>
        <p className="text-lg font-medium">{verdict(result.percent)}</p>
        <p className="mt-1 text-stone-600">
          {pluralize(result.correct, 'acierto')} · {pluralize(result.incorrect, 'fallo')} de {result.total}
        </p>
        <SaveStatus state={saveState} />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={onRestart}>Repetir</Button>
          <ButtonLink to="/estadisticas" variant="secondary">
            Ver estadísticas
          </ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Otros tests
          </ButtonLink>
        </div>
      </section>

      {failed.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Preguntas falladas</h2>
          <ol className="space-y-4">
            {failed.map(({ item: { question }, answer }) => (
              <li key={question.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="mb-3 font-medium">
                  <Markdown inline>{question.prompt}</Markdown>
                </p>
                <p className="text-sm text-red-700">
                  <span className="font-medium">Tu respuesta: </span>
                  <Markdown inline>{question.options[answer.selectedIndex] ?? ''}</Markdown>
                </p>
                <p className="mb-3 text-sm text-green-700">
                  <span className="font-medium">Correcta: </span>
                  <Markdown inline>{question.options[answer.correctIndex] ?? ''}</Markdown>
                </p>
                <Markdown className="prose-sm">{question.explanation}</Markdown>
                <TagList tags={question.tags} className="mt-3" />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === 'error') {
    return (
      <p className="mt-3 text-sm text-red-700">
        No se ha podido guardar el resultado. Puede que tu navegador bloquee el almacenamiento local (por ejemplo, en
        modo privado).
      </p>
    )
  }
  if (state === 'saved') return <p className="mt-3 text-sm text-stone-500">Resultado guardado en este navegador.</p>
  return null
}
