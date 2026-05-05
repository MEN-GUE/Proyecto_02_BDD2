import { useState } from 'react'
import { bulkUpdateRelProperties, bulkDeleteRelProperties } from '../../api/relationships'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'

const TABS = [
  { id: 'update', label: 'Actualizar' },
  { id: 'delete', label: 'Eliminar propiedades' },
]

export default function BulkEditRelForm({ ids, onSuccess }: { ids: string[]; onSuccess: () => void }) {
  const { toast } = useToast()
  const [tab, setTab] = useState('update')
  const [jsonText, setJsonText] = useState('{\n  "": ""\n}')
  const [keysText, setKeysText] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateJson(t: string) {
    try { JSON.parse(t); setJsonError(''); return true }
    catch { setJsonError('JSON inválido'); return false }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateJson(jsonText)) return
    setLoading(true)
    try {
      const r = await bulkUpdateRelProperties(ids, JSON.parse(jsonText))
      toast(`${r.updated} relaciones actualizadas`, 'success')
      onSuccess()
    } catch (err) { toast((err as Error).message, 'error') }
    finally { setLoading(false) }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    const keys = keysText.split(',').map((k) => k.trim()).filter(Boolean)
    if (!keys.length) { toast('Ingresa claves', 'error'); return }
    setLoading(true)
    try {
      const r = await bulkDeleteRelProperties(ids, keys)
      toast(`Propiedades eliminadas en ${r.updated} relaciones`, 'success')
      onSuccess()
    } catch (err) { toast((err as Error).message, 'error') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        Operación en lote sobre <strong>{ids.length} relaciones</strong>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'update' ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <textarea value={jsonText} onChange={(e) => { setJsonText(e.target.value); validateJson(e.target.value) }}
            rows={5} className="w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button type="submit" loading={loading}>Actualizar {ids.length} relaciones</Button>
        </form>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <input value={keysText} onChange={(e) => setKeysText(e.target.value)} placeholder="clave1, clave2"
            className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <Button type="submit" variant="danger" loading={loading}>Eliminar propiedades en {ids.length} relaciones</Button>
        </form>
      )}
    </div>
  )
}
