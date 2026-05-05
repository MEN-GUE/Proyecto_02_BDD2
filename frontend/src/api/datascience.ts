import api from './client'
import type { ClustersResponse } from '../types/cluster'

export async function getClusters(): Promise<ClustersResponse> {
  const { data } = await api.get('/api/ds/clusters')
  return data
}
