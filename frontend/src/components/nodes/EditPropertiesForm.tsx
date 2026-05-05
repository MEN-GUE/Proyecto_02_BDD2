import { useState } from 'react'
import { updateNodeProperties, deleteNodeProperties } from '../../api/nodes'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'
import Tabs from '../ui/Tabs'

interface EditPropertiesFormProps {
  nodeId: string
  currentProperties: Record<string, unknown>
  onSuccess: () => void
}

const TABS = [
  { id: 'add', label: 'Agregar / Actualizar' },
  { id: 'delete', label: 'Eliminar propiedades' },
]

export default function EditPropertiesForm({ nodeId, currentProperties, onSuccess }: EditPropertiesFormProps) {
  const { toast } = useToast()
  const [tab, setTab] = useState('add')
  const [jsonText, setJsonText] = useState('{\n  "": ""\n}')
  const [jsonError, setJsonError] = useState('')
  const [keysToDelete, setKeysToDelete] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function validateJson(text: string) {
    try { JSON.parse(text); setJsonError(''); return true }
    catch { setJsonError('JSON inválido'); return false }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!validateJson(jsonText)) return
    setLoading(true)
    try {
      await updateNodeProperties(nodeId, JSON.parse(jsonText))
      toast('Propiedades actualizadas', 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (keysToDelete.length === 0) { toast('Selecciona al menos una propiedad', 'error'); return }
    setLoading(true)
    try {
      await deleteNodeProperties(nodeId, keysToDelete)
      toast('Propiedades eliminadas', 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleKey = (key: string) =>
    setKeysToDelete((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])

  return (
    <div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'add' ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">Ingresa un objeto JSON con las propiedades a agregar o actualizar.</p>
          <textarea
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); validateJson(e.target.value) }}
            rows={8}
            className="w-full font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
          <Button type="submit" loading={loading}>Actualizar propiedades</Button>
        </form>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">Selecciona las propiedades que deseas eliminar.</p>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {Object.keys(currentProperties).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 py-1 rounded">
                <input
                  type="checkbox"
                  checked={keysToDelete.includes(key)}
                  onChange={() => toggleKey(key)}
                  className="rounded border-gray-300 text-green-600"
                />
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{key}</span>
                <span className="text-gray-400 text-xs truncate">{String(currentProperties[key])}</span>
              </label>
            ))}
          </div>
          <Button type="submit" variant="danger" loading={loading}>
            Eliminar {keysToDelete.length > 0 ? `(${keysToDelete.length})` : ''} propiedades
          </Button>
        </form>
      )}
    </div>
  )
}
