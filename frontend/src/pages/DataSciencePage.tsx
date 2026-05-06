import { useMemo, useState } from 'react'
import { useClusters } from '../hooks/useClusters'
import ClusterScatterPlot from '../components/datascience/ClusterScatterPlot'
import ClusterLegend from '../components/datascience/ClusterLegend'
import ClusterTable from '../components/datascience/ClusterTable'
import Tabs from '../components/ui/Tabs'
import Spinner from '../components/ui/Spinner'
import type { ClusterMeta } from '../types/cluster'

const TABS = [
  { id: 'scatter', label: 'Grafico de Dispersion' },
  { id: 'table', label: 'Tabla de Proveedores' },
]

export default function DataSciencePage() {
  const { data, loading, error } = useClusters()
  const [tab, setTab] = useState('scatter')

  const meta: ClusterMeta[] = useMemo(() => {
    if (!data?.clusters?.length) return []
    const map = new Map<number, typeof data.clusters>()
    for (const p of data.clusters) {
      const arr = map.get(p.cluster_id) ?? []
      arr.push(p)
      map.set(p.cluster_id, arr)
    }
    return [...map.entries()].map(([cluster_id, items]) => ({
      cluster_id,
      cluster_label: items[0].cluster_label,
      count: items.length,
      avg_calificacion: items.reduce((s, i) => s + i.calificacion_proveedor, 0) / items.length,
      avg_productos: items.reduce((s, i) => s + i.total_productos, 0) / items.length,
    })).sort((a, b) => a.cluster_id - b.cluster_id)
  }, [data])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Science — Clustering de Proveedores</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Segmentacion K-Means sobre proveedores de la cadena de suministro
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <p className="text-sm text-red-700 dark:text-red-300">
            No se pudieron cargar los datos de clustering: {error}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Asegurate de que el endpoint <code className="font-mono">/api/ds/clusters</code> este disponible.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data ? (
        <>
          <ClusterLegend meta={meta} />
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'scatter' ? (
            <ClusterScatterPlot providers={data.clusters} meta={meta} />
          ) : (
            <ClusterTable providers={data.clusters} />
          )}
        </>
      ) : !error ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-sm">Sin datos de clustering disponibles</p>
        </div>
      ) : null}
    </div>
  )
}
