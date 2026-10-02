const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
  crearClienteValidator, 
  actualizarClienteValidator, 
  idClienteValidator 
} = require('../validators/cliente.validator');

router.get('/', clienteController.getClientes);

router.get('/:id', 
  [...idClienteValidator, validarCampos], 
  clienteController.getClienteById
);

router.post('/', 
  [validarJWT, ...crearClienteValidator, validarCampos], 
  clienteController.createCliente
);

router.put('/:id', 
  [validarJWT, ...idClienteValidator, ...actualizarClienteValidator, validarCampos], 
  clienteController.updateCliente
);

router.delete('/:id', 
  [validarJWT, ...idClienteValidator, validarCampos], 
  clienteController.deleteCliente
);

module.exports = router;
