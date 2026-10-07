<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Órdenes de trabajo" subtitle="Seguimiento de diagnósticos y reparaciones">
        <template #actions>
          <q-btn unelevated color="primary" label="Nueva orden" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface q-pa-md">
        <!-- Buscador -->
        <div class="q-mb-lg">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por orden, placa, cliente o falla" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>

        <!-- CUADRÍCULA DE ÓRDENES (GRID CARDS) -->
        <div v-if="filtradas.length > 0" class="row q-col-gutter-md">
          <div
            v-for="orden in filtradas"
            :key="orden._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="contact-card q-pa-sm relative-position bg-white column justify-between fit"
              :class="{ 'card-selected': selectedOrdenes.includes(orden._id) }"
            >
              <div>
                <!-- Fila Superior: N° Orden + StatusChip + Menú (...) -->
                <div class="row items-center justify-between no-wrap q-mb-xs">
                  <div class="row items-center no-wrap">
                    <q-avatar size="36px" color="negative" text-color="white" class="text-bold q-mr-sm">
                      <q-icon name="assignment" size="20px" />
                    </q-avatar>

                    <div>
                      <div class="text-subtitle2 text-bold text-grey-9 leading-tight">
                        {{ orden.numeroOrden }}
                      </div>
                      <div class="text-caption text-grey-6">
                        Placa: <strong class="text-black">{{ getPlacaVehiculo(orden.vehiculoId) }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Menú de Acciones (...) -->
                  <div class="row items-center">
                    <StatusChip :estado="orden.estado" class="q-mr-xs" />
                    <q-btn flat round dense icon="more_horiz" color="grey-7" size="sm">
                      <q-menu auto-close class="shadow-3 style-menu">
                        <q-list dense style="min-width: 140px">
                          <q-item clickable @click="openDialog(orden)">
                            <q-item-section avatar class="min-icon-sec">
                              <q-icon name="edit" size="18px" color="grey-8" />
                            </q-item-section>
                            <q-item-section class="text-grey-9">Editar</q-item-section>
                          </q-item>

                          <q-item clickable @click="deleteOrden(orden._id)">
                            <q-item-section avatar class="min-icon-sec">
                              <q-icon name="delete" size="18px" color="negative" />
                            </q-item-section>
                            <q-item-section class="text-negative text-bold">Eliminar</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>

                <q-separator class="q-my-xs" />

                <!-- Cuerpo de la Card: Descripción de la Falla -->
                <div class="q-py-xs">
                  <div class="text-caption text-bold text-grey-7">Descripción de la falla:</div>
                  <div class="text-body2 text-grey-9 falla-box q-pa-xs rounded-borders bg-grey-1">
                    {{ orden.descripcionFalla || 'Sin detalles registrados' }}
                  </div>
                </div>

                <!-- Info Adicional: Cliente / Mecánico Asignado -->
                <div class="q-gutter-y-xs q-mt-xs text-caption">
                  <div class="row items-center">
                    <q-icon name="person" color="negative" size="16px" class="q-mr-xs" />
                    <span class="text-grey-7">Cliente:</span>
                    <span class="text-bold text-grey-9 q-ml-xs ellipsis">{{ getClienteNombre(orden.vehiculoId) }}</span>
                  </div>

                  <div class="row items-center">
                    <q-icon name="engineering" color="negative" size="16px" class="q-mr-xs" />
                    <span class="text-grey-7">Mecánico:</span>
                    <span class="text-bold text-grey-9 q-ml-xs ellipsis">{{ getMecanicoNombre(orden.mecanicoId) }}</span>
                  </div>
                </div>
              </div>

              <!-- Fila Inferior: Costo Formateado ($ 150.000) + Checkbox -->
              <div class="row items-center justify-between q-mt-sm q-pt-xs border-top">
                <div class="row items-center">
                  <q-chip dense flat class="bg-red-1 text-negative text-caption text-bold">
                    Mano de Obra: {{ formatMoneda(orden.costoManoObra) }}
                  </q-chip>
                </div>

                <q-checkbox v-model="selectedOrdenes" :val="orden._id" dense size="xs" color="primary" />
              </div>
            </q-card>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="full-width q-pa-xl text-center text-grey-6">
          No hay órdenes de trabajo que coincidan con la búsqueda.
        </div>
      </div>
    </div>

    <!-- FORMULARIO MODAL EN CUADRÍCULA (2 COLUMNAS) -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 650px; max-width: 95vw; border-radius: 16px; overflow: hidden;" class="shadow-10">
        <q-card-section class="bg-black text-white q-pa-md row items-center justify-between">
          <div class="row items-center">
            <q-avatar color="negative" text-color="white" icon="assignment" size="38px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-bold leading-tight">
                {{ form._id ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo' }}
              </div>
              <div class="text-caption text-grey-4">Asignación técnica, diagnóstico y presupuesto</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveOrden">
            <div class="row q-col-gutter-md">
              
              <!-- N° de Orden -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.numeroOrden"
                  label="Número de Orden *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El número de orden es obligatorio']"
                >
                  <template #prepend><q-icon name="tag" color="negative" /></template>
                </q-input>
              </div>

              <!-- Vehículo -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.vehiculoId"
                  :options="vehiculosOptions"
                  option-value="_id"
                  :option-label="opt => `${opt.placa} - ${opt.marca} ${opt.modelo}`"
                  label="Vehículo *"
                  emit-value
                  map-options
                  outlined
                  dense
                  :rules="[val => !!val || 'Seleccione un vehículo']"
                >
                  <template #prepend><q-icon name="directions_car" color="negative" /></template>
                </q-select>
              </div>

              <!-- Mecánico Asignado -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.mecanicoId"
                  :options="mecanicosOptions"
                  option-value="_id"
                  option-label="nombre"
                  label="Mecánico Asignado *"
                  emit-value
                  map-options
                  outlined
                  dense
                  :rules="[val => !!val || 'Seleccione un mecánico']"
                >
                  <template #prepend><q-icon name="engineering" color="negative" /></template>
                </q-select>
              </div>

              <!-- Fecha Estimada de Entrega -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fechaEntregaEstimada"
                  type="date"
                  label="Fecha Estimada Entrega *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La fecha es obligatoria']"
                >
                  <template #prepend><q-icon name="event" color="negative" /></template>
                </q-input>
              </div>

              <!-- Costo Mano de Obra -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.costoManoObra"
                  type="number"
                  prefix="$"
                  label="Costo Mano de Obra *"
                  outlined
                  dense
                  :rules="[val => val !== null && val !== '' || 'Ingrese un costo válido']"
                >
                  <template #prepend><q-icon name="attach_money" color="negative" /></template>
                </q-input>
              </div>

              <!-- Estado (Solo visible al editar) -->
              <div class="col-12 col-sm-6" v-if="form._id">
                <q-select
                  v-model="form.estado"
                  :options="['En diagnóstico', 'En reparación', 'Listo', 'Entregado']"
                  label="Estado de la Orden"
                  outlined
                  dense
                >
                  <template #prepend><q-icon name="rule" color="negative" /></template>
                </q-select>
              </div>

              <!-- Descripción de la Falla -->
              <div class="col-12">
                <q-input
                  v-model="form.descripcionFalla"
                  label="Descripción de la falla *"
                  outlined
                  dense
                  autogrow
                  rows="3"
                  :rules="[val => !!val || 'La descripción de la falla es obligatoria']"
                >
                  <template #prepend><q-icon name="report_problem" color="negative" /></template>
                </q-input>
              </div>

            </div>

            <!-- Botones de Acción -->
            <div class="row justify-end q-pt-md">
              <q-btn label="CANCELAR" color="grey-7" flat v-close-popup no-caps />
              <q-btn label="GUARDAR" type="submit" color="negative" unelevated class="q-ml-sm text-weight-bold" :loading="saving" no-caps />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from '@/components/PageHeader.vue'
import StatusChip from '@/components/StatusChip.vue'
import api from '@/services/api'

const $q = useQuasar()
const filtro = ref('')
const ordenes = ref([])
const vehiculosOptions = ref([])
const mecanicosOptions = ref([])
const selectedOrdenes = ref([])

const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  numeroOrden: '',
  vehiculoId: null,
  mecanicoId: null,
  fechaEntregaEstimada: '',
  descripcionFalla: '',
  estado: 'En diagnóstico',
  costoManoObra: 0
})

// Formato de miles con punto (ej: $ 150.000)
const formatMoneda = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '$ 0'
  const formateado = Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `$ ${formateado}`
}

