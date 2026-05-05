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

    try:
        with get_driver().session() as session:
            result = session.run(query)
            return [dict(record) for record in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        "orders-by-status": """
            MATCH (o:Orden)
            RETURN o.estado AS label, count(o) AS value
            ORDER BY value DESC
        """,
        "products-by-category": """
            MATCH (p:Producto)-[:PERTENECE_A]->(c:Categoria)
            RETURN c.nombre AS label, count(p) AS value
            ORDER BY value DESC
            LIMIT 10
        """,
    }

    if type not in aggregations:
        raise HTTPException(status_code=404, detail="Agregación no encontrada")

    with get_driver().session() as session:
        result = session.run(aggregations[type])
        return [dict(record) for record in result]