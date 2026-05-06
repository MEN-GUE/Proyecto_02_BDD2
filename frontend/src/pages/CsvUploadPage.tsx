import { useState, useRef } from 'react'
import { uploadCsv } from '../api/csv'
import { useToast } from '../components/ui/ToastProvider'
import { ALL_LABELS } from '../types/node'
import Button from '../components/ui/Button'

export default function CsvUploadPage() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [label, setLabel] = useState(ALL_LABELS[0])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ nodesCreated: number; relationshipsCreated: number; message: string } | null>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.csv')) setFile(dropped)
    else toast('Solo se aceptan archivos .csv', 'error')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { toast('Selecciona un archivo CSV', 'error'); return }
    setLoading(true)
    setResult(null)
    try {
      const r = await uploadCsv(file, label)
      setResult(r)
      toast(`Carga exitosa: ${r.nodesCreated} nodos creados`, 'success')
      setFile(null)
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Carga de Datos CSV</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Importa nodos y relaciones desde un archivo CSV</p>
      </div>

      {/* Requirements notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
        <p className="font-semibold mb-1">⚠️ Requisitos del archivo CSV</p>
        <ul className="list-disc list-inside text-xs space-y-1 text-yellow-700 dark:text-yellow-400">
          <li>Debe contener una columna <code className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">id</code> como identificador único</li>
          <li>El resto de columnas se convierten en propiedades del nodo</li>
          <li>Usa <code className="font-mono bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">MERGE</code> internamente — si el ID ya existe, actualiza las propiedades</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : file
              ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
          }`}
        >
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f) }} />
          {file ? (
            <div>
              <p className="text-4xl mb-3">📄</p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl mb-3">📂</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Arrastra tu archivo CSV aquí
              </p>
              <p className="text-xs text-gray-400 mt-1">o haz clic para seleccionar</p>
            </div>
          )}
        </div>

        {/* Label selector */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de nodo (etiqueta)
          </label>
          <select value={label} onChange={(e) => setLabel(e.target.value as typeof label)}
            className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-green-500">
            {ALL_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <Button type="submit" loading={loading} size="lg">
          📤 Cargar CSV
        </Button>
      </form>

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">✅ Carga completada</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.nodesCreated}</p>
              <p className="text-xs text-gray-500">Nodos creados</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{result.relationshipsCreated}</p>
              <p className="text-xs text-gray-500">Relaciones creadas</p>
            </div>
          </div>
          {result.message && <p className="text-xs text-gray-500 mt-2">{result.message}</p>}
        </div>
      )}
    </div>
  )
}
