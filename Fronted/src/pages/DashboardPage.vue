<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell max-width-1440 q-mx-auto">

      <!-- HEADER & QUICK ACTIONS -->
      <div class="row items-center justify-between q-mb-xl">
        <div>
          <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight">Panel de Control</h1>
          <div class="text-subtitle1 text-grey-7 q-mt-xs">Resumen general y métricas clave del taller</div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn to="/ordenes" color="primary" icon="add" label="Nueva Orden" unelevated class="text-weight-bold"
            style="border-radius: 8px" />
        </div>
      </div>

      <!-- FILTER -->
      <div class="row justify-end q-mb-md">
        <q-btn-group flat rounded class="bg-white shadow-1">
          <q-btn :color="diasFiltro === 0 ? 'primary' : 'grey-7'" :flat="diasFiltro !== 0" label="Hoy"
            @click="cambiarFiltro(0)" class="text-weight-bold" />
          <q-btn :color="diasFiltro === 7 ? 'primary' : 'grey-7'" :flat="diasFiltro !== 7" label="7D"
            @click="cambiarFiltro(7)" class="text-weight-bold" />
          <q-btn :color="diasFiltro === 30 ? 'primary' : 'grey-7'" :flat="diasFiltro !== 30" label="30D"
            @click="cambiarFiltro(30)" class="text-weight-bold" />
          <q-btn :color="diasFiltro === 90 ? 'primary' : 'grey-7'" :flat="diasFiltro !== 90" label="90D"
            @click="cambiarFiltro(90)" class="text-weight-bold" />
        </q-btn-group>
      </div>

      <div v-if="loading" class="flex flex-center q-pa-xl min-h-400">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <template v-else>
        <!-- KPI CARDS -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <div v-for="card in metrics" :key="card.title" class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="kpi-card bg-white transition-hover" style="border-radius: 16px;">
              <q-card-section class="q-pa-lg">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bold">{{ card.title }}</div>
                  <q-avatar :color="card.colorLight" :text-color="card.color" size="42px" class="shadow-1">
                    <q-icon :name="card.icon" size="20px" />
                  </q-avatar>
                </div>
                <div class="text-h3 text-weight-bolder text-dark q-mb-xs">{{ card.value }}</div>
                <div class="text-caption text-weight-medium row items-center"
                  :class="card.subtextColor || 'text-grey-6'">
                  <q-icon v-if="card.subtextIcon" :name="card.subtextIcon" size="14px" class="q-mr-xs" />
                  {{ card.subtext || (diasFiltro === 0 ? 'Día de hoy' : `Últimos ${diasFiltro} días`) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- MAIN CONTENT AREA -->
        <div class="row q-col-gutter-lg">
          <!-- ESTADO DE ORDENES -->
          <div class="col-12 col-md-7">
            <q-card flat bordered class="bg-white full-height" style="border-radius: 16px;">
              <q-card-section class="q-pa-lg">
                <div class="row items-center justify-between q-mb-lg">
                  <div>
                    <div class="text-h6 text-weight-bold text-dark">Distribución por Estado</div>
                    <div class="text-caption text-grey-6">Volumen de órdenes según su etapa actual</div>
                  </div>
                  <q-icon name="donut_large" color="grey-4" size="32px" />
                </div>

                <div v-if="estadoOrdenesData.length > 0" class="q-mt-md">
                  <div v-for="estado in estadoOrdenesData" :key="estado.label" class="q-mb-lg">
                    <div class="row justify-between items-center q-mb-sm">
                      <div class="row items-center">
                        <q-badge rounded :color="estado.color" class="q-mr-sm" style="width: 10px; height: 10px;" />
                        <span class="text-weight-bold text-dark">{{ estado.label }}</span>
                      </div>
                      <div class="text-weight-bold text-grey-8">
                        {{ estado.count }} <span class="text-caption text-grey-5">({{ estado.percentage }}%)</span>
                      </div>
                    </div>
                    <q-linear-progress :value="estado.percentage / 100" :color="estado.color" size="12px" rounded
                      class="bg-grey-2" />
                  </div>
                </div>
                <div v-else class="flex flex-center q-pa-xl text-grey-5 column">
                  <q-icon name="assignment_turned_in" size="48px" class="q-mb-md" />
                  <div class="text-h6">No hay datos de órdenes</div>
                  <div class="text-caption">Intente con un rango de fechas diferente</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- ACCIONES RÁPIDAS Y RESUMEN -->
          <div class="col-12 col-md-5">
            <div class="column full-height" style="gap: 24px;">
              <!-- TARJETA DE ALERTA (EJ: ORDENES VENCIDAS) -->
              <q-card flat bordered class="bg-red-1" style="border-color: var(--q-red-2); border-radius: 16px;"
                v-if="dataset.vencidas > 0">
                <q-card-section class="q-pa-lg row items-center no-wrap">
                  <q-avatar color="red-2" text-color="red-9" class="q-mr-md" size="54px">
                    <q-icon name="warning" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-red-9">Atención Requerida</div>
                    <div class="text-body2 text-red-8">Hay <b>{{ dataset.vencidas }}</b> órdenes de trabajo vencidas que
                      requieren su revisión inmediata.</div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="bg-blue-1" style="border-color: var(--q-blue-2); border-radius: 16px;"
                v-else>
                <q-card-section class="q-pa-lg row items-center no-wrap">
                  <q-avatar color="blue-2" text-color="blue-9" class="q-mr-md" size="54px">
                    <q-icon name="check_circle" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-blue-9">Todo en orden</div>
                    <div class="text-body2 text-blue-8">No hay órdenes de trabajo vencidas. ¡Excelente trabajo!</div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- PANEL DE ACCESOS DIRECTOS -->
              <q-card flat bordered class="bg-white flex-1" style="border-radius: 16px;">
                <q-card-section class="q-pa-lg">
                  <div class="text-h6 text-weight-bold text-dark q-mb-md">Accesos Directos</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-btn to="/clientes" stack flat class="full-width bg-grey-1 hover-primary text-grey-8 q-pa-md"
                        style="border-radius: 12px; transition: all 0.3s">
                        <q-icon name="group" size="32px" class="q-mb-sm text-primary" />
                        <div class="text-weight-bold">Clientes</div>
                      </q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn to="/vehiculos" stack flat class="full-width bg-grey-1 hover-primary text-grey-8 q-pa-md"
                        style="border-radius: 12px; transition: all 0.3s">
                        <q-icon name="directions_car" size="32px" class="q-mb-sm text-orange" />
                        <div class="text-weight-bold">Vehículos</div>
                      </q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn to="/ordenes" stack flat class="full-width bg-grey-1 hover-primary text-grey-8 q-pa-md"
                        style="border-radius: 12px; transition: all 0.3s">
                        <q-icon name="assignment" size="32px" class="q-mb-sm text-green" />
                        <div class="text-weight-bold">Órdenes</div>
                      </q-btn>
                    </div>
                    <div class="col-6">
                      <q-btn to="/mecanicos" stack flat class="full-width bg-grey-1 hover-primary text-grey-8 q-pa-md"
                        style="border-radius: 12px; transition: all 0.3s">
                        <q-icon name="engineering" size="32px" class="q-mb-sm text-purple" />
                        <div class="text-weight-bold">Mecánicos</div>
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const dashboardData = ref(null)
const diasFiltro = ref(30)

const fetchData = async (dias) => {
  loading.value = true
  try {
    const fechaDesde = new Date()
    fechaDesde.setDate(fechaDesde.getDate() - dias)
    const { data } = await api.get(`/dashboard?desde=${fechaDesde.toISOString()}`)
    dashboardData.value = data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos del dashboard'
    })
  } finally {
    loading.value = false
  }
}

