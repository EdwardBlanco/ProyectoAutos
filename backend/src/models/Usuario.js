const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  estado: { type: Number, default: 1 }, // 1 activo, 0 inactivo
  cedula: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
