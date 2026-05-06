import { useState } from 'react'
import { ALL_LABELS, type NodeLabel } from '../../types/node'
import { createNode } from '../../api/nodes'
import { useToast } from '../ui/ToastProvider'
import Button from '../ui/Button'

type PropType = 'string' | 'number' | 'boolean' | 'date' | 'list'

interface PropRow {
  key: string
  value: string
  type: PropType
}

const emptyRow = (): PropRow => ({ key: '', value: '', type: 'string' })

interface CreateNodeFormProps {
  onSuccess: () => void
}

export default function CreateNodeForm({ onSuccess }: CreateNodeFormProps) {
  const { toast } = useToast()
  const [selectedLabels, setSelectedLabels] = useState<NodeLabel[]>([])
  const [customLabel, setCustomLabel] = useState('')
  const [nodeId, setNodeId] = useState('')
  const [rows, setRows] = useState<PropRow[]>([emptyRow(), emptyRow(), emptyRow(), emptyRow()])
  const [loading, setLoading] = useState(false)

  // id field + filled extra rows = total props; need >= 5 total
  const extraFilled = rows.filter((r) => r.key.trim()).length
  const totalFilled = (nodeId.trim() ? 1 : 0) + extraFilled
  const isMultiLabel = (selectedLabels.length + (customLabel.trim() ? 1 : 0)) > 1

  function toggleLabel(label: NodeLabel) {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    )
  }

  function updateRow(i: number, field: keyof PropRow, val: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))
  }

  function coerce(val: string, type: PropType): unknown {
    if (type === 'number') return Number(val)
    if (type === 'boolean') return val === 'true'
    if (type === 'list') return val.split(',').map((v) => v.trim())
    return val
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const labels: string[] = [...selectedLabels]
    if (customLabel.trim()) labels.push(customLabel.trim())
    if (labels.length === 0) { toast('Selecciona al menos una etiqueta', 'error'); return }
    if (!nodeId.trim()) { toast('El campo ID es obligatorio', 'error'); return }

    const properties: Record<string, unknown> = { id: nodeId.trim() }
    for (const row of rows) {
      if (row.key.trim()) properties[row.key.trim()] = coerce(row.value, row.type)
    }

    if (Object.keys(properties).length < 5) {
      toast('Se requieren al menos 5 propiedades en total (incluyendo id)', 'error')
      return
    }

    setLoading(true)
    try {
      await createNode(labels, properties)
      toast(`Nodo ${labels.join('+')} creado exitosamente`, 'success')
      onSuccess()
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Labels */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Etiquetas
          {isMultiLabel && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
              multi-label
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ALL_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleLabel(label)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedLabels.includes(label)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
          placeholder="Etiqueta personalizada (opcional)"
          className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* ID field — required by API */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID del nodo <span className="text-red-500">*</span>
          <span className="ml-2 text-xs font-normal text-gray-400">Identificador único requerido</span>
        </label>
        <input
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
          placeholder="ej: PROD-001, CLI-042, …"
          required
          className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Extra properties */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Propiedades adicionales
          </label>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            totalFilled >= 5
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
          }`}>
            {totalFilled} / 5 requeridas
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.key}
                onChange={(e) => updateRow(i, 'key', e.target.value)}
                placeholder={`clave ${i + 1}`}
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                value={row.value}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
                placeholder="valor"
                className="flex-1 h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={row.type}
                onChange={(e) => updateRow(i, 'type', e.target.value)}
                className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="string">texto</option>
                <option value="number">número</option>
                <option value="boolean">booleano</option>
                <option value="date">fecha</option>
                <option value="list">lista</option>
              </select>
              {i >= 4 && (
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:text-red-700 px-1"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="mt-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-medium"
        >
          + Agregar propiedad
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {isMultiLabel ? '⬡ Crear nodo multi-label' : '⬡ Crear nodo'}
        </Button>
      </div>
    </form>
  )
}
