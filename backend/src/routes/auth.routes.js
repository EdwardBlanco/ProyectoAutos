const { Router } = require('express');
const { login, registrar } = require('../controllers/auth.controller');
const { loginValidator, registrarValidator } = require('../validators/auth.validator');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.post('/login', [
  ...loginValidator,
  validarCampos
], login);

router.post('/register', [
  ...registrarValidator,
  validarCampos
], registrar);

module.exports = router;
