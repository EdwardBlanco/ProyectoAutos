const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
process.env.MONGODB_URI = process.env.MONGODB_URI.replace('/taller_autos?', '/taller_autos?');
process.env.MONGODB_URI_CLOUD_SRV = process.env.MONGODB_URI_CLOUD_SRV.replace('/taller_autos', '/taller_autos');


const connectDB = require('../src/config/database');
const Usuario = require('../src/models/Usuario');
const Cliente = require('../src/models/Cliente');
const Mecanico = require('../src/models/Mecanico');
const Vehiculo = require('../src/models/Vehiculo');
const Orden = require('../src/models/Orden');
const Contador = require('../src/models/Contador');

const importData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected...');

    // Leemos los archivos con EJSON para soportar $oid y $date
    const { EJSON } = require('bson');
    const usuarios = EJSON.parse(fs.readFileSync(path.join(__dirname, '01_usuarios.json'), 'utf-8'));
    const clientes = EJSON.parse(fs.readFileSync(path.join(__dirname, '02_clientes.json'), 'utf-8'));
    const mecanicos = EJSON.parse(fs.readFileSync(path.join(__dirname, '03_mecanicos.json'), 'utf-8'));
    const vehiculos = EJSON.parse(fs.readFileSync(path.join(__dirname, '04_vehiculos.json'), 'utf-8'));
    const ordenes = EJSON.parse(fs.readFileSync(path.join(__dirname, '05_ordens.json'), 'utf-8'));
    const contadores = EJSON.parse(fs.readFileSync(path.join(__dirname, '06_contadors.json'), 'utf-8'));


    // Opcional: limpiar la base de datos antes de importar
    // await Usuario.deleteMany();
    // await Cliente.deleteMany();
    // await Mecanico.deleteMany();
    // await Vehiculo.deleteMany();
    // await Orden.deleteMany();
    // await Contador.deleteMany();

    console.log('Importing Usuarios...');
    await Usuario.insertMany(usuarios);

    console.log('Importing Clientes...');
    await Cliente.insertMany(clientes);

    console.log('Importing Mecanicos...');
    await Mecanico.insertMany(mecanicos);

    console.log('Importing Vehiculos...');
    await Vehiculo.insertMany(vehiculos);

    console.log('Importing Contadores...');
    await Contador.insertMany(contadores);

    console.log('Importing Ordenes...');
    await Orden.insertMany(ordenes);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

importData();
