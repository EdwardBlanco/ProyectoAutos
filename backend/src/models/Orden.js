const mongoose = require('mongoose');
const { ESTADOS } = require('../constants/estados');

// Registro de cada cambio de estado (línea de tiempo de la orden)
const historialEstadoSchema = new mongoose.Schema({
  estado: { type: String, enum: ESTADOS, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: String },
  nota: { type: String }
}, { _id: false });

const ordenSchema = new mongoose.Schema({
  numeroOrden: { type: String, required: true, unique: true },
  vehiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
  mecanicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanico', required: true },
  fechaIngreso: { type: Date, default: Date.now },
  fechaEntregaEstimada: { type: Date, required: true },
  fechaEntregaReal: { type: Date },
  descripcionFalla: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ESTADOS,
    default: 'En diagnóstico'
  },
  historialEstados: { type: [historialEstadoSchema], default: [] },
  costoManoObra: { type: Number, required: true }
}, { timestamps: true });

// Índices para filtros frecuentes (estado, mecánico, vehículo, fechas)
ordenSchema.index({ estado: 1, fechaEntregaEstimada: 1 });
ordenSchema.index({ mecanicoId: 1, estado: 1 });
ordenSchema.index({ vehiculoId: 1 });
ordenSchema.index({ fechaIngreso: -1 });

module.exports = mongoose.model('Orden', ordenSchema);
