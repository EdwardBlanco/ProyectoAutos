const mongoose = require('mongoose');
const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');
const { regexBusqueda, leerLimite } = require('../helpers/busqueda');
const { errorHttp } = require('../helpers/errores');

// Evita registrar dos clientes con la misma cédula
const validarCedulaUnica = async (cedula, excluirId = null) => {
  if (!cedula) return;
  const filtro = { cedula: String(cedula).trim() };
  if (excluirId) filtro._id = { $ne: excluirId };
  const existente = await Cliente.findOne(filtro, 'nombre').lean();
  if (existente) {
    throw errorHttp(`Ya existe un cliente con la cédula ${cedula} (${existente.nombre}).`, 409);
  }
};

const limpiar = (data) => {
  // "vehiculos" es un campo calculado; no se persiste en el cliente
  const { vehiculos, vehiculosCount, _id, ...resto } = data;
  if (resto.cedula) resto.cedula = String(resto.cedula).trim();
  return resto;
};

exports.createCliente = async (data) => {
  await validarCedulaUnica(data.cedula);
  const cliente = new Cliente(limpiar(data));
  return await cliente.save();
};

// Filtros soportados: q (nombre, cédula, teléfono, correo), limit.
// Cada cliente incluye sus vehículos (placa, marca, modelo) para mostrarlos y actuar sobre ellos.
exports.getClientes = async (query = {}) => {
  const filtro = {};
  const rx = regexBusqueda(query.q);
  if (rx) {
    filtro.$or = [{ nombre: rx }, { cedula: rx }, { telefono: rx }, { correo: rx }];
  }

  const pipeline = [
    { $match: filtro },
    { $sort: { nombre: 1 } }
  ];
  const limite = leerLimite(query.limit);
  if (limite) pipeline.push({ $limit: limite });
  pipeline.push(
    {
      $lookup: {
        from: Vehiculo.collection.name,
        localField: '_id',
        foreignField: 'clienteId',
        as: 'vehiculos',
        pipeline: [{ $project: { placa: 1, marca: 1, modelo: 1, anio: 1 } }, { $sort: { placa: 1 } }]
      }
    },
    { $addFields: { vehiculosCount: { $size: '$vehiculos' } } }
  );

  return await Cliente.aggregate(pipeline);
};

exports.getClienteById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const cliente = await Cliente.findById(id).lean();
  if (!cliente) return null;
  const vehiculos = await Vehiculo.find({ clienteId: id }, 'placa marca modelo anio').sort({ placa: 1 }).lean();
  return { ...cliente, vehiculos, vehiculosCount: vehiculos.length };
};

exports.updateCliente = async (id, data) => {
  await validarCedulaUnica(data.cedula, id);
  return await Cliente.findByIdAndUpdate(id, limpiar(data), { returnDocument: 'after', runValidators: true });
};

// No se permite eliminar un cliente con vehículos registrados (quedarían huérfanos)
exports.deleteCliente = async (id) => {
  const vehiculos = await Vehiculo.countDocuments({ clienteId: id });
  if (vehiculos > 0) {
    throw errorHttp(`No se puede eliminar: el cliente tiene ${vehiculos} vehículo(s) registrado(s). Reasígnelos o elimínelos primero.`, 409);
  }
  return await Cliente.findByIdAndDelete(id);
};
