const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  placa: { type: String, required: [true, 'La placa es obligatoria'], match: [/^[A-Z0-9-]{4,10}$/i, 'La placa debe tener entre 4 y 10 caracteres alfanuméricos'] },
  marca: { type: String, required: [true, 'La marca es obligatoria'], minlength: [2, 'La marca debe tener al menos 2 caracteres'] },
  modelo: { type: String, required: [true, 'El modelo es obligatorio'], minlength: [1, 'El modelo debe tener al menos 1 caracter'] },
  anio: { type: Number, required: [true, 'El año es obligatorio'], min: [1900, 'Año inválido'] },
  vin: { type: String, match: [/^[A-Z0-9]{17}$/i, 'El VIN debe tener exactamente 17 caracteres alfanuméricos'] },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: [true, 'El propietario es obligatorio'] }
}, { timestamps: true });

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
