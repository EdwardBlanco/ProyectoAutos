// Estados del ciclo de vida de una orden de trabajo
const ESTADOS = [
  'En diagnóstico',
  'Pendiente de aprobación',
  'Esperando repuestos',
  'En reparación',
  'Listo para entrega',
  'Entregada',
  'Cancelada'
];

// Estados en los que el vehículo sigue dentro del taller
const ESTADOS_ACTIVOS = ['En diagnóstico', 'Pendiente de aprobación', 'Esperando repuestos', 'En reparación', 'Listo para entrega'];

// Estados finales (la orden ya no requiere acción)
const ESTADOS_FINALES = ['Entregada', 'Cancelada'];

module.exports = { ESTADOS, ESTADOS_ACTIVOS, ESTADOS_FINALES };
