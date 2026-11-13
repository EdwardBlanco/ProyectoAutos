# Documentación de Componentes Reutilizables del Frontend

Este documento describe la arquitectura, especificación de API (Props, Slots, Eventos) y casos de uso de los componentes reutilizables creados para la aplicación web de gestión de talleres.

---

## 1. Justificación y Análisis de Arquitectura

Durante la auditoría del frontend se identificaron tres áreas clave con alta duplicación de código e inconsistencia de estilos:

1. **Estructura de Cabecera de Módulos (`PageHeader.vue`)**:
   - Cada página (`ClientesPage`, `VehiculosPage`, `OrdenesPage`, `MecanicosPage`, `DashboardPage`) definía de forma aislada un bloque de 20-30 líneas con avatar de icono, título `h1`, badges de conteo y botones de acción rápida.
   - **Solución**: Unificar en un componente estructural de layout con slots para acciones y badges.

2. **Visualización y Manipulación de Placas Vehiculares (`PlacaBadge.vue`)**:
   - La matrícula vehicular es la clave de búsqueda y visualización central del taller automotriz. Se mostraba con estilos CSS dispersos e inconsistentes en 4 módulos.
   - **Solución**: Centralizar en un átomo de diseño con 3 variantes estéticas (`standard`, `pro`, `outline`), 3 tamaños (`sm`, `md`, `lg`), formateo automático a mayúsculas y soporte de copiado al portapapeles en 1 clic.

3. **Tarjetas de Métricas Estadísticas y KPIs (`KpiCard.vue`)**:
   - Tanto el panel principal (`DashboardPage`) como el módulo de especialistas (`MecanicosPage`) presentaban tarjetas con métricas operativas (ingresos, órdenes, capacidad y satisfacción).
   - Cada vista implementaba estilos y estructuras dispares para mostrar títulos, avatares, números destacados y subtítulos informativos.
   - **Solución**: Crear un componente modular con microanimación de elevación hover, soporte para iconos de estado, avatares temáticos y slots de valor adaptable.

---

## 2. Componente: `PageHeader.vue`

- **Ruta del archivo**: [`src/components/PageHeader.vue`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/PageHeader.vue)
- **Ruta de pruebas unitarias**: [`src/components/__tests__/PageHeader.spec.js`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/__tests__/PageHeader.spec.js)
- **Tipo de componente**: Estructural / Layout

### 2.1 Especificación de Props

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `String` | **Sí** | `-` | Título del módulo o sección (ej. `"Parque Vehicular"`). |
| `subtitle` | `String` | No | `""` | Subtítulo descriptivo debajo del título. |
| `icon` | `String` | No | `""` | Nombre del icono de Material Icons (ej. `"directions_car"`). |
| `iconBg` | `String` | No | `"red-1"` | Color de fondo Quasar para el avatar. |
| `iconColor` | `String` | No | `"primary"` | Color del icono Quasar. |
| `badge` | `String \| Number` | No | `null` | Texto o valor numérico para el badge de resumen. |
| `badgeColor` | `String` | No | `"grey-3"` | Color de fondo del badge. |
| `badgeTextColor` | `String` | No | `"grey-8"` | Color del texto del badge. |
| `customClass` | `String \| Object \| Array` | No | `""` | Clases adicionales añadidas a la fila principal. |

### 2.2 Slots

| Slot | Descripción |
| :--- | :--- |
| `#actions` | Contenedor flex a la derecha para botones de acción (`<q-btn>`). |
| `#subtitle` | Reemplazo con contenido enriquecido para el subtítulo. |
| `#badge` | Reemplazo para badges complejos o personalizados. |

### 2.3 Ejemplo de Uso

```html
<template>
  <PageHeader
    title="Directorio de Clientes"
    subtitle="Gestión y directorio de propietarios de vehículos del taller"
    icon="people"
    icon-bg="blue-1"
    icon-color="primary"
    :badge="`${clientes.length} Registrados`"
  >
    <template #actions>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo Cliente"
        unelevated
        no-caps
        @click="openForm()"
      />
    </template>
  </PageHeader>
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue'
</script>
```

---

## 3. Componente: `PlacaBadge.vue`

- **Ruta del archivo**: [`src/components/PlacaBadge.vue`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/PlacaBadge.vue)
- **Ruta de pruebas unitarias**: [`src/components/__tests__/PlacaBadge.spec.js`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/__tests__/PlacaBadge.spec.js)
- **Tipo de componente**: Átomo de diseño / Dominio

### 3.1 Especificación de Props

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `placa` | `String` | No | `"N/A"` | Texto de la placa. Se limpia y transforma automáticamente a mayúsculas. |
| `variant` | `String` | No | `"standard"` | Variante visual: `'standard'`, `'pro'` o `'outline'`. |
| `size` | `String` | No | `"md"` | Tamaño: `'sm'` (tablas), `'md'` (tarjetas) o `'lg'` (cabeceras de detalle). |
| `copyable` | `Boolean` | No | `false` | Activa icono de copia, tooltip y evento de copiado en el portapapeles con notificación. |
| `clickable` | `Boolean` | No | `false` | Activa cursor pointer y emite el evento `@click`. |
| `tooltipText` | `String` | No | `"Clic para copiar placa"` | Texto informativo en el tooltip. |

### 3.2 Eventos Emitidos (`Emits`)

| Evento | Firma | Descripción |
| :--- | :--- | :--- |
| `@click` | `(placa: string, event: MouseEvent)` | Emitido cuando `clickable` es `true`. |
| `@copy` | `(placa: string)` | Emitido cuando la placa se copia al portapapeles. |

### 3.3 Variantes Visuales

