const mongoose = require('mongoose');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');
const Orden = require('../models/Orden');
const { ESTADOS_ACTIVOS } = require('../constants/estados');
const { regexBusqueda, leerLimite } = require('../helpers/busqueda');
const { errorHttp, traducirDuplicado } = require('../helpers/errores');

const CAMPOS_CLIENTE = 'nombre cedula telefono correo';

// Normaliza la placa y el VIN (mayúsculas, sin espacios) para evitar duplicados visuales
const normalizar = (data) => {
  const limpio = { ...data };
  if (limpio.placa) limpio.placa = String(limpio.placa).trim().toUpperCase();
  if (limpio.vin) limpio.vin = String(limpio.vin).trim().toUpperCase();
  if (limpio.clienteId && limpio.clienteId._id) limpio.clienteId = limpio.clienteId._id;
  return limpio;
};

exports.createVehiculo = async (data) => {
  try {
    const vehiculo = new Vehiculo(normalizar(data));
    await vehiculo.save();
    return await vehiculo.populate('clienteId', CAMPOS_CLIENTE);
  } catch (error) {
    throw traducirDuplicado(error, `Ya existe un vehículo con la placa ${data.placa}`);
  }
};

// Filtros soportados: q (placa, marca, modelo, VIN, nombre/cédula del propietario), clienteId, limit
exports.getVehiculos = async (query = {}) => {
  const filtro = {};

  if (query.clienteId && mongoose.isValidObjectId(query.clienteId)) {
    filtro.clienteId = query.clienteId;
  }

  const rx = regexBusqueda(query.q);
  if (rx) {
    const clientes = await Cliente.find({ $or: [{ nombre: rx }, { cedula: rx }] }, '_id').lean();
    filtro.$or = [
      { placa: rx },
      { marca: rx },
      { modelo: rx },
      { vin: rx },
      { clienteId: { $in: clientes.map(c => c._id) } }
    ];
  }

  const consulta = Vehiculo.find(filtro)
    .populate('clienteId', CAMPOS_CLIENTE)
    .sort({ placa: 1 });

  const limite = leerLimite(query.limit);
  if (limite) consulta.limit(limite);

  const vehiculos = await consulta.lean();

  // Marca los vehículos que tienen una orden activa en el taller
  const activas = await Orden.find(
    { vehiculoId: { $in: vehiculos.map(v => v._id) }, estado: { $in: ESTADOS_ACTIVOS } },
    'vehiculoId numeroOrden estado'
  ).lean();
  const porVehiculo = new Map(activas.map(o => [String(o.vehiculoId), o]));

  return vehiculos.map(v => ({
    ...v,
    ordenActiva: porVehiculo.get(String(v._id)) || null
  }));
};

exports.getVehiculoById = async (id) => {
  return await Vehiculo.findById(id).populate('clienteId', CAMPOS_CLIENTE);
};

exports.getExpedienteVehiculo = async (id) => {
  const vehiculo = await Vehiculo.findById(id);
  if (!vehiculo) throw new Error('Vehículo no encontrado');
  
  const cliente = await Cliente.findById(vehiculo.clienteId);
  const historial = await Orden.find({ vehiculoId: id })
    .populate('mecanicoId', 'nombre especialidad')
    .sort({ fechaIngreso: -1 });

  return {
    vehiculo,
    cliente,
    historial
  };
};

exports.updateVehiculo = async (id, data) => {
  try {
    return await Vehiculo.findByIdAndUpdate(id, normalizar(data), { returnDocument: 'after', runValidators: true })
      .populate('clienteId', CAMPOS_CLIENTE);
  } catch (error) {
    throw traducirDuplicado(error, `Ya existe un vehículo con la placa ${data.placa}`);
  }
};

// No se permite eliminar un vehículo con historial de órdenes (se perdería la trazabilidad)
exports.deleteVehiculo = async (id) => {
  const ordenes = await Orden.countDocuments({ vehiculoId: id });
  if (ordenes > 0) {
    throw errorHttp(`No se puede eliminar: el vehículo tiene ${ordenes} orden(es) en su historial.`, 409);
  }
  return await Vehiculo.findByIdAndDelete(id);
};
