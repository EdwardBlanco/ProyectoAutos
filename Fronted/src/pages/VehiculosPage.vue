<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Vehículos" subtitle="Flota registrada en el taller">
        <template #actions>
          <q-btn unelevated color="primary" label="Registrar vehículo" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface q-pa-md">
        <!-- Buscador -->
        <div class="q-mb-lg">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por placa, marca, modelo o propietario" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>

        <!-- CUADRÍCULA DE VEHÍCULOS (GRID CARDS) -->
        <div v-if="filtrados.length > 0" class="row q-col-gutter-md">
          <div
            v-for="vehiculo in filtrados"
            :key="vehiculo._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="contact-card q-pa-sm relative-position bg-white"
              :class="{ 'card-selected': selectedVehiculos.includes(vehiculo._id) }"
            >
              <!-- Fila Superior: Icono Vehículo + Info Placa/Marca + Menú (...) -->
              <div class="row items-center justify-between no-wrap q-mb-sm">
                <div class="row items-center no-wrap">
                  <q-avatar size="38px" color="negative" text-color="white" class="text-bold q-mr-sm">
                    <q-icon name="directions_car" size="22px" />
                  </q-avatar>

                  <div class="ellipsis">
                    <div class="text-subtitle2 text-bold text-grey-9 leading-tight ellipsis">
                      {{ vehiculo.placa }}
                    </div>
                    <div class="text-caption text-grey-6 ellipsis">
                      {{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.anio }})
                    </div>
                  </div>
                </div>

                <!-- Botón de Opciones (...) -->
                <q-btn flat round dense icon="more_horiz" color="grey-7" size="sm">
                  <q-menu auto-close class="shadow-3 style-menu">
                    <q-list dense style="min-width: 140px">
                      <q-item clickable @click="openDialog(vehiculo)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="edit" size="18px" color="grey-8" />
                        </q-item-section>
                        <q-item-section class="text-grey-9">Editar</q-item-section>
                      </q-item>

                      <q-item clickable @click="deleteVehiculo(vehiculo._id)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="delete" size="18px" color="negative" />
                        </q-item-section>
                        <q-item-section class="text-negative text-bold">Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <!-- Fila Inferior: Propietario / VIN + Checkbox -->
              <div class="row items-center justify-between q-mt-xs">
                <div class="row items-center q-gutter-xs">
                  <q-chip dense flat class="bg-grey-2 text-grey-8 text-caption">
                    <q-icon name="person" size="14px" color="negative" class="q-mr-xs" />
                    {{ getPropietarioNombre(vehiculo.cliente) }}
                  </q-chip>

                  <q-chip v-if="vehiculo.vin" dense flat class="bg-red-1 text-negative text-caption text-bold">
                    VIN: {{ vehiculo.vin }}
                  </q-chip>
                </div>

                <q-checkbox v-model="selectedVehiculos" :val="vehiculo._id" dense size="xs" color="primary" />
              </div>
            </q-card>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="full-width q-pa-xl text-center text-grey-6">
          No hay vehículos que coincidan con la búsqueda.
        </div>
      </div>
    </div>

    <!-- FORMULARIO MODAL EN CUADRÍCULA (2 COLUMNAS) -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 650px; max-width: 95vw; border-radius: 16px; overflow: hidden;" class="shadow-10">
        <!-- Cabecera estilizada -->
        <q-card-section class="bg-black text-white q-pa-md row items-center justify-between">
          <div class="row items-center">
            <q-avatar color="negative" text-color="white" icon="directions_car" size="38px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-bold leading-tight">
                {{ form._id ? 'Editar Vehículo' : 'Registrar Vehículo' }}
              </div>
              <div class="text-caption text-grey-4">Especificaciones técnicas y asignación de propietario</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <!-- Cuerpo del Formulario en Grid Layout -->
        <q-card-section class="q-pa-lg">
          <q-form @submit="saveVehiculo">
            <div class="row q-col-gutter-md">
              
              <!-- Placa -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.placa"
                  label="Placa *"
                  outlined
                  dense
                  class="text-uppercase"
                  :rules="[
                    val => !!val || 'La placa es obligatoria',
                    val => /^[A-Z0-9-]{6,8}$/i.test(val) || 'Formato de placa inválido'
                  ]"
                >
                  <template #prepend><q-icon name="pin" color="negative" /></template>
                </q-input>
              </div>

              <!-- Marca -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.marca"
                  label="Marca *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La marca es obligatoria']"
                >
                  <template #prepend><q-icon name="time_to_leave" color="negative" /></template>
                </q-input>
              </div>

              <!-- Modelo -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.modelo"
                  label="Modelo *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El modelo es obligatorio']"
                >
                  <template #prepend><q-icon name="car_repair" color="negative" /></template>
                </q-input>
              </div>

              <!-- Año -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.anio"
                  label="Año *"
                  type="number"
                  outlined
                  dense
                  :rules="[
                    val => !!val || 'El año es obligatorio',
                    val => (val >= 1900 && val <= 2027) || 'Ingrese un año válido'
                  ]"
                >
                  <template #prepend><q-icon name="event" color="negative" /></template>
                </q-input>
              </div>

              <!-- VIN / Chasis (Ocupa fila completa o media según espacio) -->
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.vin"
                  label="VIN (Número de Chasis)"
                  outlined
                  dense
                  class="text-uppercase"
                >
                  <template #prepend><q-icon name="qr_code" color="negative" /></template>
                </q-input>
              </div>

              <!-- Propietario (Cliente) -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.cliente"
                  label="Propietario *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="clientesOpciones"
                  option-label="nombre"
                  option-value="_id"
                  :rules="[val => !!val || 'Seleccione un propietario']"
                >
                  <template #prepend><q-icon name="person" color="negative" /></template>
                </q-select>
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
import api from '@/services/api'

