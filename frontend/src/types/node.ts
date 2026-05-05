export type NodeLabel =
  | 'Proveedor'
  | 'Categoria'
  | 'Producto'
  | 'Almacen'
  | 'Cliente'
  | 'Transporte'
  | 'Orden'

export const ALL_LABELS: NodeLabel[] = [
  'Proveedor', 'Categoria', 'Producto', 'Almacen', 'Cliente', 'Transporte', 'Orden',
]

export interface Neo4jNode {
  id: string
  labels: NodeLabel[]
  properties: Record<string, unknown>
}

export interface NodeFilterParams {
  label?: NodeLabel | ''
  prop?: string
  value?: string
  page?: number
  pageSize?: number
}

export interface NodesResponse {
  nodes: Neo4jNode[]
  total: number
  page: number
  pageSize: number
}
