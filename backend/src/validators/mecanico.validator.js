const { check, param } = require('express-validator');

const crearMecanicoValidator = [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('nombre').isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres'),
  check('especialidad', 'La especialidad es obligatoria').not().isEmpty(),
  check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
];

const actualizarMecanicoValidator = [
  check('nombre', 'El nombre debe tener entre 2 y 60 caracteres').optional().isLength({ min: 2, max: 60 }),
  check('especialidad').optional().isString(),
  check('telefono').optional().isString()
];

const idMecanicoValidator = [
  param('id', 'El id proporcionado no es un ObjectId válido de MongoDB').isMongoId()
];

module.exports = {
  crearMecanicoValidator,
  actualizarMecanicoValidator,
  idMecanicoValidator
};
