const mecanicoService = require('../services/mecanico.service');

exports.createMecanico = async (req, res) => {
  try {
    const mecanico = await mecanicoService.createMecanico(req.body);
    res.status(201).json(mecanico);
  } catch (error) {
    const errorProcesado = require('../helpers/errores').procesarErrorMongoose(error);
    res.status(errorProcesado.status || 400).json({ message: errorProcesado.message });
  }
};

exports.getMecanicos = async (req, res) => {
  try {
    const mecanicos = await mecanicoService.getMecanicos(req.query);
    res.json(mecanicos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMecanicoById = async (req, res) => {
  try {
    const mecanico = await mecanicoService.getMecanicoById(req.params.id);
    if (!mecanico) return res.status(404).json({ message: 'Mecánico no encontrado' });
    res.json(mecanico);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMecanico = async (req, res) => {
  try {
    const mecanico = await mecanicoService.updateMecanico(req.params.id, req.body);
    if (!mecanico) return res.status(404).json({ message: 'Mecánico no encontrado' });
    res.json(mecanico);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.deleteMecanico = async (req, res) => {
  try {
    const mecanico = await mecanicoService.deleteMecanico(req.params.id);
    if (!mecanico) return res.status(404).json({ message: 'Mecánico no encontrado' });
    res.json({ message: 'Mecánico eliminado correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
