import pandas as pd
from faker import Faker
import random
import os
import uuid
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()
URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

fake = Faker('es_MX')
os.makedirs('../data', exist_ok=True)

# Departamentos y patrones lógicos para Guatemala
DEPARTAMENTOS = ['Guatemala', 'Escuintla', 'Quetzaltenango', 'Sacatepéquez', 'Alta Verapaz', 'Petén', 'Zacapa']
PRODUCTOS_GT = [
    ('Alevines de Tilapia', 150.0, 'Agropecuario'),
    ('Concentrado Caprino (Saco 50lb)', 220.0, 'Agropecuario'),
    ('Quintal de Café Pergamino', 1500.0, 'Exportación'),
    ('Saco de Cardamomo de Primera', 4500.0, 'Exportación'),
    ('Caja de Ron Añejo', 1200.0, 'Minorista'),
    ('Lote de Textiles Típicos', 800.0, 'Minorista'),
    ('Fertilizante Urea (Saco)', 350.0, 'Agropecuario')
]

def random_date(start='-1y', end='today'):
    return fake.date_between(start_date=start, end_date=end).isoformat()

def generar_datos_ds():
    print("Generando 3,000 Clientes y 10,000 Órdenes para Data Science...")
    
    # 1. Generar Productos Locales (para dar contexto a las órdenes)
    productos = []
    for nombre, precio, categoria in PRODUCTOS_GT:
        for i in range(5):  # 5 variantes de cada producto
            productos.append({
                'id': str(uuid.uuid4()), 'nombre': f"{nombre} Var-{i+1}",
                'precio': precio * random.uniform(0.9, 1.1), 'peso': random.randint(10, 100),
                'enStock': True, 'fechaVencimiento': random_date('today', '+1y'),
                'tags': f"Guatemala|{categoria}"
            })
    df_prod = pd.DataFrame(productos)
    
    # 2. Generar Clientes con patrones
    clientes = []
    segmentos = ['Agropecuario', 'Exportación', 'Minorista']
    
    for _ in range(3000):
        segmento = random.choice(segmentos)
        
        # Asignar departamento según segmento para crear un patrón geográfico
        if segmento == 'Agropecuario':
            depto = random.choice(['Escuintla', 'Petén', 'Zacapa'])
            credito = random.uniform(5000, 20000)
        elif segmento == 'Exportación':
            depto = random.choice(['Guatemala', 'Sacatepéquez', 'Alta Verapaz'])
            credito = random.uniform(50000, 200000)
        else:
            depto = random.choice(DEPARTAMENTOS)
            credito = random.uniform(1000, 5000)
            
        clientes.append({
            'id': str(uuid.uuid4()), 'nombre': fake.company(),
            'segmento': segmento, 'creditoAprobado': round(credito, 2),
            'pais': 'Guatemala', 'fechaAlta': random_date('-4y', 'today'),
            'etiquetas': f"{depto}|BulkDS"
        })
    df_cli = pd.DataFrame(clientes)

    # 3. Generar Órdenes y Relaciones REALIZA / CONTIENE
    ordenes, rel_realiza, rel_contiene = [], [], []
    
    for _, cliente in df_cli.iterrows():
        # Exportadores compran menos frecuente pero muy caro, Minoristas compran mucho y barato
        num_ordenes = random.randint(1, 3) if cliente['segmento'] == 'Exportación' else random.randint(3, 8)
        
        for _ in range(num_ordenes):
            orden_id = str(uuid.uuid4())
            urgente = True if cliente['segmento'] == 'Exportación' and random.random() < 0.4 else False
            
            ordenes.append({
                'id': orden_id, 'fecha': random_date('-1y', 'today'),
                'total': 0, 'estado': random.choice(['Entregada', 'En Transito']), # Se recalcula abajo
                'urgente': urgente, 'items': "", 'fechaEntrega': random_date('today', '+1m')
            })
            
            rel_realiza.append({
                'origen': cliente['id'], 'destino': orden_id,
                'fechaPedido': random_date('-1y', 'today'),
                'metodoPago': 'Transferencia', 'aprobada': True
            })
            
            # Asignar productos lógicos según el segmento del cliente
            prods_disponibles = df_prod[df_prod['tags'].str.contains(cliente['segmento'])]
            if prods_disponibles.empty: prods_disponibles = df_prod
            
            seleccionados = prods_disponibles.sample(random.randint(1, 4))
            total_orden = 0
            
            for _, prod in seleccionados.iterrows():
                cantidad = random.randint(50, 200) if cliente['segmento'] == 'Exportación' else random.randint(1, 15)
                subtotal = cantidad * prod['precio']
                total_orden += subtotal
                
                rel_contiene.append({
                    'origen': orden_id, 'destino': prod['id'],
                    'cantidad': cantidad, 'precioUnitario': round(prod['precio'], 2),
                    'descuento': round(random.uniform(0, 0.15), 2)
                })
            
            ordenes[-1]['total'] = round(total_orden, 2)

    df_ord = pd.DataFrame(ordenes)
    df_rel_realiza = pd.DataFrame(rel_realiza)
    df_rel_contiene = pd.DataFrame(rel_contiene)
    
    # Guardar CSVs
    df_prod.to_csv('../data/ds_productos.csv', index=False)
    df_cli.to_csv('../data/ds_clientes.csv', index=False)
    df_ord.to_csv('../data/ds_ordenes.csv', index=False)
    df_rel_realiza.to_csv('../data/ds_rel_realiza.csv', index=False)
    df_rel_contiene.to_csv('../data/ds_rel_contiene.csv', index=False)
    
    return df_prod, df_cli, df_ord, df_rel_realiza, df_rel_contiene

