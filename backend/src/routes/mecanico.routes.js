const express = require('express');
const router = express.Router();
const mecanicoController = require('../controllers/mecanico.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
  crearMecanicoValidator, 
  actualizarMecanicoValidator, 
  idMecanicoValidator 
} = require('../validators/mecanico.validator');

// Get all mecanicos
router.get('/', mecanicoController.getMecanicos);

// Get mecanico by ID
router.get('/:id', 
  [
    ...idMecanicoValidator,
    validarCampos
  ], 
  mecanicoController.getMecanicoById
);

// Create mecanico (Protected)
router.post('/', 
  [
    validarJWT,
    ...crearMecanicoValidator,
    validarCampos
  ], 
  mecanicoController.createMecanico
);

// Update mecanico (Protected)
router.put('/:id', 
  [
    validarJWT,
    ...idMecanicoValidator,
    ...actualizarMecanicoValidator,
    validarCampos
  ], 
  mecanicoController.updateMecanico
);

// Delete mecanico (Protected)
router.delete('/:id', 
  [
    validarJWT,
    ...idMecanicoValidator,
    validarCampos
  ], 
  mecanicoController.deleteMecanico
);

module.exports = router;
