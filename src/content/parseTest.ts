import { parse as parseYaml } from 'yaml'
import type { Difficulty, Question, Test } from '../domain/types'

export class TestFormatError extends Error {
  constructor(file: string, message: string, question?: string) {
    const where = question ? `${file} › "${question}"` : file
    super(`${where}: ${message}`)
    this.name = 'TestFormatError'
  }
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/
const FENCE = /^\s*(```|~~~)/
const HEADING = /^##\s+(.+?)\s*$/
const OPTION = /^-\s+\[([ xX])\]\s+(.+?)\s*$/
const QUOTE = /^>\s?(.*)$/
const TAGS = /^Etiquetas:\s*(.*)$/
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DIFFICULTIES: Difficulty[] = ['baja', 'media', 'alta']

/** Convierte el contenido de un `.md` en un `Test` validado. */
export function parseTest(source: string, file: string): Test {
  const text = source.replace(/\r\n?/g, '\n')
  const match = FRONTMATTER.exec(text)
  if (!match) throw new TestFormatError(file, 'falta el frontmatter (bloque --- al inicio)')

  const meta = parseMeta(match[1] ?? '', file)
  const blocks = splitQuestions(text.slice(match[0].length))
  if (blocks.length === 0) throw new TestFormatError(file, 'no contiene ninguna pregunta (## ...)')

  const questions = blocks.map((block) => parseQuestion(block, meta.id, file))
  const seen = new Set<string>()
  for (const q of questions) {
    if (seen.has(q.id)) throw new TestFormatError(file, 'enunciado duplicado', q.prompt)
    seen.add(q.id)
  }

  return { ...meta, questions }
}

function parseMeta(yaml: string, file: string): Omit<Test, 'questions'> {
  let data: unknown
  try {
    data = parseYaml(yaml)
  } catch (e) {
    throw new TestFormatError(file, `frontmatter YAML inválido: ${(e as Error).message}`)
  }
  if (typeof data !== 'object' || data === null) {
    throw new TestFormatError(file, 'el frontmatter debe ser un objeto YAML')
  }
  const m = data as Record<string, unknown>

  const id = m.id
  if (typeof id !== 'string' || !ID.test(id)) {
    throw new TestFormatError(file, '"id" es obligatorio y debe ir en kebab-case (ej. fundamentos-mtc)')
  }
  const title = m.title
  if (typeof title !== 'string' || title.trim() === '') {
    throw new TestFormatError(file, '"title" es obligatorio')
  }
  const difficulty = m.difficulty
  if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty as Difficulty)) {
    throw new TestFormatError(file, `"difficulty" debe ser ${DIFFICULTIES.join(' | ')}`)
  }
  const version = m.version ?? 1
  if (!Number.isInteger(version) || (version as number) < 1) {
    throw new TestFormatError(file, '"version" debe ser un entero ≥ 1')
  }

  return {
    id,
    title: title.trim(),
    description: optionalString(m.description, 'description', file),
    category: optionalString(m.category, 'category', file),
    difficulty: difficulty as Difficulty | undefined,
    version: version as number,
    shuffleQuestions: optionalBoolean(m.shuffleQuestions, 'shuffleQuestions', file),
    shuffleOptions: optionalBoolean(m.shuffleOptions, 'shuffleOptions', file),
  }
}

function optionalString(value: unknown, key: string, file: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') throw new TestFormatError(file, `"${key}" debe ser texto`)
  return value.trim() || undefined
}

function optionalBoolean(value: unknown, key: string, file: string): boolean {
  if (value === undefined || value === null) return false
  if (typeof value !== 'boolean') throw new TestFormatError(file, `"${key}" debe ser true o false`)
  return value
}

interface Line {
  text: string
  /** true si la línea está dentro de un bloque de código (o es su delimitador). */
  code: boolean
}

/** Divide el cuerpo en bloques que empiezan por `## `, respetando los bloques de código. */
function splitQuestions(body: string): Line[][] {
  const blocks: Line[][] = []
  let inFence = false
  for (const text of body.split('\n')) {
    const isFence = FENCE.test(text)
    const code = inFence || isFence
    if (isFence) inFence = !inFence
    if (!code && HEADING.test(text)) blocks.push([])
    // Lo que haya antes del primer `##` se ignora (introducción opcional).
    blocks.at(-1)?.push({ text, code })
  }
  return blocks
}

function parseQuestion(lines: Line[], testId: string, file: string): Question {
  const [heading, ...rest] = lines
  const prompt = HEADING.exec(heading?.text ?? '')?.[1] ?? ''
  const fail = (message: string): never => {
    throw new TestFormatError(file, message, prompt)
  }

  const body: string[] = []
  const options: { text: string; correct: boolean }[] = []
  const explanation: string[] = []
  let tags: string[] | undefined

  for (const { text, code } of rest) {
    const option = code ? null : OPTION.exec(text)
    if (options.length === 0 && !option) {
      body.push(text)
      continue
    }
    if (option) {
      if (explanation.length > 0 || tags) fail('las opciones deben ir antes de la explicación y las etiquetas')
      options.push({ correct: option[1] !== ' ', text: option[2] ?? '' })
      continue
    }
    if (text.trim() === '') continue
    const quote = code ? null : QUOTE.exec(text)
    if (quote) {
      explanation.push(quote[1] ?? '')
      continue
    }
    const tagLine = code ? null : TAGS.exec(text)
    if (tagLine) {
      if (tags) fail('hay más de una línea "Etiquetas:"')
      tags = normalizeTags(tagLine[1] ?? '')
      continue
    }
    fail(`línea inesperada después de las opciones: "${text.trim()}"`)
  }

  if (options.length < 2) fail('necesita al menos 2 opciones (- [ ] / - [x])')
  const correct = options.filter((o) => o.correct).length
  if (correct !== 1) fail(`debe haber exactamente una opción marcada con [x] (hay ${correct})`)
  if (new Set(options.map((o) => o.text.toLowerCase())).size !== options.length) {
    fail('hay opciones repetidas')
  }
  const explanationText = explanation.join('\n').trim()
  if (!explanationText) fail('falta la explicación (líneas que empiezan por >)')
  if (!tags || tags.length === 0) fail('falta la línea "Etiquetas: ..." con al menos una etiqueta')

  const bodyText = body.join('\n').trim()
  return {
    id: `${testId}#${hash(prompt + '\n' + bodyText)}`,
    prompt,
    body: bodyText || undefined,
    options: options.map((o) => o.text),
    correctIndex: options.findIndex((o) => o.correct),
    explanation: explanationText,
    tags: tags as string[],
  }
}

/** Recorta, elimina vacías y quita duplicados sin distinguir mayúsculas. */
function normalizeTags(raw: string): string[] {
  const byKey = new Map<string, string>()
  for (const tag of raw.split(',')) {
    const clean = tag.trim().replace(/\s+/g, ' ')
    if (clean && !byKey.has(clean.toLowerCase())) byKey.set(clean.toLowerCase(), clean)
  }
  return [...byKey.values()]
}

/** FNV-1a de 32 bits en base 36: corto, síncrono y estable. */
function hash(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}
