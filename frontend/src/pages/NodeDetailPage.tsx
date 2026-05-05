import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNodeById } from '../hooks/useNodes'
import { useNodeRelationships } from '../hooks/useRelationships'
import { deleteNode } from '../api/nodes'
import { useToast } from '../components/ui/ToastProvider'
import EditPropertiesForm from '../components/nodes/EditPropertiesForm'
import RelTable from '../components/relationships/RelTable'
import CreateRelForm from '../components/relationships/CreateRelForm'
import Button from '../components/ui/Button'
import Badge, { LABEL_COLORS } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'

export default function NodeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: node, loading, error, refetch } = useNodeById(id!)
  const { data: rels, refetch: refetchRels } = useNodeRelationships(id!)
  const [editOpen, setEditOpen] = useState(false)
  const [relOpen, setRelOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [delLoading, setDelLoading] = useState(false)

  async function handleDelete() {
    setDelLoading(true)
    try {
      await deleteNode(id!)
      toast('Nodo eliminado', 'success')
      navigate('/nodes')
    } catch (err) {
      toast((err as Error).message, 'error')
      setDelLoading(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-red-600">{error}</div>
  if (!node) return null

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {node.labels.map((l) => <Badge key={l} label={l} color={LABEL_COLORS[l] ?? 'gray'} />)}
          </div>
          <p className="font-mono text-xs text-gray-400">{node.id}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>← Volver</Button>
          <Button size="sm" onClick={() => setEditOpen(true)}>✏️ Propiedades</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmDel(true)}>🗑️ Eliminar</Button>
        </div>
      </div>

      {/* Properties */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Propiedades</h3>
          <span className="text-xs text-gray-400">{Object.keys(node.properties).length} props</span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(node.properties).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{key}</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Relationships */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Relaciones</h3>
          <Button size="sm" onClick={() => setRelOpen(true)}>🔗 Agregar</Button>
        </div>
        <div className="p-4">
          <RelTable relationships={rels} nodeId={id!} onRefresh={refetchRels} />
        </div>
      </div>

      {/* Modals */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Propiedades" size="lg">
        <EditPropertiesForm nodeId={id!} currentProperties={node.properties} onSuccess={() => { setEditOpen(false); refetch() }} />
      </Modal>

      <Modal open={relOpen} onClose={() => setRelOpen(false)} title="Crear Relación" size="lg">
        <CreateRelForm defaultFromId={id!} onSuccess={() => { setRelOpen(false); refetchRels() }} />
      </Modal>

      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Eliminar Nodo" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          ¿Eliminar este nodo y todas sus relaciones? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} loading={delLoading}>Sí, eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
