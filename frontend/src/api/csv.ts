import api from './client'

export interface CsvUploadResult {
  nodesCreated: number
  relationshipsCreated: number
  message: string
}

export async function uploadCsv(
  file: File,
  label: string,
): Promise<CsvUploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('label', label)
  const { data } = await api.post('/api/csv/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
