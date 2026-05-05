import { useState } from 'react'
import { useRelationships } from '../hooks/useRelationships'
import { bulkDeleteRelationships } from '../api/relationships'
import { useToast } from '../components/ui/ToastProvider'
import RelTable from '../components/relationships/RelTable'
import CreateRelForm from '../components/relationships/CreateRelForm'
import BulkEditRelForm from '../components/relationships/BulkEditRelForm'
import { ALL_REL_TYPES } from '../types/relationship'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

export default function RelationshipsPage() {
  const { toast } = useToast()
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [delLoading, setDelLoading] = useState(false)

  const { data, loading, error, refetch } = useRelationships({ type: typeFilter || undefined, page, pageSize: 25 })
  const rels = data?.relationships ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 25))

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleBulkDelete() {
    setDelLoading(true)
    try {
      const r = await bulkDeleteRelationships(selected)
      toast(`${r.deleted} relaciones eliminadas`, 'success')
      setSelected([])
      setConfirmDel(false)
      refetch()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setDelLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Relaciones</h2>
          {total > 0 && <p className="text-xs text-gray-400">{total.toLocaleString()} relaciones</p>}
        </div>
        <Button onClick={() => setCreateOpen(true)}>🔗 Nueva Relación</Button>
      </div>

      <div className="flex items-center gap-3">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">Todos los tipos</option>
          {ALL_REL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {selected.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setBulkEditOpen(true)}>
              Editar {selected.length} seleccionados
            </Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmDel(true)}>
              Eliminar {selected.length}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <RelTable
          relationships={rels}
          nodeId=""
          selectedIds={selected}
          onSelect={toggleSelect}
          onRefresh={refetch}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Anterior</Button>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 px-3">Página {page} de {totalPages}</span>
          <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente →</Button>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Crear Relación" size="lg">
        <CreateRelForm onSuccess={() => { setCreateOpen(false); refetch() }} />
      </Modal>

      <Modal open={bulkEditOpen} onClose={() => setBulkEditOpen(false)} title={`Editar ${selected.length} relaciones`} size="md">
        <BulkEditRelForm ids={selected} onSuccess={() => { setBulkEditOpen(false); setSelected([]); refetch() }} />
      </Modal>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Eliminar relaciones" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          ¿Eliminar <strong>{selected.length} relaciones</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleBulkDelete} loading={delLoading}>Sí, eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
