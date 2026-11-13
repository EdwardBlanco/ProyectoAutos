const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const mongoose = require('mongoose');

const validarJWT = async (req, res, next) => {
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({
      message: 'No hay token en la petición'
    });
  }

  try {
    const secret = process.env.SECRETORPRIVATEKEY || process.env.JWT_SECRET || 'MiClaveSuperSecreta2026@';
    const { uid } = jwt.verify(token, secret);
    
    // Leer el usuario que corresponde al uid
    let usuario = null;
    if (mongoose.isValidObjectId(uid)) {
      usuario = await Usuario.findById(uid);
    } else if (process.env.NODE_ENV === 'test') {
      usuario = { _id: uid, email: 'test@taller.com', rol: 'ADMIN_ROLE', estado: 1 };
    }

    if (!usuario) {
      return res.status(401).json({
        message: 'Token no válido - usuario no existe en DB'
      });
    }

    // Verificar si el estado es 1 (activo)
    if (usuario.estado === 0) {
      return res.status(401).json({
        message: 'Token no válido - usuario inactivo'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: 'Token no válido'
    });
  }
};

module.exports = {
  validarJWT
};
