import { useState } from 'react'
import type { ClientCluster } from '../../types/cluster'

const CLUSTER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

export default function ClusterTable({ clients }: { clients: ClientCluster[] }) {
  const [search, setSearch] = useState('')
  const [filterCluster, setFilterCluster] = useState<number | null>(null)
  const clusters = [...new Set(clients.map((c) => c.cluster))].sort()

  const filtered = clients.filter((c) => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.segmento.toLowerCase().includes(search.toLowerCase())
    const matchCluster = filterCluster === null || c.cluster === filterCluster
    return matchSearch && matchCluster
  })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente o segmento…"
          className="h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
        />
        <div className="flex gap-1">
          <button onClick={() => setFilterCluster(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCluster === null ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}>
            Todos
          </button>
          {clusters.map((c) => (
            <button key={c} onClick={() => setFilterCluster(filterCluster === c ? null : c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCluster === c ? 'text-white border-transparent' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
              style={filterCluster === c ? { backgroundColor: CLUSTER_COLORS[c % CLUSTER_COLORS.length] } : {}}>
              Cluster {c}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Segmento</th>
              <th className="px-3 py-2 text-right">Crédito</th>
              <th className="px-3 py-2 text-right">Órdenes</th>
              <th className="px-3 py-2 text-right">Gastado</th>
              <th className="px-3 py-2 text-center">Cluster</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.slice(0, 100).map((c) => (
              <tr key={c.clientId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{c.nombre}</td>
                <td className="px-3 py-2 text-gray-500">{c.segmento}</td>
                <td className="px-3 py-2 text-right">Q{c.creditoAprobado.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{c.totalOrdenes}</td>
                <td className="px-3 py-2 text-right">Q{c.totalGastado.toLocaleString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: CLUSTER_COLORS[c.cluster % CLUSTER_COLORS.length] }}>
                    {c.cluster}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <p className="text-xs text-center text-gray-400 py-2">Mostrando 100 de {filtered.length} resultados</p>
        )}
      </div>
    </div>
  )
}
