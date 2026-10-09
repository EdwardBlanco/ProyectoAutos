<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell">


      <!-- 1. TITULO -->
      <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight q-mb-md">Equipo Técnico & Bahías</h1>

      <!-- 2. BOTON "+" -->
      <div class="row q-gutter-x-sm q-mb-md">
        <q-btn v-if="!isCreationOpen" color="primary" icon="engineering" label="Nuevo Mecánico" unelevated
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
        Registrados ({{ mecanicos.length }})
      </div>

      <!-- Dashboard Stats -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- Equipo Técnico Activo -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-white q-pa-md h-full transition-all hover-up">
            <div class="text-subtitle2 text-grey-6 text-weight-bold text-uppercase">Equipo Técnico Activo</div>
            <div class="text-h4 text-weight-bolder text-dark q-my-sm">{{ mecanicos.length }} / {{
              Math.max(mecanicos.length,
              5) }} técnicos</div>
            <div class="text-caption text-positive flex items-center text-weight-medium">
              <q-icon name="check_circle" size="16px" class="q-mr-xs" /> 100% de especialidades cubiertas en turno
            </div>
          </q-card>
        </div>
        <!-- Capacidad Total de Taller -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-white q-pa-md h-full transition-all hover-up">
            <div class="text-subtitle2 text-grey-6 text-weight-bold text-uppercase">Capacidad Total de Taller</div>
            <div class="text-h4 text-weight-bolder text-dark q-my-sm">{{ totalOrdenesActivas }} / 15 órdenes</div>
            <div class="text-caption text-grey-7 flex items-center text-weight-medium">
              <q-icon name="info" size="16px" class="q-mr-xs" /> Distribución equilibrada por elevador y puesto
            </div>
          </q-card>
        </div>
        <!-- Eficiencia Promedio Histórica -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-white q-pa-md h-full transition-all hover-up">
            <div class="text-subtitle2 text-grey-6 text-weight-bold text-uppercase">Eficiencia Promedio Histórica</div>
            <div class="text-h4 text-weight-bolder text-dark q-my-sm">96%</div>
            <div class="text-caption text-positive flex items-center text-weight-medium">
              <q-icon name="trending_up" size="16px" class="q-mr-xs" /> Cumplimiento de tiempos prometidos
            </div>
          </q-card>
        </div>
      </div>

      <!-- INLINE WORKBENCH (Formulario de Creación/Edición) -->
      <transition name="q-transition--slide-down">
        <div v-if="isCreationOpen" class="q-mb-xl">
          <q-card flat bordered class="bg-white">
            <q-card-section class="row items-center justify-between q-pa-md border-bottom bg-grey-1">
              <div class="row items-center">
                <q-avatar color="primary" text-color="white" icon="engineering" size="md" class="q-mr-md shadow-2" />
                <div>
                  <div class="text-h6 text-bold text-dark">{{ isEditing ? 'Editar Mecánico' : 'Nuevo Mecánico' }}</div>
                  <div class="text-caption text-grey-6">Gestione la información del personal técnico.</div>
                </div>
              </div>
              <q-btn icon="close" flat round dense color="grey-8" @click="isCreationOpen = false" />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit="saveMecanico" class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-input v-model="formData.nombre" label="Nombre Completo *" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="formData.cedula" label="Cédula/ID *" outlined dense
                    :rules="[val => !!val || 'Requerido', val => val.length >= 5 || 'Mínimo 5 caracteres']"
                    class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.especialidad" label="Especialidad *" outlined dense
                    hint="Ej: Motor, Transmisión, Eléctrico" :rules="[val => !!val || 'Requerido']"
                    class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.telefono" label="Teléfono *" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.correo" label="Correo *" type="email" outlined dense
                    :rules="[val => !!val || 'Requerido']" class="rounded-input" />
                </div>

                <div class="col-12 text-right q-mt-md">
                  <q-btn label="Cancelar" color="grey-7" flat @click="isCreationOpen = false"
                    class="q-mr-md text-weight-bold rounded-button" no-caps />
                  <q-btn :label="isEditing ? 'Guardar Cambios' : 'Crear Mecánico'" type="submit" color="primary"
                    unelevated :loading="saving" class="text-weight-bold rounded-button shadow-2 q-px-lg" no-caps
                    icon="save" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </transition>

      <!-- Mechanics Cards Grid -->
      <div v-if="loading" class="row justify-center q-pa-xl">
        <q-spinner-dots color="primary" size="50px" />
      </div>

      <div v-else-if="mecanicos.length === 0" class="text-center q-pa-xl">
        <q-icon name="engineering" size="64px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">No se encontraron mecánicos</div>
        <div class="text-caption text-grey-5">Prueba con otro término de búsqueda o registra un nuevo mecánico.</div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="(mec, index) in mecanicos" :key="mec._id" class="col-12 col-md-6 col-lg-4 d-flex">
          <q-card flat bordered
            class="mecanico-card bg-white flex flex-col full-width overflow-hidden transition-all hover-up">

            <!-- Card Header -->
            <div class="q-pa-md bg-grey-1 border-bottom relative-position">
              <div class="absolute-top-right q-pa-sm">
                <q-btn icon="more_vert" flat round dense color="grey-7">
                  <q-menu anchor="bottom right" self="top right" class="border-radius-md shadow-3">
                    <q-list style="min-width: 150px">
                      <q-item clickable v-close-popup @click="openForm(mec)">
                        <q-item-section avatar><q-icon name="edit" color="primary" size="sm" /></q-item-section>
                        <q-item-section>Editar</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="confirmDelete(mec)">
                        <q-item-section avatar><q-icon name="delete" color="negative" size="sm" /></q-item-section>
                        <q-item-section>Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <div class="row items-start q-pr-lg">
                <q-avatar size="56px" :color="getAvatarColor(mec.nombre)" text-color="white"
                  class="text-weight-bolder shadow-2 font-size-lg border-avatar q-mr-md">
                  {{ getInitials(mec.nombre) }}
                </q-avatar>
                <div>
                  <div class="text-h6 text-weight-bold text-dark q-mb-none line-height-tight">{{ mec.nombre }}</div>
                  <div class="text-subtitle2 text-primary q-mt-xs font-medium">{{ mec.especialidad }}</div>
                  <div class="text-caption text-grey-7 flex items-center q-mt-xs">
                    <q-icon name="phone" size="14px" class="q-mr-xs text-grey-5" /> {{ mec.telefono }}
                    <span class="q-mx-sm">·</span>
                    <span class="text-weight-medium text-dark">Eficiencia: {{ getMockEficiencia(mec) }}%</span>
                  </div>
                </div>
              </div>
              <div class="q-mt-sm">
                <q-badge :color="getDisponibilidadColor(mec)" class="text-weight-bold q-px-sm q-py-xs" rounded>
                  {{ getDisponibilidadText(mec) }}
                </q-badge>
              </div>
            </div>

            <!-- Card Body -->
            <div class="q-pa-md flex-grow-1 flex flex-col">
              <!-- Bahía Info -->
              <div class="row items-center justify-between q-mb-md bg-blue-grey-1 q-pa-sm border-radius-md">
                <div class="text-caption text-grey-8 text-weight-medium flex items-center">
                  <q-icon name="home_repair_service" size="16px" class="q-mr-xs text-primary" /> Bahía Asignada:
                </div>
                <div class="text-body2 text-weight-bold text-dark">{{ getMockBahia(mec, index) }}</div>
              </div>

              <!-- Carga Operativa Progress -->
              <div class="q-mb-md">
                <div class="row justify-between items-center q-mb-xs">
                  <span class="text-caption text-weight-medium text-grey-7">Carga Operativa:</span>
                  <span class="text-caption text-weight-bold text-dark">{{ mec.ordenesActivas || 0 }} / {{
                    getCapacidad(mec)
                    }} órdenes ({{ getPorcentajeCarga(mec) }}%)</span>
                </div>
                <q-linear-progress :value="getPorcentajeCarga(mec) / 100" :color="getCargaColor(mec)"
                  class="rounded-borders" size="8px" />
              </div>

              <!-- Órdenes list -->
              <div class="text-subtitle2 text-weight-bold text-dark flex items-center q-mb-sm">
                <q-icon name="assignment" size="18px" class="q-mr-sm text-primary" /> Órdenes asignadas en proceso ({{
                  mec.ordenesActivas || 0 }})
              </div>

              <div class="orders-list flex-grow-1">
                <template v-if="(mec.ordenesActivas || 0) > 0">
                  <div v-for="i in mec.ordenesActivas" :key="i"
                    class="order-item border bg-white border-radius-md q-pa-sm q-mb-sm transition-all hover-border-primary">
                    <div class="row justify-between items-center">
                      <div>
                        <div class="row items-center q-mb-xs">
                          <span class="text-primary text-weight-bold q-mr-sm">OR-108{{ index + i + 1 }}</span>
                          <q-badge color="dark" class="text-weight-bold placa-badge">XXX-000</q-badge>
                        </div>
                        <div class="text-caption text-grey-8">Vehículo Asignado</div>
                      </div>
                      <q-badge :color="i % 2 === 0 ? 'positive' : 'orange-8'" class="text-weight-medium">
                        {{ i % 2 === 0 ? 'Listo p/ Entrega' : 'En Reparación' }}
                      </q-badge>
                    </div>
                  </div>
                </template>
                <div v-else
                  class="text-center q-pa-md border-dashed border-radius-md bg-grey-1 text-grey-6 text-caption text-weight-medium">
                  Bahía libre sin faenas en cola. Lista para nueva orden.
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="q-pa-sm bg-grey-1 border-top text-center">
              <q-btn flat color="primary" label="Gestionar órdenes del taller"
                class="full-width text-weight-bold font-size-sm" no-caps @click="gestionarOrdenes(mec)" />
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
const mecanicos = ref([])
const loading = ref(false)
const search = ref('')
const isCreationOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const formData = ref({
  _id: null,
  nombre: '',
  cedula: '',
  especialidad: '',
  telefono: '',
  correo: ''
})

