from fastapi import APIRouter, HTTPException, Query
from database import get_driver
from schemas import (
    CreateNodeRequest,
    CreateMultiLabelNodeRequest,
    UpdatePropertiesRequest,
    DeletePropertiesRequest,
    BulkUpdatePropertiesRequest,
    BulkDeletePropertiesRequest,
    BulkDeleteRequest,
)
from utils import (
    validate_cypher_name,
    node_to_dict,
    relationship_to_dict,
    build_set_clause,
    build_remove_clause,
)

router = APIRouter(prefix="/api/nodes", tags=["Nodes"])


@router.get("")
def get_nodes(
    label: str | None = None,
    prop: str | None = None,
    value: str | None = None,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1),
):
    skip = (page - 1) * pageSize

    label_clause = ""
    if label:
        label = validate_cypher_name(label)
        label_clause = f":{label}"

    where_clause = ""
    params = {"skip": skip, "limit": pageSize}

    if prop and value:
        prop = validate_cypher_name(prop)
        where_clause = f"WHERE toString(n.{prop}) = $value"
        params["value"] = value

    count_query = f"""
    MATCH (n{label_clause})
    {where_clause}
    RETURN count(n) AS total
    """

    query = f"""
    MATCH (n{label_clause})
    {where_clause}
    WITH n
    ORDER BY n.id
    SKIP $skip
    LIMIT $limit
    RETURN n, labels(n) AS labels
    """

    with get_driver().session() as session:
        total = session.run(count_query, **params).single()["total"]
        result = session.run(query, **params)

        nodes = [
            node_to_dict(record["n"], record["labels"])
            for record in result
        ]

        return {
            "nodes": nodes,
            "total": total,
            "page": page,
            "pageSize": pageSize,
        }


@router.post("")
def create_node(payload: CreateNodeRequest):
    label = validate_cypher_name(payload.label)

    if len(payload.properties) < 5:
        raise HTTPException(
            status_code=400,
            detail="El nodo debe tener al menos 5 propiedades",
        )

    if "id" not in payload.properties:
        raise HTTPException(
            status_code=400,
            detail="El nodo debe incluir propiedad id",
        )

    set_clause = build_set_clause("n", payload.properties)

    query = f"""
    CREATE (n:{label})
    SET {set_clause}
    RETURN n, labels(n) AS labels
    """

    with get_driver().session() as session:
        record = session.run(query, **payload.properties).single()
        return node_to_dict(record["n"], record["labels"])


@router.post("/multi-label")
def create_multi_label_node(payload: CreateMultiLabelNodeRequest):
    if len(payload.properties) < 5:
        raise HTTPException(
            status_code=400,
            detail="El nodo debe tener al menos 5 propiedades",
        )

    if "id" not in payload.properties:
        raise HTTPException(
            status_code=400,
            detail="El nodo debe incluir propiedad id",
        )

    labels = [validate_cypher_name(label) for label in payload.labels]
    labels_clause = ":" + ":".join(labels)

    set_clause = build_set_clause("n", payload.properties)

    query = f"""
    CREATE (n{labels_clause})
    SET {set_clause}
    RETURN n, labels(n) AS labels
    """

    with get_driver().session() as session:
        record = session.run(query, **payload.properties).single()
        return node_to_dict(record["n"], record["labels"])


@router.patch("/bulk/properties")
def bulk_update_node_properties(payload: BulkUpdatePropertiesRequest):
    set_clause = build_set_clause("n", payload.properties)

    query = f"""
    MATCH (n)
    WHERE n.id IN $ids
    SET {set_clause}
    RETURN count(n) AS updated
    """

    params = {"ids": payload.ids, **payload.properties}

    with get_driver().session() as session:
        record = session.run(query, **params).single()
        return {"updated": record["updated"]}


@router.delete("/bulk/properties")
def bulk_delete_node_properties(payload: BulkDeletePropertiesRequest):
    remove_clause = build_remove_clause("n", payload.keys)

    query = f"""
    MATCH (n)
    WHERE n.id IN $ids
    REMOVE {remove_clause}
    RETURN count(n) AS updated
    """

    with get_driver().session() as session:
        record = session.run(query, ids=payload.ids).single()
        return {"updated": record["updated"]}


@router.delete("/bulk")
def bulk_delete_nodes(payload: BulkDeleteRequest):
    query = """
    MATCH (n)
    WHERE n.id IN $ids
    WITH collect(n) AS nodes, count(n) AS deleted
    FOREACH (node IN nodes | DETACH DELETE node)
    RETURN deleted
    """

    with get_driver().session() as session:
        record = session.run(query, ids=payload.ids).single()
        return {"deleted": record["deleted"]}


@router.get("/{node_id}")
def get_node_by_id(node_id: str):
    query = """
    MATCH (n {id: $id})
    RETURN n, labels(n) AS labels
    LIMIT 1
    """

    with get_driver().session() as session:
        record = session.run(query, id=node_id).single()

        if record is None:
            raise HTTPException(status_code=404, detail="Nodo no encontrado")

        return node_to_dict(record["n"], record["labels"])


@router.patch("/{node_id}/properties")
def update_node_properties(node_id: str, payload: UpdatePropertiesRequest):
    set_clause = build_set_clause("n", payload.properties)

    query = f"""
    MATCH (n {{id: $id}})
    SET {set_clause}
    RETURN n, labels(n) AS labels
    """

    params = {"id": node_id, **payload.properties}

    with get_driver().session() as session:
        record = session.run(query, **params).single()

        if record is None:
            raise HTTPException(status_code=404, detail="Nodo no encontrado")

        return node_to_dict(record["n"], record["labels"])


@router.delete("/{node_id}/properties")
def delete_node_properties(node_id: str, payload: DeletePropertiesRequest):
    remove_clause = build_remove_clause("n", payload.keys)

    query = f"""
    MATCH (n {{id: $id}})
    REMOVE {remove_clause}
    RETURN n, labels(n) AS labels
    """

    with get_driver().session() as session:
        record = session.run(query, id=node_id).single()

        if record is None:
            raise HTTPException(status_code=404, detail="Nodo no encontrado")

        return node_to_dict(record["n"], record["labels"])


@router.get("/{node_id}/relationships")
def get_relationships_for_node(node_id: str):
    query = """
    MATCH (n {id: $id})-[r]-(m)
    RETURN r, startNode(r).id AS startNodeId, endNode(r).id AS endNodeId
    """

    with get_driver().session() as session:
        result = session.run(query, id=node_id)

        return [
            relationship_to_dict(
                record["r"],
                record["startNodeId"],
                record["endNodeId"],
            )
            for record in result
        ]


@router.delete("/{node_id}")
def delete_node(node_id: str):
    query = """
    MATCH (n {id: $id})
    WITH n, count(n) AS deleted
    DETACH DELETE n
    RETURN deleted
    """

    with get_driver().session() as session:
        record = session.run(query, id=node_id).single()

        if record["deleted"] == 0:
            raise HTTPException(status_code=404, detail="Nodo no encontrado")

        return