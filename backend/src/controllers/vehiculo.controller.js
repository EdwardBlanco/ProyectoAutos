const vehiculoService = require('../services/vehiculo.service');

exports.createVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.createVehiculo(req.body);
    res.status(201).json(vehiculo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getVehiculos = async (req, res) => {
  try {
    const vehiculos = await vehiculoService.getVehiculos(req.query);
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVehiculoById = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.getVehiculoById(req.params.id);
    if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpedienteVehiculo = async (req, res) => {
  try {
    const expediente = await vehiculoService.getExpedienteVehiculo(req.params.id);
    res.json(expediente);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.updateVehiculo(req.params.id, req.body);
    if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehiculo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.deleteVehiculo(req.params.id);
    if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
