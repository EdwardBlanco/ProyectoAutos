const mongoose = require('mongoose');

const mecanicoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especialidad: { type: String, required: true },
  telefono: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Mecanico', mecanicoSchema);
