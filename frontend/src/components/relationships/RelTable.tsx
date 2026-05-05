import { useState } from 'react'
import type { Relationship } from '../../types/relationship'
import { deleteRelationship } from '../../api/relationships'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import EditRelPropsForm from './EditRelPropsForm'

interface RelTableProps {
  relationships: Relationship[]
  nodeId: string
  selectedIds?: string[]
  onSelect?: (id: string) => void
  onRefresh: () => void
}

export default function RelTable({ relationships, nodeId, selectedIds = [], onSelect, onRefresh }: RelTableProps) {
  const { toast } = useToast()
  const [editRel, setEditRel] = useState<Relationship | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirmDel) return
    setLoading(true)
    try {
      await deleteRelationship(confirmDel)
      toast('Relación eliminada', 'success')
      setConfirmDel(null)
      onRefresh()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (relationships.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-600">
        <p className="text-sm">Sin relaciones</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
            <tr>
              {onSelect && <th className="px-3 py-2 w-8"></th>}
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Dirección</th>
              <th className="px-3 py-2 text-left">Propiedades</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {relationships.map((rel) => (
              <tr key={rel.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {onSelect && (
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selectedIds.includes(rel.id)}
                      onChange={() => onSelect(rel.id)}
                      className="rounded border-gray-300 text-green-600" />
                  </td>
                )}
                <td className="px-3 py-2">
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{rel.type}</span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {rel.startNodeId === nodeId ? (
                    <span className="text-green-600">→ {rel.endNodeId.slice(0, 8)}…</span>
                  ) : (
                    <span className="text-blue-600">← {rel.startNodeId.slice(0, 8)}…</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">
                  {Object.entries(rel.properties).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditRel(rel)}>✏️</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDel(rel.id)}>🗑️</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editRel && (
        <Modal open={!!editRel} onClose={() => setEditRel(null)} title={`Editar relación ${editRel.type}`}>
          <EditRelPropsForm
            rel={editRel}
            onSuccess={() => { setEditRel(null); onRefresh() }}
          />
        </Modal>
      )}

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Eliminar relación" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">¿Eliminar esta relación? La acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>Sí, eliminar</Button>
        </div>
      </Modal>
    </>
  )
}
