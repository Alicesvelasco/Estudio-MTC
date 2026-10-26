import { HashRouter, Route, Routes } from 'react-router-dom'
import { tests } from './content/catalog'

// Provisional: las pantallas reales (catálogo, test y dashboard) llegan en el
// siguiente paso. Esto solo comprueba que los Markdown se cargan bien.
function Catalog() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Estudio MTC</h1>
      <ul className="space-y-3">
        {tests.map((t) => (
          <li key={t.id} className="rounded-lg border border-gray-200 p-4">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-500">{t.questions.length} preguntas</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<Catalog />} />
      </Routes>
    </HashRouter>
  )
}
