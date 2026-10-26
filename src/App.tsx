import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFound } from './components/NotFound'
import { CatalogPage } from './features/catalog/CatalogPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { PracticeRoute, TestRoute } from './features/quiz/QuizPage'

// HashRouter (/#/ruta) porque GitHub Pages no sabe redirigir rutas de una SPA
// a index.html: con BrowserRouter, recargar /estadisticas daría un 404.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="test/:testId" element={<TestRoute />} />
          <Route path="repaso/:tag" element={<PracticeRoute />} />
          <Route path="estadisticas" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
