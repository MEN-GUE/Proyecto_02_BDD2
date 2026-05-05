import pandas as pd
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI")
AUTH = (os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))

# ==========================================
# FUNCIONES DE CARGA DE NODOS
# ==========================================
def cargar_nodos(tx, df, label, queries_set):
    records = df.to_dict('records')
    # Transformamos las cadenas separadas por "|" en listas reales para que Neo4j las guarde como Array
    for r in records:
        for key in ['categorias', 'subcategorias', 'tags', 'etiquetas', 'rutasActivas', 'items']:
            if key in r and isinstance(r[key], str):
                r[key] = r[key].split('|')
                
    query = f"""
    UNWIND $registros AS row
    MERGE (n:{label} {{id: row.id}})
    SET {queries_set}
    """
    tx.run(query, registros=records)

# ==========================================
# FUNCIONES DE CARGA DE RELACIONES
# ==========================================
def cargar_relaciones(tx, df, origen_label, destino_label, tipo_relacion, queries_set):
    records = df.to_dict('records')
    query = f"""
    UNWIND $registros AS row
    MATCH (origen:{origen_label} {{id: row.origen}})
    MATCH (destino:{destino_label} {{id: row.destino}})
    MERGE (origen)-[r:{tipo_relacion}]->(destino)
    SET {queries_set}
    """
    tx.run(query, registros=records)

if __name__ == "__main__":
    driver = GraphDatabase.driver(URI, auth=AUTH)
    
    # Mapeo de configuraciones para nodos
    config_nodos = {
        'proveedores': ('Proveedor', 'n.nombre=row.nombre, n.pais=row.pais, n.calificacion=toFloat(row.calificacion), n.activo=row.activo, n.fechaRegistro=date(row.fechaRegistro), n.categorias=row.categorias'),
        'categorias': ('Categoria', 'n.nombre=row.nombre, n.descripcion=row.descripcion, n.impuesto=toFloat(row.impuesto), n.regulada=row.regulada, n.subcategorias=row.subcategorias'),
        'productos': ('Producto', 'n.nombre=row.nombre, n.precio=toFloat(row.precio), n.peso=toInteger(row.peso), n.enStock=row.enStock, n.fechaVencimiento=date(row.fechaVencimiento), n.tags=row.tags'),
        'almacenes': ('Almacen', 'n.nombre=row.nombre, n.ubicacion=row.ubicacion, n.capacidad=toInteger(row.capacidad), n.temperatura=toFloat(row.temperatura), n.activo=row.activo, n.coordenadas=row.coordenadas'),
        'clientes': ('Cliente', 'n.nombre=row.nombre, n.segmento=row.segmento, n.creditoAprobado=toFloat(row.creditoAprobado), n.pais=row.pais, n.fechaAlta=date(row.fechaAlta), n.etiquetas=row.etiquetas'),
        'transportes': ('Transporte', 'n.tipo=row.tipo, n.capacidadKg=toInteger(row.capacidadKg), n.disponible=row.disponible, n.matricula=row.matricula, n.rutasActivas=row.rutasActivas, n.fechaRevision=date(row.fechaRevision)'),
        'ordenes': ('Orden', 'n.fecha=date(row.fecha), n.total=toFloat(row.total), n.estado=row.estado, n.urgente=row.urgente, n.items=row.items, n.fechaEntrega=date(row.fechaEntrega)')
    }

    # Mapeo de configuraciones para relaciones
    config_relaciones = {
        'suministra': ('Proveedor', 'Producto', 'SUMINISTRA', 'r.precioAcordado=toFloat(row.precioAcordado), r.plazoEntregaDias=toInteger(row.plazoEntregaDias), r.contrato=row.contrato'),
        'almacena': ('Almacen', 'Producto', 'ALMACENA', 'r.cantidad=toInteger(row.cantidad), r.fechaIngreso=date(row.fechaIngreso), r.ubicacionInterna=row.ubicacionInterna'),
        'contiene': ('Orden', 'Producto', 'CONTIENE', 'r.cantidad=toInteger(row.cantidad), r.precioUnitario=toFloat(row.precioUnitario), r.descuento=toFloat(row.descuento)'),
        'realiza': ('Cliente', 'Orden', 'REALIZA', 'r.fechaPedido=date(row.fechaPedido), r.metodoPago=row.metodoPago, r.aprobada=row.aprobada'),
        'transporta': ('Transporte', 'Orden', 'TRANSPORTA', 'r.fechaSalida=date(row.fechaSalida), r.fechaLlegada=date(row.fechaLlegada), r.costo=toFloat(row.costo)'),
        'envia_a': ('Almacen', 'Almacen', 'ENVIA_A', 'r.distanciaKm=toFloat(row.distanciaKm), r.tiempoHoras=toInteger(row.tiempoHoras), r.costoFlete=toFloat(row.costoFlete)'),
        'pertenece_a': ('Producto', 'Categoria', 'PERTENECE_A', 'r.fechaAsignacion=date(row.fechaAsignacion), r.principal=row.principal, r.orden=toInteger(row.orden)'),
        'abastece': ('Proveedor', 'Almacen', 'ABASTECE', 'r.frecuencia=row.frecuencia, r.volumenMensual=toInteger(row.volumenMensual), r.prioridad=toInteger(row.prioridad)'),
        'gestiona': ('Almacen', 'Orden', 'GESTIONA', 'r.fechaDespacho=date(row.fechaDespacho), r.responsable=row.responsable, r.estado=row.estado'),
        'conecta': ('Almacen', 'Transporte', 'CONECTA', 'r.fechaAsignacion=date(row.fechaAsignacion), r.disponibilidad=row.disponibilidad, r.contrato=row.contrato'),
        'distribuye': ('Transporte', 'Cliente', 'DISTRIBUYE', 'r.ruta=row.ruta, r.estimadoEntrega=date(row.estimadoEntrega), r.firmado=row.firmado'),
        'reemplaza': ('Producto', 'Producto', 'REEMPLAZA', 'r.motivo=row.motivo, r.fechaVigencia=date(row.fechaVigencia), r.aprobado=row.aprobado')
    }

    print("Conectando a AuraDB...")
    with driver.session() as session:
        # 1. Cargar Nodos
        for nombre_archivo, (label, set_query) in config_nodos.items():
            print(f"Cargando nodos {label}...")
            df = pd.read_csv(f'../data/{nombre_archivo}.csv')
            session.execute_write(cargar_nodos, df, label, set_query)

        # 2. Cargar Relaciones
        for nombre_archivo, (origen, destino, tipo_rel, set_query) in config_relaciones.items():
            print(f"Cargando relaciones {tipo_rel}...")
            df = pd.read_csv(f'../data/rel_{nombre_archivo}.csv')
            session.execute_write(cargar_relaciones, df, origen, destino, tipo_rel, set_query)
            
    driver.close()
    print("¡Todos los datos fueron migrados a AuraDB exitosamente!")