const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
  numeroOrden: { type: String, required: true, unique: true },
  vehiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehiculo', required: true },
  mecanicoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanico', required: true },
  fechaIngreso: { type: Date, default: Date.now },
  fechaEntregaEstimada: { type: Date, required: true },
  descripcionFalla: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['En diagnóstico', 'En reparación', 'Listo', 'Entregado'],
    default: 'En diagnóstico'
  },
  costoManoObra: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Orden', ordenSchema);
