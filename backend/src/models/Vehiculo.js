const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  vin: { type: String },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
