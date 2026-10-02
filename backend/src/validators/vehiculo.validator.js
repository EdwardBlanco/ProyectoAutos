const { check, param } = require('express-validator');

const crearVehiculoValidator = [
  check('placa', 'La placa es obligatoria').not().isEmpty(),
  check('marca', 'La marca es obligatoria').not().isEmpty(),
  check('modelo', 'El modelo es obligatorio').not().isEmpty(),
  check('año', 'El año es obligatorio y debe ser numérico').isNumeric(),
  check('vin').optional().isString(),
  check('clienteId', 'El ID del cliente es obligatorio y debe ser un ObjectId válido').isMongoId()
];

const actualizarVehiculoValidator = [
  check('placa').optional().isString(),
  check('marca').optional().isString(),
  check('modelo').optional().isString(),
  check('año').optional().isNumeric(),
  check('vin').optional().isString(),
  check('clienteId').optional().isMongoId()
];

const idVehiculoValidator = [
  param('id', 'El id proporcionado no es un ObjectId válido de MongoDB').isMongoId()
];

module.exports = {
  crearVehiculoValidator,
  actualizarVehiculoValidator,
  idVehiculoValidator
};
