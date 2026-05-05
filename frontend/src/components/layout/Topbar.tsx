import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/nodes': 'Gestión de Nodos',
  '/relationships': 'Gestión de Relaciones',
  '/aggregations': 'Agregaciones y Estadísticas',
  '/cypher': 'Consultas Cypher',
  '/csv': 'Carga de Datos CSV',
  '/datascience': 'Data Science — Clustering',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = Object.entries(titles).find(([p]) => pathname === p || (p !== '/' && pathname.startsWith(p)))?.[1] ?? 'Supply Chain'

  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">{title}</h1>
      <button
        onClick={() => setDark((d) => !d)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Toggle dark mode"
      >
        {dark ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
