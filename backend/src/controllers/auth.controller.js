const bcryptjs = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/generar-jwt');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        message: 'Usuario / Password no son correctos - correo'
      });
    }

    if (usuario.estado === 0) {
      return res.status(400).json({
        message: 'Usuario / Password no son correctos - estado: inactivo'
      });
    }

    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        message: 'Usuario / Password no son correctos - password'
      });
    }

    const token = await generarJWT(usuario.id);

    res.json({
      usuario,
      token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Hable con el administrador'
    });
  }
};

const registrar = async (req, res) => {
  const { email, password } = req.body;

  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({
        message: 'Un usuario ya existe con ese correo'
      });
    }

    usuario = new Usuario({ email, password });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();

    // Generar JWT
    const token = await generarJWT(usuario.id);

    res.status(201).json({
      usuario,
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Hable con el administrador'
    });
  }
};

module.exports = {
  login,
  registrar
};
