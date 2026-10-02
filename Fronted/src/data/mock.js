export const clientes = [
  { id: 1, nombre: 'Ana Morales', telefono: '310 452 1180', correo: 'ana.morales@email.com', vehiculos: 2 },
  { id: 2, nombre: 'Carlos Peña', telefono: '315 890 2241', correo: 'carlos.pena@email.com', vehiculos: 1 },
  { id: 3, nombre: 'Lucía Restrepo', telefono: '300 112 7788', correo: 'lucia.r@email.com', vehiculos: 1 },
  { id: 4, nombre: 'Jorge Díaz', telefono: '320 667 9012', correo: 'jorge.diaz@email.com', vehiculos: 3 }
]

export const vehiculos = [
  { id: 1, placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2019, cliente: 'Ana Morales' },
  { id: 2, placa: 'JKL-908', marca: 'Chevrolet', modelo: 'Onix', anio: 2021, cliente: 'Carlos Peña' },
  { id: 3, placa: 'MNO-441', marca: 'Mazda', modelo: 'CX-5', anio: 2020, cliente: 'Lucía Restrepo' },
  { id: 4, placa: 'PQR-220', marca: 'Renault', modelo: 'Duster', anio: 2018, cliente: 'Jorge Díaz' }
]

export const ordenes = [
  { id: 'OT-1042', placa: 'ABC-123', cliente: 'Ana Morales', estado: 'Diagnóstico', fecha: '02/10/2026' },
  { id: 'OT-1041', placa: 'JKL-908', cliente: 'Carlos Peña', estado: 'Reparación', fecha: '01/10/2026' },
  { id: 'OT-1039', placa: 'MNO-441', cliente: 'Lucía Restrepo', estado: 'Listo', fecha: '30/09/2026' },
  { id: 'OT-1034', placa: 'PQR-220', cliente: 'Jorge Díaz', estado: 'Entregado', fecha: '28/09/2026' }
]

export const expedientes = [
  { id: 'EXP-220', cliente: 'Ana Morales', placa: 'ABC-123', documentos: 6, actualizado: '02/10/2026' },
  { id: 'EXP-218', cliente: 'Carlos Peña', placa: 'JKL-908', documentos: 4, actualizado: '01/10/2026' },
  { id: 'EXP-211', cliente: 'Lucía Restrepo', placa: 'MNO-441', documentos: 8, actualizado: '29/09/2026' },
  { id: 'EXP-198', cliente: 'Jorge Díaz', placa: 'PQR-220', documentos: 5, actualizado: '27/09/2026' }
]
