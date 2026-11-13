<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell">


      <!-- 1. HEADER (TITULO & ACCION) -->
      <PageHeader
        title="Equipo Técnico"
        subtitle="Gestión de mecánicos, asignación de órdenes y control de capacidad del taller"
        icon="engineering"
        icon-bg="purple-1"
        icon-color="primary"
        :badge="`${mecanicos.length} Especialistas`"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="engineering"
            label="Nuevo Mecánico"
            unelevated
            class="rounded-button shadow-2 q-px-lg q-py-sm text-weight-bold transition-all hover-scale"
            no-caps
            @click="openForm()"
          />
        </template>
      </PageHeader>

      <!-- 2. INPUT DE BUSQUEDA -->
      <div class="row items-center justify-between q-mb-md q-col-gutter-md">
        <div class="col-12 col-md-6 col-lg-5">
          <q-input
            v-model="search"
            outlined
            placeholder="Buscar por nombre, especialidad o teléfono..."
            class="bg-white rounded-input shadow-1 w-full"
            dense
            @update:model-value="onSearch"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" size="18px" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- Capacidad Total de Taller -->
        <div class="col-12 col-md-6">
          <KpiCard
            title="Capacidad Total de Taller"
            :value="`${totalOrdenesActivas} / ${totalCapacidadTaller} órdenes`"
            value-class="text-h4"
            icon="engineering"
            color="purple-8"
            color-light="purple-1"
            subtext="Distribución equilibrada por mecánico"
            subtext-icon="info"
            subtext-color="text-grey-7"
          />
        </div>
        <!-- Evaluación Promedio -->
        <div class="col-12 col-md-6">
          <KpiCard
            title="Calidad de Reparaciones"
            value="4.8"
            value-class="text-h4"
            value-icon="star"
            value-icon-color="warning"
            icon="thumb_up"
            color="green-8"
            color-light="green-1"
            subtext="Alta satisfacción de los clientes"
            subtext-icon="thumb_up"
            subtext-color="text-positive"
          />
        </div>
      </div>

      <!-- MODAL DIALOG: NUEVO / EDITAR MECÁNICO -->
      <q-dialog v-model="isCreationOpen" persistent transition-show="scale" transition-hide="scale">
        <q-card style="width: 760px; max-width: 95vw; border-radius: 16px;" class="bg-white shadow-10 overflow-hidden">
          <q-card-section class="row items-center justify-between q-pa-md border-bottom bg-grey-1">
            <div class="row items-center">
              <q-avatar color="primary" text-color="white" icon="engineering" size="md" class="q-mr-md shadow-2" />
              <div>
                <div class="text-h6 text-bold text-dark">{{ isEditing ? 'Editar Mecánico' : 'Nuevo Mecánico' }}</div>
                <div class="text-caption text-grey-6">Gestione la información del personal técnico.</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense color="grey-8" v-close-popup />
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
              <div class="col-12 col-md-4">
                <q-input v-model.number="formData.capacidad" label="Capacidad (Órdenes) *" type="number" outlined dense
                  :rules="[val => !!val || 'Requerido', val => val > 0 || 'Debe ser mayor a 0']" class="rounded-input" />
              </div>

              <div class="col-12 text-right q-mt-md">
                <q-btn label="Cancelar" color="grey-7" flat v-close-popup
                  class="q-mr-md text-weight-bold rounded-button" no-caps />
                <q-btn :label="isEditing ? 'Guardar Cambios' : 'Crear Mecánico'" type="submit" color="primary"
                  unelevated :loading="saving" class="text-weight-bold rounded-button shadow-2 q-px-lg" no-caps
                  icon="save" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

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
        <div v-for="(mec, index) in mecanicos" :key="mec._id" class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 d-flex">
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
                <template v-if="(mec.ordenesLista && mec.ordenesLista.length > 0)">
                  <div v-for="orden in mec.ordenesLista" :key="orden._id"
                    class="order-item border bg-white border-radius-md q-pa-sm q-mb-sm transition-all hover-border-primary">
                    <div class="row justify-between items-center">
                      <div>
                        <div class="row items-center q-mb-xs">
                          <span class="text-primary text-weight-bold q-mr-sm">{{ orden.numeroOrden }}</span>
                          <PlacaBadge :placa="orden.vehiculoId?.placa" size="sm" />
                        </div>
                        <div class="text-caption text-grey-8">Vehículo Asignado</div>
                      </div>
                      <q-badge :color="orden.estado === 'Listo para entrega' || orden.estado === 'Entregada' ? 'positive' : 'orange-8'" class="text-weight-medium">
                        {{ orden.estado }}
                      </q-badge>
                    </div>
                  </div>
                </template>
                <div v-else
                  class="text-center q-pa-md border-dashed border-radius-md bg-grey-1 text-grey-6 text-caption text-weight-medium">
                  Mecánico libre sin órdenes en cola. Listo para nueva orden.
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
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import PageHeader from '@/components/PageHeader.vue'
import PlacaBadge from '@/components/PlacaBadge.vue'
import KpiCard from '@/components/KpiCard.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

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
  correo: '',
  capacidad: 3
})

let searchTimeout = null



// Computed
const totalOrdenesActivas = computed(() => {
  return mecanicos.value.reduce((acc, mec) => acc + (mec.ordenesActivas || 0), 0)
})

const totalCapacidadTaller = computed(() => {
  return mecanicos.value.reduce((acc, mec) => acc + (mec.capacidad || 3), 0)
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

const getCapacidad = (mec) => {
  return mec.capacidad || 3
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

watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== undefined) {
      search.value = String(newQ || '')
      fetchMecanicos(search.value)
    }
  }
)

onMounted(() => {
  if (route.query?.q) {
    search.value = String(route.query.q)
  }
  fetchMecanicos(search.value)
  if (route.query?.nuevo === 'true') {
    openForm()
  }
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
      correo: '',
      capacidad: 3
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