const cambiarFiltro = (dias) => {
  diasFiltro.value = dias
  fetchData(dias)
}

onMounted(() => {
  fetchData(diasFiltro.value)
})

const dataset = computed(() => {
  if (!dashboardData.value) return {}
  const m = dashboardData.value.metricas
  return {
    ingresos: `$${m.ingresos.toLocaleString()}`,
    ordenes: m.ordenesActivas.toString(),
    vencidas: m.vencidas,
    clientes: m.clientesNuevos.toString(),
    vehiculos: m.vehiculosAtendidos.toString()
  }
})

const metrics = computed(() => [
  {
    title: 'Ingresos Facturados',
    value: dataset.value.ingresos || '$0',
    icon: 'attach_money',
    color: 'green-8',
    colorLight: 'green-1'
  },
  {
    title: 'Órdenes Activas',
    value: dataset.value.ordenes || '0',
    icon: 'assignment',
    color: 'blue-8',
    colorLight: 'blue-1',
    subtext: dataset.value.vencidas > 0 ? `${dataset.value.vencidas} vencidas` : 'Todas al día',
    subtextIcon: dataset.value.vencidas > 0 ? 'warning' : 'check_circle',
    subtextColor: dataset.value.vencidas > 0 ? 'text-red-6' : 'text-green-6'
  },
  {
    title: 'Nuevos Clientes',
    value: dataset.value.clientes || '0',
    icon: 'person_add',
    color: 'purple-8',
    colorLight: 'purple-1'
  },
  {
    title: 'Vehículos Atendidos',
    value: dataset.value.vehiculos || '0',
    icon: 'directions_car',
    color: 'orange-8',
    colorLight: 'orange-1'
  }
])

const estadoOrdenesData = computed(() => {
  if (!dashboardData.value || !dashboardData.value.porEstado) return []
  const pe = dashboardData.value.porEstado

  // Total para sacar porcentaje
  const total = Object.values(pe).reduce((a, b) => a + b, 0)
  if (total === 0) return []

  const colors = {
    'Recepción': 'blue',
    'En diagnóstico': 'orange',
    'Presupuestado': 'cyan',
    'En reparación': 'warning',
    'En control de calidad': 'purple',
    'Listo': 'positive',
    'Entregado': 'grey'
  }

  const items = []
  for (const [estado, count] of Object.entries(pe)) {
    items.push({
      label: estado,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[estado] || 'primary'
    })
  }

  return items.sort((a, b) => b.count - a.count)
})
</script>

<style scoped>
.page-shell {
  max-width: 1400px;
  margin: 0 auto;
}

.transition-hover {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.transition-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
}

.min-h-400 {
  min-height: 400px;
}

.flex-1 {
  flex: 1;
}

.hover-primary:hover {
  background-color: var(--q-primary) !important;
  color: white !important;
}

.hover-primary:hover .q-icon {
  color: white !important;
}
</style>