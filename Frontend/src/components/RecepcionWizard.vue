<template>
  <q-dialog v-model="isOpen" persistent maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-grey-1 column">
      
      <!-- HEADER -->
      <q-card-section class="bg-primary text-white row items-center justify-between q-pa-md">
        <div class="row items-center">
          <q-avatar color="white" text-color="primary" icon="add_task" size="42px" class="q-mr-sm" />
          <div>
            <div class="text-h6 text-bold leading-tight">Asistente de Recepción</div>
            <div class="text-caption opacity-80">Nuevo cliente, vehículo y orden en un solo paso</div>
          </div>
        </div>
        <q-btn icon="close" flat round dense color="white" v-close-popup @click="cerrar" />
      </q-card-section>

      <!-- BODY / STEPPER -->
      <q-card-section class="col q-pa-none">
        <q-stepper
          v-model="step"
          ref="stepper"
          color="primary"
          animated
          flat
          class="fit"
          header-class="bg-white text-bold shadow-1"
        >
          <!-- PASO 1: CLIENTE -->
          <q-step
            :name="1"
            title="Propietario"
            icon="person"
            :done="step > 1"
          >
            <div class="q-pa-md q-mx-auto" style="max-width: 600px;">
              <div class="text-subtitle1 text-bold q-mb-md">Selecciona o crea un cliente</div>
              
              <!-- Buscar existente -->
              <q-select
                v-model="clienteSelect"
                :options="clientesOptions"
                option-value="_id"
                option-label="nombre"
                label="Buscar Cliente Existente"
                outlined
                use-input
                clearable
                @filter="filterClientes"
                @update:model-value="onClienteSeleccionado"
                class="q-mb-md"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.cedula }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-separator class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm text-grey-7">O ingresa uno nuevo:</div>

              <q-form ref="formCliente">
                <q-input v-model="cliente.nombre" label="Nombre Completo *" outlined dense class="q-mb-sm" :rules="[val => !!val || 'Requerido']" />
                <q-input v-model="cliente.cedula" label="Cédula/NIT *" outlined dense class="q-mb-sm" :rules="[val => !!val || 'Requerido']" />
                <q-input v-model="cliente.telefono" label="Teléfono *" outlined dense class="q-mb-sm" :rules="[val => !!val || 'Requerido', val => /^[0-9+() -]{7,20}$/.test(val) || 'Formato inválido']" />
                <q-input v-model="cliente.correo" label="Correo Electrónico *" outlined dense class="q-mb-sm" type="email" :rules="[val => !!val || 'Requerido', val => /^\\S+@\\S+\\.\\S+$/.test(val) || 'Correo inválido']" />
              </q-form>
            </div>
          </q-step>

          <!-- PASO 2: VEHICULO -->
          <q-step
            :name="2"
            title="Vehículo"
            icon="directions_car"
            :done="step > 2"
          >
            <div class="q-pa-md q-mx-auto" style="max-width: 600px;">
               <div class="text-subtitle1 text-bold q-mb-md">Selecciona o crea un vehículo</div>
               
               <q-select
                v-if="vehiculosDelCliente.length > 0"
                v-model="vehiculoSelect"
                :options="vehiculosDelCliente"
                option-value="_id"
                option-label="placa"
                label="Vehículos registrados de este cliente"
                outlined
                clearable
                @update:model-value="onVehiculoSeleccionado"
                class="q-mb-md"
              >
                 <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.placa }} - {{ scope.opt.marca }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.modelo }} ({{ scope.opt.anio }})</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-separator v-if="vehiculosDelCliente.length > 0" class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm text-grey-7">O registra un nuevo vehículo para {{ cliente.nombre || 'el cliente' }}:</div>

              <q-form ref="formVehiculo">
                <div class="row q-col-gutter-sm">
                  <div class="col-6"><q-input v-model="vehiculo.placa" label="Placa *" outlined dense class="text-uppercase" :rules="[val => !!val || 'Requerido']" /></div>
                  <div class="col-6"><q-input v-model="vehiculo.marca" label="Marca *" outlined dense :rules="[val => !!val || 'Requerido']" /></div>
                  <div class="col-6"><q-input v-model="vehiculo.modelo" label="Modelo *" outlined dense :rules="[val => !!val || 'Requerido']" /></div>
                  <div class="col-6"><q-input v-model="vehiculo.anio" label="Año *" type="number" outlined dense :rules="[val => !!val || 'Requerido']" /></div>
                </div>
              </q-form>
            </div>
          </q-step>

          <!-- PASO 3: ORDEN -->
          <q-step
            :name="3"
            title="Orden"
            icon="assignment"
          >
            <div class="q-pa-md q-mx-auto" style="max-width: 600px;">
              <div class="text-subtitle1 text-bold q-mb-md">Detalles de Recepción</div>
              
              <q-form ref="formOrden">
                <q-input
                  v-model="orden.descripcionFalla"
                  label="Motivo de ingreso / Descripción de la falla *"
                  outlined
                  autogrow
                  rows="3"
                  class="q-mb-md"
                  :rules="[val => !!val || 'Requerido']"
                />

                <q-select
                  v-model="orden.mecanicoId"
                  :options="mecanicosOptions"
                  option-value="_id"
                  option-label="nombre"
                  label="Asignar Mecánico (Opcional)"
                  outlined
                  use-input
                  clearable
                  @filter="filterMecanicos"
                  class="q-mb-md"
                />

                <q-input
                  v-model="orden.fechaEntregaEstimada"
                  type="date"
                  label="Fecha Estimada Entrega (Opcional)"
                  outlined
                  class="q-mb-md"
                />
              </q-form>
            </div>
          </q-step>

          <!-- NAVEGACIÓN -->
          <template v-slot:navigation>
            <q-stepper-navigation class="q-pa-md bg-white border-top flex justify-end">
              <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Atrás" class="q-mr-sm" />
              <q-btn v-if="step < 3" @click="validarYContinuar" color="primary" label="Continuar" unelevated />
              <q-btn v-else @click="finalizar" color="positive" label="Finalizar Recepción" unelevated :loading="saving" />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import api from '@/services/api'
