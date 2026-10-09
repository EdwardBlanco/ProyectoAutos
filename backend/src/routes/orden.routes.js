const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/orden.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
  crearOrdenValidator, 
  actualizarOrdenValidator, 
  estadoOrdenValidator,
  idOrdenValidator 
} = require('../validators/orden.validator');

// Filtros soportados: ?estado=activos|todas|Listo,Entregado &mecanicoId= &vehiculoId= &clienteId= &vencidas=1 &q= &limit=
router.get('/', validarJWT, ordenController.getOrdenes);

router.get('/:id', 
  [validarJWT, ...idOrdenValidator, validarCampos], 
  ordenController.getOrdenById
);

router.post('/', 
  [validarJWT, ...crearOrdenValidator, validarCampos], 
  ordenController.createOrden
);

router.patch('/:id/estado', 
  [validarJWT, ...idOrdenValidator, ...estadoOrdenValidator, validarCampos], 
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
