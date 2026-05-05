from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_driver

router = APIRouter(prefix="/api/cypher", tags=["Cypher"])


class CypherRequest(BaseModel):
    query: str


@router.post("")
def run_cypher(payload: CypherRequest):
    blocked = ["CREATE", "MERGE", "DELETE", "DETACH", "SET", "REMOVE", "DROP"]

    if any(word in payload.query.upper() for word in blocked):
        raise HTTPException(
            status_code=400,
            detail="Solo se permiten consultas de lectura"
        )

    try:
        with get_driver().session() as session:
            result = session.run(payload.query)
            return [record.data() for record in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))