import { useEventBus } from '@vueuse/core'

const $q = useQuasar()
const props = defineProps({ modelValue: Boolean, prefill: Object })
const emit = defineEmits(['update:modelValue', 'saved'])

// Event bus para actualizar vistas al crear algo nuevo
const bus = useEventBus('app-events')

const isOpen = ref(false)
watch(() => props.modelValue, (val) => { 
  isOpen.value = val 
  if (val) initWizard()
})
watch(isOpen, (val) => emit('update:modelValue', val))

const step = ref(1)
const saving = ref(false)

// Formularios
const formCliente = ref(null)
const formVehiculo = ref(null)
const formOrden = ref(null)

// Estado del Wizard
const clienteSelect = ref(null)
const cliente = ref({ _id: null, nombre: '', cedula: '', telefono: '', correo: '' })
const clientesOptions = ref([])

const vehiculoSelect = ref(null)
const vehiculo = ref({ _id: null, placa: '', marca: '', modelo: '', anio: '' })
const vehiculosDelCliente = ref([])

const orden = ref({ descripcionFalla: '', mecanicoId: null, fechaEntregaEstimada: '' })
const mecanicosOptions = ref([])

let clienteSearchTimeout = null
let mecanicoSearchTimeout = null

const initWizard = () => {
  step.value = 1
  clienteSelect.value = null
  cliente.value = { _id: null, nombre: '', cedula: '', telefono: '', correo: '' }
  vehiculoSelect.value = null
  vehiculo.value = { _id: null, placa: '', marca: '', modelo: '', anio: '' }
  orden.value = { descripcionFalla: '', mecanicoId: null, fechaEntregaEstimada: new Date().toISOString().split('T')[0] }
  vehiculosDelCliente.value = []

  // Si hay prefill desde un botón contextual de acción (ej. vengo desde ClientesPage)
  if (props.prefill) {
    if (props.prefill.type === 'cliente' && props.prefill.data) {
      onClienteSeleccionado(props.prefill.data)
      clienteSelect.value = props.prefill.data
    }
    if (props.prefill.type === 'vehiculo' && props.prefill.data) {
       // Cargar cliente del vehiculo primero
       if (props.prefill.data.clienteId) {
         onClienteSeleccionado(props.prefill.data.clienteId)
         clienteSelect.value = props.prefill.data.clienteId
       }
       onVehiculoSeleccionado(props.prefill.data)
       vehiculoSelect.value = props.prefill.data
       step.value = 3 // Saltar directo a la orden
    }
    if (props.prefill.type === 'mecanico' && props.prefill.data) {
       mecanicosOptions.value = [props.prefill.data]
       orden.value.mecanicoId = props.prefill.data
    }
  }
}

