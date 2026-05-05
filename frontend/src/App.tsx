import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import NodesPage from './pages/NodesPage'
import NodeDetailPage from './pages/NodeDetailPage'
import RelationshipsPage from './pages/RelationshipsPage'
import AggregationsPage from './pages/AggregationsPage'
import CypherPage from './pages/CypherPage'
import CsvUploadPage from './pages/CsvUploadPage'
import DataSciencePage from './pages/DataSciencePage'
import { ToastProvider } from './components/ui/ToastProvider'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="nodes" element={<NodesPage />} />
          <Route path="nodes/:id" element={<NodeDetailPage />} />
          <Route path="relationships" element={<RelationshipsPage />} />
          <Route path="aggregations" element={<AggregationsPage />} />
          <Route path="cypher" element={<CypherPage />} />
          <Route path="csv" element={<CsvUploadPage />} />
          <Route path="datascience" element={<DataSciencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
