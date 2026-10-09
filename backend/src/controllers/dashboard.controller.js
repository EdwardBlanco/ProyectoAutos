const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');
const Orden = require('../models/Orden');
const { ESTADOS_ACTIVOS } = require('../constants/estados');

// Retorna el inicio del día local en UTC
const parseFecha = (str, offsetDias = 0) => {
  const d = str ? new Date(str) : new Date();
  d.setHours(0, 0, 0, 0);
  if (offsetDias) d.setDate(d.getDate() + offsetDias);
  return d;
};

exports.getDashboardData = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    // Por defecto: últimos 30 días
    const fechaDesde = desde ? parseFecha(desde) : parseFecha(null, -30);
    const fechaHasta = hasta ? parseFecha(hasta) : parseFecha(null, 1); // mañana a las 00:00

    const rangoFechas = { $gte: fechaDesde, $lt: fechaHasta };

    // 1. Nuevos clientes en el periodo
    const clientesNuevos = await Cliente.countDocuments({ createdAt: rangoFechas });

    // 2. Vehículos atendidos (únicos con orden de trabajo ingresada en el periodo)
    const vehiculosAtendidosResult = await Orden.aggregate([
      { $match: { fechaIngreso: rangoFechas } },
      { $group: { _id: '$vehiculoId' } },
      { $count: 'total' }
    ]);
    const vehiculosAtendidos = vehiculosAtendidosResult[0]?.total || 0;

    // 3. Ingresos (suma de mano de obra de las órdenes ENTREGADAS en el periodo)
    const ingresosResult = await Orden.aggregate([
      { $match: { estado: 'Entregado', fechaEntregaReal: rangoFechas } },
      { $group: { _id: null, total: { $sum: '$costoManoObra' } } }
    ]);
    const ingresos = ingresosResult[0]?.total || 0;

    // 4. Órdenes Activas (total actual, independiente de la fecha)
    const ordenesActivas = await Orden.countDocuments({ estado: { $in: ESTADOS_ACTIVOS } });

    // 5. Órdenes vencidas (activas con fecha estimada menor a hoy)
    const vencidas = await Orden.countDocuments({
      estado: { $in: ESTADOS_ACTIVOS },
      fechaEntregaEstimada: { $lt: parseFecha(null) }
    });

    // 6. Órdenes por estado (historicas del periodo + activas)
    const porEstadoAg = await Orden.aggregate([
      { $match: { fechaIngreso: rangoFechas } },
      { $group: { _id: '$estado', total: { $sum: 1 } } }
    ]);
    const porEstado = porEstadoAg.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.total }), {});

    res.json({
      periodo: { desde: fechaDesde, hasta: fechaHasta },
      metricas: {
        ingresos,
        ordenesActivas,
        vencidas,
        clientesNuevos,
        vehiculosAtendidos
      },
      porEstado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo datos del dashboard' });
  }
};
