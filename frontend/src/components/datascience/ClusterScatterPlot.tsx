import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ProveedorCluster, ClusterMeta } from '../../types/cluster'

const CLUSTER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

interface ClusterScatterPlotProps {
  providers: ProveedorCluster[]
  meta: ClusterMeta[]
}

export default function ClusterScatterPlot({ providers, meta }: ClusterScatterPlotProps) {
  const clusterIds = [...new Set(providers.map((p) => p.cluster_id))].sort()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Clusters K-Means — Calificacion vs Total de Productos
      </h3>
      <p className="text-xs text-gray-400 mb-4">Cada punto es un proveedor coloreado por su segmento</p>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="calificacion_proveedor"
            name="Calificacion"
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: 'Calificacion del Proveedor', position: 'insideBottom', offset: -10, fontSize: 11 }}
          />
          <YAxis
            dataKey="total_productos"
            name="Productos"
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: 'Total Productos', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload as ProveedorCluster
              const m = meta.find((x) => x.cluster_id === p.cluster_id)
              return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-xs shadow-lg">
                  <p className="font-semibold">{p.nombre}</p>
                  <p>Pais: {p.pais}</p>
                  <p>Cluster: {p.cluster_id} — {m?.cluster_label ?? ''}</p>
                  <p>Calificacion: {p.calificacion_proveedor?.toFixed(2)}</p>
                  <p>Productos: {p.total_productos}</p>
                  <p>Ratio contratos: {(p.ratio_contratos * 100).toFixed(1)}%</p>
                </div>
              )
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {clusterIds.map((clusterId) => {
            const m = meta.find((x) => x.cluster_id === clusterId)
            return (
              <Scatter
                key={clusterId}
                name={m?.cluster_label ?? `Cluster ${clusterId}`}
                data={providers.filter((p) => p.cluster_id === clusterId)}
                fill={CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length]}
                opacity={0.75}
              />
            )
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
