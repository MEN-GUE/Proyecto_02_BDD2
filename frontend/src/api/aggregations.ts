import api from './client'

export interface AggregationItem {
  label: string
  value: number
}

export async function getNodeCounts(): Promise<AggregationItem[]> {
  const { data } = await api.get('/api/aggregations/node-counts')
  return data
}

export async function getAggregation(type: string): Promise<AggregationItem[]> {
  const { data } = await api.get(`/api/aggregations/${type}`)
  return data
}

export async function runCypherQuery(query: string): Promise<Record<string, unknown>[]> {
  const { data } = await api.post('/api/cypher', { query })
  return data
}
