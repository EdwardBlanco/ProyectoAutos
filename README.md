# Proyecto Autos - Sistema de Gestión de Talleres Mecánicos

![Proyecto Autos](https://img.shields.io/badge/Status-Activo-success) ![Vue.js](https://img.shields.io/badge/Vue.js-3.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![Quasar](https://img.shields.io/badge/Quasar-2.x-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

Sistema integral para la gestión de talleres mecánicos y automotrices. Permite administrar clientes, vehículos, mecánicos, y órdenes de trabajo de manera eficiente.

## 🚀 Novedades de la Versión 2.0 (Escalabilidad y UX)

El sistema ha sido reescrito en su núcleo para soportar grandes volúmenes de datos (cientos de mecánicos, miles de clientes y vehículos) manteniendo un rendimiento fluido.

### Mejoras Principales:
- **Dashboard Analítico (Server-side):** El panel de control ahora realiza cálculos de métricas mediante agregaciones nativas de MongoDB (`$aggregate`), evitando la carga de memoria en el cliente y permitiendo consultas históricas rápidas.
- **Búsquedas Optimizadas (Debounce & Pagination):** Todos los componentes de selección y tablas (`q-select`, `q-table`) ahora delegan la búsqueda al backend. Utilizan técnicas de `debounce` para no saturar el servidor y limitan los resultados enviados al frontend.
- **Tablero Kanban de Órdenes:** Las órdenes de trabajo ahora se pueden visualizar tanto en modo Lista como en un Tablero Kanban interactivo, agrupando las órdenes por sus estados de vida (Recepción, Diagnóstico, Presupuestado, etc.).
- **Secuencias Atómicas:** Se implementó una colección `Contador` en MongoDB para garantizar que los números de orden (`numeroOrden`) sean únicos y secuenciales de manera atómica, previniendo colisiones por concurrencia.
- **Integridad Referencial Defensiva:** El backend bloquea inteligentemente la eliminación de entidades (Clientes, Mecánicos, Vehículos) si estas tienen órdenes de trabajo históricas o activas asociadas.

## 🛠 Tecnologías Utilizadas

- **Frontend:** Vue 3, Quasar Framework, Pinia, Axios.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MongoDB (Mongoose).
- **Autenticación:** JWT (JSON Web Tokens) y Bcryptjs.

## 📦 Arquitectura del Proyecto

El proyecto está dividido en dos repositorios principales:
- `Fronted/`: Contiene la aplicación web del usuario.
- `backend/`: API RESTful y lógica de negocios.

### Endpoints Principales API REST

| Entidad | Endpoint | Funcionalidad |
|---------|----------|---------------|
| **Dashboard** | `/api/dashboard` | Retorna métricas y agregaciones optimizadas. Soporta query params `?desde=` y `?hasta=`. |
| **Órdenes** | `/api/ordenes` | CRUD de órdenes. Soporta `?q=` (búsqueda multicampo), `?estado=` y `?limit=`. |
| **Clientes** | `/api/clientes` | CRUD de clientes. Soporta `?q=` (búsqueda parcial regex) y `?limit=`. |
| **Vehículos** | `/api/vehiculos` | CRUD de vehículos. Filtros `?q=` (placa, chasis) y relaciones pobladas. |
| **Mecánicos** | `/api/mecanicos` | CRUD de personal. Soporta `?q=`, limit y retorna recuento de órdenes activas (carga laboral). |
| **Auth** | `/api/auth` | Login y validación de tokens JWT. |

## 🚀 Instalación y Despliegue Local

### 1. Requisitos Previos
- Node.js (v16+)
- MongoDB (Instalado localmente o MongoDB Atlas)

### 2. Configurar Backend
```bash
cd backend
npm install
```
Crear un archivo `.env` basado en `.env.example`:
```env
PORT=3000
MONGODB_URI=tu_cadena_conexion_mongodb
JWT_SECRET=tu_secreto_seguro
```
Iniciar el servidor:
```bash
npm run dev
```

### 3. Configurar Frontend
```bash
cd Fronted
npm install
```
Crear un archivo `.env` basado en `.env.example`:
```env
VITE_API_URL=http://localhost:3000/api
```
Iniciar el entorno de desarrollo:
```bash
npm run dev
```

## 🔐 Roles y Seguridad

Actualmente el sistema está protegido mediante Autenticación basada en JWT. Cada petición al backend (excepto el login) requiere de la cabecera `x-token`. El interceptor de Axios en el frontend maneja automáticamente la inyección del token.

## 📝 Contribuciones
Cualquier pull request es bienvenido. Para cambios mayores, abra un issue primero para discutir lo que le gustaría cambiar.
