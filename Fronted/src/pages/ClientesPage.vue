<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell">


      <!-- 1. TITULO -->
      <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight q-mb-md">Directorio de Clientes</h1>

      <!-- 2. BOTON "+" -->
      <div class="q-mb-md">
        <q-btn v-if="!isCreationOpen" color="primary" icon="add" label="Nuevo Cliente" unelevated
          class="rounded-button shadow-3 q-px-lg q-py-sm text-weight-bold transition-all hover-scale" no-caps
          @click="openForm()" />
      </div>

      <!-- 3. INPUT DE BUSQUEDA -->
      <div class="q-mb-md search-container">
        <q-input v-model="search" outlined placeholder="Buscar por placa (ej: 8492-KTL), cliente o número de orden..."
          class="bg-white search-input" dense @update:model-value="onSearch">
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- 4. REGISTRADOS (#) -->
      <div class="text-subtitle2 text-grey-8 q-mb-md font-medium">
        Registrados ({{ clientes.length }})
      </div>

      <!-- INLINE WORKBENCH (Formulario de Creación/Edición) -->
      <transition name="q-transition--slide-down">
        <div v-if="isCreationOpen" class="q-mb-xl">
          <q-card flat bordered class="bg-white">
            <q-card-section class="row items-center justify-between q-pa-md border-bottom bg-grey-1">
              <div class="row items-center">
                <q-avatar color="primary" text-color="white" icon="person" size="md" class="q-mr-md shadow-2" />
                <div>
                  <div class="text-h6 text-bold text-dark">{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</div>
                  <div class="text-caption text-grey-6">Complete la información del propietario</div>
                </div>
              </div>
              <q-btn icon="close" flat round dense color="grey-8" @click="isCreationOpen = false" />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit="saveCliente" class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-input v-model="formData.nombre" label="Nombre Completo *" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="formData.cedula" label="Cédula/Doc *" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.telefono" label="Teléfono *" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.correo" label="Correo Electrónico *" type="email" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.direccion" label="Dirección" outlined dense class="rounded-input" />
                </div>

                <div class="col-12 text-right q-mt-md">
                  <q-btn label="Cancelar" color="grey-7" flat @click="isCreationOpen = false"
                    class="q-mr-md text-weight-bold rounded-button" no-caps />
                  <q-btn :label="isEditing ? 'Guardar Cambios' : 'Registrar Cliente'" type="submit" color="primary"
                    unelevated :loading="saving" class="text-weight-bold rounded-button shadow-2 q-px-lg" no-caps
                    icon="save" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </transition>

      <!-- Client Cards Grid -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <div v-else-if="clientes.length === 0" class="text-center q-pa-xl">
        <q-icon name="people_outline" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">No se encontraron clientes</div>
        <div class="text-caption text-grey-5">Prueba con otro término de búsqueda o registra un nuevo cliente.</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="cliente in clientes" :key="cliente._id" class="col-12 col-md-6 col-lg-4 d-flex">
          <q-card flat bordered
            class="client-card bg-white flex flex-col full-width overflow-hidden transition-all hover-up">

            <!-- Card Header -->
            <div class="q-pa-md bg-grey-1 border-bottom">
              <div class="row justify-between items-start">
                <div class="row items-center q-gutter-x-md">
                  <q-avatar size="54px" color="white" text-color="primary"
                    class="text-weight-bolder shadow-1 font-size-lg border-avatar">
                    {{ cliente.nombre.charAt(0).toUpperCase() }}
                  </q-avatar>
                  <div>
                    <div class="text-h6 text-weight-bold text-dark q-mb-none line-height-tight">{{ cliente.nombre }}
                    </div>
                    <div class="text-caption text-grey-7 flex items-center q-mt-xs">
                      <q-icon name="badge" size="14px" class="q-mr-xs text-grey-5" /> Doc: <span
                        class="text-dark q-ml-xs text-weight-medium">{{ cliente.cedula }}</span>
                    </div>
                  </div>
                </div>
                <q-btn icon="more_vert" flat round dense color="grey-7">
                  <q-menu anchor="bottom right" self="top right" class="border-radius-md shadow-3">
                    <q-list style="min-width: 150px">
                      <q-item clickable v-close-popup @click="openForm(cliente)">
                        <q-item-section avatar><q-icon name="edit" color="primary" size="sm" /></q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="confirmDelete(cliente)">
                        <q-item-section avatar><q-icon name="delete" color="negative" size="sm" /></q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <!-- Quick Info Chips -->
              <div class="row q-mt-md q-gutter-x-sm">
                <q-chip dense square color="blue-1" text-color="blue-9" class="q-ma-none font-medium chip-radius">
                  {{ cliente.vehiculos?.length || 0 }} {{ (cliente.vehiculos?.length === 1) ? 'vehículo' : 'vehículos'
                  }}
                </q-chip>
                <div class="flex items-center text-caption text-grey-8 q-ml-md">
                  <q-icon name="phone" size="14px" class="q-mr-xs text-grey-6" /> {{ cliente.telefono || 'N/A' }}
                </div>
                <div class="flex items-center text-caption text-grey-8 q-ml-md ellipsis" style="max-width: 130px;">
                  <q-icon name="email" size="14px" class="q-mr-xs text-grey-6" /> {{ cliente.correo || 'N/A' }}
                  <q-tooltip>{{ cliente.correo }}</q-tooltip>
                </div>
              </div>
            </div>

            <!-- Card Body: Vehículos -->
            <div class="q-pa-md flex-grow-1 flex flex-col">
              <div class="row justify-between items-center q-mb-md">
                <div class="text-subtitle2 text-weight-bold text-dark flex items-center">
                  <q-icon name="directions_car" size="18px" class="q-mr-sm text-primary" /> Parque Vehicular:
                </div>
                <q-btn flat dense color="primary" icon="add" label="Asociar otro" size="sm" class="text-weight-bold"
                  no-caps @click="asociarVehiculo(cliente)" />
              </div>

              <div class="vehicles-list flex-grow-1">
                <template v-if="cliente.vehiculos && cliente.vehiculos.length > 0">
                  <div v-for="v in cliente.vehiculos" :key="v._id"
                    class="vehicle-item border bg-white rounded-borders q-pa-sm q-mb-sm transition-all hover-border-primary">
                    <div class="row justify-between items-start">
                      <div class="col">
                        <div class="row items-center q-mb-xs">
                          <q-badge color="dark" class="text-weight-bold q-mr-sm placa-badge">{{ v.placa }}</q-badge>
                          <span class="text-body2 text-weight-medium text-dark">{{ v.marca || 'Vehículo' }} {{ v.modelo
                            || '' }} {{ v.anio ? `(${v.anio})` : '' }}</span>
                        </div>
                        <div class="text-caption text-grey-6 flex items-center">
                          <span v-if="v.reparacionesPrevias">{{ v.reparacionesPrevias }} reparaciones previas</span>
                          <span v-else>0 reparaciones previas</span>

                          <template v-if="v.estadoTaller">
                            <span class="q-mx-xs">·</span>
                            <span class="text-orange-8 flex items-center text-weight-medium">
                              En taller <span
                                class="text-grey-7 text-weight-regular q-ml-xs">({{ v.estadoTaller }})</span>
                            </span>
                          </template>
                        </div>
                      </div>
                      <q-btn flat dense color="primary" label="Historial" size="sm" class="text-weight-bold q-ml-sm"
                        no-caps @click="verHistorialVehiculo(v)" />
                    </div>
                  </div>
                </template>
                <div v-else class="text-center q-pa-md border-dashed rounded-borders text-grey-5 text-caption">
                  No hay vehículos asociados a este cliente.
                </div>
              </div>
            </div>


          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const $q = useQuasar()
const router = useRouter()

// State
const clientes = ref([])
const loading = ref(false)
const search = ref('')
const isCreationOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const formData = ref({
  _id: null,
  nombre: '',
  cedula: '',
  telefono: '',
  correo: '',
  direccion: ''
})

let searchTimeout = null

// Fetch data
const fetchClientes = async (q = '') => {
  loading.value = true
  try {
    const { data } = await api.get('/clientes', { params: { q } })
    clientes.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar clientes' })
  } finally {
    loading.value = false
  }
}

const onSearch = (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchClientes(val)
  }, 300)
}

