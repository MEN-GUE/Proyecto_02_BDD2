from fastapi import APIRouter
from services.ds_service import get_client_clusters

router = APIRouter(prefix="/api/ds", tags=["Data Science"])


@router.get("/clusters")
def clusters():
    return get_client_clusters()