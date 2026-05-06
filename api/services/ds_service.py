import logging
from datetime import date
from typing import Optional

import pandas as pd
from neo4j import GraphDatabase
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ─────────────────────────────────────────────
# CONFIGURACIÓN
# ─────────────────────────────────────────────
NEO4J_URI      = "neo4j+ssc://4bef671f.databases.neo4j.io"
NEO4J_USER     = "4bef671f"
NEO4J_PASSWORD = "yjUkVbXfveVVrNqdVGpiTzoq3QmZoXIJB-yzLEC8wRU"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)


def get_client_cluster(
    n_clusters: int = 4,
    random_state: int = 42,
    batch_size: int = 500,
    exportar_csv: bool = True,
) -> Optional[pd.DataFrame]:
    """
    Pipeline completo de segmentación de Proveedores en Neo4j.

    1. Extrae métricas de nodos Proveedor, Producto, Categoria y Almacen.
    2. Aplica K-Means clustering sobre las variables de segmentación.
    3. Escribe cluster_id, cluster_label y cluster_ts de vuelta en cada nodo Proveedor.

    Parámetros:
        n_clusters    : número de segmentos deseados (default 4)
        random_state  : semilla de reproducibilidad (default 42)
        batch_size    : proveedores por transacción al escribir (default 500)
        exportar_csv  : si True, guarda proveedores_clusters.csv (default True)

    Retorna:
        DataFrame con todas las variables y el cluster asignado, o None si falla.
    """

    # ── Queries ───────────────────────────────────────────────────
    EXTRACTION_QUERY = """
    MATCH (p:Proveedor)-[s:SUMINISTRA]->(prod:Producto)
    OPTIONAL MATCH (prod)-[:PERTENECE_A]->(cat:Categoria)
    WITH
        p,
        count(DISTINCT prod)                                        AS total_productos,
        avg(prod.precio)                                            AS precio_promedio,
        avg(s.plazoEntregaDias)                                     AS plazo_entrega_promedio,
        avg(s.precioAcordado)                                       AS precio_acordado_promedio,
        sum(CASE WHEN s.contrato = true THEN 1 ELSE 0 END) * 1.0
            / count(s)                                              AS ratio_contratos,
        count(DISTINCT cat)                                         AS diversidad_categorias
    OPTIONAL MATCH (p)-[:ABASTECE]->(a:Almacen)
    WITH
        p,
        total_productos,
        precio_promedio,
        plazo_entrega_promedio,
        precio_acordado_promedio,
        ratio_contratos,
        diversidad_categorias,
        coalesce(sum(a.capacidad), 0)                               AS capacidad_almacen_total
    RETURN
        p.id                                                        AS proveedor_id,
        p.nombre                                                    AS nombre,
        p.pais                                                      AS pais,
        p.calificacion                                              AS calificacion_proveedor,
        p.fechaRegistro                                             AS fecha_registro,
        p.activo                                                    AS activo,
        total_productos,
        coalesce(precio_promedio, 0.0)                              AS precio_promedio,
        coalesce(plazo_entrega_promedio, 0.0)                       AS plazo_entrega_promedio,
        coalesce(precio_acordado_promedio, 0.0)                     AS precio_acordado_promedio,
        coalesce(ratio_contratos, 0.0)                              AS ratio_contratos,
        diversidad_categorias,
        capacidad_almacen_total
    ORDER BY proveedor_id
    """

    WRITE_QUERY = """
    UNWIND $rows AS row
    MATCH (p:Proveedor {id: row.proveedor_id})
    SET
        p.cluster_id    = row.cluster_id,
        p.cluster_label = row.cluster_label,
        p.cluster_ts    = datetime()
    """

    FEATURES = [
        "calificacion_proveedor",
        "total_productos",
        "precio_promedio",
        "plazo_entrega_promedio",
        "precio_acordado_promedio",
        "ratio_contratos",
        "diversidad_categorias",
        "capacidad_almacen_total",
        "antiguedad_dias",
    ]

    CLUSTER_LABELS = {
        0: "Proveedor_Basico",
        1: "Proveedor_Confiable",
        2: "Proveedor_Estrategico",
        3: "Proveedor_Premium",
    }

    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    try:
        driver.verify_connectivity()
        log.info("Conexión a Neo4j establecida.")

        # ── 1. Extracción ─────────────────────────────────────────
        log.info("Extrayendo datos de Neo4j...")
        with driver.session() as session:
            result = session.run(EXTRACTION_QUERY)
            records = [dict(r) for r in result]

        if not records:
            raise ValueError("La consulta no devolvió registros. Verifica la conexión y el esquema.")

        df = pd.DataFrame(records)

        hoy = date.today()
        df["antiguedad_dias"] = df["fecha_registro"].apply(
            lambda f: (hoy - date.fromisoformat(str(f))).days if pd.notna(f) else 0
        )
        log.info(f"  → {len(df)} proveedores extraídos.")

        # ── 2. Clustering ─────────────────────────────────────────
        log.info("Entrenando modelo K-Means...")
        X = df[FEATURES].fillna(0).values

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init="auto")
        df = df.copy()
        df["cluster_id"]    = kmeans.fit_predict(X_scaled)
        df["cluster_label"] = df["cluster_id"].map(
            lambda i: CLUSTER_LABELS.get(i, f"Segmento_{i}")
        )

        # Centroides en escala original
        centroides = pd.DataFrame(
            scaler.inverse_transform(kmeans.cluster_centers_),
            columns=FEATURES,
        )
        centroides.index.name = "cluster_id"
        log.info("\n── Centroides (escala original) ──\n%s\n", centroides.round(2).to_string())

        # Distribución por cluster
        dist = (
            df.groupby(["cluster_id", "cluster_label"])
            .agg(
                n_proveedores=("proveedor_id", "count"),
                calificacion_media=("calificacion_proveedor", "mean"),
                productos_media=("total_productos", "mean"),
                ratio_contratos_media=("ratio_contratos", "mean"),
            )
            .reset_index()
        )
        log.info("\n── Distribución por cluster ──\n%s\n", dist.round(2).to_string(index=False))

        # ── 3. Retroalimentación al grafo ─────────────────────────
        rows = df[["proveedor_id", "cluster_id", "cluster_label"]].to_dict("records")
        total, written = len(rows), 0

        log.info(f"Escribiendo clusters para {total} proveedores (lotes de {batch_size})...")
        with driver.session() as session:
            for start in range(0, total, batch_size):
                batch = rows[start : start + batch_size]
                session.run(WRITE_QUERY, rows=batch)
                written += len(batch)
                log.info(f"  → {written}/{total} actualizados")
        log.info("✓ Escritura completada.")

        # ── 4. CSV de auditoría (opcional) ────────────────────────
        if exportar_csv:
            out_csv = "proveedores_clusters.csv"
            cols_export = ["proveedor_id", "nombre", "pais", "activo", *FEATURES, "cluster_id", "cluster_label"]
            df[cols_export].to_csv(out_csv, index=False)
            log.info(f"Resultados guardados en: {out_csv}")

        return df

    except Exception as e:
        log.error(f"Error en el pipeline: {e}", exc_info=True)
        raise

    finally:
        driver.close()
        log.info("Conexión cerrada.")


if __name__ == "__main__":
    df_result = get_client_cluster(n_clusters=4)

    if df_result is not None:
        print("\n── Muestra de resultados ──")
        print(
            df_result[[
                "nombre", "pais", "calificacion_proveedor",
                "total_productos", "ratio_contratos",
                "cluster_id", "cluster_label",
            ]]
            .head(15)
            .to_string(index=False)
        )
