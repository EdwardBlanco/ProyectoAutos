const ordenService = require('../services/orden.service');

exports.createOrden = async (req, res) => {
  try {
    const orden = await ordenService.createOrden(req.body);
    res.status(201).json(orden);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getOrdenes = async (req, res) => {
  try {
    const ordenes = await ordenService.getOrdenes(req.query);
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdenById = async (req, res) => {
  try {
    const orden = await ordenService.getOrdenById(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(orden);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEstadoOrden = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ message: 'Estado es requerido' });

    const orden = await ordenService.updateEstadoOrden(req.params.id, estado);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    
    res.json(orden);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrden = async (req, res) => {
  try {
    const orden = await ordenService.updateOrden(req.params.id, req.body);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(orden);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOrden = async (req, res) => {
  try {
    const orden = await ordenService.deleteOrden(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
