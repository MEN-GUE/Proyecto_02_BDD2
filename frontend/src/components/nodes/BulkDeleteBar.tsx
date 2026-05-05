import { useState } from 'react'
import { bulkDeleteNodes } from '../../api/nodes'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import BulkEditPropsForm from './BulkEditPropsForm'

interface BulkDeleteBarProps {
  selectedIds: string[]
  onClear: () => void
  onDeleted: () => void
}

export default function BulkDeleteBar({ selectedIds, onClear, onDeleted }: BulkDeleteBarProps) {
  const { toast } = useToast()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await bulkDeleteNodes(selectedIds)
      toast(`${result.deleted} nodos eliminados`, 'success')
      setConfirmDelete(false)
      onClear()
      onDeleted()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-2xl">
        <span className="text-sm font-medium">{selectedIds.length} nodo{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}</span>
        <div className="w-px h-5 bg-white/20 dark:bg-gray-900/20" />
        <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>Editar propiedades</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>Eliminar seleccionados</Button>
        <button onClick={onClear} className="text-white/60 dark:text-gray-900/60 hover:text-white dark:hover:text-gray-900 ml-1">✕</button>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Confirmar eliminación" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          ¿Eliminar <strong>{selectedIds.length} nodos</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>Sí, eliminar</Button>
        </div>
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Editar ${selectedIds.length} nodos`} size="md">
        <BulkEditPropsForm ids={selectedIds} onSuccess={() => { setEditOpen(false); onDeleted() }} />
      </Modal>
    </>
  )
}
