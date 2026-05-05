import { ALL_LABELS, type NodeLabel } from '../../types/node'
import Button from '../ui/Button'

interface NodeFilterBarProps {
  label: NodeLabel | ''
  prop: string
  value: string
  onLabel: (l: NodeLabel | '') => void
  onProp: (p: string) => void
  onValue: (v: string) => void
  onSearch: () => void
}

export default function NodeFilterBar({ label, prop, value, onLabel, onProp, onValue, onSearch }: NodeFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Etiqueta</label>
        <select
          value={label}
          onChange={(e) => onLabel(e.target.value as NodeLabel | '')}
          className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas</option>
          {ALL_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Propiedad</label>
        <input
          value={prop}
          onChange={(e) => onProp(e.target.value)}
          placeholder="nombre, estado…"
          className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500 w-36"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Valor</label>
        <input
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder="valor a filtrar"
          className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500 w-40"
        />
      </div>
      <Button onClick={onSearch} size="sm">Buscar</Button>
    </div>
  )
}
