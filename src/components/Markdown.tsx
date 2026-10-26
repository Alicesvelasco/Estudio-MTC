import { marked } from 'marked'
import { useMemo } from 'react'

interface Props {
  children: string
  /** Solo formato en línea (negrita, cursiva, código), sin párrafos. */
  inline?: boolean
  className?: string
}

// El Markdown procede de los ficheros del propio repositorio (contenido de
// confianza), por eso se inyecta el HTML sin sanitizar.
export function Markdown({ children, inline = false, className = '' }: Props) {
  const html = useMemo(
    () => (inline ? marked.parseInline(children, { async: false }) : marked.parse(children, { async: false })),
    [children, inline],
  )
  const Tag = inline ? 'span' : 'div'
  return (
    <Tag
      className={inline ? className : `prose prose-stone max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
