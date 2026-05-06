import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ClientCluster, ClusterMeta } from '../../types/cluster'

const CLUSTER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

interface ClusterScatterPlotProps {
  clients: ClientCluster[]
  meta: ClusterMeta[]
}

export default function ClusterScatterPlot({ clients, meta }: ClusterScatterPlotProps) {
  const clusterIds = [...new Set(clients.map((c) => c.cluster))].sort()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Clusters K-Means — Credito vs Ordenes Totales
      </h3>
      <p className="text-xs text-gray-400 mb-4">Cada punto es un cliente coloreado por su segmento de cluster</p>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="creditoAprobado"
            name="Credito Aprobado"
            type="number"
            unit=" Q"
            tick={{ fontSize: 11 }}
            label={{ value: 'Credito Aprobado (Q)', position: 'insideBottom', offset: -10, fontSize: 11 }}
          />
          <YAxis
            dataKey="totalOrdenes"
            name="Ordenes"
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: 'Total Ordenes', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (!payload?.length) return null
              const c = payload[0].payload as ClientCluster
              const m = meta.find((x) => x.cluster === c.cluster)
              return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs shadow-lg">
                  <p className="font-semibold">{c.nombre}</p>
                  <p>Segmento: {c.segmento}</p>
                  <p>Cluster: {c.cluster} — {m?.label ?? ''}</p>
                  <p>Credito: Q{c.creditoAprobado.toLocaleString()}</p>
                  <p>Ordenes: {c.totalOrdenes}</p>
                  <p>Total gastado: Q{c.totalGastado.toLocaleString()}</p>
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {clusterIds.map((clusterNum) => {
            const m = meta.find((x) => x.cluster === clusterNum)
            return (
              <Scatter
                key={clusterNum}
                name={m?.label ?? `Cluster ${clusterNum}`}
                data={clients.filter((c) => c.cluster === clusterNum)}
                fill={CLUSTER_COLORS[clusterNum % CLUSTER_COLORS.length]}
                opacity={0.75}
              />
            )
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
