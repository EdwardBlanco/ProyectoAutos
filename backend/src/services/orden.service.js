const mongoose = require('mongoose');
const Orden = require('../models/Orden');
const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');
const Contador = require('../models/Contador');
const { ESTADOS_ACTIVOS } = require('../constants/estados');
const { regexBusqueda, leerLimite } = require('../helpers/busqueda');

// Población estándar: vehículo con su propietario y mecánico asignado
const POPULATE = [
  {
    path: 'vehiculoId',
    populate: { path: 'clienteId', select: 'nombre telefono cedula correo' }
  },
  { path: 'mecanicoId', select: 'nombre especialidad telefono' }
];

// Genera el siguiente consecutivo ORD-0001 de forma atómica.
// La primera vez inicializa el contador con el mayor número existente.
const siguienteNumeroOrden = async () => {
  const existe = await Contador.exists({ _id: 'orden' });
  if (!existe) {
    const existentes = await Orden.find({ numeroOrden: /^ORD-\d+$/ }, 'numeroOrden').lean();
    const maximo = existentes.reduce((max, o) => {
      const n = parseInt(o.numeroOrden.replace('ORD-', ''), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    await Contador.updateOne({ _id: 'orden' }, { $max: { seq: maximo } }, { upsert: true });
  }
  const contador = await Contador.findOneAndUpdate(
    { _id: 'orden' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `ORD-${contador.seq.toString().padStart(4, '0')}`;
};

const inicioDelDia = (fecha = new Date()) => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Construye el filtro de Mongo a partir de los parámetros de la URL
const construirFiltro = async (query = {}) => {
  const filtro = {};

  // estado=activos | todas | "Listo,Entregado"
  if (query.estado && query.estado !== 'todas') {
    filtro.estado = query.estado === 'activos'
      ? { $in: ESTADOS_ACTIVOS }
      : { $in: String(query.estado).split(',') };
  }

  if (query.mecanicoId && mongoose.isValidObjectId(query.mecanicoId)) {
    filtro.mecanicoId = query.mecanicoId;
  }

  if (query.vehiculoId && mongoose.isValidObjectId(query.vehiculoId)) {
    filtro.vehiculoId = query.vehiculoId;
  } else if (query.clienteId && mongoose.isValidObjectId(query.clienteId)) {
    const vehiculos = await Vehiculo.find({ clienteId: query.clienteId }, '_id').lean();
    filtro.vehiculoId = { $in: vehiculos.map(v => v._id) };
  }

  // Órdenes vencidas: activas cuya fecha estimada ya pasó
  if (query.vencidas === '1' || query.vencidas === 'true') {
    filtro.estado = { $in: ESTADOS_ACTIVOS };
    filtro.fechaEntregaEstimada = { $lt: inicioDelDia() };
  }

  // Rango de fecha de ingreso
  if (query.desde || query.hasta) {
    filtro.fechaIngreso = {};
    if (query.desde) filtro.fechaIngreso.$gte = new Date(query.desde);
    if (query.hasta) filtro.fechaIngreso.$lt = new Date(query.hasta);
  }

  // Búsqueda libre: número de orden, falla, placa o nombre/cédula del cliente
  const rx = regexBusqueda(query.q);
  if (rx) {
    const clientes = await Cliente.find({ $or: [{ nombre: rx }, { cedula: rx }] }, '_id').lean();
    const vehiculos = await Vehiculo.find({
      $or: [{ placa: rx }, { clienteId: { $in: clientes.map(c => c._id) } }]
    }, '_id').lean();
    filtro.$or = [
      { numeroOrden: rx },
      { descripcionFalla: rx },
      { vehiculoId: { $in: vehiculos.map(v => v._id) } }
    ];
  }

  return filtro;
};

exports.createOrden = async (data, usuario) => {
  const numeroOrden = await siguienteNumeroOrden();
  const estado = data.estado || 'En diagnóstico';

  const orden = new Orden({
    ...data,
    numeroOrden,
    estado,
    historialEstados: [{ estado, usuario, nota: 'Orden creada' }]
  });
  await orden.save();
  return await Orden.findById(orden._id).populate(POPULATE);
};

exports.getOrdenes = async (query = {}) => {
  const filtro = await construirFiltro(query);
  const consulta = Orden.find(filtro)
    .populate(POPULATE)
    .sort({ fechaIngreso: -1 });

  const limite = leerLimite(query.limit);
  if (limite) consulta.limit(limite);

  return await consulta;
};

exports.getOrdenById = async (id) => {
  return await Orden.findById(id).populate(POPULATE);
};

// Cambia el estado registrando el historial y la fecha real de entrega
exports.updateEstadoOrden = async (id, estado, { usuario, nota } = {}) => {
  const orden = await Orden.findById(id);
  if (!orden) return null;
  if (orden.estado === estado) return await Orden.findById(id).populate(POPULATE);

  orden.estado = estado;
  orden.historialEstados.push({ estado, usuario, nota });
  if (estado === 'Entregada') orden.fechaEntregaReal = new Date();
  else orden.fechaEntregaReal = undefined;

  await orden.save();
  return await Orden.findById(id).populate(POPULATE);
};

exports.updateOrden = async (id, data, usuario) => {
  const { numeroOrden, historialEstados, fechaEntregaReal, ...cambios } = data;
  const orden = await Orden.findById(id);
  if (!orden) return null;

  // Si el estado cambia desde el formulario de edición, también se registra en el historial
  if (cambios.estado && cambios.estado !== orden.estado) {
    orden.historialEstados.push({ estado: cambios.estado, usuario, nota: 'Editado desde formulario' });
    orden.fechaEntregaReal = cambios.estado === 'Entregada' ? new Date() : undefined;
  }

  ['vehiculoId', 'mecanicoId', 'fechaEntregaEstimada', 'descripcionFalla', 'estado', 'costoManoObra']
    .forEach((campo) => {
      if (cambios[campo] !== undefined) {
        // Si llega un objeto poblado, se guarda solo su _id
        orden[campo] = cambios[campo]?._id || cambios[campo];
      }
    });

  await orden.save();
  return await Orden.findById(id).populate(POPULATE);
};

exports.deleteOrden = async (id) => {
  return await Orden.findByIdAndDelete(id);
};
