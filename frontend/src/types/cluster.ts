export interface ClientCluster {
  clientId: string
  nombre: string
  segmento: string
  creditoAprobado: number
  totalOrdenes: number
  totalGastado: number
  cluster: number
}

export interface ClusterMeta {
  cluster: number
  label: string
  count: number
  avgCredito: number
  avgOrdenes: number
}

export interface ClustersResponse {
  clients: ClientCluster[]
  meta: ClusterMeta[]
}