# ==========================================
# FUNCIONES DE CARGA A NEO4J
# ==========================================
def batch_load(tx, query, records):
    tx.run(query, registros=records)

def upload_to_neo4j():
    driver = GraphDatabase.driver(URI, auth=AUTH)
    
    queries = {
        'Producto': """UNWIND $registros AS row MERGE (n:Producto {id: row.id}) SET n.nombre=row.nombre, n.precio=toFloat(row.precio), n.peso=toInteger(row.peso), n.enStock=row.enStock, n.fechaVencimiento=date(row.fechaVencimiento), n.tags=split(row.tags, '|')""",
        'Cliente': """UNWIND $registros AS row MERGE (n:Cliente {id: row.id}) SET n.nombre=row.nombre, n.segmento=row.segmento, n.creditoAprobado=toFloat(row.creditoAprobado), n.pais=row.pais, n.fechaAlta=date(row.fechaAlta), n.etiquetas=split(row.etiquetas, '|')""",
        'Orden': """UNWIND $registros AS row MERGE (n:Orden {id: row.id}) SET n.fecha=date(row.fecha), n.total=toFloat(row.total), n.estado=row.estado, n.urgente=row.urgente, n.fechaEntrega=date(row.fechaEntrega)""",
        'REALIZA': """UNWIND $registros AS row MATCH (c:Cliente {id: row.origen}), (o:Orden {id: row.destino}) MERGE (c)-[r:REALIZA]->(o) SET r.fechaPedido=date(row.fechaPedido), r.metodoPago=row.metodoPago, r.aprobada=row.aprobada""",
        'CONTIENE': """UNWIND $registros AS row MATCH (o:Orden {id: row.origen}), (p:Producto {id: row.destino}) MERGE (o)-[r:CONTIENE]->(p) SET r.cantidad=toInteger(row.cantidad), r.precioUnitario=toFloat(row.precioUnitario), r.descuento=toFloat(row.descuento)"""
    }

    print("Subiendo datos masivos a AuraDB en lotes...")
    with driver.session() as session:
        for file_name, entity in [('ds_productos.csv', 'Producto'), ('ds_clientes.csv', 'Cliente'), ('ds_ordenes.csv', 'Orden')]:
            print(f"Cargando {entity}s...")
            df = pd.read_csv(f'../data/{file_name}')
            # Partir en lotes de 2000 para no ahogar la conexión
            for i in range(0, len(df), 2000):
                session.execute_write(batch_load, queries[entity], df.iloc[i:i+2000].to_dict('records'))
                
        for file_name, rel in [('ds_rel_realiza.csv', 'REALIZA'), ('ds_rel_contiene.csv', 'CONTIENE')]:
            print(f"Cargando relaciones {rel}...")
            df = pd.read_csv(f'../data/{file_name}')
            for i in range(0, len(df), 2000):
                session.execute_write(batch_load, queries[rel], df.iloc[i:i+2000].to_dict('records'))
                
    driver.close()
    print("¡Base de datos lista para el modelo de Machine Learning!")

if __name__ == "__main__":
    generar_datos_ds()
    upload_to_neo4j()