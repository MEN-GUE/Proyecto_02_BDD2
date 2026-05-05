import api from './client'
import type { Neo4jNode, NodeFilterParams, NodesResponse } from '../types/node'

export async function getNodes(params: NodeFilterParams): Promise<NodesResponse> {
  const { data } = await api.get('/api/nodes', { params })
  return data
}

export async function getNodeById(id: string): Promise<Neo4jNode> {
  const { data } = await api.get(`/api/nodes/${id}`)
  return data
}

export async function createNode(
  labels: string[],
  properties: Record<string, unknown>,
): Promise<Neo4jNode> {
  if (labels.length > 1) {
    const { data } = await api.post('/api/nodes/multi-label', { labels, properties })
    return data
  }
  const { data } = await api.post('/api/nodes', { label: labels[0], properties })
  return data
}

export async function updateNodeProperties(
  id: string,
  properties: Record<string, unknown>,
): Promise<Neo4jNode> {
  const { data } = await api.patch(`/api/nodes/${id}/properties`, { properties })
  return data
}

export async function bulkUpdateNodeProperties(
  ids: string[],
  properties: Record<string, unknown>,
): Promise<{ updated: number }> {
  const { data } = await api.patch('/api/nodes/bulk/properties', { ids, properties })
  return data
}

export async function deleteNodeProperties(
  id: string,
  keys: string[],
): Promise<Neo4jNode> {
  const { data } = await api.delete(`/api/nodes/${id}/properties`, { data: { keys } })
  return data
}

export async function bulkDeleteNodeProperties(
  ids: string[],
  keys: string[],
): Promise<{ updated: number }> {
  const { data } = await api.delete('/api/nodes/bulk/properties', { data: { ids, keys } })
  return data
}

export async function deleteNode(id: string): Promise<void> {
  await api.delete(`/api/nodes/${id}`)
}

export async function bulkDeleteNodes(ids: string[]): Promise<{ deleted: number }> {
  const { data } = await api.delete('/api/nodes/bulk', { data: { ids } })
  return data
}