const $q = useQuasar()
const filtro = ref('')
const vehiculos = ref([])
const clientesOpciones = ref([])
const selectedVehiculos = ref([])
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  vin: '',
  cliente: null
})

const fetchVehiculos = async () => {
  try {
    const { data } = await api.get('/vehiculos')
    vehiculos.value = data
  } catch (error) {
    console.error('Error fetching vehiculos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar vehículos' })
  }
}

const fetchClientes = async () => {
  try {
    const { data } = await api.get('/clientes')
    clientesOpciones.value = data
  } catch (error) {
    console.error('Error fetching clientes:', error)
  }
}

onMounted(() => {
  fetchVehiculos()
  fetchClientes()
})

const getPropietarioNombre = (cliente) => {
  if (!cliente) return 'Sin propietario'
  if (typeof cliente === 'object') return cliente.nombre || 'Propietario'
  const encontrado = clientesOpciones.value.find(c => c._id === cliente)
  return encontrado ? encontrado.nombre : 'Propietario'
}

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return vehiculos.value
  return vehiculos.value.filter((v) => {
    const propNombre = getPropietarioNombre(v.cliente).toLowerCase()
    return `${v.placa} ${v.marca} ${v.modelo} ${v.vin || ''} ${propNombre}`.toLowerCase().includes(q)
  })
})

const openDialog = (vehiculo = null) => {
  if (vehiculo) {
    form.value = { 
      ...vehiculo, 
      cliente: typeof vehiculo.cliente === 'object' ? vehiculo.cliente?._id : vehiculo.cliente 
    }
  } else {
    form.value = {
      _id: null,
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      vin: '',
      cliente: null
    }
  }
  dialog.value = true
}

const saveVehiculo = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await api.put(`/vehiculos/${form.value._id}`, form.value)
      $q.notify({ type: 'positive', message: 'Vehículo actualizado exitosamente' })
    } else {
      await api.post('/vehiculos', form.value)
      $q.notify({ type: 'positive', message: 'Vehículo registrado exitosamente' })
    }
    dialog.value = false
    fetchVehiculos()
  } catch (error) {
    console.error('Error saving vehiculo:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el vehículo' })
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
      fetchVehiculos()
    } catch (error) {
      console.error('Error deleting vehiculo:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar vehículo' })
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