let searchTimeout = null



// Computed
const totalOrdenesActivas = computed(() => {
  return mecanicos.value.reduce((acc, mec) => acc + (mec.ordenesActivas || 0), 0)
})

// Methods for UI
const getAvatarColor = (name) => {
  if (!name) return 'primary'
  const colors = ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning']
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return colors[sum % colors.length]
}

const getInitials = (name) => {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length > 1) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getMockBahia = (mec, index) => `Bahía ${index + 1}`

const getMockEficiencia = (mec) => {
  if (!mec.nombre) return 95
  return 90 + (mec.nombre.length % 10)
}

const getCapacidad = (mec) => {
  // Mock capacity based on name length for variety
  return 2 + ((mec.nombre?.length || 0) % 3)
}

const getPorcentajeCarga = (mec) => {
  const cap = getCapacidad(mec)
  const orders = mec.ordenesActivas || 0
  return Math.min(100, Math.round((orders / cap) * 100))
}

const getCargaColor = (mec) => {
  const perc = getPorcentajeCarga(mec)
  if (perc < 50) return 'positive'
  if (perc < 80) return 'warning'
  return 'negative'
}

const getDisponibilidadText = (mec) => {
  const perc = getPorcentajeCarga(mec)
  if (perc >= 100) return 'Ocupado'
  return 'Disponible'
}

