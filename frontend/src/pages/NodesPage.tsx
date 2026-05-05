import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNodes } from '../hooks/useNodes'
import type { NodeLabel } from '../types/node'
import NodeFilterBar from '../components/nodes/NodeFilterBar'
import CreateNodeForm from '../components/nodes/CreateNodeForm'
import BulkDeleteBar from '../components/nodes/BulkDeleteBar'
import Button from '../components/ui/Button'
import Badge, { LABEL_COLORS } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

export default function NodesPage() {
  const navigate = useNavigate()
  const [label, setLabel] = useState<NodeLabel | ''>('')
  const [prop, setProp] = useState('')
  const [value, setValue] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState({ label: '' as NodeLabel | '', prop: '', value: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const { data, loading, error, refetch } = useNodes({ ...search, page, pageSize: 20 })
  const nodes = data?.nodes ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 20))

  function handleSearch() {
    setSearch({ label, prop, value })
    setPage(1)
    setSelected([])
  }

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  function toggleAll() {
    if (selected.length === nodes.length) setSelected([])
    else setSelected(nodes.map((n) => n.id))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nodos</h2>
          {total > 0 && <p className="text-xs text-gray-400">{total.toLocaleString()} nodos encontrados</p>}
        </div>
        <Button onClick={() => setCreateOpen(true)}>⬡ Nuevo Nodo</Button>
      </div>

      <NodeFilterBar
        label={label} prop={prop} value={value}
        onLabel={setLabel} onProp={setProp} onValue={setValue}
        onSearch={handleSearch}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : nodes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-4xl mb-3">⬡</p>
          <p className="text-sm">No se encontraron nodos</p>
          <p className="text-xs mt-1">Cambia los filtros o crea un nuevo nodo</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={selected.length === nodes.length && nodes.length > 0}
                    onChange={toggleAll} className="rounded border-gray-300 text-green-600" />
                </th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Etiquetas</th>
                <th className="px-4 py-3 text-left">Propiedades</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(node.id)}
                      onChange={() => toggleSelect(node.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-green-600" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500" onClick={() => navigate(`/nodes/${node.id}`)}>
                    {node.id.slice(0, 12)}…
                  </td>
                  <td className="px-4 py-3" onClick={() => navigate(`/nodes/${node.id}`)}>
                    <div className="flex flex-wrap gap-1">
                      {node.labels.map((l) => (
                        <Badge key={l} label={l} color={LABEL_COLORS[l] ?? 'gray'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs" onClick={() => navigate(`/nodes/${node.id}`)}>
                    <span className="truncate block">
                      {Object.entries(node.properties).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/nodes/${node.id}`)}>Ver →</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 px-3">Página {page} de {totalPages}</span>
          <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear Nuevo Nodo" size="lg">
        <CreateNodeForm onSuccess={() => { setCreateOpen(false); refetch() }} />
      </Modal>

      <BulkDeleteBar selectedIds={selected} onClear={() => setSelected([])} onDeleted={refetch} />
    </div>
  )
}
