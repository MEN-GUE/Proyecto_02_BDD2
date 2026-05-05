import re
from fastapi import HTTPException


def validate_cypher_name(name: str):
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name):
        raise HTTPException(status_code=400, detail=f"Nombre inválido: {name}")
    return name


def node_to_dict(node, labels):
    props = dict(node)
    return {
        "id": props.get("id"),
        "labels": labels,
        "properties": props,
    }


def relationship_to_dict(rel, start_id=None, end_id=None):
    props = dict(rel)

    return {
        "id": str(rel.id),
        "type": rel.type,
        "startNodeId": start_id,
        "endNodeId": end_id,
        "properties": props,
    }


def build_set_clause(alias: str, properties: dict):
    return ", ".join([f"{alias}.{key} = ${key}" for key in properties.keys()])


def build_remove_clause(alias: str, keys: list[str]):
    for key in keys:
        validate_cypher_name(key)
    return ", ".join([f"{alias}.{key}" for key in keys])