const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

jest.setTimeout(60000);

let mongoServer;

process.env.SECRETORPRIVATEKEY = process.env.SECRETORPRIVATEKEY || process.env.JWT_SECRET || 'MiClaveSuperSecreta2026@';
process.env.JWT_SECRET = process.env.SECRETORPRIVATEKEY;
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (global.__PRESERVE_DB__) {
    return;
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
