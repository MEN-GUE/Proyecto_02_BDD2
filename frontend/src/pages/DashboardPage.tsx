import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getNodeCounts } from '../api/aggregations'
import type { AggregationItem } from '../api/aggregations'
import StatCard from '../components/aggregations/StatCard'
import Spinner from '../components/ui/Spinner'
import { LABEL_COLORS } from '../components/ui/Badge'

const LABEL_ICONS: Record<string, string> = {
  Proveedor: '🏭',
  Categoria: '🏷️',
  Producto: '📦',
  Almacen: '🏢',
  Cliente: '👤',
  Transporte: '🚚',
  Orden: '📋',
}

const quickActions = [
  { label: 'Nuevo Nodo', icon: '⬡', description: 'Crear nodo con propiedades', to: '/nodes', hash: 'create' },
  { label: 'Subir CSV', icon: '📂', description: 'Cargar datos masivos', to: '/csv' },
  { label: 'Ver Clusters', icon: '🤖', description: 'Análisis de segmentación', to: '/datascience' },
  { label: 'Consultas', icon: '🔍', description: 'Ejecutar Cypher', to: '/cypher' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [counts, setCounts] = useState<AggregationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getNodeCounts()
      .then(setCounts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [location.key])

  const total = counts.reduce((s, c) => s + c.value, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supply Chain Neo4j</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Panel de control — gestiona nodos, relaciones y visualiza datos</p>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium opacity-80">Total de Nodos en la BD</p>
        {loading ? (
          <Spinner className="h-8 w-8 mt-2 text-white" />
        ) : (
          <p className="text-5xl font-bold mt-1">{total.toLocaleString()}</p>
        )}
        <p className="text-xs opacity-60 mt-1">Neo4j AuraDB</p>
      </div>

      {/* Counts by label */}
      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {counts.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value.toLocaleString()}
              icon={LABEL_ICONS[item.label] ?? '⬡'}
              color={LABEL_COLORS[item.label] ?? 'gray'}
            />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-left hover:border-green-500 dark:hover:border-green-500 hover:shadow-sm transition-all group"
            >
              <span className="text-2xl block mb-2">{a.icon}</span>
              <p className="text-sm font-semibold text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">{a.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
