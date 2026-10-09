import api from '../src/services/api.js';

let testToken = null;

if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => testToken,
    setItem: (k, v) => { if (k === 'token') testToken = v; }
  };
}

async function testFrontendBackendIntegration() {
  console.log('Testing Frontend-Backend Integration...');
  try {
    console.log('1. Testing Login...');
    const loginRes = await api.post('/auth/login', {
      email: 'admin@tallerautos.com',
      password: 'admin123456'
    });
    
    testToken = loginRes.data.token;
    console.log('Login successful, token received.');
    
    console.log('2. Testing Create Cliente...');
    const createRes = await api.post('/clientes', {
      nombre: 'Test Cliente Frontend',
      telefono: '111222333',
      correo: 'test.frontend@example.com',
      direccion: 'Frontend Street 123'
    });
    const clienteId = createRes.data._id;
    console.log(`Cliente created with ID: ${clienteId}`);

    console.log('3. Testing Get Clientes...');
    const getRes = await api.get('/clientes');
    console.log(`Successfully fetched ${getRes.data.length} clientes.`);

    console.log('4. Testing Delete Cliente...');
    const delRes = await api.delete(`/clientes/${clienteId}`);
    console.log(`Delete result: ${delRes.data.message}`);

    console.log('Frontend-Backend Integration tests passed successfully!');
  } catch (error) {
    console.error('Integration test failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testFrontendBackendIntegration();
