import { useState } from 'react'
import { useClusters } from '../hooks/useClusters'
import ClusterScatterPlot from '../components/datascience/ClusterScatterPlot'
import ClusterLegend from '../components/datascience/ClusterLegend'
import ClusterTable from '../components/datascience/ClusterTable'
import Tabs from '../components/ui/Tabs'
import Spinner from '../components/ui/Spinner'

const TABS = [
  { id: 'scatter', label: 'Gráfico de Dispersión' },
  { id: 'table', label: 'Tabla de Clientes' },
]

export default function DataSciencePage() {
  const { data, loading, error } = useClusters()
  const [tab, setTab] = useState('scatter')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Science — Clustering de Clientes</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Segmentación K-Means sobre clientes de la cadena de suministro
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <p className="text-sm text-red-700 dark:text-red-300">
            ⚠️ No se pudieron cargar los datos de clustering: {error}
          </p>
          <p className="text-xs text-gray-500 mt-1">Asegúrate de que el endpoint <code className="font-mono">/api/ds/clusters</code> esté disponible.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data ? (
        <>
          <ClusterLegend meta={data.meta} />
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'scatter' ? (
            <ClusterScatterPlot clients={data.clients} meta={data.meta} />
          ) : (
            <ClusterTable clients={data.clients} />
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
