interface StatCardProps {
  label: string
  value: number | string
  icon?: string
  color?: string
}

export default function StatCard({ label, value, icon = '📦', color = 'green' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    green: 'border-l-green-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    orange: 'border-l-orange-500',
    indigo: 'border-l-indigo-500',
    teal: 'border-l-teal-500',
    yellow: 'border-l-yellow-500',
  }
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${colorMap[color] ?? colorMap.green} p-4 flex items-center gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
