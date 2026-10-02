<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Selector de Período -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="q-my-none text-bold text-primary">Panel de Control</h5>
        <div class="text-caption text-grey-7">Resumen general y métricas clave del taller</div>
      </div>
      
      <q-btn-toggle
        v-model="periodo"
        flat
        spread
        no-caps
        toggle-color="primary"
        color="grey-4"
        text-color="grey-8"
        :options="[
          { label: 'Semana', value: 'semana' },
          { label: 'Mes', value: 'mes' },
          { label: 'Año', value: 'anio' }
        ]"
      />
    </div>

    <!-- Tarjetas de Métricas -->
    <div class="row q-col-gutter-md q-mb-md">
      <div
        v-for="card in metrics"
        :key="card.title"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card flat bordered class="my-card">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-caption text-grey-7">{{ card.title }}</div>
              <div class="text-h5 text-bold q-mt-xs">{{ card.value }}</div>
            </div>
            <q-avatar :color="card.colorLight" :text-color="card.color" size="48px">
              <q-icon :name="card.icon" size="24px" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-pt-none row items-center">
            <q-icon
              :name="card.trend >= 0 ? 'trending_up' : 'trending_down'"
              :color="card.trend >= 0 ? 'positive' : 'negative'"
              size="18px"
              class="q-mr-xs"
            />
            <span
              :class="card.trend >= 0 ? 'text-positive' : 'text-negative'"
              class="text-weight-bold"
            >
              {{ Math.abs(card.trend) }}%
            </span>
            <span class="text-caption text-grey-6 q-ml-xs">vs. período anterior</span>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos y Barras de Progreso -->
    <div class="row q-col-gutter-md">
      <!-- Distribución de Órdenes por Estado -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="fit">
          <q-card-section>
            <div class="text-subtitle1 text-bold">Estado de Órdenes de Trabajo</div>
            <div class="text-caption text-grey-7">Progreso global del taller</div>
          </q-card-section>

          <q-card-section>
            <div v-for="estado in estadoOrdenesData" :key="estado.label" class="q-mb-md">
              <div class="row justify-between text-caption q-mb-xs">
                <span class="text-weight-medium">{{ estado.label }}</span>
                <span class="text-bold">{{ estado.count }} órdenes ({{ estado.percentage }}%)</span>
              </div>
              <q-linear-progress
                :value="estado.percentage / 100"
                :color="estado.color"
                size="10px"
                stripe
                rounded
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Rendimiento por Categoría / Tipo de Servicio -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="fit">
          <q-card-section>
            <div class="text-subtitle1 text-bold">Servicios más Solicitados</div>
            <div class="text-caption text-grey-7">Volumen según el tipo de reparación</div>
          </q-card-section>

          <q-card-section class="row items-center justify-around">
            <div
              v-for="servicio in serviciosData"
              :key="servicio.nombre"
              class="column items-center q-ma-sm"
            >
              <q-circular-progress
                show-value
                font-size="12px"
                :value="servicio.porcentaje"
                size="80px"
                :thickness="0.2"
                :color="servicio.color"
                track-color="grey-3"
                class="q-ma-xs text-bold"
              >
                {{ servicio.porcentaje }}%
              </q-circular-progress>
              <div class="text-caption text-weight-medium q-mt-xs">{{ servicio.nombre }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'

const periodo = ref('mes')

// Datos dinámicos según el período seleccionado
const dataset = {
  semana: {
    ingresos: '$3,420',
    ingresosTrend: 8.5,
    ordenes: '14',
    ordenesTrend: 4.2,
    clientes: '8',
    clientesTrend: 12.0,
    vehiculos: '12',
    vehiculosTrend: -2.1,
    estados: [
      { label: 'Completadas', count: 8, percentage: 57, color: 'positive' },
      { label: 'En Proceso', count: 4, percentage: 29, color: 'warning' },
      { label: 'Pendientes', count: 2, percentage: 14, color: 'negative' }
    ],
    servicios: [
      { nombre: 'Mantenimiento', porcentaje: 45, color: 'primary' },
      { nombre: 'Frenos', porcentaje: 30, color: 'teal' },
      { nombre: 'Motor', porcentaje: 25, color: 'orange' }
    ]
  },
  mes: {
    ingresos: '$14,850',
    ingresosTrend: 12.3,
    ordenes: '58',
    ordenesTrend: 6.8,
    clientes: '32',
    clientesTrend: 15.4,
    vehiculos: '45',
    vehiculosTrend: 9.1,
    estados: [
      { label: 'Completadas', count: 38, percentage: 65, color: 'positive' },
      { label: 'En Proceso', count: 14, percentage: 24, color: 'warning' },
      { label: 'Pendientes', count: 6, percentage: 11, color: 'negative' }
    ],
    servicios: [
      { nombre: 'Mantenimiento', porcentaje: 40, color: 'primary' },
      { nombre: 'Frenos', porcentaje: 35, color: 'teal' },
      { nombre: 'Motor', porcentaje: 25, color: 'orange' }
    ]
  },
  anio: {
    ingresos: '$168,200',
    ingresosTrend: 21.0,
    ordenes: '640',
    ordenesTrend: 18.5,
    clientes: '210',
    clientesTrend: 24.1,
    vehiculos: '310',
    vehiculosTrend: 16.3,
    estados: [
      { label: 'Completadas', count: 520, percentage: 81, color: 'positive' },
      { label: 'En Proceso', count: 80, percentage: 13, color: 'warning' },
      { label: 'Pendientes', count: 40, percentage: 6, color: 'negative' }
    ],
    servicios: [
      { nombre: 'Mantenimiento', porcentaje: 50, color: 'primary' },
      { nombre: 'Frenos', porcentaje: 28, color: 'teal' },
      { nombre: 'Motor', porcentaje: 22, color: 'orange' }
    ]
  }
}

// Métricas computadas dinámicamente al cambiar el botón de período
const metrics = computed(() => [
  {
    title: 'Ingresos',
    value: dataset[periodo.value].ingresos,
    trend: dataset[periodo.value].ingresosTrend,
    icon: 'attach_money',
    color: 'green-8',
    colorLight: 'green-1'
  },
  {
    title: 'Órdenes Activas',
    value: dataset[periodo.value].ordenes,
    trend: dataset[periodo.value].ordenesTrend,
    icon: 'assignment',
    color: 'blue-8',
    colorLight: 'blue-1'
  },
  {
    title: 'Nuevos Clientes',
    value: dataset[periodo.value].clientes,
    trend: dataset[periodo.value].clientesTrend,
    icon: 'person_add',
    color: 'purple-8',
    colorLight: 'purple-1'
  },
  {
    title: 'Vehículos Atendidos',
    value: dataset[periodo.value].vehiculos,
    trend: dataset[periodo.value].vehiculosTrend,
    icon: 'directions_car',
    color: 'orange-8',
    colorLight: 'orange-1'
  }
])

const estadoOrdenesData = computed(() => dataset[periodo.value].estados)
const serviciosData = computed(() => dataset[periodo.value].servicios)
</script>