from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import close_driver, verify_connection
from routers import nodes, relationships, cypher, aggregations, csv, ds


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(nodes.router)
app.include_router(relationships.router)
app.include_router(cypher.router)
app.include_router(aggregations.router)
app.include_router(csv.router)
app.include_router(ds.router)


@app.get("/")
def root():
    return {"message": "API funcionando 🚀"}