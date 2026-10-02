const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { 
  crearVehiculoValidator, 
  actualizarVehiculoValidator, 
  idVehiculoValidator 
} = require('../validators/vehiculo.validator');

router.get('/', vehiculoController.getVehiculos);

router.get('/:id', 
  [...idVehiculoValidator, validarCampos], 
  vehiculoController.getVehiculoById
);

router.get('/:id/expediente', 
  [...idVehiculoValidator, validarCampos], 
  vehiculoController.getExpedienteVehiculo
);

router.post('/', 
  [validarJWT, ...crearVehiculoValidator, validarCampos], 
  vehiculoController.createVehiculo
);

router.put('/:id', 
  [validarJWT, ...idVehiculoValidator, ...actualizarVehiculoValidator, validarCampos], 
  vehiculoController.updateVehiculo
);

router.delete('/:id', 
  [validarJWT, ...idVehiculoValidator, validarCampos], 
  vehiculoController.deleteVehiculo
);

module.exports = router;
