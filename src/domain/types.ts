export type Difficulty = 'baja' | 'media' | 'alta'

export interface Question {
  /** Estable entre builds: `<testId>#<hash del enunciado>`. */
  id: string
  /** Enunciado (Markdown en línea, viene del `## ...`). */
  prompt: string
  /** Contenido adicional del enunciado (Markdown), si lo hay. */
  body?: string
  options: string[]
  correctIndex: number
  /** Explicación (Markdown) que se muestra tras responder. */
  explanation: string
  tags: string[]
}

export interface Test {
  id: string
  title: string
  description?: string
  category?: string
  difficulty?: Difficulty
  version: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  questions: Question[]
}

/**
 * Respuesta guardada en IndexedDB. Se desnormaliza (enunciado, etiquetas…)
 * para que las estadísticas sigan siendo válidas aunque el Markdown cambie.
 */
export interface AnswerRecord {
  questionId: string
  prompt: string
  tags: string[]
  /** Índices referidos al orden original de las opciones en el Markdown. */
  selectedIndex: number
  correctIndex: number
  correct: boolean
}

export interface Attempt {
  /** Autoincremental, lo asigna IndexedDB. */
  id?: number
  testId: string
  testTitle: string
  testVersion: number
  startedAt: number
  finishedAt: number
  answers: AnswerRecord[]
}
