// Utilidades para búsquedas y paginación seguras en listados

// Escapa caracteres especiales para usar texto del usuario dentro de un RegExp
const escapeRegex = (texto = '') => String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Crea un RegExp insensible a mayúsculas a partir del texto buscado (o null si está vacío)
const regexBusqueda = (q) => {
  const limpio = String(q || '').trim();
  return limpio ? new RegExp(escapeRegex(limpio), 'i') : null;
};

// Lee el parámetro "limit" de la query (máx. 100). Devuelve 0 si no se envió (sin límite)
const leerLimite = (limit) => {
  const n = parseInt(limit, 10);
  if (Number.isNaN(n) || n <= 0) return 0;
  return Math.min(n, 100);
};

module.exports = { escapeRegex, regexBusqueda, leerLimite };
