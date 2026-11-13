<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell">

      <!-- HEADER (TITULO & ACCIONES) -->
      <PageHeader title="Órdenes de Reparación"
        subtitle="Control de ingresos, estados de trabajo, repuestos y asignación técnica" icon="assignment"
        icon-bg="red-1" icon-color="primary" :badge="`${ordenes.length} Órdenes`">
        <template #actions>
          <q-btn unelevated color="primary" label="Nueva Orden" icon="add" no-caps
            class="rounded-button shadow-2 q-px-lg q-py-sm text-weight-bold transition-all hover-scale"
            @click="openInlineForm()" />
        </template>
      </PageHeader>

      <!-- MODAL DIALOG: NUEVA / EDITAR ORDEN -->
      <q-dialog v-model="isCreationOpen" persistent transition-show="scale" transition-hide="scale">
        <q-card style="width: 1100px; max-width: 95vw; border-radius: 16px;" class="bg-white column no-wrap">
          <q-card-section class="row items-center justify-between q-pa-md bg-grey-1 border-bottom">
            <div class="row items-center">
              <q-avatar color="primary" text-color="white" icon="build" size="42px" class="q-mr-md shadow-1" />
              <div>
                <div class="text-h6 text-weight-bold leading-tight">
                  {{ form._id ? 'Editar Orden: ' + form.numeroOrden : 'Ingreso al Taller · Nueva Orden de Trabajo' }}
                </div>
                <div class="text-caption text-grey-7">
                  Formulario unificado: selecciona o registra vehículo, cliente y asigna el trabajo correspondiente.
                </div>
              </div>
            </div>
            <q-btn icon="close" flat round dense color="grey-8" @click="closeInlineForm" />
          </q-card-section>

          <q-card-section class="q-pa-lg scroll" style="max-height: 75vh;">
            <q-form @submit="saveOrden" id="ordenForm" class="row q-col-gutter-lg">
              <!-- SECCION 1: Vehiculo y Cliente -->
              <div class="col-12 col-lg-4">
                <div class="text-bold text-primary q-mb-sm flex items-center">
                  <q-icon name="directions_car" size="sm" class="q-mr-xs" />
                  1. Carro & Dueño
                </div>

                <div class="q-mb-sm text-right" v-if="!form._id">
                  <q-btn flat dense color="primary" no-caps size="sm"
                    :label="isRegisteringInlineVehicle ? '← Seleccionar auto existente' : '+ Registrar auto nuevo aquí'"
                    @click="isRegisteringInlineVehicle = !isRegisteringInlineVehicle" />
                </div>

                <div v-if="!isRegisteringInlineVehicle">
                  <q-select v-model="form.vehiculoId" :options="vehiculosOptions" option-value="_id"
                    option-label="placa" label="Vehículo (Buscar por Placa) *" emit-value map-options use-input outlined
                    dense @filter="filterVehiculos" :rules="[val => !!val || 'Seleccione un vehículo']"
                    class="bg-white">
                    <template #prepend><q-icon name="directions_car" color="primary" /></template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="text-weight-bold">{{ scope.opt.placa }} - {{ scope.opt.marca }} {{
                            scope.opt.modelo }}</q-item-label>
                          <q-item-label caption v-if="scope.opt.clienteId">
                            Propietario: {{ scope.opt.clienteId.nombre }} ({{ scope.opt.clienteId.cedula || 'N/A' }})
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div v-else class="q-pa-md rounded-borders border q-gutter-y-sm bg-grey-2">
                  <div class="text-caption text-bold text-primary">Datos del Nuevo Auto</div>
                  <q-input v-model="newVehicle.placa" label="Placa *" outlined dense class="text-uppercase bg-white"
                    placeholder="Ej: ABC-123" :rules="[val => !!val || 'Requerido']" />

                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-sm-6">
                      <q-select v-model="newVehicle.marca" :options="marcasOptions" label="Marca *" outlined dense
                        use-input fill-input hide-selected input-debounce="0" new-value-mode="add-unique"
                        @filter="filterMarcas" @update:model-value="onNewVehicleMarcaChange"
                        :rules="[val => !!val || 'Requerido']" class="bg-white" />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-select v-model="newVehicle.modelo" :options="modelosOptions" label="Modelo *" outlined dense
                        use-input fill-input hide-selected input-debounce="0" new-value-mode="add-unique"
                        @filter="filterModelos" :rules="[val => !!val || 'Requerido']"
                        :hint="newVehicle.marca ? `Sugerencias para ${newVehicle.marca}` : 'O escribe'"
                        class="bg-white" />
                    </div>
                  </div>

                  <q-input v-model.number="newVehicle.anio" type="number" label="Año *" outlined dense class="bg-white"
                    :rules="[val => !!val || 'Requerido']" />

                  <div class="row items-center justify-between q-mt-sm border-top q-pt-sm">
                    <div class="text-caption text-bold text-primary">Dueño del carro</div>
                    <q-btn flat dense color="primary" no-caps size="sm"
                      :label="isRegisteringInlineClient ? '← Buscar existente' : '+ Dueño nuevo aquí'"
                      @click="isRegisteringInlineClient = !isRegisteringInlineClient" />
                  </div>

                  <div v-if="!isRegisteringInlineClient">
                    <q-select v-model="newVehicle.clienteId" :options="clientesOptions" label="Propietario / Cliente *"
                      outlined dense option-value="_id" option-label="nombre" emit-value map-options use-input
                      @filter="filterClientes" :rules="[val => !!val || 'Requerido']" class="bg-white">
                      <template #prepend><q-icon name="person" color="primary" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label class="text-weight-bold">{{ scope.opt.nombre }}</q-item-label>
                            <q-item-label caption>Cédula: {{ scope.opt.cedula || 'N/A' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div v-else class="q-gutter-y-sm">
                    <q-input v-model="newClient.nombre" label="Nombre Completo *" outlined dense class="bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                    <q-input v-model="newClient.cedula" label="Cédula/NIT *" outlined dense class="bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                    <q-input v-model="newClient.telefono" label="Teléfono *" outlined dense class="bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                    <q-input v-model="newClient.correo" label="Correo *" outlined dense type="email" class="bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                    <q-input v-model="newClient.direccion" label="Dirección *" outlined dense class="bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                  </div>
                </div>
              </div>

              <!-- SECCION 2: Motivo y Falla -->
              <div class="col-12 col-lg-4">
                <div class="text-bold text-primary q-mb-sm flex items-center">
                  <q-icon name="description" size="sm" class="q-mr-xs" />
                  2. Motivo de Ingreso
                </div>
                <q-input v-model="form.descripcionFalla" label="Falla reportada / Diagnóstico *" outlined dense autogrow
                  rows="4" :rules="[val => !!val || 'Requerido']" class="q-mb-md bg-white"
                  placeholder="Describa el motivo por el cual ingresa el auto..." />

                <q-select v-model="form.mecanicoId" :options="mecanicosOptions" option-value="_id" option-label="nombre"
                  label="Mecánico Responsable *" emit-value map-options use-input outlined dense
                  @filter="filterMecanicos" :rules="[val => !!val || 'Asigne un mecánico']" class="bg-white">
                  <template #prepend><q-icon name="engineering" color="primary" /></template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ scope.opt.nombre }}</q-item-label>
                        <q-item-label caption>Esp: {{ scope.opt.especialidad || 'General' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- SECCION 3: Plazos y Costos -->
              <div class="col-12 col-lg-4">
                <div class="text-bold text-primary q-mb-sm flex items-center">
                  <q-icon name="attach_money" size="sm" class="q-mr-xs" />
                  3. Plazos y Presupuesto
                </div>

                <q-input v-model="form.fechaEntregaEstimada" label="Fecha Estimada de Entrega *" type="date" outlined
                  dense stack-label :rules="[val => !!val || 'Requerido']" class="q-mb-md bg-white" />

                <q-input :model-value="formatInputMoneda(form.costoManoObra)"
                  @update:model-value="val => form.costoManoObra = unformatMoneda(val)"
                  label="Costo Mano de Obra Estimado *" outlined dense prefix="$"
                  :rules="[val => val !== '' && val !== null && val !== undefined || 'Requerido']"
                  class="q-mb-md bg-white" />

                <q-select v-if="form._id" v-model="form.estado" :options="estadosPosibles" label="Estado de la Orden"
                  outlined dense class="bg-white" />
              </div>
            </q-form>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1 border-top">
            <q-btn label="Cancelar" color="grey-8" flat @click="closeInlineForm" class="q-mr-sm text-weight-bold"
              no-caps />
            <q-btn form="ordenForm" :label="form._id ? 'Guardar Cambios' : 'Generar Orden'" type="submit"
              color="primary" unelevated :loading="saving" class="text-weight-bold shadow-2 q-px-lg rounded-button"
              no-caps icon="save" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- SEARCH BAR & TABS (ESPACIO HORIZONTAL AMPLIO) -->
      <div class="row items-center q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-5 col-lg-4">
          <q-input v-model="filtroBusqueda" dense outlined placeholder="Buscar por placa, cliente o # orden..."
            @update:model-value="onSearch" clearable class="bg-white search-input w-full">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>

        <div class="col-12 col-md-7 col-lg-8">
          <q-tabs v-model="filtroEstado" dense class="text-grey-7 bg-white rounded-borders shadow-1 w-full"
            active-color="primary" indicator-color="primary" align="left" narrow-indicator
            @update:model-value="fetchData">
            <q-tab name="Todos" label="Todas las Órdenes" no-caps class="text-weight-medium" />
            <q-tab name="En diagnóstico" label="En Diagnóstico" no-caps class="text-weight-medium" />
            <q-tab name="En reparación" label="En Reparación" no-caps class="text-weight-medium" />
            <q-tab name="Pendiente de aprobación" label="Pend. Aprobación" no-caps class="text-weight-medium" />
            <q-tab name="Esperando repuestos" label="Espera Repuestos" no-caps class="text-weight-medium" />
            <q-tab name="Listo para entrega" label="Listas p/ Retiro" no-caps class="text-weight-medium" />
            <q-tab name="Entregada" label="Entregados" no-caps class="text-weight-medium" />
            <q-tab name="Cancelada" label="Canceladas" no-caps class="text-weight-medium" />
          </q-tabs>
        </div>
      </div>

      <!-- REGISTRADOS (#) & ACTIVE FILTERS -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle2 text-grey-8 font-medium">
          Órdenes Registradas <span class="text-weight-bold text-dark">({{ ordenes.length }})</span>
        </div>
        <div v-if="route.query.mecanicoId" class="row items-center">
          <q-chip removable @remove="limpiarFiltroMecanico" color="purple-1" text-color="purple-9" icon="engineering"
            class="text-weight-medium">
            Filtrado por mecánico
          </q-chip>
        </div>
      </div>

      <!-- TABLA DE ORDENES (AMPLITUD COMPLETA) -->
      <q-table :rows="ordenes" :columns="columns" row-key="_id" flat bordered :loading="loading"
        class="bg-white shadow-1 table-ordenes" style="border-radius: 14px;" :rows-per-page-options="[10, 20, 50, 0]">
        <template v-slot:body-cell-orden="props">
          <q-td :props="props">
            <div class="text-weight-bolder text-primary text-body2">{{ props.row.numeroOrden }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-vehiculo="props">
          <q-td :props="props">
            <div class="row items-center">
              <PlacaBadge :placa="getPlacaVehiculo(props.row.vehiculoId)" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold text-grey-9">{{ getVehiculoDetalles(props.row.vehiculoId) }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-dueno="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ getClienteNombre(props.row.vehiculoId) }}</div>
            <div class="text-caption text-grey-7" v-if="getClienteTelefono(props.row.vehiculoId)">
              <q-icon name="phone" size="xs" class="q-mr-xs text-green-7" />{{ getClienteTelefono(props.row.vehiculoId)
              }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-trabajo="props">
          <q-td :props="props" style="max-width: 320px;">
            <div class="text-caption text-grey-9 ellipsis-2-lines q-mb-xs" :title="props.row.descripcionFalla">
              {{ props.row.descripcionFalla }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-mecanico="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="sm" color="purple-1" text-color="purple-8" class="q-mr-xs" icon="engineering" />
              <span class="text-grey-9 text-weight-medium">{{ getMecanicoNombre(props.row.mecanicoId) }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <StatusChip :estado="props.row.estado" />
          </q-td>
        </template>

        <template v-slot:body-cell-ficha="props">
          <q-td :props="props">
            <q-btn flat color="primary" icon="directions_car" label="Ver Carro" no-caps size="sm"
              class="text-weight-bold" @click="verFichaAuto(props.row.vehiculoId)">
              <q-tooltip>Ir a la ficha de este vehículo</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props">
            <div class="text-weight-bolder text-grey-9 text-body2">{{ formatMoneda(props.row.costoManoObra) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openInlineForm(props.row)">
              <q-tooltip>Editar Orden</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="deleteOrden(props.row._id)">
              <q-tooltip>Eliminar Orden</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6 text-subtitle1">
            <q-icon name="assignment_late" size="2em" class="q-mr-sm text-grey-4" />
            No se encontraron órdenes de trabajo.
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import StatusChip from '@/components/StatusChip.vue'
import PageHeader from '@/components/PageHeader.vue'
import PlacaBadge from '@/components/PlacaBadge.vue'
import api from '@/services/api'
import { getMarcas, getModelosPorMarca } from '@/constants/vehiculos'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const filtroBusqueda = ref('')
const filtroEstado = ref('Todos')
const loading = ref(false)

const ordenes = ref([])
const vehiculosOptions = ref([])
const mecanicosOptions = ref([])
let searchTimeout = null
let vehiculoSearchTimeout = null
let mecanicoSearchTimeout = null

const saving = ref(false)
const isCreationOpen = ref(false)
const isRegisteringInlineVehicle = ref(false)
const isRegisteringInlineClient = ref(false)
const clientesOptions = ref([])
let clientSearchTimeout = null

const marcasList = getMarcas()
const marcasOptions = ref(marcasList)
const modelosOptions = ref([])

const estadosPosibles = [
  'En diagnóstico', 'Pendiente de aprobación', 'Esperando repuestos',
  'En reparación', 'Listo para entrega', 'Entregada', 'Cancelada'
]

const form = ref({
  _id: null,
  numeroOrden: '',
  vehiculoId: null,
  mecanicoId: null,
  fechaEntregaEstimada: '',
  descripcionFalla: '',
  estado: 'En diagnóstico',
  costoManoObra: 0,
  historial: []
})

const newClient = ref({ nombre: '', cedula: '', telefono: '', correo: '', direccion: '' })
const newVehicle = ref({ placa: '', marca: '', modelo: '', anio: new Date().getFullYear(), clienteId: null })

// Funciones utilitarias
function filterMarcas(val, update) {
  if (!val) {
    update(() => { marcasOptions.value = marcasList })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    marcasOptions.value = marcasList.filter(v => v.toLowerCase().includes(needle))
  })
}

function onNewVehicleMarcaChange(val) {
  newVehicle.value.marca = val || ''
  newVehicle.value.modelo = ''
  if (val) {
    modelosOptions.value = getModelosPorMarca(val)
  } else {
    modelosOptions.value = []
  }
}

function filterModelos(val, update) {
  const allModels = getModelosPorMarca(newVehicle.value.marca)
  if (!val) {
    update(() => { modelosOptions.value = allModels })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    modelosOptions.value = allModels.filter(v => v.toLowerCase().includes(needle))
  })
}

function getPlacaVehiculo(vehiculo) {
  if (!vehiculo) return 'N/A'
  return typeof vehiculo === 'object' ? vehiculo.placa : vehiculo
}

function getVehiculoDetalles(vehiculo) {
  if (!vehiculo || typeof vehiculo !== 'object') return ''
  const marca = vehiculo.marca || ''
  const modelo = vehiculo.modelo || ''
  return `${marca} ${modelo}`.trim() || 'Sin detalles'
}

function getClienteNombre(vehiculo) {
  if (!vehiculo || typeof vehiculo !== 'object') return 'N/A'
  return vehiculo.clienteId?.nombre || vehiculo.cliente?.nombre || 'N/A'
}

function getClienteTelefono(vehiculo) {
  if (!vehiculo || typeof vehiculo !== 'object') return ''
  return vehiculo.clienteId?.telefono || vehiculo.cliente?.telefono || ''
}

function getMecanicoNombre(mecanico) {
  if (!mecanico) return 'Sin asignar'
  if (typeof mecanico === 'object') return mecanico.nombre
  return 'Asignado'
}

function formatMoneda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '$ 0'
  return `$ ${Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

function formatInputMoneda(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  const numStr = valor.toString().replace(/\D/g, '')
  if (!numStr) return ''
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function unformatMoneda(valor) {
  if (!valor) return 0
  const numeroPuro = valor.toString().replace(/\./g, '')
  return Number(numeroPuro) || 0
}

const columns = [
  { name: 'orden', label: 'Orden', align: 'left', field: 'numeroOrden', sortable: true },
  { name: 'vehiculo', label: 'Vehículo', align: 'left', field: row => getPlacaVehiculo(row.vehiculoId), sortable: true },
  { name: 'dueno', label: 'Dueño (Propietario)', align: 'left', field: row => getClienteNombre(row.vehiculoId) },
  { name: 'trabajo', label: 'Trabajo Solicitado', align: 'left', field: 'descripcionFalla' },
  { name: 'mecanico', label: 'Mecánico', align: 'left', field: row => getMecanicoNombre(row.mecanicoId) },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'ficha', label: 'Ficha Auto', align: 'center' },
  { name: 'total', label: 'Total', align: 'right', field: 'costoManoObra', sortable: true },
  { name: 'detalle', label: 'Acciones', align: 'center' }
]

// Funciones de apertura y manipulación del formulario
async function openInlineForm(orden = null, preselectVehiculoId = null) {
  isCreationOpen.value = true
  isRegisteringInlineVehicle.value = false

  if (orden) {
    const dateStr = orden.fechaEntregaEstimada ? new Date(orden.fechaEntregaEstimada).toISOString().split('T')[0] : ''
    form.value = {
      ...orden,
      vehiculoId: orden.vehiculoId?._id || orden.vehiculoId,
      mecanicoId: orden.mecanicoId?._id || orden.mecanicoId,
      fechaEntregaEstimada: dateStr
    }
    if (orden.vehiculoId && typeof orden.vehiculoId === 'object') vehiculosOptions.value = [orden.vehiculoId]
    if (orden.mecanicoId && typeof orden.mecanicoId === 'object') mecanicosOptions.value = [orden.mecanicoId]
  } else {
    form.value = {
      _id: null,
      numeroOrden: '',
      vehiculoId: preselectVehiculoId || null,
      mecanicoId: null,
      fechaEntregaEstimada: new Date().toISOString().split('T')[0],
      descripcionFalla: '',
      estado: 'En diagnóstico',
      costoManoObra: 0,
      historial: []
    }
    vehiculosOptions.value = []
    mecanicosOptions.value = []
    clientesOptions.value = []
    newVehicle.value = { placa: '', marca: '', modelo: '', anio: new Date().getFullYear(), clienteId: null }
    newClient.value = { nombre: '', cedula: '', telefono: '', correo: '', direccion: '' }
    isRegisteringInlineClient.value = false

    if (preselectVehiculoId) {
      try {
        const { data: v } = await api.get(`/vehiculos/${preselectVehiculoId}`)
        if (v) {
          vehiculosOptions.value = [v]
          form.value.vehiculoId = v._id
        }
      } catch (e) {
        console.error('Error prefetching vehicle:', e)
      }
    }
  }
}

function closeInlineForm() {
  isCreationOpen.value = false
  isRegisteringInlineVehicle.value = false
  if (route.query.nuevo || route.query.vehiculoId) {
    router.replace({ path: route.path, query: {} })
  }
}

function limpiarFiltroMecanico() {
  const query = { ...route.query }
  delete query.mecanicoId
  router.replace({ path: route.path, query })
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { limit: 100 }
    if (filtroBusqueda.value) params.q = filtroBusqueda.value
    if (filtroEstado.value && filtroEstado.value !== 'Todos') params.estado = filtroEstado.value
    if (route.query.mecanicoId) params.mecanicoId = route.query.mecanicoId

    const { data } = await api.get('/ordenes', { params })
    ordenes.value = data
  } catch (error) {
    console.error('Error fetching data:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar órdenes' })
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(), 400)
}

function filterVehiculos(val, update, abort) {
  if (vehiculoSearchTimeout) clearTimeout(vehiculoSearchTimeout)
  vehiculoSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/vehiculos', { params: { q: val, limit: 10 } })
      update(() => { vehiculosOptions.value = data })
    } catch (e) { abort() }
  }, 300)
}

function filterMecanicos(val, update, abort) {
  if (mecanicoSearchTimeout) clearTimeout(mecanicoSearchTimeout)
  mecanicoSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/mecanicos', { params: { q: val, limit: 10 } })
      update(() => { mecanicosOptions.value = data })
    } catch (e) { abort() }
  }, 300)
}

function filterClientes(val, update, abort) {
  if (clientSearchTimeout) clearTimeout(clientSearchTimeout)
  if (val.length < 2) {
    update(() => { clientesOptions.value = [] })
    return
  }
  clientSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/clientes', { params: { q: val, limit: 10 } })
      update(() => { clientesOptions.value = data })
    } catch (e) { abort() }
  }, 300)
}

const saveOrden = async () => {
  saving.value = true
  try {
    let targetVehiculoId = form.value.vehiculoId;

    if (isRegisteringInlineVehicle.value && !form.value._id) {
      let cId = newVehicle.value.clienteId;
      if (isRegisteringInlineClient.value) {
        const resCliente = await api.post('/clientes', newClient.value)
        cId = resCliente.data._id
      }
      const payloadVehiculo = { ...newVehicle.value, clienteId: cId, placa: newVehicle.value.placa.toUpperCase() }
      const resVehiculo = await api.post('/vehiculos', payloadVehiculo)
      targetVehiculoId = resVehiculo.data._id
    }

    const payload = { ...form.value, vehiculoId: targetVehiculoId }
    delete payload.numeroOrden
    delete payload.historial

    if (form.value._id) {
      await api.put(`/ordenes/${form.value._id}`, payload)
      $q.notify({ type: 'positive', message: 'Orden actualizada exitosamente' })
    } else {
      await api.post('/ordenes', payload)
      $q.notify({ type: 'positive', message: 'Orden creada exitosamente' })
    }
    isCreationOpen.value = false
    if (route.query.nuevo || route.query.vehiculoId) {
      router.replace({ path: route.path, query: {} })
    }
    fetchData()
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al guardar la orden'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    saving.value = false
  }
}

const deleteOrden = (id) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de eliminar esta orden? Esto no se puede deshacer.',
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Eliminar' }
  }).onOk(async () => {
    try {
      await api.delete(`/ordenes/${id}`)
      $q.notify({ type: 'positive', message: 'Orden eliminada' })
      fetchData()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error al eliminar orden' })
    }
  })
}

const verFichaAuto = (vehiculo) => {
  const placa = getPlacaVehiculo(vehiculo);
  if (placa && placa !== 'N/A') {
    router.push({ path: '/vehiculos', query: { q: placa } })
  } else {
    router.push('/vehiculos')
  }
}

// Watcher reactivo y seguro para abrir automáticamente el formulario
watch(
  () => [route.query.nuevo, route.query.vehiculoId],
  ([nuevo, vehiculoId]) => {
    if (nuevo === 'true' || nuevo === true) {
      openInlineForm(null, vehiculoId)
    }
  },
  { immediate: true }
)

// Watcher para cambios en filtros de URL (búsqueda y mecánico)
watch(
  () => [route.query.q, route.query.mecanicoId],
  ([newQ]) => {
    if (newQ !== undefined) {
      filtroBusqueda.value = newQ || ''
    }
    fetchData()
  }
)

onMounted(() => {
  if (route.query.q) {
    filtroBusqueda.value = route.query.q
  }
  fetchData()
})
</script>

<style scoped>
/* Estilos integrados en app.scss */
</style>