const mongoose = require('mongoose');

const bahiaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre de la bahía es obligatorio'], 
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'], 
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres'] 
  },
  tipo: { 
    type: String, 
    required: [true, 'El tipo o descripción de la bahía es obligatorio'], 
    minlength: [3, 'El tipo debe tener al menos 3 caracteres'] 
  },
  estado: { 
    type: String, 
    enum: {
      values: ['Disponible', 'Ocupada', 'Mantenimiento'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'Disponible'
  }
}, { timestamps: true });

module.exports = mongoose.model('Bahia', bahiaSchema);
