const mecanicoService = require('../services/mecanico.service');

exports.createMecanico = async (req, res) => {
  try {
    const { nombre, especialidad, telefono, cedula, correo } = req.body;
    const mecanico = await mecanicoService.createMecanico({ nombre, especialidad, telefono, cedula, correo });
    res.status(201).json(mecanico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMecanicos = async (req, res) => {
  try {
    const mecanicos = await mecanicoService.getMecanicos();
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
    const { nombre, especialidad, telefono, cedula, correo } = req.body;
    const mecanico = await mecanicoService.updateMecanico(req.params.id, { nombre, especialidad, telefono, cedula, correo });
    if (!mecanico) return res.status(404).json({ message: 'Mecánico no encontrado' });
    res.json(mecanico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMecanico = async (req, res) => {
  try {
    const mecanico = await mecanicoService.deleteMecanico(req.params.id);
    if (!mecanico) return res.status(404).json({ message: 'Mecánico no encontrado' });
    res.json({ message: 'Mecánico eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
