import { useState } from 'react'
import type { Relationship } from '../../types/relationship'
import { updateRelProperties, deleteRelProperties } from '../../api/relationships'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'

const TABS = [
  { id: 'update', label: 'Agregar / Actualizar' },
  { id: 'delete', label: 'Eliminar' },
]

export default function EditRelPropsForm({ rel, onSuccess }: { rel: Relationship; onSuccess: () => void }) {
  const { toast } = useToast()
  const [tab, setTab] = useState('update')
  const [jsonText, setJsonText] = useState('{\n  "": ""\n}')
  const [jsonError, setJsonError] = useState('')
  const [keysToDelete, setKeysToDelete] = useState<string[]>([])
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
      await updateRelProperties(rel.id, JSON.parse(jsonText))
      toast('Relación actualizada', 'success')
      onSuccess()
    } catch (err) { toast((err as Error).message, 'error') }
    finally { setLoading(false) }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (!keysToDelete.length) { toast('Selecciona propiedades', 'error'); return }
    setLoading(true)
    try {
      await deleteRelProperties(rel.id, keysToDelete)
      toast('Propiedades eliminadas', 'success')
      onSuccess()
    } catch (err) { toast((err as Error).message, 'error') }
    finally { setLoading(false) }
  }

  const toggleKey = (k: string) => setKeysToDelete((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k])

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'update' ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <textarea value={jsonText} onChange={(e) => { setJsonText(e.target.value); validateJson(e.target.value) }}
            rows={6} className="w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button type="submit" loading={loading}>Actualizar</Button>
        </form>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {Object.keys(rel.properties).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded">
                <input type="checkbox" checked={keysToDelete.includes(key)} onChange={() => toggleKey(key)} className="rounded border-gray-300 text-green-600" />
                <span className="font-mono text-xs">{key}</span>
              </label>
            ))}
          </div>
          <Button type="submit" variant="danger" loading={loading}>Eliminar {keysToDelete.length > 0 ? `(${keysToDelete.length})` : ''}</Button>
        </form>
      )}
    </div>
  )
}
