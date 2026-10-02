const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const vehiculoRoutes = require('./routes/vehiculo.routes');
const mecanicoRoutes = require('./routes/mecanico.routes');
const ordenRoutes = require('./routes/orden.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/mecanicos', mecanicoRoutes);
app.use('/api/ordenes', ordenRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ocurrió un error en el servidor' });
});

module.exports = app;
