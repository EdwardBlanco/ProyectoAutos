<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Mecánicos" subtitle="Personal del taller">
        <template #actions>
          <q-btn unelevated color="primary" label="Nuevo mecánico" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface">
        <div class="q-pa-md">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por nombre o especialidad" color="primary">
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
          <template #body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round color="primary" icon="edit" size="sm" @click="openDialog(props.row)" />
              <q-btn flat round color="negative" icon="delete" size="sm" @click="deleteMecanico(props.row._id)" />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width q-pa-lg text-center empty-copy">No hay mecánicos que coincidan.</div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialogo para Crear/Editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px; border-radius: 12px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ form._id ? 'Editar Mecánico' : 'Nuevo Mecánico' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveMecanico" class="q-gutter-md">
            <q-input v-model="form.nombre" label="Nombre completo *" outlined dense :rules="[val => !!val || 'El nombre es requerido']" />
            <q-input v-model="form.especialidad" label="Especialidad *" outlined dense :rules="[val => !!val || 'La especialidad es requerida']" />
            <q-input v-model="form.telefono" label="Teléfono *" outlined dense :rules="[val => !!val || 'El teléfono es requerido']" />
            
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
const mecanicos = ref([])
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  nombre: '',
  especialidad: '',
  telefono: ''
})

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'especialidad', label: 'Especialidad', field: 'especialidad', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' }
]

const fetchMecanicos = async () => {
  try {
    const { data } = await api.get('/mecanicos')
    mecanicos.value = data
  } catch (error) {
    console.error('Error fetching mecanicos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar mecánicos' })
  }
}

onMounted(() => {
  fetchMecanicos()
})

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return mecanicos.value
  return mecanicos.value.filter((m) => `${m.nombre} ${m.especialidad}`.toLowerCase().includes(q))
})

const openDialog = (mecanico = null) => {
  if (mecanico) {
    form.value = { ...mecanico }
  } else {
    form.value = { _id: null, nombre: '', especialidad: '', telefono: '' }
  }
  dialog.value = true
}

const saveMecanico = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await api.put(`/mecanicos/${form.value._id}`, form.value)
      $q.notify({ type: 'positive', message: 'Mecánico actualizado' })
    } else {
      await api.post('/mecanicos', form.value)
      $q.notify({ type: 'positive', message: 'Mecánico registrado' })
    }
    dialog.value = false
    fetchMecanicos()
  } catch (error) {
    console.error('Error saving mecanico:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el mecánico' })
  } finally {
    saving.value = false
  }
}

const deleteMecanico = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este mecánico?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/mecanicos/${id}`)
      $q.notify({ type: 'positive', message: 'Mecánico eliminado' })
      fetchMecanicos()
    } catch (error) {
      console.error('Error deleting mecanico:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar mecánico' })
    }
  })
}
</script>
