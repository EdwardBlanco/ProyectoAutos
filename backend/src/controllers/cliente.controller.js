const clienteService = require('../services/cliente.service');

exports.createCliente = async (req, res) => {
  try {
    const cliente = await clienteService.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const clientes = await clienteService.getClientes();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClienteById = async (req, res) => {
  try {
    const cliente = await clienteService.getClienteById(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const cliente = await clienteService.updateCliente(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await clienteService.deleteCliente(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
