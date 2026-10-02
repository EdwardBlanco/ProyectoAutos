const Orden = require('../models/Orden');

exports.createOrden = async (data) => {
  const count = await Orden.countDocuments();
  const numeroOrden = `ORD-${(count + 1).toString().padStart(4, '0')}`;
  
  const orden = new Orden({ ...data, numeroOrden });
  return await orden.save();
};

exports.getOrdenes = async (query = {}) => {
  return await Orden.find(query)
    .populate('vehiculoId')
    .populate('mecanicoId')
    .sort({ fechaIngreso: -1 });
};

exports.getOrdenById = async (id) => {
  return await Orden.findById(id)
    .populate('vehiculoId')
    .populate('mecanicoId');
};

exports.updateEstadoOrden = async (id, estado) => {
  return await Orden.findByIdAndUpdate(id, { estado }, { new: true });
};

exports.updateOrden = async (id, data) => {
  return await Orden.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteOrden = async (id) => {
  return await Orden.findByIdAndDelete(id);
};
