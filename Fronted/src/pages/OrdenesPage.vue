<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell">

      <!-- HEADER (TITULO) -->
      <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight q-mb-md">Órdenes de Reparación</h1>

      <!-- BOTON "+" -->
      <div class="q-mb-md">
        <q-btn v-if="!isCreationOpen" unelevated color="primary" label="Nueva Orden" icon="add" no-caps
          class="rounded-button shadow-3 q-px-lg q-py-sm text-weight-bold transition-all hover-scale"
          @click="openInlineForm()" />
      </div>

      <!-- SEARCH BAR -->
      <div class="q-mb-md search-container">
        <q-input v-model="filtroBusqueda" dense outlined
          placeholder="Buscar por placa (ej: 8492-KTL), cliente o número de orden..." @update:model-value="onSearch"
          clearable class="bg-white search-input">
          <template #prepend><q-icon name="search" color="grey-6" /></template>
        </q-input>
      </div>

      <!-- FILTROS (TABS) -->
      <q-tabs v-model="filtroEstado" dense class="text-grey-7 q-mb-md bg-white rounded-borders shadow-1"
        active-color="primary" indicator-color="primary" align="left" narrow-indicator @update:model-value="fetchData">
        <q-tab name="Todos" label="Todas las Órdenes" no-caps class="text-weight-medium" />
        <q-tab name="En diagnóstico" label="En Diagnóstico" no-caps class="text-weight-medium" />
        <q-tab name="En reparación" label="En Reparación" no-caps class="text-weight-medium" />
        <q-tab name="Pendiente de aprobación" label="Pend. Aprobación" no-caps class="text-weight-medium" />
        <q-tab name="Esperando repuestos" label="Espera Repuestos" no-caps class="text-weight-medium" />
        <q-tab name="Listo para entrega" label="Listas p/ Retiro" no-caps class="text-weight-medium" />
        <q-tab name="Entregada" label="Entregados" no-caps class="text-weight-medium" />
        <q-tab name="Cancelada" label="Canceladas" no-caps class="text-weight-medium" />
      </q-tabs>

      <!-- REGISTRADOS (#) -->
      <div class="text-subtitle2 text-grey-8 q-mb-md">
        Registrados ({{ ordenes.length }})
      </div>

      <!-- INLINE WORKBENCH (SIN MODALS) -->
      <transition name="q-transition--slide-down">
        <div v-if="isCreationOpen" class="q-mb-lg">
          <q-card class="bg-white border shadow-2">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="row items-center">
                <q-avatar color="primary" text-color="white" icon="build" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle1 text-bold leading-tight">{{ form._id ? 'Editar Orden: ' + form.numeroOrden
                    :
                    'Ingreso de Vehículo · Nueva Orden' }}</div>
                  <div class="text-caption text-grey-7">Formulario unificado: registre cliente, vehículo y asigne el
                    trabajo.
                  </div>
                </div>
              </div>
              <q-btn icon="close" flat round dense color="grey-8" @click="closeInlineForm" />
            </q-card-section>

            <q-card-section>
              <q-form @submit="saveOrden" class="row q-col-gutter-md">
                <!-- SECCION 1: Vehiculo y Cliente -->
                <div class="col-12 col-md-4">
                  <div class="text-bold text-primary q-mb-sm flex items-center">
                    <q-icon name="directions_car" size="sm" class="q-mr-xs" />
                    1. Carro & Dueño
                  </div>

                  <div class="q-mb-sm text-right" v-if="!form._id">
                    <q-btn flat dense color="primary" no-caps size="sm"
                      :label="isRegisteringInlineVehicle ? '← Seleccionar existente' : '+ Carro nuevo aquí'"
                      @click="isRegisteringInlineVehicle = !isRegisteringInlineVehicle" />
                  </div>

                  <div v-if="!isRegisteringInlineVehicle">
                    <q-select v-model="form.vehiculoId" :options="vehiculosOptions" option-value="_id"
                      option-label="placa" label="Vehículo (Buscar por Placa) *" emit-value map-options use-input
                      outlined dense @filter="filterVehiculos" :rules="[val => !!val || 'Seleccione un vehículo']">
                      <template #prepend><q-icon name="directions_car" color="primary" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.placa }} - {{ scope.opt.marca }}</q-item-label>
                            <q-item-label caption v-if="scope.opt.clienteId">
                              {{ scope.opt.clienteId.nombre }} ({{ scope.opt.clienteId.cedula || 'N/A' }})
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                  <div v-else class="q-pa-sm rounded-borders border q-gutter-y-sm bg-grey-1">
                    <div class="text-caption text-bold text-primary">Datos del Nuevo Auto</div>
                    <q-input v-model="newVehicle.placa" label="Placa *" outlined dense class="text-uppercase bg-white"
                      :rules="[val => !!val || 'Requerido']" />
                    <div class="row q-col-gutter-sm">
                      <div class="col-6"><q-input v-model="newVehicle.marca" label="Marca *" outlined dense
                          class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                      <div class="col-6"><q-input v-model="newVehicle.modelo" label="Modelo *" outlined dense
                          class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                    </div>
                    <q-input v-model.number="newVehicle.anio" type="number" label="Año *" outlined dense
                      class="bg-white" :rules="[val => !!val || 'Requerido']" />

                    <div class="row items-center justify-between q-mt-sm border-top q-pt-sm">
                      <div class="text-caption text-bold text-primary">Dueño del carro</div>
                      <q-btn flat dense color="primary" no-caps size="sm"
                        :label="isRegisteringInlineClient ? '← Buscar existente' : '+ Dueño nuevo aquí'"
                        @click="isRegisteringInlineClient = !isRegisteringInlineClient" />
                    </div>

                    <div v-if="!isRegisteringInlineClient">
                      <q-select v-model="newVehicle.clienteId" :options="clientesOptions"
                        label="Propietario / Cliente *" outlined dense option-value="_id" option-label="nombre"
                        emit-value map-options use-input @filter="filterClientes" :rules="[val => !!val || 'Requerido']"
                        class="bg-white">
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                              <q-item-label caption>{{ scope.opt.cedula }}</q-item-label>
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
                <div class="col-12 col-md-4">
                  <div class="text-bold text-primary q-mb-sm flex items-center">
                    <q-icon name="description" size="sm" class="q-mr-xs" />
                    2. Motivo de Ingreso
                  </div>
                  <q-input v-model="form.descripcionFalla" label="Falla reportada / Motivo *" outlined dense autogrow
                    rows="4" :rules="[val => !!val || 'Requerido']" class="q-mb-md">
                    <template #prepend><q-icon name="report_problem" color="primary" /></template>
                  </q-input>

                  <q-select v-model="form.mecanicoId" :options="mecanicosOptions" option-value="_id"
                    option-label="nombre" label="Mecánico Asignado *" emit-value map-options use-input outlined dense
                    class="q-mb-md" @filter="filterMecanicos" :rules="[val => !!val || 'Requerido']">
                    <template #prepend><q-icon name="engineering" color="primary" /></template>
                  </q-select>

                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-select v-model="form.estado" :options="estadosPosibles" label="Estado *" outlined dense
                        :rules="[val => !!val || 'Requerido']" />
                    </div>
                    <div class="col-6">
                      <q-input v-model="form.fechaEntregaEstimada" type="date" label="Entrega Est." outlined dense
                        :rules="[val => !!val || 'Requerido']" />
                    </div>
                  </div>
                </div>

                <!-- SECCION 3: Presupuesto -->
                <div class="col-12 col-md-4">
                  <div class="text-bold text-primary q-mb-sm flex items-center">
                    <q-icon name="attach_money" size="sm" class="q-mr-xs" />
                    3. Presupuesto
                  </div>

                  <div class="q-mb-md">
                    <q-input v-model.number="form.costoManoObra" type="number" prefix="$"
                      label="Costo Total / Mano de Obra *" outlined dense
                      :rules="[val => val !== null && val !== '' || 'Requerido']">
                      <template #prepend><q-icon name="attach_money" color="primary" /></template>
                    </q-input>
                  </div>

                  <!-- Historial de Estados (si es edición) -->
                  <div v-if="form.historial && form.historial.length > 0" class="q-mt-md border-top q-pt-sm">
                    <div class="text-caption text-bold text-grey-7 q-mb-xs">Historial de Estados:</div>
                    <q-scroll-area style="height: 100px;" class="bg-grey-2 rounded-borders q-pa-sm border">
                      <div v-for="(hist, idx) in form.historial" :key="idx"
                        class="text-caption row items-center q-mb-xs">
                        <q-icon name="circle" size="8px" color="primary" class="q-mr-xs" />
                        <span class="text-bold q-mr-sm">{{ hist.estado }}</span>
                        <span class="text-grey-6">{{ new Date(hist.fecha).toLocaleString() }}</span>
                      </div>
                    </q-scroll-area>
                  </div>
                </div>

                <div class="col-12 text-right q-mt-sm border-top q-pt-md">
                  <q-btn label="Cancelar" color="grey-8" flat @click="closeInlineForm" class="q-mr-sm text-weight-bold"
                    no-caps />
                  <q-btn :label="form._id ? 'Guardar Cambios' : 'Generar Orden'" type="submit" color="primary"
                    unelevated :loading="saving" class="text-weight-bold" no-caps icon="save" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </transition>

      <!-- TABLA DE ORDENES -->
      <q-table :rows="ordenes" :columns="columns" row-key="_id" flat bordered :loading="loading"
        class="bg-white shadow-1 table-ordenes" :rows-per-page-options="[10, 20, 50, 0]">
        <template v-slot:body-cell-orden="props">
          <q-td :props="props">
            <div class="text-weight-bold text-primary">{{ props.row.numeroOrden }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-vehiculo="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ getPlacaVehiculo(props.row.vehiculoId) }}</div>
            <div class="text-caption text-grey-7">{{ getVehiculoDetalles(props.row.vehiculoId) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-dueno="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ getClienteNombre(props.row.vehiculoId) }}</div>
            <div class="text-caption text-grey-7">{{ getClienteTelefono(props.row.vehiculoId) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-trabajo="props">
          <q-td :props="props" style="max-width: 250px;">
            <div class="text-caption text-grey-9 ellipsis-2-lines q-mb-xs" :title="props.row.descripcionFalla">
              {{ props.row.descripcionFalla }}
            </div>
            <!-- Si tuvieramos kilometraje: <div class="text-caption text-grey-6 text-italic">Entró con: 35.000 km</div> -->
          </q-td>
        </template>

        <template v-slot:body-cell-mecanico="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="sm" color="grey-2" text-color="grey-8" class="q-mr-xs" icon="engineering" />
              <span class="text-grey-9">{{ getMecanicoNombre(props.row.mecanicoId) }}</span>
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
            <q-btn flat color="primary" label="Ver Historial" no-caps size="sm" class="text-weight-bold"
              @click="verFichaAuto(props.row.vehiculoId)" />
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ formatMoneda(props.row.costoManoObra) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-detalle="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="grey-8" size="sm" @click="openInlineForm(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="negative" size="sm" @click="deleteOrden(props.row._id)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6 text-subtitle1">
            <q-icon name="warning" size="2em" class="q-mr-sm" />
            No se encontraron órdenes de trabajo.
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import StatusChip from '@/components/StatusChip.vue'
import api from '@/services/api'

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

const estadosPosibles = [
  'En diagnóstico', 'Pendiente de aprobación', 'Esperando repuestos',
  'En reparación', 'Listo para entrega', 'Entregada', 'Cancelada'
]

const columns = [
  { name: 'orden', label: 'Orden', align: 'left', field: 'numeroOrden', sortable: true },
  { name: 'vehiculo', label: 'Vehículo', align: 'left', field: row => getPlacaVehiculo(row.vehiculoId), sortable: true },
  { name: 'dueno', label: 'Dueño (Propietario)', align: 'left', field: row => getClienteNombre(row.vehiculoId) },
  { name: 'trabajo', label: 'Trabajo Solicitado', align: 'left', field: 'descripcionFalla' },
  { name: 'mecanico', label: 'Mecánico', align: 'left', field: row => getMecanicoNombre(row.mecanicoId) },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  { name: 'ficha', label: 'Ficha del Auto', align: 'center' },
  { name: 'total', label: 'Total', align: 'right', field: 'costoManoObra', sortable: true },
  { name: 'detalle', label: 'Detalle', align: 'center' }
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
const newVehicle = ref({ placa: '', marca: '', modelo: '', anio: '', clienteId: null })

const formatMoneda = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return '$ 0'
  return `$ ${Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = { limit: 100 }
    if (filtroBusqueda.value) params.q = filtroBusqueda.value
    if (filtroEstado.value && filtroEstado.value !== 'Todos') params.estado = filtroEstado.value

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

onMounted(() => {
  fetchData()
  if (route.query.nuevo) {
    openInlineForm()
    router.replace({ path: route.path, query: {} })
  }
})

const getPlacaVehiculo = (vehiculo) => {
  if (!vehiculo) return 'N/A'
  return typeof vehiculo === 'object' ? vehiculo.placa : vehiculo
}

const getVehiculoDetalles = (vehiculo) => {
  if (!vehiculo || typeof vehiculo !== 'object') return ''
  const marca = vehiculo.marca || ''
  const modelo = vehiculo.modelo || ''
  return `${marca} ${modelo}`.trim() || 'Sin detalles'
}

const getClienteNombre = (vehiculo) => {
  if (!vehiculo || typeof vehiculo !== 'object') return 'N/A'
  return vehiculo.clienteId?.nombre || vehiculo.cliente?.nombre || 'N/A'
}

const getClienteTelefono = (vehiculo) => {
  if (!vehiculo || typeof vehiculo !== 'object') return ''
  return vehiculo.clienteId?.telefono || vehiculo.cliente?.telefono || ''
}

const getMecanicoNombre = (mecanico) => {
  if (!mecanico) return 'Sin asignar'
  if (typeof mecanico === 'object') return mecanico.nombre
  return 'Asignado'
}

const filterVehiculos = (val, update, abort) => {
  if (vehiculoSearchTimeout) clearTimeout(vehiculoSearchTimeout)
  vehiculoSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/vehiculos', { params: { q: val, limit: 10 } })
      update(() => { vehiculosOptions.value = data })
    } catch (e) { abort() }
  }, 300)
}

const filterMecanicos = (val, update, abort) => {
  if (mecanicoSearchTimeout) clearTimeout(mecanicoSearchTimeout)
  mecanicoSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/mecanicos', { params: { q: val, limit: 10 } })
      update(() => { mecanicosOptions.value = data })
    } catch (e) { abort() }
  }, 300)
}

const filterClientes = (val, update, abort) => {
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

const openInlineForm = (orden = null) => {
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
      vehiculoId: null,
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
    newVehicle.value = { placa: '', marca: '', modelo: '', anio: '', clienteId: null }
    newClient.value = { nombre: '', cedula: '', telefono: '', correo: '', direccion: '' }
    isRegisteringInlineClient.value = false
  }
}

const closeInlineForm = () => {
  isCreationOpen.value = false
  isRegisteringInlineVehicle.value = false
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
  if (placa !== 'N/A') {
    // Redirigir a VehiculosPage con filtro de placa si fuera necesario
    // Por ahora, mostrar notificación
    $q.notify({ type: 'info', message: `Redirigiendo a ficha del vehículo ${placa}...`, position: 'top' })
  }
}
</script>

<style scoped>
/* Las clases de utilidades se movieron a app.scss */
</style>