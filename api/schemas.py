from pydantic import BaseModel
from typing import Any


class CreateNodeRequest(BaseModel):
    label: str
    properties: dict[str, Any]


class CreateMultiLabelNodeRequest(BaseModel):
    labels: list[str]
    properties: dict[str, Any]


class UpdatePropertiesRequest(BaseModel):
    properties: dict[str, Any]


class DeletePropertiesRequest(BaseModel):
    keys: list[str]


class BulkUpdatePropertiesRequest(BaseModel):
    ids: list[str]
    properties: dict[str, Any]


class BulkDeletePropertiesRequest(BaseModel):
    ids: list[str]
    keys: list[str]


class BulkDeleteRequest(BaseModel):
    ids: list[str]


class CreateRelationshipRequest(BaseModel):
    fromId: str
    toId: str
    type: str
    properties: dict[str, Any]