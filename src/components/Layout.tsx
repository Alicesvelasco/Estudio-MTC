import { NavLink, Outlet } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200'
  }`

export function Layout() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-6" />
            Estudio MTC
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navClass}>
              Tests
            </NavLink>
            <NavLink to="/estadisticas" className={navClass}>
              Estadísticas
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
