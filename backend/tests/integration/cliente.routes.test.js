const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const Cliente = require('../../src/models/Cliente');
const jwt = require('jsonwebtoken');

describe('Cliente Routes - Integration Tests', () => {
  let token;

  beforeAll(async () => {
    // Generar un token válido para pasar el middleware
    token = jwt.sign({ uid: 'admin_test' }, process.env.JWT_SECRET || 'secret_test', { expiresIn: '1h' });
  });

  // La DB se limpia automáticamente después de cada test gracias a setup.js


  it('GET /api/clientes - Debe retornar array vacío si no hay clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('x-token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(0);
  });

  it('POST /api/clientes - Debe crear un nuevo cliente con datos válidos', async () => {
    const payload = {
      nombre: 'Juan Perez',
      cedula: '123456789',
      telefono: '3001234567',
      correo: 'juan@test.com',
      direccion: 'Av. Siempre Viva'
    };

    const res = await request(app)
      .post('/api/clientes')
      .set('x-token', token)
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nombre).toBe('Juan Perez');
  });

  it('POST /api/clientes - Debe fallar si la cédula está duplicada', async () => {
    const payload = { nombre: 'Juan Perez', cedula: '123456789', telefono: '3001234567', correo: 'juan@test.com', direccion: 'Av. Siempre Viva' };
    await new Cliente(payload).save(); // Crear uno manualmente

    const res = await request(app)
      .post('/api/clientes')
      .set('x-token', token)
      .send(payload);

    expect(res.statusCode).toEqual(409); // Validamos que el errorHandler detecte duplicados
    expect(res.body.message).toMatch(/existe/i);
  });
});
