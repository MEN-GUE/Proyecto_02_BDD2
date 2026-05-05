import csv
import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from database import get_driver
from utils import validate_cypher_name

router = APIRouter(prefix="/api/csv", tags=["CSV"])


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...), label: str = Form(...)):
    label = validate_cypher_name(label)

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="El archivo debe ser CSV")

    content = await file.read()
    decoded = content.decode("utf-8-sig")

    reader = csv.DictReader(io.StringIO(decoded))
    records = list(reader)

    if not records:
        raise HTTPException(status_code=400, detail="El CSV está vacío")

    if "id" not in records[0]:
        raise HTTPException(status_code=400, detail="El CSV debe tener una columna id")

    query = f"""
    UNWIND $records AS row
    MERGE (n:{label} {{id: row.id}})
    SET n += row
    RETURN count(n) AS nodesCreated
    """

    with get_driver().session() as session:
        result = session.run(query, records=records)
        nodes_created = result.single()["nodesCreated"]

    return {
        "nodesCreated": nodes_created,
        "relationshipsCreated": 0,
        "message": "CSV cargado correctamente"
    }