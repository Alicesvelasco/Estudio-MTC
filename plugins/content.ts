import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { Plugin } from 'vite'
import { parseTest } from '../src/content/parseTest.ts'
import type { Test } from '../src/domain/types.ts'

const VIRTUAL_ID = 'virtual:tests'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Expone `virtual:tests` con todos los `.md` de `dir` ya parseados y
 * validados. El parseo ocurre en Node durante el build, así que:
 * - un Markdown inválido rompe el build (o muestra el error en `npm run dev`);
 * - el navegador recibe JSON y no necesita la librería YAML ni el parser.
 */
export function contentPlugin(dir: string): Plugin {
  return {
    name: 'estudio-mtc:content',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const tests = loadTests(dir)
      for (const file of tests.files) this.addWatchFile(file)
      return `export default ${JSON.stringify(tests.parsed)}`
    },
    configureServer(server) {
      // Añadir, editar o borrar un .md recarga la página con el contenido nuevo.
      server.watcher.add(dir)
      const reload = (file: string) => {
        if (!file.startsWith(dir) || !file.endsWith('.md')) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload).on('change', reload).on('unlink', reload)
    },
  }
}

export function loadTests(dir: string): { files: string[]; parsed: Test[] } {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(dir, f))
  const parsed = files.map((file) => parseTest(readFileSync(file, 'utf8'), relative(process.cwd(), file)))

  const seen = new Map<string, string>()
  for (const [i, test] of parsed.entries()) {
    const other = seen.get(test.id)
    if (other) throw new Error(`El id "${test.id}" está repetido en ${other} y ${files[i]}`)
    seen.set(test.id, files[i] ?? '')
  }
  return { files, parsed }
}
