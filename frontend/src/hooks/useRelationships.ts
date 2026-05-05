import { useState, useEffect, useCallback } from 'react'
import { getRelationshipsForNode, getRelationships } from '../api/relationships'
import type { Relationship } from '../types/relationship'

export function useNodeRelationships(nodeId: string) {
  const [data, setData] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!nodeId) return
    setLoading(true)
    setError(null)
    try {
      const result = await getRelationshipsForNode(nodeId)
      setData(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [nodeId])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function useRelationships(params?: { type?: string; page?: number; pageSize?: number }) {
  const [data, setData] = useState<{ relationships: Relationship[]; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRelationships(params)
      setData(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
