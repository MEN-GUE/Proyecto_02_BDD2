from fastapi import APIRouter, HTTPException
from database import get_driver

router = APIRouter(prefix="/api/aggregations", tags=["Aggregations"])


@router.get("/node-counts")
def get_node_counts():
    query = """
    MATCH (n)
    UNWIND labels(n) AS label
    RETURN label, count(n) AS value
    ORDER BY value DESC
    """

    with get_driver().session() as session:
        result = session.run(query)
        return [dict(record) for record in result]


@router.get("/{type}")
def get_aggregation(type: str):
    aggregations = {
        "top-products": """
            MATCH (:Orden)-[r:CONTIENE]->(p:Producto)
            RETURN p.nombre AS label, sum(r.cantidad) AS value
            ORDER BY value DESC
            LIMIT 10
        """,
        "top-clients": """
            MATCH (c:Cliente)-[:REALIZA]->(o:Orden)
            RETURN c.nombre AS label, sum(o.total) AS value
            ORDER BY value DESC
            LIMIT 10
        """,
        "order-status": """
            MATCH (o:Orden)
            RETURN o.estado AS label, count(o) AS value
            ORDER BY value DESC
        """,
        "client-segments": """
            MATCH (c:Cliente)
            RETURN c.segmento AS label, count(c) AS value
            ORDER BY value DESC
        """,
        "supplier-rating": """
            MATCH (p:Proveedor)
            RETURN 
                CASE 
                    WHEN p.calificacion >= 4 THEN 'Alta'
                    WHEN p.calificacion >= 2.5 THEN 'Media'
                    ELSE 'Baja'
                END AS label,
                count(p) AS value
            ORDER BY value DESC
        """,
    }

    if type not in aggregations:
        raise HTTPException(status_code=404, detail="Agregación no encontrada")

    with get_driver().session() as session:
        result = session.run(aggregations[type])
        return [dict(record) for record in result]