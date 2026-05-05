import { PREDEFINED_QUERIES } from '../data/queries'
import QueryCard from '../components/cypher/QueryCard'

export default function CypherPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Consultas Cypher</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {PREDEFINED_QUERIES.length} consultas predefinidas sobre el grafo de cadena de suministro
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {PREDEFINED_QUERIES.map((q) => (
          <QueryCard key={q.id} query={q} />
        ))}
      </div>
    </div>
  )
}
