import { useState, useEffect } from 'react'
import { getAggregation, getNodeCounts } from '../api/aggregations'
import type { AggregationItem } from '../api/aggregations'
import BarChartWidget from '../components/aggregations/BarChartWidget'
import PieChartWidget from '../components/aggregations/PieChartWidget'
import StatCard from '../components/aggregations/StatCard'
import Spinner from '../components/ui/Spinner'
import { LABEL_COLORS } from '../components/ui/Badge'

const LABEL_ICONS: Record<string, string> = {
  Proveedor: '🏭', Categoria: '🏷️', Producto: '📦',
  Almacen: '🏢', Cliente: '👤', Transporte: '🚚', Orden: '📋',
}

export default function AggregationsPage() {
  const [nodeCounts, setNodeCounts] = useState<AggregationItem[]>([])
  const [orderStatus, setOrderStatus] = useState<AggregationItem[]>([])
  const [topClients, setTopClients] = useState<AggregationItem[]>([])
  const [productsByCategory, setProductsByCategory] = useState<AggregationItem[]>([])
  const [topProducts, setTopProducts] = useState<AggregationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getNodeCounts(),
      getAggregation('orders-by-status'),
      getAggregation('top-clients'),
      getAggregation('products-by-category'),
      getAggregation('top-products'),
    ]).then(([counts, status, clients, byCategory, products]) => {
      if (counts.status === 'fulfilled') setNodeCounts(counts.value)
      if (status.status === 'fulfilled') setOrderStatus(status.value)
      if (clients.status === 'fulfilled') setTopClients(clients.value)
      if (byCategory.status === 'fulfilled') setProductsByCategory(byCategory.value)
      if (products.status === 'fulfilled') setTopProducts(products.value)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agregaciones y Estadísticas</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen visual de los datos en la base de datos</p>
      </div>

      {/* Node counts by label */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nodos por Etiqueta</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {nodeCounts.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value.toLocaleString()}
              icon={LABEL_ICONS[item.label] ?? '⬡'} color={LABEL_COLORS[item.label] ?? 'gray'} />
          ))}
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orderStatus.length > 0 && (
          <BarChartWidget data={orderStatus} title="Órdenes por Estado" color="#f59e0b" />
        )}
        {topClients.length > 0 && (
          <BarChartWidget data={topClients} title="Top 10 Clientes por Total de Compras" color="#6366f1" />
        )}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productsByCategory.length > 0 && (
          <PieChartWidget data={productsByCategory} title="Productos por Categoría" />
        )}
        {topProducts.length > 0 && (
          <BarChartWidget data={topProducts} title="Top 10 Productos más Ordenados" color="#22c55e" />
        )}
      </div>
    </div>
  )
}
