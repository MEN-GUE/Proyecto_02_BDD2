import { useState } from 'react'
import { bulkUpdateNodeProperties, bulkDeleteNodeProperties } from '../../api/nodes'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'

interface BulkEditPropsFormProps {
  ids: string[]
  onSuccess: () => void
}

const TABS = [
  { id: 'update', label: 'Agregar / Actualizar' },
  { id: 'delete', label: 'Eliminar propiedades' },
]

export default function BulkEditPropsForm({ ids, onSuccess }: BulkEditPropsFormProps) {
  const { toast } = useToast()
  const [tab, setTab] = useState('update')
  const [propsJson, setPropsJson] = useState('{\n  "": ""\n}')
  const [keysText, setKeysText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateJson(text: string) {
    try { JSON.parse(text); setJsonError(''); return true }
    catch { setJsonError('JSON inválido'); return false }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateJson(propsJson)) return
    setLoading(true)
    try {
      const result = await bulkUpdateNodeProperties(ids, JSON.parse(propsJson))
      toast(`${result.updated} nodos actualizados`, 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    const keys = keysText.split(',').map((k) => k.trim()).filter(Boolean)
    if (keys.length === 0) { toast('Ingresa al menos una clave', 'error'); return }
    setLoading(true)
    try {
      const result = await bulkDeleteNodeProperties(ids, keys)
      toast(`Propiedades eliminadas en ${result.updated} nodos`, 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        Operación en lote sobre <strong>{ids.length} nodos</strong>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'update' ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <textarea
            value={propsJson}
            onChange={(e) => { setPropsJson(e.target.value); validateJson(e.target.value) }}
            rows={6}
            className="w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button type="submit" loading={loading}>Actualizar {ids.length} nodos</Button>
        </form>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">Claves separadas por coma (ej: precio, estado)</p>
          <input
            value={keysText}
            onChange={(e) => setKeysText(e.target.value)}
            placeholder="clave1, clave2, clave3"
            className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button type="submit" variant="danger" loading={loading}>Eliminar propiedades en {ids.length} nodos</Button>
        </form>
      )}
    </div>
  )
}
