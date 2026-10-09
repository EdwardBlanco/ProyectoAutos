require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Vehiculo = require('./models/Vehiculo');
const Mecanico = require('./models/Mecanico');
const Cliente = require('./models/Cliente');

const seedData = async () => {
  try {
    await connectDB();

    console.log('--- Iniciando Seed ---');

    // 1. Crear 5 mecánicos
    const mecanicosData = [
      { nombre: 'Carlos Perez', especialidad: 'Motor', telefono: '3001234567', cedula: '100000001', correo: 'carlos@ejemplo.com' },
      { nombre: 'Juan Sanchez', especialidad: 'Frenos', telefono: '3001234568', cedula: '100000002', correo: 'juan@ejemplo.com' },
      { nombre: 'Luis Martinez', especialidad: 'Suspensión', telefono: '3001234569', cedula: '100000003', correo: 'luis@ejemplo.com' },
      { nombre: 'Ana Gomez', especialidad: 'Electricidad', telefono: '3001234570', cedula: '100000004', correo: 'ana@ejemplo.com' },
      { nombre: 'Pedro Diaz', especialidad: 'General', telefono: '3001234571', cedula: '100000005', correo: 'pedro@ejemplo.com' }
    ];
    await Mecanico.deleteMany({ correo: { $regex: '@ejemplo.com$' } });
    await Mecanico.insertMany(mecanicosData);
    console.log('5 mecánicos agregados correctamente.');

    // 2. Crear un cliente genérico para asignarle los vehículos
    let cliente = await Cliente.findOne({ correo: 'cliente_seed@ejemplo.com' });
    if (!cliente) {
      cliente = await Cliente.create({
        nombre: 'Cliente Seed',
        telefono: '3100000000',
        correo: 'cliente_seed@ejemplo.com',
        direccion: 'Calle Seed 123',
        cedula: '999999999'
      });
      console.log('Cliente genérico creado.');
    }

    // 3. Crear 10 modelos de vehículos
    const vehiculosData = [
      { placa: 'SED101', marca: 'Toyota', modelo: 'Corolla', anio: 2020, vin: 'VIN00000000000001', clienteId: cliente._id },
      { placa: 'SED102', marca: 'Mazda', modelo: '3', anio: 2021, vin: 'VIN00000000000002', clienteId: cliente._id },
      { placa: 'SED103', marca: 'Honda', modelo: 'Civic', anio: 2019, vin: 'VIN00000000000003', clienteId: cliente._id },
      { placa: 'SED104', marca: 'Ford', modelo: 'Fiesta', anio: 2018, vin: 'VIN00000000000004', clienteId: cliente._id },
      { placa: 'SED105', marca: 'Chevrolet', modelo: 'Tracker', anio: 2022, vin: 'VIN00000000000005', clienteId: cliente._id },
      { placa: 'SED106', marca: 'Nissan', modelo: 'Sentra', anio: 2020, vin: 'VIN00000000000006', clienteId: cliente._id },
      { placa: 'SED107', marca: 'Kia', modelo: 'Rio', anio: 2021, vin: 'VIN00000000000007', clienteId: cliente._id },
      { placa: 'SED108', marca: 'Hyundai', modelo: 'Tucson', anio: 2023, vin: 'VIN00000000000008', clienteId: cliente._id },
      { placa: 'SED109', marca: 'Renault', modelo: 'Logan', anio: 2019, vin: 'VIN00000000000009', clienteId: cliente._id },
      { placa: 'SED110', marca: 'Volkswagen', modelo: 'Jetta', anio: 2022, vin: 'VIN00000000000010', clienteId: cliente._id }
    ];
    await Vehiculo.deleteMany({ placa: { $regex: '^SED1' } });
    await Vehiculo.insertMany(vehiculosData);
    console.log('10 vehículos agregados correctamente.');



    console.log('--- Seed completado ---');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar BD:', error);
    process.exit(1);
  }
};

seedData();
