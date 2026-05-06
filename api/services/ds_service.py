import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from database import get_driver


def get_client_clusters(n_clusters: int = 4):
    query = """
    MATCH (c:Cliente)
    OPTIONAL MATCH (c)-[:REALIZA]->(o:Orden)
    WITH
        c,
        count(o) AS totalOrdenes,
        coalesce(sum(o.total), 0) AS totalGastado
    RETURN
        c.id AS clientId,
        c.nombre AS nombre,
        c.segmento AS segmento,
        coalesce(c.creditoAprobado, 0) AS creditoAprobado,
        totalOrdenes,
        totalGastado
    """

    with get_driver().session() as session:
        result = session.run(query)
        records = [dict(r) for r in result]

    if not records:
        return {
            "clients": [],
            "meta": []
        }

    df = pd.DataFrame(records)

    features = ["creditoAprobado", "totalOrdenes", "totalGastado"]

    X = df[features].fillna(0)

    real_clusters = min(n_clusters, len(df))

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(
        n_clusters=real_clusters,
        random_state=42,
        n_init="auto"
    )

    df["cluster"] = kmeans.fit_predict(X_scaled)

    clients = []

    for _, row in df.iterrows():
        clients.append({
            "clientId": row["clientId"],
            "nombre": row["nombre"],
            "segmento": row["segmento"],
            "creditoAprobado": float(row["creditoAprobado"]),
            "totalOrdenes": int(row["totalOrdenes"]),
            "totalGastado": float(row["totalGastado"]),
            "cluster": int(row["cluster"]),
        })

    meta_df = (
        df.groupby("cluster")
        .agg(
            count=("clientId", "count"),
            avgCredito=("creditoAprobado", "mean"),
            avgOrdenes=("totalOrdenes", "mean"),
        )
        .reset_index()
    )

    meta = []

    for _, row in meta_df.iterrows():
        cluster = int(row["cluster"])

        meta.append({
            "cluster": cluster,
            "label": f"Cluster {cluster}",
            "count": int(row["count"]),
            "avgCredito": round(float(row["avgCredito"]), 2),
            "avgOrdenes": round(float(row["avgOrdenes"]), 2),
        })

    return {
        "clients": clients,
        "meta": meta
    }