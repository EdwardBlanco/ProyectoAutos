const jwt = require('jsonwebtoken');

const generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = { uid };
    const secret = process.env.SECRETORPRIVATEKEY || process.env.JWT_SECRET || 'MiClaveSuperSecreta2026@';
    jwt.sign(payload, secret, {
      expiresIn: '4h'
    }, (err, token) => {
      if (err) {
        console.log(err);
        reject('No se pudo generar el token');
      } else {
        resolve(token);
      }
    });
  });
};

module.exports = {
  generarJWT
};
