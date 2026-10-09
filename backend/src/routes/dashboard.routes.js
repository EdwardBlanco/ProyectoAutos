const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/', validarJWT, dashboardController.getDashboardData);

module.exports = router;
