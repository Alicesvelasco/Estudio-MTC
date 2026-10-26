import { Markdown } from '../../components/Markdown'
import { TagList } from '../../components/TagList'
import type { SessionQuestion } from '../../domain/quiz'
import type { AnswerRecord } from '../../domain/types'
import { OptionButton, type OptionState } from './OptionButton'

interface Props {
  item: SessionQuestion
  answer?: AnswerRecord
  onSelect: (originalIndex: number) => void
}

export const OPTION_LABELS = 'ABCDEFGHIJ'

function optionState(originalIndex: number, answer?: AnswerRecord): OptionState {
  if (!answer) return 'idle'
  if (originalIndex === answer.correctIndex) return 'correct'
  if (originalIndex === answer.selectedIndex) return 'wrong'
  return 'dimmed'
}

export function QuestionView({ item, answer, onSelect }: Props) {
  const { question, order } = item
  return (
    <section>
      <h2 className="mb-4 text-xl leading-snug font-semibold">
        <Markdown inline>{question.prompt}</Markdown>
      </h2>
      {question.body && <Markdown className="mb-4">{question.body}</Markdown>}

      <div className="space-y-2">
        {order.map((originalIndex, position) => (
          <OptionButton
            key={originalIndex}
            label={OPTION_LABELS[position] ?? String(position + 1)}
            text={question.options[originalIndex] ?? ''}
            state={optionState(originalIndex, answer)}
            disabled={answer !== undefined}
            onSelect={() => onSelect(originalIndex)}
          />
        ))}
      </div>

      <div aria-live="polite">
        {answer && (
          <div
            className={`mt-6 rounded-xl border p-4 ${
              answer.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <p className={`mb-2 font-semibold ${answer.correct ? 'text-green-800' : 'text-red-800'}`}>
              {answer.correct ? '¡Correcto!' : 'Incorrecto'}
            </p>
            <Markdown className="prose-sm">{question.explanation}</Markdown>
            <TagList tags={question.tags} className="mt-3" />
          </div>
        )}
      </div>
    </section>
  )
}
