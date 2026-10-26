import { describe, expect, it } from 'vitest'
import { parseTest, TestFormatError } from '../src/content/parseTest'

const front = `---
id: demo
title: Demo
---
`

const question = `## ¿Qué elemento genera al Fuego?

- [x] Madera
- [ ] Agua

> La Madera alimenta al Fuego.
> Segunda línea.

Etiquetas: Cinco Elementos, cinco elementos ,  Ciclo de generación
`

const parse = (body: string, meta = front) => parseTest(meta + body, 'demo.md')

describe('parseTest', () => {
  it('parsea metadatos y aplica valores por defecto', () => {
    const t = parse(question)
    expect(t).toMatchObject({
      id: 'demo',
      title: 'Demo',
      version: 1,
      shuffleQuestions: false,
      shuffleOptions: false,
    })
  })

  it('parsea una pregunta completa', () => {
    const [q] = parse(question).questions
    expect(q).toMatchObject({
      prompt: '¿Qué elemento genera al Fuego?',
      options: ['Madera', 'Agua'],
      correctIndex: 0,
      explanation: 'La Madera alimenta al Fuego.\nSegunda línea.',
      tags: ['Cinco Elementos', 'Ciclo de generación'],
    })
    expect(q?.id).toMatch(/^demo#[0-9a-z]+$/)
  })

  it('genera ids estables e independientes del orden', () => {
    const other = question.replace('Fuego?', 'Agua?')
    const a = parse(question + other).questions
    const b = parse(other + question).questions
    expect(a[0]?.id).toBe(b[1]?.id)
    expect(a[1]?.id).toBe(b[0]?.id)
  })

  it('incluye el texto entre el título y las opciones como cuerpo', () => {
    const [q] = parse(question.replace('\n\n- [x]', '\n\nPaciente con lengua pálida.\n\n- [x]')).questions
    expect(q?.body).toBe('Paciente con lengua pálida.')
  })

  it('ignora opciones y encabezados dentro de bloques de código', () => {
    const body = question.replace('\n\n- [x]', '\n\n```\n## no es pregunta\n- [x] no es opción\n```\n\n- [x]')
    const t = parse(body)
    expect(t.questions).toHaveLength(1)
    expect(t.questions[0]?.options).toEqual(['Madera', 'Agua'])
  })

  it('acepta finales de línea de Windows', () => {
    expect(parse(question.replace(/\n/g, '\r\n'), front.replace(/\n/g, '\r\n')).questions).toHaveLength(1)
  })

  it.each([
    ['sin frontmatter', () => parseTest(question, 'x.md'), /frontmatter/],
    ['id inválido', () => parse(question, front.replace('demo', 'Demo Test')), /kebab-case/],
    ['sin title', () => parse(question, front.replace('title: Demo\n', '')), /title/],
    ['difficulty inválida', () => parse(question, front.replace('---\n', '---\ndifficulty: x\n')), /difficulty/],
    ['sin preguntas', () => parse('Solo texto'), /ninguna pregunta/],
    ['sin respuesta correcta', () => parse(question.replace('[x]', '[ ]')), /exactamente una/],
    ['dos correctas', () => parse(question.replace('[ ]', '[x]')), /exactamente una/],
    ['una sola opción', () => parse(question.replace('- [ ] Agua\n', '')), /al menos 2/],
    ['opciones repetidas', () => parse(question.replace('Agua', 'madera')), /repetidas/],
    ['sin explicación', () => parse(question.replace(/> .*\n/g, '')), /explicación/],
    ['sin etiquetas', () => parse(question.replace(/Etiquetas:.*\n/, '')), /Etiquetas/],
    ['etiquetas vacías', () => parse(question.replace(/Etiquetas:.*\n/, 'Etiquetas: , \n')), /Etiquetas/],
    ['texto suelto tras las opciones', () => parse(question + 'texto suelto\n'), /línea inesperada/],
    ['enunciado duplicado', () => parse(question + question), /duplicado/],
  ])('rechaza: %s', (_, run, message) => {
    expect(run).toThrow(TestFormatError)
    expect(run).toThrow(message)
  })

  it('indica fichero y pregunta en el error', () => {
    expect(() => parse(question.replace('[x]', '[ ]'))).toThrow(
      'demo.md › "¿Qué elemento genera al Fuego?"',
    )
  })
})
