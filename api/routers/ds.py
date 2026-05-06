import json
from fastapi import APIRouter
from services.ds_service import get_client_cluster

router = APIRouter(prefix="/api/ds", tags=["Data Science"])


@router.get("/clusters")
def clusters():
    df = get_client_cluster()
    if df is None:
        return {"clusters": []}
    df = df.copy()
    df["fecha_registro"] = df["fecha_registro"].astype(str)
    return {"clusters": json.loads(df.to_json(orient="records"))}
