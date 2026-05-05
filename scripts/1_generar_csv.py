import pandas as pd
from faker import Faker
import random
import os
import uuid

# Usamos español para que la data tenga sentido
fake = Faker('es_MX')
os.makedirs('../data', exist_ok=True)

# Helper para fechas
def random_date(start='-2y', end='today'):
    return fake.date_between(start_date=start, end_date=end).isoformat()

# ==========================================
# 1. GENERACIÓN DE NODOS
# ==========================================

def generar_nodos():
    print("Generando nodos...")
    
    # 1. Proveedores (100)
    proveedores = [{'id': str(uuid.uuid4()), 'nombre': fake.company(), 'pais': fake.country(), 
                    'calificacion': round(random.uniform(1.0, 5.0), 2), 'activo': fake.boolean(chance_of_getting_true=90), 
                    'fechaRegistro': random_date('-5y', '-1y'), 
                    'categorias': "|".join(fake.words(nb=3))} for _ in range(100)]
    
    # 2. Categorias (150)
    categorias = [{'id': str(uuid.uuid4()), 'nombre': fake.word().capitalize(), 'descripcion': fake.sentence(), 
                   'impuesto': round(random.uniform(0.05, 0.20), 2), 'regulada': fake.boolean(chance_of_getting_true=30), 
                   'subcategorias': "|".join(fake.words(nb=2))} for _ in range(150)]
    
    # 3. Productos (2500)
    productos = [{'id': str(uuid.uuid4()), 'nombre': fake.catch_phrase(), 'precio': round(random.uniform(10.0, 5000.0), 2), 
                  'peso': random.randint(1, 500), 'enStock': fake.boolean(chance_of_getting_true=80), 
                  'fechaVencimiento': random_date('today', '+2y'), 
                  'tags': "|".join(fake.words(nb=4))} for _ in range(2500)]
    
    # 4. Almacenes (50)
    almacenes = [{'id': str(uuid.uuid4()), 'nombre': f"Bodega {fake.city()}", 'ubicacion': fake.address().replace('\n', ', '), 
                  'capacidad': random.randint(1000, 50000), 'temperatura': round(random.uniform(-10.0, 30.0), 1), 
                  'activo': fake.boolean(chance_of_getting_true=95), 
                  'coordenadas': f"{fake.latitude()},{fake.longitude()}"} for _ in range(50)]
    
    # 5. Clientes (1500)
    clientes = [{'id': str(uuid.uuid4()), 'nombre': fake.name(), 'segmento': random.choice(['Retail', 'Mayorista', 'VIP']), 
                 'creditoAprobado': round(random.uniform(1000.0, 50000.0), 2), 'pais': fake.country(), 
                 'fechaAlta': random_date('-3y', 'today'), 
                 'etiquetas': "|".join(fake.words(nb=2))} for _ in range(1500)]
    
    # 6. Transportes (100)
    transportes = [{'id': str(uuid.uuid4()), 'tipo': random.choice(['Camion', 'Furgoneta', 'Moto', 'Trailer']), 
                    'capacidadKg': random.randint(500, 20000), 'disponible': fake.boolean(chance_of_getting_true=70), 
                    'matricula': fake.license_plate(), 'rutasActivas': "|".join([fake.city(), fake.city()]), 
                    'fechaRevision': random_date('-6m', 'today')} for _ in range(100)]
    
    # 7. Ordenes (1000)
    ordenes = [{'id': str(uuid.uuid4()), 'fecha': random_date('-1y', 'today'), 'total': round(random.uniform(100.0, 10000.0), 2), 
                'estado': random.choice(['Pendiente', 'En Transito', 'Entregada', 'Cancelada']), 
                'urgente': fake.boolean(chance_of_getting_true=20), 'items': "|".join([str(uuid.uuid4())[:8], str(uuid.uuid4())[:8]]), 
                'fechaEntrega': random_date('today', '+1m')} for _ in range(1000)]

    # Guardar en CSV
    dfs = {
        'proveedores': pd.DataFrame(proveedores), 'categorias': pd.DataFrame(categorias),
        'productos': pd.DataFrame(productos), 'almacenes': pd.DataFrame(almacenes),
        'clientes': pd.DataFrame(clientes), 'transportes': pd.DataFrame(transportes),
        'ordenes': pd.DataFrame(ordenes)
    }
    
    for nombre, df in dfs.items():
        df.to_csv(f'../data/{nombre}.csv', index=False)
        
    return dfs

# ==========================================
# 2. GENERACIÓN DE RELACIONES
# ==========================================

