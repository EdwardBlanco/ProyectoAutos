const fs = require('fs');

const API_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  const results = {};
  try {
    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tallerautos.com', password: 'admin123456' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    const token = loginData.token;
    results.login = { status: 'success', token: token.substring(0, 10) + '...' };
    
    const headersWithToken = { 
      'Content-Type': 'application/json',
      'x-token': token 
    };

    // 2. Create Cliente
    console.log('Creating Cliente...');
    const clienteRes = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        nombre: 'Juan Perez',
        telefono: '1234567890',
        correo: 'juan@example.com',
        direccion: 'Calle Falsa 123'
      })
    });
    const cliente = await clienteRes.json();
    if (!clienteRes.ok) throw new Error(JSON.stringify(cliente));
    results.createCliente = { status: 'success', cliente };

    // 3. Create Vehiculo
    console.log('Creating Vehiculo...');
    const vehiculoRes = await fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        placa: `ABC${Math.floor(Math.random() * 1000)}`,
        marca: 'Toyota',
        modelo: 'Corolla',
        año: 2020,
        vin: '1234567890ABCDEFG',
        clienteId: cliente._id
      })
    });
    const vehiculo = await vehiculoRes.json();
    if (!vehiculoRes.ok) throw new Error(JSON.stringify(vehiculo));
    results.createVehiculo = { status: 'success', vehiculo };

    // 4. Create Mecanico
    console.log('Creating Mecanico...');
    const mecanicoRes = await fetch(`${API_URL}/mecanicos`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        nombre: 'Pedro Mecanico',
        especialidad: 'Frenos',
        telefono: '0987654321'
      })
    });
    const mecanico = await mecanicoRes.json();
    if (!mecanicoRes.ok) throw new Error(JSON.stringify(mecanico));
    results.createMecanico = { status: 'success', mecanico };

    // 5. Create Orden
    console.log('Creating Orden...');
    const ordenRes = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        numeroOrden: `ORD-${Math.floor(Math.random() * 10000)}`,
        vehiculoId: vehiculo._id,
        mecanicoId: mecanico._id,
        fechaEntregaEstimada: new Date().toISOString(),
        descripcionFalla: 'Falla en el motor, ruido extraño',
        costoManoObra: 150000
      })
    });
    const orden = await ordenRes.json();
    if (!ordenRes.ok) throw new Error(JSON.stringify(orden));
    results.createOrden = { status: 'success', orden };

    // 6. Get all Clientes
    console.log('Getting all Clientes...');
    const getClientesRes = await fetch(`${API_URL}/clientes`, { headers: { 'Content-Type': 'application/json' }});
    const getClientesData = await getClientesRes.json();
    if (!getClientesRes.ok) throw new Error(JSON.stringify(getClientesData));
    results.getClientes = { status: 'success', count: getClientesData.length };


    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
    console.log('All tests passed and saved to test_results.json');
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
    results.error = error.message;
    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
  }
}

testEndpoints();
