type Color = 'green' | 'yellow' | 'blue' | 'red' | 'purple' | 'orange' | 'gray' | 'indigo' | 'pink' | 'teal'

interface BadgeProps {
  label: string
  color?: Color
}

const colors: Record<Color, string> = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
}

export const LABEL_COLORS: Record<string, Color> = {
  Proveedor: 'blue',
  Categoria: 'purple',
  Producto: 'green',
  Almacen: 'orange',
  Cliente: 'indigo',
  Transporte: 'teal',
  Orden: 'yellow',
}

export const ORDER_STATUS_COLORS: Record<string, Color> = {
  'Entregada': 'green',
  'Pendiente': 'yellow',
  'En Transito': 'blue',
  'Cancelada': 'red',
}

export const SEGMENT_COLORS: Record<string, Color> = {
  VIP: 'purple',
  Mayorista: 'blue',
  Retail: 'green',
  Agropecuario: 'orange',
}

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}
