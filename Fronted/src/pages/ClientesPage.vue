<template>
  <q-page class="q-pa-lg">
    <div class="page-shell">
      <PageHeader title="Clientes" subtitle="Directorio de propietarios">
        <template #actions>
          <q-btn unelevated color="primary" label="Nuevo cliente" icon="add" no-caps @click="openDialog()" />
        </template>
      </PageHeader>

      <div class="surface q-pa-md">
        <!-- Buscador -->
        <div class="q-mb-lg">
          <q-input v-model="filtro" dense outlined placeholder="Buscar por DNI/Cédula, nombre o teléfono" color="primary">
            <template #prepend><q-icon name="search" color="grey-6" /></template>
          </q-input>
        </div>

        <!-- CUADRÍCULA ESTILO REFERENCIA -->
        <div v-if="filtrados.length > 0" class="row q-col-gutter-md">
          <div
            v-for="cliente in filtrados"
            :key="cliente._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="contact-card q-pa-sm relative-position bg-white"
              :class="{ 'card-selected': selectedClientes.includes(cliente._id) }"
            >
              <!-- Fila Superior: Avatar + Info + Menú (...) -->
              <div class="row items-center justify-between no-wrap q-mb-sm">
                <div class="row items-center no-wrap">
                  <!-- Avatar con iniciales o ícono -->
                  <q-avatar size="38px" color="negative" text-color="white" class="text-bold q-mr-sm">
                    {{ getInitials(cliente.nombre) }}
                  </q-avatar>

                  <!-- Nombre y Correo/Teléfono -->
                  <div class="ellipsis">
                    <div class="text-subtitle2 text-bold text-grey-9 leading-tight ellipsis">
                      {{ cliente.nombre }}
                    </div>
                    <div class="text-caption text-grey-6 ellipsis">
                      {{ cliente.correo || cliente.telefono || 'Sin datos de contacto' }}
                    </div>
                  </div>
                </div>

                <!-- Botón de Opciones (...) -->
                <q-btn flat round dense icon="more_horiz" color="grey-7" size="sm">
                  <q-menu auto-close class="shadow-3 style-menu">
                    <q-list dense style="min-width: 140px">
                      <q-item clickable @click="openDialog(cliente)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="edit" size="18px" color="grey-8" />
                        </q-item-section>
                        <q-item-section class="text-grey-9">Editar</q-item-section>
                      </q-item>

                      <q-item clickable @click="deleteCliente(cliente._id)">
                        <q-item-section avatar class="min-icon-sec">
                          <q-icon name="delete" size="18px" color="negative" />
                        </q-item-section>
                        <q-item-section class="text-negative text-bold">Eliminar</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <!-- Fila Inferior: Tags + Checkbox -->
              <div class="row items-center justify-between q-mt-xs">
                <!-- Tags (DNI / Dirección / Vehículos) -->
                <div class="row items-center q-gutter-xs">
                  <q-chip dense flat class="bg-grey-2 text-grey-8 text-caption">
                    {{ cliente.cedula ? `DNI: ${cliente.cedula}` : 'Sin DNI' }}
                  </q-chip>

                  <q-chip dense flat class="bg-grey-2 text-grey-8 text-caption">
                    <q-icon name="directions_car" size="14px" color="negative" class="q-mr-xs" />
                    {{ cliente.vehiculos?.length || 0 }} veh
                  </q-chip>
                </div>

                <!-- Checkbox lateral derecho -->
                <q-checkbox v-model="selectedClientes" :val="cliente._id" dense size="xs" color="primary" />
              </div>
            </q-card>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="full-width q-pa-xl text-center text-grey-6">
          No hay clientes registrados.
        </div>
      </div>
    </div>

    <!-- Dialogo / Tarjeta Formulario -->
    <q-dialog v-model="dialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 16px; overflow: hidden;" class="shadow-10">
        <q-card-section class="bg-black text-white q-pa-md row items-center justify-between">
          <div class="row items-center">
            <q-avatar color="negative" text-color="white" icon="badge" size="38px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-bold leading-tight">
                {{ form._id ? 'Editar Cliente' : 'Nuevo Cliente' }}
              </div>
              <div class="text-caption text-grey-4">Información de identificación, residencia y vehículos</div>
            </div>
          </div>
          <q-btn icon="close" flat round dense color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="saveCliente" class="q-gutter-y-md">
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

            <q-input
              v-model="form.telefono"
              label="Teléfono *"
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

            <q-input
              v-model="form.correo"
              type="email"
              label="Correo electrónico *"
              outlined
              dense
              :rules="[
                val => !!val || 'El correo es obligatorio',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un correo electrónico válido'
              ]"
            >
              <template #prepend><q-icon name="email" color="negative" /></template>
            </q-input>

            <q-input
              v-model="form.direccion"
              label="Dirección de residencia *"
              outlined
              dense
              :rules="[val => !!val || 'La dirección de residencia es obligatoria']"
            >
              <template #prepend><q-icon name="location_on" color="negative" /></template>
            </q-input>

            <q-select
              v-model="form.vehiculos"
              label="Vehículos asignados"
              outlined
              dense
              multiple
              use-chips
              use-input
              new-value-mode="add-unique"
              :options="vehiculosOpciones"
              option-label="placa"
              option-value="_id"
              hint="Escribe y presiona Enter para agregar placas o selecciona existentes"
            >
              <template #prepend><q-icon name="directions_car" color="negative" /></template>
            </q-select>

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
const clientes = ref([])
const vehiculosOpciones = ref([])
const selectedClientes = ref([])
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  _id: null,
  cedula: '',
  nombre: '',
  telefono: '',
  correo: '',
  direccion: '',
  vehiculos: []
})

const getInitials = (nombre) => {
  if (!nombre) return 'C'
  const words = nombre.trim().split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}

const fetchClientes = async () => {
  try {
    const { data } = await api.get('/clientes')
    clientes.value = data
  } catch (error) {
    console.error('Error fetching clientes:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar los clientes' })
  }
}

const fetchVehiculos = async () => {
  try {
    const { data } = await api.get('/vehiculos')
    vehiculosOpciones.value = data
  } catch (error) {
    console.error('Error fetching vehiculos:', error)
  }
}

onMounted(() => {
  fetchClientes()
  fetchVehiculos()
})

const filtrados = computed(() => {
  const q = filtro.value.trim().toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter((c) => 
    `${c.cedula || ''} ${c.nombre} ${c.telefono} ${c.direccion || ''}`.toLowerCase().includes(q)
  )
})

const openDialog = (cliente = null) => {
  if (cliente) {
    form.value = { 
      ...cliente, 
      vehiculos: cliente.vehiculos || [] 
    }
  } else {
    form.value = { _id: null, cedula: '', nombre: '', telefono: '', correo: '', direccion: '', vehiculos: [] }
  }
  dialog.value = true
}

const saveCliente = async () => {
  saving.value = true
  try {
    if (form.value._id) {
      await api.put(`/clientes/${form.value._id}`, form.value)
      $q.notify({ type: 'positive', message: 'Cliente actualizado exitosamente' })
    } else {
      await api.post('/clientes', form.value)
      $q.notify({ type: 'positive', message: 'Cliente registrado exitosamente' })
    }
    dialog.value = false
    fetchClientes()
  } catch (error) {
    console.error('Error saving cliente:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el cliente' })
  } finally {
    saving.value = false
  }
}

const deleteCliente = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro de eliminar este cliente?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/clientes/${id}`)
      $q.notify({ type: 'positive', message: 'Cliente eliminado' })
      fetchClientes()
    } catch (error) {
      console.error('Error deleting cliente:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar cliente' })
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