const fetchData = async () => {
  try {
    const [ordenesRes, vehiculosRes, mecanicosRes] = await Promise.all([
      api.get('/ordenes'),
      api.get('/vehiculos'),
      api.get('/mecanicos')
    ])
    ordenes.value = ordenesRes.data
    vehiculosOptions.value = vehiculosRes.data
    mecanicosOptions.value = mecanicosRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  }
}

onMounted(() => {
  fetchData()
})

const getPlacaVehiculo = (vehiculo) => {
  if (!vehiculo) return 'N/A'
  return typeof vehiculo === 'object' ? vehiculo.placa : vehiculo
}

const getClienteNombre = (vehiculo) => {
  if (!vehiculo || typeof vehiculo !== 'object') return 'N/A'
  return vehiculo.clienteId?.nombre || vehiculo.cliente?.nombre || 'N/A'
}

const getMecanicoNombre = (mecanico) => {
  if (!mecanico) return 'Sin asignar'
  if (typeof mecanico === 'object') return mecanico.nombre
  const hallado = mecanicosOptions.value.find(m => m._id === mecanico)
  return hallado ? hallado.nombre : 'Mecánico'
}

const filtradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return ordenes.value
  return ordenes.value.filter((o) => {
    const placa = getPlacaVehiculo(o.vehiculoId).toLowerCase()
    const cliente = getClienteNombre(o.vehiculoId).toLowerCase()
    const falla = (o.descripcionFalla || '').toLowerCase()
    return `${o.numeroOrden} ${placa} ${cliente} ${falla}`.toLowerCase().includes(q)
  })
})

