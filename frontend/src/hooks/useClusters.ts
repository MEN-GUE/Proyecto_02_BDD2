import { useState, useEffect } from 'react'
import { getClusters } from '../api/datascience'
import type { ClustersResponse } from '../types/cluster'

export function useClusters() {
  const [data, setData] = useState<ClustersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getClusters()
      .then(setData)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
