const mongoose = require('mongoose');
const Mecanico = require('../models/Mecanico');
const Orden = require('../models/Orden');
const { regexBusqueda, leerLimite } = require('../helpers/busqueda');
const { ESTADOS_ACTIVOS } = require('../constants/estados');
const { errorHttp } = require('../helpers/errores');

const validarCedulaUnica = async (cedula, excluirId = null) => {
  if (!cedula) return;
  const filtro = { cedula: String(cedula).trim() };
  if (excluirId) filtro._id = { $ne: excluirId };
  const existente = await Mecanico.findOne(filtro, 'nombre').lean();
  if (existente) {
    throw errorHttp(`Ya existe un mecánico con la cédula ${cedula} (${existente.nombre}).`, 409);
  }
};

const limpiar = (data) => {
  const { ordenesActivas, ...resto } = data;
  if (resto.cedula) resto.cedula = String(resto.cedula).trim();
  return resto;
};

exports.createMecanico = async (data) => {
  await validarCedulaUnica(data.cedula);
  const mecanico = new Mecanico(limpiar(data));
  return await mecanico.save();
};

// Filtros soportados: q (nombre, especialidad, cédula, teléfono, correo), especialidad, limit
// Retorna la cantidad de órdenes activas de cada mecánico para ayudar en la asignación
exports.getMecanicos = async (query = {}) => {
  const filtro = {};

  if (query.especialidad) {
    filtro.especialidad = regexBusqueda(query.especialidad); // Búsqueda parcial (ej. "Motor")
  }

  const rx = regexBusqueda(query.q);
  if (rx) {
    filtro.$or = [
      { nombre: rx }, { especialidad: rx }, { cedula: rx }, { telefono: rx }, { correo: rx }
    ];
  }

  const consulta = Mecanico.find(filtro).sort({ nombre: 1 });
  const limite = leerLimite(query.limit);
  if (limite) consulta.limit(limite);
  
  const mecanicos = await consulta.lean();

  // Obtener órdenes activas completas para cada mecánico
  const ordenesActivas = await Orden.find({
    mecanicoId: { $in: mecanicos.map(m => m._id) },
    estado: { $in: ESTADOS_ACTIVOS }
  }).populate('vehiculoId', 'placa').lean();

  const ordenesPorMecanico = new Map(mecanicos.map(m => [String(m._id), []]));
  ordenesActivas.forEach(o => {
    ordenesPorMecanico.get(String(o.mecanicoId)).push(o);
  });

  return mecanicos.map(m => {
    const lista = ordenesPorMecanico.get(String(m._id));
    return {
      ...m,
      ordenesActivas: lista.length,
      ordenesLista: lista
    };
  });
};

exports.getMecanicoById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const mecanico = await Mecanico.findById(id).lean();
  if (!mecanico) return null;

  const ordenesLista = await Orden.find({
    mecanicoId: id,
    estado: { $in: ESTADOS_ACTIVOS }
  }).populate('vehiculoId', 'placa').lean();
  
  return { ...mecanico, ordenesActivas: ordenesLista.length, ordenesLista };
};

exports.updateMecanico = async (id, data) => {
  await validarCedulaUnica(data.cedula, id);
  return await Mecanico.findByIdAndUpdate(id, limpiar(data), { returnDocument: 'after', runValidators: true });
};

// Evita eliminar un mecánico con órdenes (históricas o activas)
exports.deleteMecanico = async (id) => {
  const ordenes = await Orden.countDocuments({ mecanicoId: id });
  if (ordenes > 0) {
    throw errorHttp(`No se puede eliminar: el mecánico tiene ${ordenes} orden(es) asignada(s) (activas o finalizadas).`, 409);
  }
  return await Mecanico.findByIdAndDelete(id);
};
