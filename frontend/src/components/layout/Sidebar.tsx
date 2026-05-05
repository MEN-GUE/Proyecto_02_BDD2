import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { to: '/nodes', label: 'Nodos', icon: '⬡' },
  { to: '/relationships', label: 'Relaciones', icon: '🔗' },
  { to: '/aggregations', label: 'Agregaciones', icon: '📊' },
  { to: '/cypher', label: 'Consultas Cypher', icon: '🔍' },
  { to: '/csv', label: 'Carga CSV', icon: '📂' },
  { to: '/datascience', label: 'Data Science', icon: '🤖' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Supply Chain</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Neo4j Manager</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {nav.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">BDD2 · UVG 2026</p>
      </div>
    </aside>
  )
}
