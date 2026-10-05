const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

require('dotenv').config();

require('dotenv').config();

// Use Atlas DB from .env but change the database name to avoid dropping prod db
const MONGODB_URI = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace('taller_autos', 'taller_autos_test') : 'mongodb://127.0.0.1:27017/taller_mecanico_test';

let token = '';
let clienteId = '';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
  // Limpiar la base de datos de test antes de las pruebas
  await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Integration Tests: Backend & Database', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should create a new cliente', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .set('x-token', token)
      .send({
        nombre: 'Cliente Prueba',
        telefono: '1234567890',
        correo: 'cliente@prueba.com',
        direccion: 'Calle Falsa 123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.nombre).toEqual('Cliente Prueba');
    clienteId = res.body._id;
  });

  it('should fetch clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('x-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a cliente', async () => {
    const res = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .set('x-token', token)
      .send({
        nombre: 'Cliente Actualizado'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.nombre).toEqual('Cliente Actualizado');
  });

  it('should delete a cliente', async () => {
    const res = await request(app)
      .delete(`/api/clientes/${clienteId}`)
      .set('x-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Cliente eliminado correctamente');
  });
});
