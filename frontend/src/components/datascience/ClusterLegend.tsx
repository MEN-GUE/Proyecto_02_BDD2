import type { ClusterMeta } from '../../types/cluster'

const CLUSTER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6']

export default function ClusterLegend({ meta }: { meta: ClusterMeta[] }) {
  return (
    <div className="flex flex-wrap gap-3 py-3">
      {meta.map((m) => (
        <div
          key={m.cluster_id}
          className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
        >
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: CLUSTER_COLORS[m.cluster_id % CLUSTER_COLORS.length] }}
          />
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{m.cluster_label}</p>
            <p className="text-xs text-gray-400">
              {m.count} proveedores · {m.avg_calificacion.toFixed(1)} calif. prom.
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