const openDialog = (orden = null) => {
  if (orden) {
    const dateStr = orden.fechaEntregaEstimada ? new Date(orden.fechaEntregaEstimada).toISOString().split('T')[0] : ''
    form.value = { 
      ...orden, 
      vehiculoId: orden.vehiculoId?._id || orden.vehiculoId,
      mecanicoId: orden.mecanicoId?._id || orden.mecanicoId,
      fechaEntregaEstimada: dateStr
    }
  } else {
    form.value = { 
      _id: null, 
      numeroOrden: `ORD-${Date.now().toString().slice(-6)}`, 
      vehiculoId: null, 
      mecanicoId: null, 
      fechaEntregaEstimada: new Date().toISOString().split('T')[0], 
      descripcionFalla: '', 
      estado: 'En diagnóstico', 
      costoManoObra: 0 
    }
  }
  dialog.value = true
}

const saveOrden = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await api.put(`/ordenes/${form.value._id}`, form.value)
      $q.notify({ type: 'positive', message: 'Orden actualizada exitosamente' })
    } else {
      await api.post('/ordenes', form.value)
      $q.notify({ type: 'positive', message: 'Orden creada exitosamente' })
    }
    dialog.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving orden:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar la orden' })
  } finally {
    saving.value = false
  }
}

const deleteOrden = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar esta orden?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/ordenes/${id}`)
      $q.notify({ type: 'positive', message: 'Orden eliminada' })
      fetchData()
    } catch (error) {
      console.error('Error deleting orden:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar orden' })
    }
  })
}
</script>

<style scoped>
.contact-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.contact-card:hover {
  border-color: #bdbdbd;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.card-selected {
  background-color: #e3f2fd !important;
  border-color: #90caf9 !important;
}

.min-icon-sec {
  min-width: 32px !important;
}

.falla-box {
  min-height: 48px;
  max-height: 70px;
  overflow-y: auto;
  border: 1px dashed #e0e0e0;
}

.leading-tight {
  line-height: 1.2;
}

.border-top {
  border-top: 1px solid #f0f0f0;
}
</style>