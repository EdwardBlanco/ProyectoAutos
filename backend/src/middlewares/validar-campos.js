const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      message: "Error de validación",
      errors: errores.array().map((err) => ({
        campo: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validarCampos
};