const getDisponibilidadColor = (mec) => {
  const perc = getPorcentajeCarga(mec)
  if (perc >= 100) return 'negative'
  return 'positive'
}

// Fetch data
const fetchMecanicos = async (q = '') => {
  loading.value = true
  try {
    const { data } = await api.get('/mecanicos', { params: { q } })
    mecanicos.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar mecánicos' })
  } finally {
    loading.value = false
  }
}

const onSearch = (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchMecanicos(val)
  }, 300)
}

onMounted(() => {
  fetchMecanicos()
})

// Form handling
const openForm = (mec = null) => {
  if (mec) {
    isEditing.value = true
    formData.value = { ...mec }
  } else {
    isEditing.value = false
    formData.value = {
      _id: null,
      nombre: '',
      cedula: '',
      especialidad: '',
      telefono: '',
      correo: ''
    }
  }
  isCreationOpen.value = true
}

const saveMecanico = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/mecanicos/${formData.value._id}`, formData.value)
      $q.notify({ type: 'positive', message: 'Mecánico actualizado con éxito' })
    } else {
      await api.post('/mecanicos', formData.value)
      $q.notify({ type: 'positive', message: 'Mecánico creado con éxito' })
    }
    isCreationOpen.value = false
    fetchMecanicos(search.value)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al guardar el mecánico'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (mec) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar a ${mec.nombre}?`,
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
      await api.delete(`/mecanicos/${mec._id}`)
      $q.notify({ type: 'positive', message: 'Mecánico eliminado con éxito' })
      fetchMecanicos(search.value)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar el mecánico'
      })
    }
  })
}

// Navigation placeholders
const nuevaOrden = () => {
  router.push('/ordenes?nuevo=true')
}

const gestionarOrdenes = (mec) => {
  router.push(`/ordenes?mecanicoId=${mec._id}`)
}
</script>

<style scoped>
.mecanico-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>