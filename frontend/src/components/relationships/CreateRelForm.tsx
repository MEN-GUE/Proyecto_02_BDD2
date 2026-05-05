import { useState } from 'react'
import { ALL_REL_TYPES } from '../../types/relationship'
import { createRelationship } from '../../api/relationships'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'

interface PropRow { key: string; value: string }
const emptyRow = (): PropRow => ({ key: '', value: '' })

interface CreateRelFormProps {
  defaultFromId?: string
  onSuccess: () => void
}

export default function CreateRelForm({ defaultFromId = '', onSuccess }: CreateRelFormProps) {
  const { toast } = useToast()
  const [fromId, setFromId] = useState(defaultFromId)
  const [toId, setToId] = useState('')
  const [relType, setRelType] = useState(ALL_REL_TYPES[0])
  const [customType, setCustomType] = useState('')
  const [rows, setRows] = useState<PropRow[]>([emptyRow(), emptyRow(), emptyRow()])
  const [loading, setLoading] = useState(false)

  function updateRow(i: number, field: keyof PropRow, val: string) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromId.trim() || !toId.trim()) { toast('Ingresa los IDs de origen y destino', 'error'); return }
    const type = customType.trim() || relType
    const props: Record<string, unknown> = {}
    for (const row of rows) {
      if (row.key.trim()) props[row.key.trim()] = row.value
    }
    const required = rows.slice(0, 3)
    if (required.some((r) => !r.key.trim())) {
      toast('Las 3 primeras propiedades son obligatorias', 'error')
      return
    }

    setLoading(true)
    try {
      await createRelationship(fromId.trim(), toId.trim(), type, props)
      toast(`Relación ${type} creada exitosamente`, 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">ID Nodo Origen</label>
          <input
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            placeholder="ID del nodo origen"
            required
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">ID Nodo Destino</label>
          <input
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            placeholder="ID del nodo destino"
            required
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Relación</label>
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value as typeof relType)}
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {ALL_REL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo personalizado (opcional)</label>
          <input
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="TIPO_CUSTOM"
            className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Propiedades</label>
          <span className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
            primeras 3 son obligatorias
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className={`text-xs w-4 shrink-0 font-bold ${i < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>{i + 1}</span>
              <input
                value={row.key}
                onChange={(e) => updateRow(i, 'key', e.target.value)}
                placeholder="clave"
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                value={row.value}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                placeholder="valor"
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {i >= 3 && (
                <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 px-1">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="mt-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium">
          + Agregar propiedad
        </button>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>🔗 Crear relación</Button>
      </div>
    </form>
  )
}
