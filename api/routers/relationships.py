from fastapi import APIRouter, HTTPException, Query
from database import get_driver
from schemas import (
    CreateRelationshipRequest,
    UpdatePropertiesRequest,
    DeletePropertiesRequest,
    BulkUpdatePropertiesRequest,
    BulkDeletePropertiesRequest,
    BulkDeleteRequest,
)
from utils import (
    validate_cypher_name,
    relationship_to_dict,
    build_set_clause,
    build_remove_clause,
)

router = APIRouter(prefix="/api/relationships", tags=["Relationships"])


@router.get("")
def get_relationships(
    type: str | None = None,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1),
):
    skip = (page - 1) * pageSize
    params = {"skip": skip, "limit": pageSize}

    type_clause = ""
    if type:
        type = validate_cypher_name(type)
        type_clause = f":{type}"

    query = f"""
    MATCH ()-[r{type_clause}]->()
    WITH r
    ORDER BY id(r)
    SKIP $skip
    LIMIT $limit
    RETURN r, startNode(r).id AS startNodeId, endNode(r).id AS endNodeId
    """

    count_query = f"""
    MATCH ()-[r{type_clause}]->()
    RETURN count(r) AS total
    """

    with get_driver().session() as session:
        total = session.run(count_query, **params).single()["total"]
        result = session.run(query, **params)

        relationships = [
            relationship_to_dict(
                record["r"],
                record["startNodeId"],
                record["endNodeId"],
            )
            for record in result
        ]

        return {
            "relationships": relationships,
            "total": total,
        }


@router.post("")
def create_relationship(payload: CreateRelationshipRequest):
    rel_type = validate_cypher_name(payload.type)

    if len(payload.properties) < 3:
        raise HTTPException(status_code=400, detail="La relación debe tener mínimo 3 propiedades")

    query = f"""
    MATCH (a {{id: $fromId}})
    MATCH (b {{id: $toId}})
    CREATE (a)-[r:{rel_type}]->(b)
    SET {build_set_clause("r", payload.properties)}
    RETURN r, startNode(r).id AS startNodeId, endNode(r).id AS endNodeId
    """

    params = {
        "fromId": payload.fromId,
        "toId": payload.toId,
        **payload.properties,
    }

    with get_driver().session() as session:
        record = session.run(query, **params).single()

        if record is None:
            raise HTTPException(status_code=404, detail="No se encontraron los nodos")

        return relationship_to_dict(record["r"], record["startNodeId"], record["endNodeId"])


@router.patch("/{relationship_id}/properties")
def update_relationship_properties(relationship_id: str, payload: UpdatePropertiesRequest):
    query = f"""
    MATCH ()-[r]->()
    WHERE id(r) = toInteger($id)
    SET {build_set_clause("r", payload.properties)}
    RETURN r, startNode(r).id AS startNodeId, endNode(r).id AS endNodeId
    """

    params = {"id": relationship_id, **payload.properties}

    with get_driver().session() as session:
        record = session.run(query, **params).single()

        if record is None:
            raise HTTPException(status_code=404, detail="Relación no encontrada")

        return relationship_to_dict(record["r"], record["startNodeId"], record["endNodeId"])


@router.patch("/bulk/properties")
def bulk_update_relationship_properties(payload: BulkUpdatePropertiesRequest):
    query = f"""
    MATCH ()-[r]->()
    WHERE toString(id(r)) IN $ids
    SET {build_set_clause("r", payload.properties)}
    RETURN count(r) AS updated
    """

    params = {"ids": payload.ids, **payload.properties}

    with get_driver().session() as session:
        record = session.run(query, **params).single()
        return {"updated": record["updated"]}


@router.delete("/{relationship_id}/properties")
def delete_relationship_properties(relationship_id: str, payload: DeletePropertiesRequest):
    remove_clause = build_remove_clause("r", payload.keys)

    query = f"""
    MATCH ()-[r]->()
    WHERE id(r) = toInteger($id)
    REMOVE {remove_clause}
    RETURN r, startNode(r).id AS startNodeId, endNode(r).id AS endNodeId
    """

    with get_driver().session() as session:
        record = session.run(query, id=relationship_id).single()

        if record is None:
            raise HTTPException(status_code=404, detail="Relación no encontrada")

        return relationship_to_dict(record["r"], record["startNodeId"], record["endNodeId"])


@router.delete("/bulk/properties")
def bulk_delete_relationship_properties(payload: BulkDeletePropertiesRequest):
    remove_clause = build_remove_clause("r", payload.keys)

    query = f"""
    MATCH ()-[r]->()
    WHERE toString(id(r)) IN $ids
    REMOVE {remove_clause}
    RETURN count(r) AS updated
    """

    with get_driver().session() as session:
        record = session.run(query, ids=payload.ids).single()
        return {"updated": record["updated"]}


@router.delete("/bulk")
def bulk_delete_relationships(payload: BulkDeleteRequest):
    query = """
    MATCH ()-[r]->()
    WHERE toString(id(r)) IN $ids
    DELETE r
    RETURN count(r) AS deleted
    """

    with get_driver().session() as session:
        record = session.run(query, ids=payload.ids).single()
        return {"deleted": record["deleted"]}


@router.delete("/{relationship_id}")
def delete_relationship(relationship_id: str):
    query = """
    MATCH ()-[r]->()
    WHERE id(r) = toInteger($id)
    DELETE r
    RETURN count(r) AS deleted
    """

    with get_driver().session() as session:
        record = session.run(query, id=relationship_id).single()

        if record["deleted"] == 0:
            raise HTTPException(status_code=404, detail="Relación no encontrada")

        return {"message": "Relación eliminada"}