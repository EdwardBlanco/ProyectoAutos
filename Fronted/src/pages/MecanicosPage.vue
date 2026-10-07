<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Mecánicos" subtitle="Personal del taller">
        <template #actions>
          <q-btn unelevated color="primary" label="Nuevo mecánico" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface q-pa-md">
        <!-- Buscador -->
        <div class="q-mb-lg">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por DNI/Cédula, nombre, especialidad o correo" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>

        <!-- CUADRÍCULA ESTILO CONTACTOS -->
        <div v-if="filtrados.length > 0" class="row q-col-gutter-md">
          <div
            v-for="mecanico in filtrados"
            :key="mecanico._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="contact-card q-pa-sm relative-position bg-white"
              :class="{ 'card-selected': selectedMecanicos.includes(mecanico._id) }"
            >
              <!-- Fila Superior: Avatar + Info + Menú (...) -->
              <div class="row items-center justify-between no-wrap q-mb-sm">
                <div class="row items-center no-wrap">
                  <!-- Avatar con iniciales -->
                  <q-avatar size="38px" color="negative" text-color="white" class="text-bold q-mr-sm">
                    {{ getInitials(mecanico.nombre) }}
                  </q-avatar>

                  <!-- Nombre y Correo/Teléfono -->
                  <div class="ellipsis">
                    <div class="text-subtitle2 text-bold text-grey-9 leading-tight ellipsis">
                      {{ mecanico.nombre }}
                    </div>
                    <div class="text-caption text-grey-6 ellipsis">
                      {{ mecanico.correo || mecanico.telefono || 'Sin datos de contacto' }}
                    </div>
                  </div>
                </div>

                <!-- Botón de Opciones (...) -->
                <q-btn flat round dense icon="more_horiz" color="grey-7" size="sm">
                  <q-menu auto-close class="shadow-3 style-menu">
                    <q-list dense style="min-width: 140px">
                      <q-item clickable @click="openDialog(mecanico)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="edit" size="18px" color="grey-8" />
                        </q-item-section>
                        <q-item-section class="text-grey-9">Editar</q-item-section>
                      </q-item>

                      <q-item clickable @click="deleteMecanico(mecanico._id)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="delete" size="18px" color="negative" />
                        </q-item-section>
                        <q-item-section class="text-negative text-bold">Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <!-- Fila Inferior: Tags (DNI / Especialidad / Teléfono) + Checkbox -->
              <div class="row items-center justify-between q-mt-xs">
                <div class="row items-center q-gutter-xs">
                  <q-chip dense flat class="bg-grey-2 text-grey-8 text-caption">
                    {{ mecanico.cedula ? `DNI: ${mecanico.cedula}` : 'Sin DNI' }}
                  </q-chip>

                  <q-chip dense flat class="bg-red-1 text-negative text-caption text-bold">
                    <q-icon name="engineering" size="14px" class="q-mr-xs" />
                    {{ mecanico.especialidad || 'General' }}
                  </q-chip>
                </div>

                <!-- Checkbox lateral derecho -->
                <q-checkbox v-model="selectedMecanicos" :val="mecanico._id" dense size="xs" color="primary" />
              </div>
            </q-card>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="full-width q-pa-xl text-center text-grey-6">
          No hay mecánicos que coincidan con la búsqueda.
        </div>
      </div>
    </div>

    <!-- Dialogo / Tarjeta de Formulario con Validaciones -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 16px; overflow: hidden;" class="shadow-10">
        <!-- Cabecera estilo tarjeta de identificación -->
        <q-card-section class="bg-black text-white q-pa-md row items-center justify-between">
          <div class="row items-center">
            <q-avatar color="negative" text-color="white" icon="engineering" size="38px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-bold leading-tight">
                {{ form._id ? 'Editar Mecánico' : 'Nuevo Mecánico' }}
              </div>
              <div class="text-caption text-grey-4">Datos de identificación, contacto y especialidad técnica</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <!-- Cuerpo del Formulario -->
        <q-card-section class="q-pa-lg">
          <q-form @submit="saveMecanico" class="q-gutter-y-md">
            
            <!-- DNI / Cédula -->
            <q-input
              v-model="form.cedula"
              label="DNI / Cédula *"
              outlined
              dense
              mask="##############"
              unmasked-value
              :rules="[
                val => !!val || 'El DNI/Cédula es obligatorio',
                val => /^[0-9]{6,12}$/.test(val) || 'Debe ser numérico entre 6 y 12 dígitos'
              ]"
            >
              <template #prepend><q-icon name="badge" color="negative" /></template>
            </q-input>

            <!-- Nombre Completo -->
            <q-input
              v-model="form.nombre"
              label="Nombre completo *"
              outlined
              dense
              :rules="[
                val => !!val || 'El nombre es obligatorio',
                val => val.trim().length >= 3 || 'Debe tener mínimo 3 caracteres'
              ]"
            >
              <template #prepend><q-icon name="person" color="negative" /></template>
            </q-input>

            <!-- Especialidad -->
            <q-input
              v-model="form.especialidad"
              label="Especialidad *"
              outlined
              dense
              placeholder="Ej. Motor, Frenos, Suspensión, Electricidad"
              :rules="[
                val => !!val || 'La especialidad es obligatoria'
              ]"
            >
              <template #prepend><q-icon name="build" color="negative" /></template>
            </q-input>

            <!-- Número de Teléfono -->
            <q-input
              v-model="form.telefono"
              label="Número de teléfono *"
              outlined
              dense
              mask="##########"
              unmasked-value
              :rules="[
                val => !!val || 'El teléfono es obligatorio',
                val => /^[0-9]{7,10}$/.test(val) || 'Ingrese entre 7 y 10 dígitos numéricos'
              ]"
            >
              <template #prepend><q-icon name="phone" color="negative" /></template>
            </q-input>

            <!-- Gmail / Correo Electrónico -->
            <q-input
              v-model="form.correo"
              type="email"
              label="Gmail / Correo *"
              outlined
              dense
              :rules="[
                val => !!val || 'El correo es obligatorio',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un formato de correo válido'
              ]"
            >
              <template #prepend><q-icon name="email" color="negative" /></template>
            </q-input>

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
import api from '@/services/api'

const $q = useQuasar()
const filtro = ref('')
const mecanicos = ref([])
const selectedMecanicos = ref([])
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  cedula: '',
  nombre: '',
  especialidad: '',
  telefono: '',
  correo: ''
})

const getInitials = (nombre) => {
  if (!nombre) return 'M'
  const words = nombre.trim().split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

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
  return mecanicos.value.filter((m) => 
    `${m.cedula || ''} ${m.nombre} ${m.especialidad || ''} ${m.correo || ''} ${m.telefono || ''}`.toLowerCase().includes(q)
  )
})

const openDialog = (mecanico = null) => {
  if (mecanico) {
    form.value = { ...mecanico }
  } else {
    form.value = { _id: null, cedula: '', nombre: '', especialidad: '', telefono: '', correo: '' }
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

.leading-tight {
  line-height: 1.2;
}
</style>