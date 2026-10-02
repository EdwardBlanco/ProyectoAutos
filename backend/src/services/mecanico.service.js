const Mecanico = require('../models/Mecanico');

exports.createMecanico = async (data) => {
  const mecanico = new Mecanico(data);
  return await mecanico.save();
};

exports.getMecanicos = async () => {
  return await Mecanico.find();
};

exports.getMecanicoById = async (id) => {
  return await Mecanico.findById(id);
};

exports.updateMecanico = async (id, data) => {
  return await Mecanico.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteMecanico = async (id) => {
  return await Mecanico.findByIdAndDelete(id);
};
