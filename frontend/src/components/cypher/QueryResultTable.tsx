interface QueryResultTableProps {
  rows: Record<string, unknown>[]
}

export default function QueryResultTable({ rows }: QueryResultTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">Sin resultados</p>
  }
  const cols = Object.keys(rows[0])
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase">
          <tr>
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                  {String(row[c] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
