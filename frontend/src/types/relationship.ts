export type RelType =
  | 'SUMINISTRA'
  | 'ALMACENA'
  | 'CONTIENE'
  | 'REALIZA'
  | 'TRANSPORTA'
  | 'ENVIA_A'
  | 'PERTENECE_A'
  | 'ABASTECE'
  | 'GESTIONA'
  | 'CONECTA'
  | 'DISTRIBUYE'
  | 'REEMPLAZA'

export const ALL_REL_TYPES: RelType[] = [
  'SUMINISTRA', 'ALMACENA', 'CONTIENE', 'REALIZA', 'TRANSPORTA',
  'ENVIA_A', 'PERTENECE_A', 'ABASTECE', 'GESTIONA', 'CONECTA',
  'DISTRIBUYE', 'REEMPLAZA',
]

export interface Relationship {
  id: string
  type: string
  startNodeId: string
  endNodeId: string
  properties: Record<string, unknown>
}