1. **`standard`**: Fondo oscuro `#111827`, texto blanco, bordes redondeados (4px) y tracking de 1.2px. Ideal para tablas y listados generales.
2. **`pro`**: Fondo oscuro con texto ámbar/dorado (`#fbbf24`), borde metálico (`2px solid #374151`) y tracking de 2px. Simula una placa vehicular oficial en alta resolución.
3. **`outline`**: Fondo blanco, texto oscuro y borde gris (`#94a3b8`). Útil en contextos secundarios.

### 3.4 Ejemplos de Uso

#### En Celdas de Tablas (Compacto)
```html
<PlacaBadge :placa="props.row.vehiculoId?.placa" size="sm" />
```

#### En Cabecera de Ficha Técnica 360° (Pro con Copiado Rápido)
```html
<PlacaBadge
  :placa="selectedVehiculo.placa"
  variant="pro"
  size="lg"
  copyable
/>
```

#### En Listas de Filtrado Rápido (Clickable)
```html
<PlacaBadge
  :placa="v.placa"
  size="sm"
  clickable
  @click="(placa) => filtrarPorPlaca(placa)"
/>
```

---

## 4. Componente: `KpiCard.vue`

- **Ruta del archivo**: [`src/components/KpiCard.vue`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/KpiCard.vue)
- **Ruta de pruebas unitarias**: [`src/components/__tests__/KpiCard.spec.js`](file:///c:/Users/edwar/Documents/GitHub/ProyectoAutos/Fronted/src/components/__tests__/KpiCard.spec.js)
- **Tipo de componente**: Molécula / Tarjeta de Datos y KPIs

### 4.1 Especificación de Props

| Prop | Tipo | Requerido | Valor por defecto | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `title` | `String` | **Sí** | `-` | Título superior de la métrica en mayúsculas (ej. `"Ingresos Facturados"`). |
| `value` | `String \| Number` | No | `""` | Valor numérico o texto destacado principal (ej. `"$15,200,000"`, `"24"`). |
| `valueClass` | `String` | No | `"text-h3"` | Clase tipográfica para el valor (ej. `"text-h3"`, `"text-h4"`). |
| `valueIcon` | `String` | No | `""` | Nombre del icono adjunto al valor (ej. `"star"` para valoraciones). |
| `valueIconColor` | `String` | No | `"warning"` | Color del icono adjunto al valor. |
| `icon` | `String` | No | `""` | Icono del avatar superior derecho (Material Icons). |
| `color` | `String` | No | `"primary"` | Color del glifo dentro del avatar. |
| `colorLight` | `String` | No | `"blue-1"` | Color de fondo del avatar superior. |
| `subtext` | `String` | No | `""` | Texto explicativo o comparativo en el pie de la tarjeta. |
| `subtextIcon` | `String` | No | `""` | Icono informativo junto al subtítulo (ej. `"check_circle"`, `"warning"`). |
| `subtextColor` | `String` | No | `"text-grey-6"` | Color tipográfico del subtítulo (ej. `"text-positive"`, `"text-red-6"`). |
| `customStyle` | `String \| Object` | No | `"border-radius: 16px;"` | Estilos CSS personalizados para el `<q-card>`. |

### 4.2 Slots

| Slot | Descripción |
| :--- | :--- |
| `#value` | Permite renderizar contenido enriquecido para el número o métrica. |
| `#subtext` | Permite personalizar el texto y los elementos del pie de la tarjeta. |
| `#header-right` | Reemplazo del avatar de la esquina superior derecha. |

### 4.3 Ejemplos de Uso

#### En el Dashboard Principal (Iterando Colección de Métricas)
```html
<KpiCard
  :title="card.title"
  :value="card.value"
  :icon="card.icon"
  :color="card.color"
  :color-light="card.colorLight"
  :subtext="card.subtext"
  :subtext-icon="card.subtextIcon"
  :subtext-color="card.subtextColor"
/>
```

#### En Fichas de Capacidad Operativa o Calidad
```html
<KpiCard
  title="Calidad de Reparaciones"
  value="4.8"
  value-class="text-h4"
  value-icon="star"
  value-icon-color="warning"
  icon="thumb_up"
  color="green-8"
  color-light="green-1"
  subtext="Alta satisfacción de los clientes"
  subtext-icon="thumb_up"
  subtext-color="text-positive"
/>
```

---

## 5. Cobertura de Pruebas Unitarias (Vitest)

Se implementaron pruebas automatizadas para todos los componentes:

```bash
npm --prefix Fronted test
```

Resultados (17 pruebas superadas):
- `PageHeader.spec.js`:
  - Renderizado de título y subtítulo semánticos.
  - Generación del avatar con icono y colores correspondientes.
  - Renderizado del badge con conteo y formatos numéricos.
  - Inyección de botones y acciones mediante slot `#actions`.
- `PlacaBadge.spec.js`:
  - Formateo y sanitización a mayúsculas (`abc-123` -> `ABC-123`).
  - Asignación de clases dinámicas para variantes `standard` y `pro`.
  - Fallback a `"N/A"` en ausencia de placa.
  - Disparo de eventos en modo `clickable`.
  - Copiado al portapapeles mediante la API `navigator.clipboard.writeText` con emisión de evento `@copy`.
- `KpiCard.spec.js`:
  - Renderizado de títulos y valores destacados.
  - Renderizado condicional del avatar con icono superior.
  - Renderizado de subtextos con iconos y estilos de estado (`positive`, `warning`, `negative`).
  - Soporte de iconos adjuntos al valor (`valueIcon`).
  - Inyección de contenido enriquecido mediante el slot `#value`.
