const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/orden.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
  crearOrdenValidator, 
  actualizarOrdenValidator, 
  idOrdenValidator 
} = require('../validators/orden.validator');

router.get('/', ordenController.getOrdenes);

router.get('/:id', 
  [...idOrdenValidator, validarCampos], 
  ordenController.getOrdenById
);

router.post('/', 
  [validarJWT, ...crearOrdenValidator, validarCampos], 
  ordenController.createOrden
);

router.patch('/:id/estado', 
  [validarJWT, ...idOrdenValidator, validarCampos], 
  ordenController.updateEstadoOrden
);

router.put('/:id', 
  [validarJWT, ...idOrdenValidator, ...actualizarOrdenValidator, validarCampos], 
  ordenController.updateOrden
);

router.delete('/:id', 
  [validarJWT, ...idOrdenValidator, validarCampos], 
  ordenController.deleteOrden
);

module.exports = router;
