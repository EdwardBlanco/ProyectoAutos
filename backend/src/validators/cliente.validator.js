const { check, param } = require('express-validator');

const crearClienteValidator = [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('nombre').isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
  check('correo', 'El correo es obligatorio').isEmail().withMessage('Debe ser un correo válido'),
  check('direccion', 'La dirección es obligatoria').not().isEmpty(),
  check('cedula', 'La cédula es obligatoria').not().isEmpty()
];

const actualizarClienteValidator = [
  check('nombre').optional().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  check('telefono').optional().isString(),
  check('correo').optional().isEmail().withMessage('Debe ser un correo válido'),
  check('direccion').optional().isString(),
  check('cedula').optional().isString()
];

const idClienteValidator = [
  param('id', 'El id proporcionado no es un ObjectId válido de MongoDB').isMongoId()
];

module.exports = {
  crearClienteValidator,
  actualizarClienteValidator,
  idClienteValidator
};
