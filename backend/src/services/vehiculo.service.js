const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');
const Orden = require('../models/Orden');

exports.createVehiculo = async (data) => {
  const vehiculo = new Vehiculo(data);
  return await vehiculo.save();
};

exports.getVehiculos = async (query = {}) => {
  return await Vehiculo.find(query).populate('clienteId');
};

exports.getVehiculoById = async (id) => {
  return await Vehiculo.findById(id).populate('clienteId');
};

exports.getExpedienteVehiculo = async (id) => {
  const vehiculo = await Vehiculo.findById(id);
  if (!vehiculo) throw new Error('Vehículo no encontrado');
  
  const cliente = await Cliente.findById(vehiculo.clienteId);
  const historial = await Orden.find({ vehiculoId: id }).sort({ fechaIngreso: -1 });

  return {
    vehiculo,
    cliente,
    historial
  };
};

exports.updateVehiculo = async (id, data) => {
  return await Vehiculo.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteVehiculo = async (id) => {
  return await Vehiculo.findByIdAndDelete(id);
};
