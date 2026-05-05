# api/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

from database import close_driver, verify_connection
from routers import nodes, relationships


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Iniciando API...")
    verify_connection()

    yield

    print("Cerrando conexión a Neo4j...")
    close_driver()


app = FastAPI(
    title="Neo4j API",
    lifespan=lifespan
)

app.include_router(nodes.router)
app.include_router(relationships.router)


@app.get("/")
def root():
    return {"message": "API funcionando 🚀"}