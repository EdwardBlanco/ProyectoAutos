const { check } = require('express-validator');

const loginValidator = [
  check('email', 'El correo es obligatorio').isEmail(),
  check('password', 'La contraseña es obligatoria').not().isEmpty()
];

const registrarValidator = [
  check('email', 'El correo es obligatorio').isEmail(),
  check('password', 'El password debe ser de más de 6 letras').isLength({ min: 6 })
];

module.exports = {
  loginValidator,
  registrarValidator
};
