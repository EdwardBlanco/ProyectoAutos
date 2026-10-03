const fs = require('fs');

const API_URL = 'https://proyecto-autos-six.vercel.app/api';

async function testProdEndpoints() {
  const results = {};
  try {
    // 1. Try to login
    console.log('Logging in to production...');
    let loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@tallerautos.com', password: 'admin123456' })
    });
    
    let loginData = await loginRes.json();
    
    // If login fails (e.g. user doesn't exist), try to register
    if (!loginRes.ok) {
        console.log('Login failed, attempting to register admin in production...');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@tallerautos.com', password: 'admin123456' })
        });
        const registerData = await registerRes.json();
        if (!registerRes.ok) throw new Error(`Register failed: ${JSON.stringify(registerData)}`);
        
        // Try login again
        loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@tallerautos.com', password: 'admin123456' })
        });
        loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

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
        nombre: 'Maria Lopez (Vercel)',
        telefono: '5551234567',
        correo: 'maria.vercel@example.com',
        direccion: 'Avenida Siempre Viva 742'
      })
    });
    const cliente = await clienteRes.json();
    if (!clienteRes.ok) throw new Error(`Cliente: ${JSON.stringify(cliente)}`);
    results.createCliente = { status: 'success', cliente };

    // 3. Create Vehiculo
    console.log('Creating Vehiculo...');
    const vehiculoRes = await fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        placa: `VER${Math.floor(Math.random() * 1000)}`,
        marca: 'Ford',
        modelo: 'Fiesta',
        año: 2018,
        vin: 'VINCARS7890VERCEL',
        clienteId: cliente._id
      })
    });
    const vehiculo = await vehiculoRes.json();
    if (!vehiculoRes.ok) throw new Error(`Vehiculo: ${JSON.stringify(vehiculo)}`);
    results.createVehiculo = { status: 'success', vehiculo };

    // 4. Create Mecanico
    console.log('Creating Mecanico...');
    const mecanicoRes = await fetch(`${API_URL}/mecanicos`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        nombre: 'Carlos Mecanico (Vercel)',
        especialidad: 'Transmisiones',
        telefono: '5559876543'
      })
    });
    const mecanico = await mecanicoRes.json();
    if (!mecanicoRes.ok) throw new Error(`Mecanico: ${JSON.stringify(mecanico)}`);
    results.createMecanico = { status: 'success', mecanico };

    // 5. Create Orden
    console.log('Creating Orden...');
    const ordenRes = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({
        numeroOrden: `V-ORD-${Math.floor(Math.random() * 10000)}`,
        vehiculoId: vehiculo._id,
        mecanicoId: mecanico._id,
        fechaEntregaEstimada: new Date().toISOString(),
        descripcionFalla: 'Falla en la transmisión automática',
        costoManoObra: 250000
      })
    });
    const orden = await ordenRes.json();
    if (!ordenRes.ok) throw new Error(`Orden: ${JSON.stringify(orden)}`);
    results.createOrden = { status: 'success', orden };

    fs.writeFileSync('test_prod_results.json', JSON.stringify(results, null, 2));
    console.log('All production tests passed and saved to test_prod_results.json');
  } catch (error) {
    console.error('Error testing production endpoints:', error.message);
    results.error = error.message;
    fs.writeFileSync('test_prod_results.json', JSON.stringify(results, null, 2));
  }
}

testProdEndpoints();
