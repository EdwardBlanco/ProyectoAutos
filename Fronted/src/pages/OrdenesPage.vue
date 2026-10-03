<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Órdenes de trabajo" subtitle="Seguimiento de diagnósticos y reparaciones">
        <template #actions>
          <q-btn unelevated color="primary" label="Nueva orden" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por orden, placa o cliente" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>
        <q-table
          class="app-table"
          flat
          :rows="filtradas"
          :columns="columns"
          row-key="_id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <StatusChip :estado="props.row.estado" />
            </q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)" />
              <q-btn flat round color="negative" icon="delete" size="sm" @click="deleteOrden(props.row._id)" />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay órdenes que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialogo para Crear/Editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ form._id ? 'Editar Orden' : 'Nueva Orden' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveOrden" class="q-gutter-md">
            <q-input v-model="form.numeroOrden" label="Número de Orden *" outlined dense :rules="[val => !!val || 'Requerido']" />
            
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
            />

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
            />

            <q-input v-model="form.fechaEntregaEstimada" type="date" label="Fecha Estimada Entrega *" outlined dense :rules="[val => !!val || 'Requerida']" />
            
            <q-input v-model="form.descripcionFalla" label="Descripción de falla *" outlined dense autogrow :rules="[val => !!val || 'Requerida']" />
            
            <q-input v-model.number="form.costoManoObra" type="number" prefix="$" label="Costo Mano de Obra *" outlined dense :rules="[val => !!val || 'Requerido']" />

            <q-select 
              v-if="form._id"
              v-model="form.estado" 
              :options="['En diagnóstico', 'En reparación', 'Listo', 'Entregado']" 
              label="Estado de la Orden" 
              outlined 
              dense 
            />
            
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" color="grey-6" flat v-close-popup />
              <q-btn label="Guardar" type="submit" color="primary" unelevated class="q-ml-sm" :loading="saving" />
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

const columns = [
  { name: 'id', label: 'Orden', field: 'numeroOrden', align: 'left' },
  { name: 'placa', label: 'Placa', field: row => row.vehiculoId?.placa || 'N/A', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: row => row.vehiculoId?.clienteId?.nombre || 'N/A', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha', label: 'Fecha Ingreso', field: row => new Date(row.fechaIngreso).toLocaleDateString(), align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
]

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

const filtradas = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return ordenes.value
  return ordenes.value.filter((o) => `${o.numeroOrden} ${o.vehiculoId?.placa}`.toLowerCase().includes(q))
})

const openDialog = (orden = null) => {
  if (orden) {
    // Format date to YYYY-MM-DD for q-input type date
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
      $q.notify({ type: 'positive', message: 'Orden actualizada' })
    } else {
      await api.post('/ordenes', form.value)
      $q.notify({ type: 'positive', message: 'Orden creada' })
    }
    dialog.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving orden:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar orden' })
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