onMounted(() => {
  fetchClientes()
})

// Form handling
const openForm = (cliente = null) => {
  if (cliente) {
    isEditing.value = true
    formData.value = { ...cliente }
  } else {
    isEditing.value = false
    formData.value = {
      _id: null,
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: ''
    }
  }
  isCreationOpen.value = true
}

const saveCliente = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/clientes/${formData.value._id}`, formData.value)
      $q.notify({ type: 'positive', message: 'Cliente actualizado con éxito' })
    } else {
      await api.post('/clientes', formData.value)
      $q.notify({ type: 'positive', message: 'Cliente registrado con éxito' })
    }
    isCreationOpen.value = false
    fetchClientes(search.value)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar el cliente'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (cliente) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar a ${cliente.nombre}?`,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar',
      unelevated: true
    },
    cancel: {
      flat: true,
      label: 'Cancelar'
    }
  }).onOk(async () => {
    try {
      await api.delete(`/clientes/${cliente._id}`)
      $q.notify({ type: 'positive', message: 'Cliente eliminado con éxito' })
      fetchClientes(search.value)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar el cliente'
      })
    }
  })
}

// Navigation placeholders
const asociarVehiculo = (cliente) => {
  router.push(`/vehiculos?clienteId=${cliente._id}&nuevo=true`)
}

const verHistorialVehiculo = (vehiculo) => {
  router.push(`/vehiculos?q=${vehiculo.placa}`)
}

const verPerfilCliente = (cliente) => {
  router.push(`/clientes/${cliente._id}`)
}
</script>

<style scoped>
.client-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>