const mongoose = require('mongoose');

// Contador atómico para generar consecutivos (ej. número de orden) sin colisiones
const contadorSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}, { versionKey: false });

module.exports = mongoose.model('Contador', contadorSchema);
