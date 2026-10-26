import { useCallback, useState } from 'react'
import { saveAttempt } from '../../db/attempts'
import { createSession, toAnswerRecord } from '../../domain/quiz'
import type { AnswerRecord, Test } from '../../domain/types'

export type Phase = 'answering' | 'feedback' | 'finished'
export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Estado de un test en curso. Al pasar de la última pregunta se guarda el
 * intento en IndexedDB. Para cambiar de test, remonta el componente (key).
 */
export function useQuiz(test: Test) {
  const [session, setSession] = useState(() => createSession(test))
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const current = session[index]
  const answer: AnswerRecord | undefined = answers[index]
  const phase: Phase = !current ? 'finished' : answer ? 'feedback' : 'answering'

  /** `originalIndex` es el índice de la opción en el Markdown, no en pantalla. */
  const select = useCallback(
    (originalIndex: number) => {
      if (!current || answer) return
      setAnswers((prev) => [...prev, toAnswerRecord(current.question, originalIndex)])
    },
    [current, answer],
  )

  const next = useCallback(() => {
    if (!answer) return
    if (index + 1 === session.length) {
      setSaveState('saving')
      saveAttempt({
        testId: test.id,
        testTitle: test.title,
        testVersion: test.version,
        startedAt,
        finishedAt: Date.now(),
        answers,
      })
        .then(() => setSaveState('saved'))
        .catch((error: unknown) => {
          console.error('No se pudo guardar el intento', error)
          setSaveState('error')
        })
    }
    setIndex(index + 1)
  }, [answer, answers, index, session.length, startedAt, test])

  const restart = useCallback(() => {
    setSession(createSession(test))
    setIndex(0)
    setAnswers([])
    setStartedAt(Date.now())
    setSaveState('idle')
  }, [test])

  return { session, index, current, answer, answers, phase, saveState, select, next, restart }
}
