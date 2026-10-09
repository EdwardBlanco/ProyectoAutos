const mongoose = require('mongoose');
const clienteService = require('../../src/services/cliente.service');
const Cliente = require('../../src/models/Cliente');
const Vehiculo = require('../../src/models/Vehiculo');
const { errorHttp } = require('../../src/helpers/errores');

// Hacemos mock de Mongoose Models
jest.mock('../../src/models/Cliente');
jest.mock('../../src/models/Vehiculo');

describe('Cliente Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteCliente', () => {
    it('debe eliminar el cliente si no tiene vehículos asociados', async () => {
      Vehiculo.countDocuments.mockResolvedValue(0);
      Cliente.findByIdAndDelete.mockResolvedValue({ _id: '123', nombre: 'Test' });

      const result = await clienteService.deleteCliente('123');

      expect(Vehiculo.countDocuments).toHaveBeenCalledWith({ clienteId: '123' });
      expect(Cliente.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(result).toEqual({ _id: '123', nombre: 'Test' });
    });

    it('debe lanzar error HTTP 409 si el cliente tiene vehículos', async () => {
      Vehiculo.countDocuments.mockResolvedValue(2); // 2 vehículos

      await expect(clienteService.deleteCliente('123')).rejects.toMatchObject({
        status: 409,
        message: expect.stringContaining('tiene 2 vehículo(s) registrado(s)')
      });

      expect(Cliente.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });

  describe('getClientes', () => {
    it('debe aplicar regex y límite correctamente', async () => {
      Cliente.aggregate.mockResolvedValue([{ _id: '1', nombre: 'Eduardo' }]);

      const result = await clienteService.getClientes({ q: 'edu', limit: '5' });

      expect(Cliente.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ $match: expect.objectContaining({ $or: expect.any(Array) }) })
      ]));
      expect(result.length).toBe(1);
    });
  });
});
