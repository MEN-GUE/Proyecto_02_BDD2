export interface PredefinedQuery {
  id: string
  title: string
  description: string
  cypher: string
}

export const PREDEFINED_QUERIES: PredefinedQuery[] = [
  {
    id: 'top-proveedores',
    title: 'Top 10 Proveedores por Calificación',
    description: 'Lista los 10 mejores proveedores ordenados por su calificación de mayor a menor.',
    cypher: `MATCH (p:Proveedor)
RETURN p.id AS id, p.nombre AS nombre, p.pais AS pais,
       p.calificacion AS calificacion, p.activo AS activo
ORDER BY p.calificacion DESC
LIMIT 10`,
  },
  {
    id: 'ordenes-urgentes',
    title: 'Órdenes Urgentes en Tránsito',
    description: 'Muestra todas las órdenes marcadas como urgentes que aún están en tránsito.',
    cypher: `MATCH (o:Orden)
WHERE o.urgente = true AND o.estado = 'En Transito'
RETURN o.id AS id, o.fecha AS fecha, o.total AS total,
       o.estado AS estado, o.fechaEntrega AS fechaEntrega
ORDER BY o.fechaEntrega ASC`,
  },
  {
    id: 'clientes-vip',
    title: 'Clientes VIP con Mayor Crédito',
    description: 'Clientes del segmento VIP ordenados por crédito aprobado descendente.',
    cypher: `MATCH (c:Cliente)
WHERE c.segmento = 'VIP'
RETURN c.id AS id, c.nombre AS nombre, c.pais AS pais,
       c.creditoAprobado AS credito, c.fechaAlta AS fechaAlta
ORDER BY c.creditoAprobado DESC
LIMIT 15`,
  },
  {
    id: 'productos-sin-stock',
    title: 'Productos sin Stock por Categoría',
    description: 'Cuenta los productos sin stock agrupados por categoría.',
    cypher: `MATCH (p:Producto)-[:PERTENECE_A]->(c:Categoria)
WHERE p.enStock = false
RETURN c.nombre AS categoria, count(p) AS sinStock
ORDER BY sinStock DESC`,
  },
  {
    id: 'almacenes-ordenes',
    title: 'Almacenes con Mayor Volumen de Órdenes',
    description: 'Almacenes que gestionan más órdenes, con conteo total.',
    cypher: `MATCH (a:Almacen)-[:GESTIONA]->(o:Orden)
RETURN a.nombre AS almacen, a.ubicacion AS ubicacion,
       count(o) AS totalOrdenes, sum(o.total) AS valorTotal
ORDER BY totalOrdenes DESC
LIMIT 10`,
  },
  {
    id: 'cadena-completa',
    title: 'Cadena Completa: Cliente → Orden → Transporte',
    description: 'Traza la cadena completa desde cliente hasta transporte para las últimas órdenes.',
    cypher: `MATCH (c:Cliente)-[:REALIZA]->(o:Orden)<-[:TRANSPORTA]-(t:Transporte)
RETURN c.nombre AS cliente, c.segmento AS segmento,
       o.id AS orden, o.estado AS estadoOrden, o.total AS total,
       t.tipo AS tipoTransporte, t.matricula AS matricula
ORDER BY o.fecha DESC
LIMIT 20`,
  },
]
