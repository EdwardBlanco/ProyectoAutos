const Cliente = require('../models/Cliente');

exports.createCliente = async (data) => {
  const cliente = new Cliente(data);
  return await cliente.save();
};

exports.getClientes = async () => {
  return await Cliente.find();
};

exports.getClienteById = async (id) => {
  return await Cliente.findById(id);
};

exports.updateCliente = async (id, data) => {
  return await Cliente.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteCliente = async (id) => {
  return await Cliente.findByIdAndDelete(id);
};
