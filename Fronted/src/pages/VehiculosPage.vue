<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Vehículos" subtitle="Flota registrada en el taller">
        <template #actions>
          <q-btn unelevated color="primary" label="Registrar vehículo" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por placa o marca" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>
        <q-table
          class="app-table"
          flat
          :rows="filtrados"
          :columns="columns"
          row-key="_id"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-cliente="props">
            <q-td :props="props" class="cell-muted">{{ props.row.clienteId?.nombre || 'N/A' }}</q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)" />
              <q-btn flat round color="negative" icon="delete" size="sm" @click="deleteVehiculo(props.row._id)" />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay vehículos que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialogo para Crear/Editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ form._id ? 'Editar Vehículo' : 'Registrar Vehículo' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveVehiculo" class="q-gutter-md">
            <q-input v-model="form.placa" label="Placa *" outlined dense :rules="[val => !!val || 'La placa es requerida']" />
            <q-input v-model="form.marca" label="Marca *" outlined dense :rules="[val => !!val || 'La marca es requerida']" />
            <q-input v-model="form.modelo" label="Modelo *" outlined dense :rules="[val => !!val || 'El modelo es requerido']" />
            <q-input v-model="form.año" type="number" label="Año *" outlined dense :rules="[val => !!val || 'El año es requerido']" />
            <q-input v-model="form.vin" label="VIN (Número de Chasis)" outlined dense />
            
            <q-select 
              v-model="form.clienteId" 
              :options="clientesOptions" 
              option-value="_id" 
              option-label="nombre" 
              label="Propietario *" 
              emit-value 
              map-options
              outlined 
              dense 
              :rules="[val => !!val || 'Seleccione un propietario']" 
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
import api from '@/services/api'

const $q = useQuasar()
const filtro = ref('')
const vehiculos = ref([])
const clientesOptions = ref([])
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  placa: '',
  marca: '',
  modelo: '',
  año: null,
  vin: '',
  clienteId: null
})

const columns = [
  { name: 'placa', label: 'Placa', field: 'placa', align: 'left' },
  { name: 'marca', label: 'Marca', field: 'marca', align: 'left' },
  { name: 'modelo', label: 'Modelo', field: 'modelo', align: 'left' },
  { name: 'anio', label: 'Año', field: 'año', align: 'left' },
  { name: 'cliente', label: 'Propietario', field: 'cliente', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
]

const fetchData = async () => {
  try {
    const [vehiculosRes, clientesRes] = await Promise.all([
      api.get('/vehiculos'),
      api.get('/clientes')
    ])
    vehiculos.value = vehiculosRes.data
    clientesOptions.value = clientesRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  }
}

onMounted(() => {
  fetchData()
})

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return vehiculos.value
  return vehiculos.value.filter((v) => `${v.placa} ${v.marca} ${v.modelo}`.toLowerCase().includes(q))
})

const openDialog = (vehiculo = null) => {
  if (vehiculo) {
    form.value = { ...vehiculo, clienteId: vehiculo.clienteId?._id || vehiculo.clienteId }
  } else {
    form.value = { _id: null, placa: '', marca: '', modelo: '', año: null, vin: '', clienteId: null }
  }
  dialog.value = true
}

const saveVehiculo = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await api.put(`/vehiculos/${form.value._id}`, form.value)
      $q.notify({ type: 'positive', message: 'Vehículo actualizado' })
    } else {
      await api.post('/vehiculos', form.value)
      $q.notify({ type: 'positive', message: 'Vehículo registrado' })
    }
    dialog.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving vehiculo:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar vehículo' })
  } finally {
    saving.value = false
  }
}

const deleteVehiculo = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este vehículo?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/vehiculos/${id}`)
      $q.notify({ type: 'positive', message: 'Vehículo eliminado' })
      fetchData()
    } catch (error) {
      console.error('Error deleting vehiculo:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar vehículo' })
    }
  })
}
</script>
