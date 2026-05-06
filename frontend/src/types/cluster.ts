export interface ProveedorCluster {
  proveedor_id: string
  nombre: string
  pais: string
  calificacion_proveedor: number
  fecha_registro: string
  activo: boolean
  total_productos: number
  precio_promedio: number
  plazo_entrega_promedio: number
  precio_acordado_promedio: number
  ratio_contratos: number
  diversidad_categorias: number
  capacidad_almacen_total: number
  antiguedad_dias: number
  cluster_id: number
  cluster_label: string
}

export interface ClusterMeta {
  cluster_id: number
  cluster_label: string
  count: number
  avg_calificacion: number
  avg_productos: number
}

export interface ClustersResponse {
  clusters: ProveedorCluster[]
}
