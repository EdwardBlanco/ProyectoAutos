const { check, param } = require('express-validator');

const crearOrdenValidator = [
  check('numeroOrden', 'El número de orden es obligatorio').not().isEmpty(),
  check('vehiculoId', 'El ID del vehículo es obligatorio y debe ser un ObjectId válido').isMongoId(),
  check('mecanicoId', 'El ID del mecánico es obligatorio y debe ser un ObjectId válido').isMongoId(),
  check('fechaEntregaEstimada', 'La fecha de entrega estimada es obligatoria').isISO8601().withMessage('Debe ser una fecha válida'),
  check('descripcionFalla', 'La descripción de la falla es obligatoria').not().isEmpty(),
  check('estado').optional().isIn(['En diagnóstico', 'En reparación', 'Listo', 'Entregado']).withMessage('Estado no válido'),
  check('costoManoObra', 'El costo de mano de obra es obligatorio y debe ser numérico').isNumeric()
];

const actualizarOrdenValidator = [
  check('numeroOrden').optional().isString(),
  check('vehiculoId').optional().isMongoId(),
  check('mecanicoId').optional().isMongoId(),
  check('fechaEntregaEstimada').optional().isISO8601(),
  check('descripcionFalla').optional().isString(),
  check('estado').optional().isIn(['En diagnóstico', 'En reparación', 'Listo', 'Entregado']),
  check('costoManoObra').optional().isNumeric()
];

const idOrdenValidator = [
  param('id', 'El id proporcionado no es un ObjectId válido de MongoDB').isMongoId()
];

module.exports = {
  crearOrdenValidator,
  actualizarOrdenValidator,
  idOrdenValidator
};
