# Análisis y Documentación del Proyecto Autos

Este documento detalla la estructura, los flujos de navegación, funcionalidades y el manejo de los datos tanto en el frontend como en el backend del Proyecto Autos. Adicionalmente, incluye la documentación sobre la implementación de Pinia para el manejo del estado y su persistencia.

## 1. Flujos de Navegación y Uso (Frontend)

El sistema utiliza **Vue Router** para gestionar la navegación de forma fluida (SPA - Single Page Application). 

### Rutas principales:
- **`/login`**: Página inicial para usuarios no autenticados. Permite el acceso al sistema mediante correo electrónico y contraseña.
- **`/` (Raíz)**: Redirige automáticamente a `/dashboard`.
- **Rutas Protegidas (Layout Principal)**:
  Estas rutas requieren autenticación (verificado a través de un `BeforeEach` en el router que comprueba la existencia de un token válido en el store):
  - **`/dashboard`**: Vista general o panel de control al ingresar al sistema.
  - **`/clientes`**: Gestión de los clientes del taller.
  - **`/vehiculos`**: Gestión de los vehículos registrados.
  - **`/mecanicos`**: Gestión del personal (mecánicos).
  - **`/ordenes`**: Gestión de las órdenes de servicio/reparación.

### Uso y Navegación:
1. El usuario ingresa a `/login`.
2. Al autenticarse correctamente, el backend retorna un token (JWT) que se guarda en el estado global (vía Pinia).
3. El usuario es redirigido a `/dashboard`.
4. El menú lateral (Drawer) permite navegar entre los diferentes módulos (`clientes`, `vehiculos`, `mecanicos`, `ordenes`).
5. El botón superior permite al usuario administrador cerrar la sesión, lo cual limpia el token del store global y redirige al `/login`.

---

## 2. Funcionalidades y Acciones del Sistema

El sistema ofrece un conjunto completo de operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para administrar un taller de vehículos.

### Autenticación (`Auth`)
- **Login**: Iniciar sesión en el sistema con email y contraseña.
- **Registro**: Registrar nuevos usuarios (empleados o administradores) que tendrán acceso al sistema. *Nota: esto es independiente de la gestión de los "Clientes" del taller.*

### Gestión de Clientes
- **Listar clientes**: Ver todos los clientes registrados.
- **Detalle de cliente**: Ver información de un cliente específico.
- **Crear cliente**: Registrar un nuevo cliente (nombre, teléfono, correo, dirección, cédula).
- **Actualizar cliente**: Modificar datos de un cliente.
- **Eliminar cliente**: Borrar registro.

### Gestión de Mecánicos
- **Listar mecánicos**: Ver lista del personal.
- **Crear mecánico**: Registrar un nuevo mecánico (nombre, especialidad, teléfono, cédula, correo).
- **Actualizar / Eliminar mecánico**.

### Gestión de Vehículos
- **Listar vehículos**: Ver vehículos registrados.
- **Crear vehículo**: Asociar un vehículo a un cliente (placa, marca, modelo, año, VIN, ID del Cliente).
- **Ver Expediente**: Obtener el historial o expediente de un vehículo en particular.
- **Actualizar / Eliminar vehículo**.

### Gestión de Órdenes de Servicio
- **Listar órdenes**: Ver todas las órdenes de trabajo.
- **Crear orden**: Generar una nueva orden asignando un vehículo y un mecánico.
- **Actualizar Estado**: Cambiar el estado de la orden (En diagnóstico, En reparación, Listo, Entregado).
- **Actualizar Orden**: Modificar detalles como costo, descripción de la falla, fechas.
- **Eliminar orden**.

---

## 3. Datos: Backend y Frontend

### Modelos en el Backend (Mongoose / MongoDB)
El backend está construido en **Node.js** con **Express** y **Mongoose**.
1. **Cliente**: `nombre`, `telefono`, `correo`, `direccion`, `cedula`.
2. **Mecanico**: `nombre`, `especialidad`, `telefono`, `cedula`, `correo`.
3. **Usuario**: `email`, `password`, `estado`, `cedula`.
4. **Vehiculo**: `placa`, `marca`, `modelo`, `anio`, `vin`, `clienteId` (Referencia a Cliente).
5. **Orden**: `numeroOrden`, `vehiculoId` (Referencia), `mecanicoId` (Referencia), `fechaIngreso`, `fechaEntregaEstimada`, `descripcionFalla`, `estado` (Enum), `costoManoObra`.

### Datos en el Frontend
Los modelos de datos en el frontend se manejan a través de los estados reactivos de **Vue 3 (Composition API)** y las peticiones **Axios** hacia el backend.
- Los componentes Vue utilizan `ref` o `reactive` para capturar la entrada del usuario en los formularios (ej. `email` y `password` en el login).
- La información persistente (como la sesión del usuario) ahora se maneja globalmente utilizando **Pinia**.

---

## 4. Librerías y su Uso (Pinia y Persistencia)

### Frontend
- **Vue 3**: Framework progresivo para construir interfaces de usuario.
- **Quasar Framework**: Biblioteca de componentes UI basados en Material Design (botones, layouts, inputs, notificaciones).
- **Vue Router**: Para enrutamiento SPA.
- **Axios**: Cliente HTTP para peticiones al backend (con un interceptor para enviar el Token en los headers `x-token`).
- **Pinia** & **pinia-plugin-persistedstate**: Manejador del estado global moderno para Vue.

### Backend
- **Express**: Framework web.
- **Mongoose**: ODM para MongoDB.
- **Bcryptjs & JsonWebToken**: Para hashing de contraseñas y emisión de JWT para autenticación segura.
- **Express-Validator**: Middleware de validación de datos en las rutas.

---

## 5. Documentación de Pinia y Pinia Persisted State

Se han instalado y configurado las librerías `pinia` y `pinia-plugin-persistedstate` para el manejo seguro y limpio del token de sesión.

### Instalación Realizada:
```bash
npm install pinia pinia-plugin-persistedstate
```

### Configuración (`src/main.js`):
Se instanció Pinia y se le inyectó el plugin de persistencia.
```javascript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia)...
```

### Creación del Store (`src/stores/auth.js`):
Se creó un store para la autenticación usando la sintaxis moderna (Setup Store). La opción `persist: true` guarda automáticamente el estado en `localStorage`.

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)

  function setToken(newToken) {
    token.value = newToken
  }
  function clearToken() {
    token.value = null
  }
  return { token, setToken, clearToken }
}, {
  persist: true // Habilita la persistencia
})
```

### Aprovechamiento en el Proyecto:
1. **Interceptor de Axios (`src/services/api.js`)**: Ahora obtiene el token directamente del store de Pinia, lo que lo hace más reactivo y centralizado que leer directamente el `localStorage`.
2. **Guards del Router (`src/router/index.js`)**: Verifica `authStore.token` para bloquear o permitir el acceso a las rutas protegidas.
3. **Login y Logout**: Modificados para utilizar los actions `setToken` y `clearToken`, delegando a Pinia y a su plugin el guardado/borrado físico del token en el navegador.
