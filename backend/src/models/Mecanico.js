const mongoose = require('mongoose');

const mecanicoSchema = new mongoose.Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], minlength: [3, 'El nombre debe tener al menos 3 caracteres'], maxlength: [100, 'El nombre no puede exceder los 100 caracteres'] },
  especialidad: { type: String, required: [true, 'La especialidad es obligatoria'], minlength: [3, 'La especialidad debe tener al menos 3 caracteres'] },
  telefono: { type: String, required: [true, 'El teléfono es obligatorio'], match: [/^[0-9+() -]{7,20}$/, 'El teléfono es inválido'] },
  cedula: { type: String, required: [true, 'La cédula es obligatoria'], match: [/^[a-zA-Z0-9-]{5,20}$/, 'La cédula debe tener entre 5 y 20 caracteres'] },
  correo: { type: String, required: [true, 'El correo es obligatorio'], match: [/^\S+@\S+\.\S+$/, 'El formato del correo es inválido'] }
}, { timestamps: true });

module.exports = mongoose.model('Mecanico', mecanicoSchema);
