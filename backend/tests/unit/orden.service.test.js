const mongoose = require('mongoose');
const ordenService = require('../../src/services/orden.service');
const Orden = require('../../src/models/Orden');
const Contador = require('../../src/models/Contador');

jest.mock('../../src/models/Orden');
jest.mock('../../src/models/Contador');

describe('Orden Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrden', () => {
    it('debe asignar un numeroOrden autogenerado e historial inicial', async () => {
      // Mock del contador
      Contador.findOneAndUpdate.mockResolvedValue({ seq: 125 });
      
      const payload = {
        vehiculoId: new mongoose.Types.ObjectId(),
        descripcionFalla: 'Falla en frenos'
      };

      // Mock de find().lean() para el inicializador del contador
      Orden.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      // Mock del save
      const mockSave = jest.fn().mockResolvedValue({
        ...payload,
        numeroOrden: 'ORD-125',
        estado: 'Recepción',
        historialEstados: [{ estado: 'Recepción', fecha: new Date() }]
      });

      Orden.mockImplementation(() => ({ save: mockSave, _id: 'ord123' }));
      Orden.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          numeroOrden: 'ORD-125',
          historialEstados: [{ estado: 'Recepción' }]
        })
      });

      const result = await ordenService.createOrden(payload);

      expect(Contador.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'orden' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('updateEstadoOrden', () => {
    it('debe agregar el nuevo estado al historial', async () => {
      const mockOrden = {
        _id: '123',
        estado: 'Recepción',
        historialEstados: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      const queryMock = {
        populate: jest.fn().mockResolvedValue(mockOrden),
        then: function(resolve) { resolve(mockOrden); }
      };
      Orden.findById.mockReturnValue(queryMock);

      await ordenService.updateEstadoOrden('123', 'En diagnóstico');

      expect(mockOrden.estado).toBe('En diagnóstico');
      expect(mockOrden.historialEstados.length).toBe(1);
      expect(mockOrden.historialEstados[0].estado).toBe('En diagnóstico');
      expect(mockOrden.save).toHaveBeenCalled();
    });
  });
});