def generar_relaciones(dfs):
    print("Generando relaciones...")
    relaciones = {name: [] for name in [
        'suministra', 'almacena', 'contiene', 'realiza', 'transporta', 
        'envia_a', 'pertenece_a', 'abastece', 'gestiona', 'conecta', 'distribuye', 'reemplaza'
    ]}

    # Extraemos las listas de IDs para hacer las conexiones
    prov_ids = dfs['proveedores']['id'].tolist()
    prod_ids = dfs['productos']['id'].tolist()
    alm_ids = dfs['almacenes']['id'].tolist()
    ord_ids = dfs['ordenes']['id'].tolist()
    cli_ids = dfs['clientes']['id'].tolist()
    trans_ids = dfs['transportes']['id'].tolist()
    cat_ids = dfs['categorias']['id'].tolist()

    # SUMINISTRA (Proveedor -> Producto)
    for prod in prod_ids:
        relaciones['suministra'].append({'origen': random.choice(prov_ids), 'destino': prod, 'precioAcordado': round(random.uniform(5.0, 1000.0), 2), 'plazoEntregaDias': random.randint(2, 30), 'contrato': fake.boolean()})

    # ALMACENA (Almacen -> Producto)
    for prod in prod_ids:
        relaciones['almacena'].append({'origen': random.choice(alm_ids), 'destino': prod, 'cantidad': random.randint(0, 1000), 'fechaIngreso': random_date('-6m', 'today'), 'ubicacionInterna': f"Pasillo {random.randint(1, 20)}"})

    # CONTIENE (Orden -> Producto) - Asignamos entre 1 y 5 productos por orden
    for orden in ord_ids:
        for _ in range(random.randint(1, 5)):
            relaciones['contiene'].append({'origen': orden, 'destino': random.choice(prod_ids), 'cantidad': random.randint(1, 50), 'precioUnitario': round(random.uniform(5.0, 500.0), 2), 'descuento': round(random.uniform(0.0, 0.3), 2)})

    # REALIZA (Cliente -> Orden) - Cada orden es de un cliente
    for orden in ord_ids:
        relaciones['realiza'].append({'origen': random.choice(cli_ids), 'destino': orden, 'fechaPedido': random_date('-1y', 'today'), 'metodoPago': random.choice(['Tarjeta', 'Transferencia', 'Efectivo']), 'aprobada': fake.boolean(chance_of_getting_true=90)})

    # TRANSPORTA (Transporte -> Orden)
    for orden in ord_ids:
        relaciones['transporta'].append({'origen': random.choice(trans_ids), 'destino': orden, 'fechaSalida': random_date('-1m', 'today'), 'fechaLlegada': random_date('today', '+1m'), 'costo': round(random.uniform(20.0, 500.0), 2)})

    # ENVIA_A (Almacen -> Almacen) - Conectamos algunos almacenes entre sí
    for alm in alm_ids:
        destinos = random.sample([a for a in alm_ids if a != alm], k=random.randint(1, 3))
        for dest in destinos:
            relaciones['envia_a'].append({'origen': alm, 'destino': dest, 'distanciaKm': round(random.uniform(10.0, 500.0), 2), 'tiempoHoras': random.randint(1, 24), 'costoFlete': round(random.uniform(50.0, 1000.0), 2)})

    # PERTENECE_A (Producto -> Categoria)
    for prod in prod_ids:
        relaciones['pertenece_a'].append({'origen': prod, 'destino': random.choice(cat_ids), 'fechaAsignacion': random_date('-2y', 'today'), 'principal': fake.boolean(chance_of_getting_true=80), 'orden': random.randint(1, 10)})

    # ABASTECE (Proveedor -> Almacen)
    for prov in prov_ids:
        destinos = random.sample(alm_ids, k=random.randint(1, 5))
        for dest in destinos:
            relaciones['abastece'].append({'origen': prov, 'destino': dest, 'frecuencia': random.choice(['Diaria', 'Semanal', 'Mensual']), 'volumenMensual': random.randint(100, 10000), 'prioridad': random.randint(1, 3)})

    # GESTIONA (Almacen -> Orden)
    for orden in ord_ids:
        relaciones['gestiona'].append({'origen': random.choice(alm_ids), 'destino': orden, 'fechaDespacho': random_date('-1m', 'today'), 'responsable': fake.name(), 'estado': random.choice(['Preparando', 'Listo', 'Enviado'])})

    # CONECTA (Almacen -> Transporte)
    for trans in trans_ids:
        destinos = random.sample(alm_ids, k=random.randint(1, 3))
        for dest in destinos:
            relaciones['conecta'].append({'origen': dest, 'destino': trans, 'fechaAsignacion': random_date('-1m', 'today'), 'disponibilidad': fake.boolean(chance_of_getting_true=80), 'contrato': str(uuid.uuid4())[:8]})

    # DISTRIBUYE (Transporte -> Cliente)
    for orden in ord_ids: # Usamos las órdenes para inferir distribución, pero mantenemos simpleza
        relaciones['distribuye'].append({'origen': random.choice(trans_ids), 'destino': random.choice(cli_ids), 'ruta': f"Ruta-{random.randint(1,50)}", 'estimadoEntrega': random_date('today', '+7d'), 'firmado': fake.boolean()})

    # REEMPLAZA (Producto -> Producto) - Simulamos versiones nuevas de productos
    para_reemplazar = random.sample(prod_ids, k=200)
    for prod in para_reemplazar:
        nuevo_prod = random.choice([p for p in prod_ids if p != prod])
        relaciones['reemplaza'].append({'origen': prod, 'destino': nuevo_prod, 'motivo': random.choice(['Descontinuado', 'Mejora', 'Falla']), 'fechaVigencia': random_date('today', '+6m'), 'aprobado': fake.boolean()})

    # Guardar en CSV
    for nombre, lista in relaciones.items():
        pd.DataFrame(lista).to_csv(f'../data/rel_{nombre}.csv', index=False)

if __name__ == "__main__":
    dfs = generar_nodos()
    generar_relaciones(dfs)
    print("¡Todos los datos fueron generados correctamente!")