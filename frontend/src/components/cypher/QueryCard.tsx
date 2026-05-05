import { useState } from 'react'
import type { PredefinedQuery } from '../../data/queries'
import { runCypherQuery } from '../../api/aggregations'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import QueryResultTable from './QueryResultTable'

export default function QueryCard({ query }: { query: PredefinedQuery }) {
  const { toast } = useToast()
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleRun() {
    setLoading(true)
    try {
      const data = await runCypherQuery(query.cypher)
      setResults(data)
      setExpanded(true)
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{query.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{query.description}</p>
        </div>
        <Button size="sm" onClick={handleRun} loading={loading}>▶ Ejecutar</Button>
      </div>
      <details open={expanded} onToggle={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 mb-2 select-none">
          Ver Cypher
        </summary>
        <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto text-gray-700 dark:text-gray-300 mb-2">{query.cypher}</pre>
      </details>
      {results !== null && <QueryResultTable rows={results} />}
    </div>
  )
}
