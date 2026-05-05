import api from './client'
import type { Relationship } from '../types/relationship'

export async function getRelationshipsForNode(nodeId: string): Promise<Relationship[]> {
  const { data } = await api.get(`/api/nodes/${nodeId}/relationships`)
  return data
}

export async function getRelationships(params?: {
  type?: string
  page?: number
  pageSize?: number
}): Promise<{ relationships: Relationship[]; total: number }> {
  const { data } = await api.get('/api/relationships', { params })
  return data
}

export async function createRelationship(
  fromId: string,
  toId: string,
  type: string,
  properties: Record<string, unknown>,
): Promise<Relationship> {
  const { data } = await api.post('/api/relationships', { fromId, toId, type, properties })
  return data
}

export async function updateRelProperties(
  id: string,
  properties: Record<string, unknown>,
): Promise<Relationship> {
  const { data } = await api.patch(`/api/relationships/${id}/properties`, { properties })
  return data
}

export async function bulkUpdateRelProperties(
  ids: string[],
  properties: Record<string, unknown>,
): Promise<{ updated: number }> {
  const { data } = await api.patch('/api/relationships/bulk/properties', { ids, properties })
  return data
}

export async function deleteRelProperties(
  id: string,
  keys: string[],
): Promise<Relationship> {
  const { data } = await api.delete(`/api/relationships/${id}/properties`, { data: { keys } })
  return data
}

export async function bulkDeleteRelProperties(
  ids: string[],
  keys: string[],
): Promise<{ updated: number }> {
  const { data } = await api.delete('/api/relationships/bulk/properties', { data: { ids, keys } })
  return data
}

export async function deleteRelationship(id: string): Promise<void> {
  await api.delete(`/api/relationships/${id}`)
}

export async function bulkDeleteRelationships(ids: string[]): Promise<{ deleted: number }> {
  const { data } = await api.delete('/api/relationships/bulk', { data: { ids } })
  return data
}
