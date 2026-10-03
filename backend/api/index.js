const app = require('../src/app');
const connectDB = require('../src/config/database');

// Connect to database before handling the request
connectDB();

module.exports = app;
