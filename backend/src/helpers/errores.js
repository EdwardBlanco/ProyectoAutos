// Crea un Error con código HTTP asociado para que el controlador responda adecuadamente
const errorHttp = (mensaje, status = 400) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// Procesa errores de validación de Mongoose
const procesarErrorMongoose = (error) => {
  if (error.name === 'ValidationError') {
    const mensajes = Object.values(error.errors).map(val => val.message);
    return errorHttp(mensajes.join('. '), 400);
  }
  return error;
};

// Traduce el error de índice único de Mongo (E11000) a un mensaje legible
const traducirDuplicado = (error, mensaje) => {
  if (error && error.code === 11000) return errorHttp(mensaje, 409);
  return procesarErrorMongoose(error);
};

module.exports = { errorHttp, procesarErrorMongoose, traducirDuplicado };
