const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

jest.setTimeout(60000);

let token = '';

// Almacenamiento de IDs para pruebas secuenciales
let clienteId = '';
let mecanicoId = '';
let vehiculoId = '';
let ordenId = '';

describe('Pruebas de Integración (Frontend -> Backend -> DB)', () => {

  describe('1. Autenticación', () => {
    it('debe registrar un usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@taller.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      token = res.body.token; // Guardamos el token para el resto de peticiones
    });

    it('debe iniciar sesión correctamente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@taller.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('2. Endpoints de Clientes', () => {
    it('debe crear un cliente tal como lo envía el frontend', async () => {
      const payload = {
        nombre: 'Juan Perez',
        cedula: '1234567890',
        telefono: '555-1234',
        correo: 'juan@example.com',
        direccion: 'Av Principal 123'
      };
      const res = await request(app)
        .post('/api/clientes')
        .set('x-token', token)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.nombre).toEqual(payload.nombre);
      expect(res.body.cedula).toEqual(payload.cedula);
      clienteId = res.body._id; // Guardar ID
    });

    it('debe obtener la lista de clientes', async () => {
      const res = await request(app).get('/api/clientes');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('3. Endpoints de Mecánicos', () => {
    it('debe crear un mecánico tal como lo envía el frontend', async () => {
      const payload = {
        nombre: 'Carlos Mecanico',
        cedula: '0987654321',
        especialidad: 'Frenos',
        telefono: '555-9876',
        correo: 'carlos@mecanico.com'
      };
      const res = await request(app)
        .post('/api/mecanicos')
        .set('x-token', token)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.nombre).toEqual(payload.nombre);
      expect(res.body.especialidad).toEqual(payload.especialidad);
      mecanicoId = res.body._id;
    });

    it('debe obtener la lista de mecánicos', async () => {
      const res = await request(app).get('/api/mecanicos');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('4. Endpoints de Vehículos', () => {
    it('debe crear un vehículo validando anio y vin correctamente (esquema actualizado)', async () => {
      const payload = {
        placa: 'ABC-123',
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2020, // Ahora el frontend envía anio correctamente
        vin: '12345678901234567', // Ahora envía vin
        clienteId: clienteId // Referencia al cliente creado antes
      };
      const res = await request(app)
        .post('/api/vehiculos')
        .set('x-token', token)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.placa).toEqual(payload.placa);
      expect(res.body.anio).toEqual(payload.anio);
      expect(res.body.clienteId).toEqual(clienteId);
      vehiculoId = res.body._id;
    });

    it('debe rechazar la creación si el frontend envía año en lugar de anio', async () => {
      const payloadInvalido = {
        placa: 'XYZ-999',
        marca: 'Honda',
        modelo: 'Civic',
        año: 2019, // Campo incorrecto
        numeroChasis: '12345678901234567',
        clienteId: clienteId
      };
      const res = await request(app)
        .post('/api/vehiculos')
        .set('x-token', token)
        .send(payloadInvalido);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toEqual('Error de validación');
    });

    it('debe obtener la lista de vehículos', async () => {
      const res = await request(app).get('/api/vehiculos');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('5. Endpoints de Órdenes', () => {
    it('debe crear una orden de trabajo (RecepcionWizard)', async () => {
      const payload = {
        vehiculoId: vehiculoId,
        mecanicoId: mecanicoId,
        fechaEntregaEstimada: new Date().toISOString().split('T')[0],
        descripcionFalla: 'El carro no frena bien',
        estado: 'Recepción',
        costoManoObra: 0
      };
      const res = await request(app)
        .post('/api/ordenes')
        .set('x-token', token)
        .send(payload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.vehiculoId).toEqual(vehiculoId);
      expect(res.body.estado).toEqual('Recepción');
      ordenId = res.body._id;
    });

    it('debe obtener la lista de órdenes', async () => {
      const res = await request(app)
        .get('/api/ordenes')
        .set('x-token', token);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('debe actualizar el estado de una orden enviando el payload completo (OrdenesPage.vue)', async () => {
      const updatePayload = {
        vehiculoId: vehiculoId,
        mecanicoId: mecanicoId,
        fechaEntregaEstimada: new Date().toISOString().split('T')[0],
        descripcionFalla: 'El carro no frena bien',
        estado: 'Diagnóstico', // Cambio de estado
        costoManoObra: 50
      };
      
      const res = await request(app)
        .put(`/api/ordenes/${ordenId}`)
        .set('x-token', token)
        .send(updatePayload);

      expect(res.statusCode).toEqual(200);
      expect(res.body.estado).toEqual('Diagnóstico');
      expect(res.body.costoManoObra).toEqual(50);
    });
  });

});
