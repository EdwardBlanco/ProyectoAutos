<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Panel de control" subtitle="Resumen general y métricas clave del taller" />

      <!-- Tarjetas de Métricas -->
      <div class="row q-col-gutter-md q-mb-md">
        <div
          v-for="card in metrics"
          :key="card.title"
          class="col-12 col-sm-6 col-md-3"
        >
          <q-card flat bordered>
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import api from '@/services/api'

// Estado inicial en 0
const clientesCount = ref(0)
const vehiculosCount = ref(0)
const ordenesActivas = ref(0)
const ordenesData = ref([])
const totalIngresos = ref(0)

const fetchData = async () => {
  try {
    const [clientesRes, vehiculosRes, ordenesRes] = await Promise.all([
      api.get('/clientes'),
      api.get('/vehiculos'),
      api.get('/ordenes')
    ])
    
    clientesCount.value = clientesRes.data.length || 0
    vehiculosCount.value = vehiculosRes.data.length || 0
    ordenesData.value = ordenesRes.data || []
    ordenesActivas.value = (ordenesRes.data || []).filter(
      o => !['Listo', 'Entregado'].includes(o.estado)
    ).length
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  fetchData()
})

const dataset = computed(() => ({
  ingresos: `$${totalIngresos.value}`,
  ingresosTrend: 0,
  ordenes: ordenesActivas.value.toString(),
  ordenesTrend: 0,
  clientes: clientesCount.value.toString(),
  clientesTrend: 0,
  vehiculos: vehiculosCount.value.toString(),
  vehiculosTrend: 0
}))

const computedEstados = computed(() => {
  const total = ordenesData.value.length
  if (!total) {
    return [
      { label: 'Completadas', count: 0, percentage: 0, color: 'positive' },
      { label: 'En Proceso', count: 0, percentage: 0, color: 'warning' },
      { label: 'Pendientes', count: 0, percentage: 0, color: 'negative' }
    ]
  }

  const completadas = ordenesData.value.filter(o => ['Listo', 'Entregado'].includes(o.estado)).length
  const enProceso = ordenesData.value.filter(o => ['En diagnóstico', 'En reparación'].includes(o.estado)).length
  const pendientes = ordenesData.value.filter(o => o.estado === 'Pendiente').length
  
  return [
    { label: 'Completadas', count: completadas, percentage: Math.round((completadas / total) * 100), color: 'positive' },
    { label: 'En Proceso', count: enProceso, percentage: Math.round((enProceso / total) * 100), color: 'warning' },
    { label: 'Pendientes', count: pendientes, percentage: Math.round((pendientes / total) * 100), color: 'negative' }
  ]
})

const computedServicios = computed(() => [
  { nombre: 'Mantenimiento', porcentaje: 0, color: 'primary' },
  { nombre: 'Frenos', porcentaje: 0, color: 'teal' },
  { nombre: 'Motor', porcentaje: 0, color: 'orange' }
])

const metrics = computed(() => [
  {
    title: 'Ingresos',
    value: dataset.value.ingresos,
    trend: dataset.value.ingresosTrend,
    icon: 'attach_money',
    color: 'green-8',
    colorLight: 'green-1'
  },
  {
    title: 'Órdenes Activas',
    value: dataset.value.ordenes,
    trend: dataset.value.ordenesTrend,
    icon: 'assignment',
    color: 'blue-8',
    colorLight: 'blue-1'
  },
  {
    title: 'Nuevos Clientes',
    value: dataset.value.clientes,
    trend: dataset.value.clientesTrend,
    icon: 'person_add',
    color: 'purple-8',
    colorLight: 'purple-1'
  },
  {
    title: 'Vehículos Atendidos',
    value: dataset.value.vehiculos,
    trend: dataset.value.vehiculosTrend,
    icon: 'directions_car',
    color: 'orange-8',
    colorLight: 'orange-1'
  }
])

const estadoOrdenesData = computed(() => computedEstados.value)
const serviciosData = computed(() => computedServicios.value)
</script>