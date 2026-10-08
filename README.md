# Proyecto Autos - Sistema de Gestión para Taller Automotriz

Este es un sistema integral de gestión diseñado para digitalizar y optimizar los procesos administrativos y operativos de un taller de autos. Su objetivo principal es facilitar el seguimiento de diagnósticos y reparaciones (Órdenes de Trabajo), llevar un control del personal técnico (Mecánicos), administrar el directorio de propietarios (Clientes) y llevar un inventario de los automóviles ingresados (Vehículos).

---

## 🚀 ¿Qué necesidad suple el sistema?

En muchos talleres automotrices, la información sobre clientes, vehículos y reparaciones se maneja en hojas de cálculo o papel, lo que provoca pérdida de historial, mala comunicación y descontrol en los tiempos de entrega. 
Este sistema resuelve esa problemática al centralizar:
1. **Historial de vehículos:** Saber exactamente qué reparaciones se han hecho a un carro a través del tiempo.
2. **Control de tiempos y estado:** Visualizar en qué etapa se encuentra una orden (Diagnóstico, Reparación, Listo, Entregado).
3. **Gestión de Recursos:** Asignar mecánicos específicos según su especialidad a órdenes concretas, y vincular los autos con sus propietarios reales.

---

## 🗺️ Navegación y Estructura Visual

La aplicación está diseñada como una **Single Page Application (SPA)** intuitiva:

- **Dashboard:** Visión general de las operaciones.
- **Vehículos (`/vehiculos`):** Registro de la flota. Permite vincular placas, VIN y modelo exacto con un cliente.
- **Clientes (`/clientes`):** Directorio de los propietarios. Registra los datos de contacto y la Cédula/DNI para temas de facturación.
- **Mecánicos (`/mecanicos`):** Lista del personal técnico. Almacena especialidades (Frenos, Motor, Electricidad, etc.) e información de contacto.
- **Órdenes de Trabajo (`/ordenes`):** El módulo central. Vincula un vehículo con un mecánico, establece un costo, fecha de entrega y detalla el progreso y el diagnóstico de la falla.

---

## 🛠️ Preguntas Técnicas: Arquitectura y Librerías (Frontend)

El Frontend ha sido desarrollado con un enfoque moderno y escalable utilizando **Vue 3** y **Vite**.

### Librerías principales y su configuración:
- **Vue 3 (Composition API):** Se empleó mediante el bloque `<script setup>`, lo cual brinda un código más limpio, menos verboso y con mejor inferencia de tipos o abstracción lógica (usando `ref` y `computed`).
- **Quasar Framework:** Se utilizó como librería core de UI. 
  - *¿Cómo se usó?* Se aprovechó su sistema de grillas CSS (`row`, `col`), sus inputs nativos con validaciones integradas (`q-input`, `q-select`), y sus modales (`q-dialog`).
- **Vue Router:** Utilizado para manejar la navegación en el cliente de manera fluida y sin recargas.
- **Axios:** Configurado como cliente HTTP mediante un interceptor central en `src/services/api.js`. Esto permite definir una única `baseURL` y facilitar el manejo de tokens o headers de autorización si la aplicación escala a un entorno asegurado mediante JWT.

### ¿Qué estructuras se usaron?
A nivel estructural en el Frontend, el código está dividido en responsabilidades:
- `/pages`: Vistas o pantallas completas (Ej: `ClientesPage.vue`, `OrdenesPage.vue`). Aquí residen las llamadas HTTP de obtención y los computed properties para filtros en tiempo real.
- `/components`: Elementos reutilizables sin estado pesado (Ej: `PageHeader.vue`, `StatusChip.vue`).
- `/services`: Lógica de comunicación con el backend totalmente aislada.

---

## 🎨 Diseño UI / UX

El enfoque de la interfaz de usuario se alejó de los "Dashboards llenos de tablas densas" tradicionales:
1. **Sistema de Tarjetas (Cards):** Los listados (Vehículos, Clientes, Órdenes) se presentan mediante tarjetas individuales (*Contact Cards*). Esto es mucho más **amigable y responsivo** en dispositivos móviles, permitiendo al usuario escanear visualmente la información importante en segundos sin tener que hacer scroll horizontal.
2. **Feedbacks visuales:** Se usa una semántica de colores (Chips de colores verdes, rojos, naranjas) para comunicar de un vistazo el estado de una Orden (e.g. *Listo*, *En Reparación*).
3. **Modales In-Place:** Al crear o editar entidades, no se redirige a otra página (lo cual rompe el flujo del usuario), sino que se abre un diálogo contextual oscuro y elegante.
4. **Buscador en tiempo real:** Todas las listas filtran la información en tiempo real a medida que se escribe utilizando `computed` properties de Vue, ahorrando llamadas de búsqueda excesivas al backend.

---

## 🗄️ Validaciones, Datos e Integridad (Backend)

La aplicación maneja información estructurada validada de extremo a extremo:

- **Estructura Backend:** Arquitectura N-Capas Clásica (Rutas -> Validadores -> Controladores -> Servicios -> Modelos).
- **Bases de Datos:** **MongoDB** (Mongoose). Permite una inserción flexible pero controlada con ObjectIds referenciales.
- **express-validator:** Toda la información enviada desde el front es saneada y evaluada antes de tocar los controladores. 
  - *Ejemplo de validación:* Se exige un DNI (`cedula`) válido de formato numérico; no se admiten placas vacías; el `año` de los vehículos debe tener coherencia, y se valida formato de correos.

## ⚙️ Cómo ejecutar el proyecto

1. **Instalación Frontend:**
   ```bash
   cd Fronted
   npm install
   npm run dev
   ```

2. **Instalación Backend:**
   ```bash
   cd backend
   npm install
   # Asegurarse de tener el archivo .env con la URI de Mongoose (MONGODB_URI) y PORT.
   npm run dev
   ```

3. **Poblar Base de Datos (Seed):**
   Si la base de datos está vacía, puedes inyectar datos de prueba ejecutando en la carpeta del backend:
   ```bash
   node src/seed.js
   ```
   *(Esto creará 10 vehículos, 5 mecánicos y un cliente genérico).*