const cerrar = () => {
  isOpen.value = false
}

// Búsqueda Cliente
const filterClientes = (val, update) => {
  if (clienteSearchTimeout) clearTimeout(clienteSearchTimeout)
  if (val.length < 2) { update(() => { clientesOptions.value = [] }); return; }
  clienteSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/clientes', { params: { q: val, limit: 10 } })
      update(() => { clientesOptions.value = data })
    } catch (e) { update(() => { clientesOptions.value = [] }) }
  }, 300)
}

const onClienteSeleccionado = async (val) => {
  if (val) {
    cliente.value = { ...val }
    // Buscar sus vehículos
    try {
      const { data } = await api.get('/vehiculos', { params: { q: val.cedula } }) // o un endpoint por clienteId
      // Fallback: filtramos localmente temporal si el backend no soporta por clienteId directo
      const vehs = data.filter(v => v.clienteId?._id === val._id || v.clienteId === val._id)
      vehiculosDelCliente.value = vehs
    } catch (e) { console.log(e) }
  } else {
    cliente.value = { _id: null, nombre: '', cedula: '', telefono: '', correo: '' }
    vehiculosDelCliente.value = []
  }
}

// Búsqueda Mecánico
const filterMecanicos = (val, update) => {
  if (mecanicoSearchTimeout) clearTimeout(mecanicoSearchTimeout)
  mecanicoSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/mecanicos', { params: { q: val, limit: 10 } })
      update(() => { mecanicosOptions.value = data })
    } catch (e) { update(() => { mecanicosOptions.value = [] }) }
  }, 300)
}

const onVehiculoSeleccionado = (val) => {
  if (val) {
    vehiculo.value = { ...val }
  } else {
    vehiculo.value = { _id: null, placa: '', marca: '', modelo: '', anio: '' }
  }
}

const validarYContinuar = async () => {
  if (step.value === 1) {
    // Validar cliente
    const valid = await formCliente.value.validate()
    if (valid) step.value = 2
  } else if (step.value === 2) {
    // Validar vehiculo
    const valid = await formVehiculo.value.validate()
    if (valid) step.value = 3
  }
}

const finalizar = async () => {
  const valid = await formOrden.value.validate()
  if (!valid) return

  saving.value = true
  try {
    // 1. Guardar/Actualizar Cliente
    let cId = cliente.value._id
    if (!cId) {
      const cRes = await api.post('/clientes', cliente.value)
      cId = cRes.data._id
    }

    // 2. Guardar/Actualizar Vehiculo
    let vId = vehiculo.value._id
    if (!vId) {
      const payloadVehiculo = { ...vehiculo.value, clienteId: cId, placa: vehiculo.value.placa.toUpperCase() }
      const vRes = await api.post('/vehiculos', payloadVehiculo)
      vId = vRes.data._id
    }

    // 3. Crear Orden
    const payloadOrden = {
      vehiculoId: vId,
      mecanicoId: orden.value.mecanicoId ? orden.value.mecanicoId._id : null,
      descripcionFalla: orden.value.descripcionFalla,
      fechaEntregaEstimada: orden.value.fechaEntregaEstimada,
      estado: 'Recepción',
      costoManoObra: 0
    }
    await api.post('/ordenes', payloadOrden)

    $q.notify({ type: 'positive', message: '¡Recepción completada con éxito!' })
    bus.emit('datos-actualizados') // Notificar a otras vistas
    cerrar()
    emit('saved')

  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.message || 'Error en el proceso' })
  } finally {
    saving.value = false
  }
}

// Inicializar si el componente se monta con isOpen true
if (props.modelValue) {
  isOpen.value = true
  initWizard()
}
</script>

<style scoped>
.leading-tight { line-height: 1.2; }
.border-top { border-top: 1px solid #e0e0e0; }
</style>
