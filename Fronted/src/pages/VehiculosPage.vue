<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell h-full flex column no-wrap" style="height: calc(100vh - 100px);">

      <!-- 1. TITULO -->
      <h1 class="text-h4 text-weight-bolder q-my-none text-dark tracking-tight q-mb-md shrink-0">Parque Vehicular</h1>

      <!-- 2. BOTON "+" -->
      <div class="q-mb-md">
        <q-btn
          v-if="!isCreationOpen"
          color="primary"
          icon="add"
          label="Nuevo Carro"
          unelevated
          @click="openForm()"
          class="text-weight-bold rounded-button shadow-3 q-px-lg q-py-sm transition-all hover-scale"
          no-caps
        />
      </div>

      <!-- INLINE WORKBENCH (SIN MODALS) -->
      <transition name="q-transition--slide-down">
        <div v-if="isCreationOpen" class="q-mb-md">
          <q-card class="bg-grey-1 border shadow-2">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div class="row items-center">
                <q-avatar color="primary" text-color="white" icon="directions_car" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle1 text-bold leading-tight">{{ isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</div>
                  <div class="text-caption text-grey-7">Gestione la información del vehículo y su propietario.</div>
                </div>
              </div>
              <q-btn icon="close" flat round dense color="grey-8" @click="isCreationOpen = false" />
            </q-card-section>
            
            <q-card-section>
              <q-form @submit="saveVehiculo" class="row q-col-gutter-md">
                <!-- SECCION CLIENTE -->
                <div class="col-12">
                   <div class="row items-center justify-between q-mb-sm">
                     <div class="text-bold text-primary flex items-center">
                       <q-icon name="person" size="sm" class="q-mr-xs" />
                       Propietario del Vehículo
                     </div>
                     <q-btn 
                       v-if="!formData._id"
                       flat dense color="primary" no-caps size="sm"
                       :label="isRegisteringNewClient ? '← Buscar existente' : '+ Registrar nuevo cliente'"
                       @click="isRegisteringNewClient = !isRegisteringNewClient"
                     />
                   </div>

                   <div v-if="!isRegisteringNewClient">
                     <q-select
                       v-model="formData.clienteId"
                       :options="clientesOptions"
                       label="Propietario / Cliente *"
                       outlined
                       dense
                       option-value="_id"
                       option-label="nombre"
                       emit-value
                       map-options
                       use-input
                       @filter="filterClientes"
                       :rules="[val => !!val || 'El cliente es obligatorio']"
                       hint="Busca por nombre o cédula"
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
                   </div>
                   <div v-else class="row q-col-gutter-sm bg-grey-2 q-pa-sm rounded-borders border">
                     <div class="col-12 col-md-3"><q-input v-model="newClient.nombre" label="Nombre Completo *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                     <div class="col-12 col-md-3"><q-input v-model="newClient.cedula" label="Cédula/NIT *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                     <div class="col-12 col-md-3"><q-input v-model="newClient.telefono" label="Teléfono *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                     <div class="col-12 col-md-3"><q-input v-model="newClient.correo" label="Correo *" outlined dense class="bg-white" type="email" :rules="[val => !!val || 'Requerido']" /></div>
                     <div class="col-12"><q-input v-model="newClient.direccion" label="Dirección *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                   </div>
                </div>

                <!-- SECCION VEHICULO -->
                <div class="col-12 text-bold text-primary flex items-center q-mt-md">
                  <q-icon name="directions_car" size="sm" class="q-mr-xs" />
                  Datos del Vehículo
                </div>

                <div class="col-12 col-md-3">
                  <q-input v-model="formData.placa" label="Placa *" outlined dense class="text-uppercase" :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.marca" label="Marca *" outlined dense :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.modelo" label="Modelo *" outlined dense :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.anio" label="Año *" type="number" outlined dense :rules="[val => !!val || 'Requerido']" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="formData.vin" label="VIN / Número de Chasis" outlined dense />
                </div>
                
                <div class="col-12 text-right q-mt-sm border-top q-pt-md">
                   <q-btn label="Cancelar" color="grey-8" flat @click="isCreationOpen = false" class="q-mr-sm text-weight-bold" no-caps />
                   <q-btn :label="isEditing ? 'Guardar Cambios' : 'Crear Vehículo'" type="submit" color="primary" unelevated :loading="saving" class="text-weight-bold" no-caps icon="save" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </transition>

      <!-- 3. INPUT DE BUSQUEDA -->
      <div class="q-mb-md search-container shrink-0">
        <q-input
          v-model="search"
          dense
          outlined
          placeholder="Buscar placa o cliente..."
          @update:model-value="onSearch"
          class="bg-white search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- 4. FILTROS HORIZONTALES (TABS) -->
      <q-tabs
        v-model="filtroEstado"
        dense
        class="text-grey-7 q-mb-md bg-white rounded-borders shadow-1"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="Todos" label="Todos" no-caps class="text-weight-medium" />
        <q-tab name="En diagnóstico" label="En diagnóstico" no-caps class="text-weight-medium" />
        <q-tab name="Pendiente de aprobación" label="Pendiente de aprobación" no-caps class="text-weight-medium" />
        <q-tab name="En reparación" label="En reparación" no-caps class="text-weight-medium" />
        <q-tab name="Esperando repuestos" label="Espera repuestos" no-caps class="text-weight-medium" />
        <q-tab name="Listo para entrega" label="Listo para entrega" no-caps class="text-weight-medium" />
        <q-tab name="Entregada" label="Entregada" no-caps class="text-weight-medium" />
      </q-tabs>

      <!-- 5. REGISTRADOS (#) -->
      <div class="text-subtitle2 text-grey-8 q-mb-md font-medium">
        Registrados ({{ vehiculosFiltrados.length }})
      </div>

      <!-- Master / Detail Layout -->
      <div class="flex-auto" style="min-height: 0; width: 100%; overflow: hidden;">
        <div class="row q-col-gutter-x-md" style="height: 100%;">
          
          
          <!-- Left Pane: Vehicles List -->
          <div class="col-12 col-md-4 flex column" style="height: 100%; min-width: 0;">
          
          
          
          <div class="scroll-area flex-auto q-pr-sm" style="overflow-y: auto; overflow-x: hidden; min-width: 0;">
            <q-card 
              v-for="vehiculo in vehiculosFiltrados" :key="vehiculo._id" 
              class="vehiculo-card q-mb-sm cursor-pointer transition-scale" 
              :class="{'selected-card': selectedVehiculo?._id === vehiculo._id}"
              @click="selectVehiculo(vehiculo)"
              flat bordered
              style="min-width: 0;"
            >
              <q-card-section class="q-pa-sm row items-center no-wrap" style="min-width: 0;">
                <q-avatar size="md" :color="getVehiculoStatusColor(vehiculo)" text-color="white" class="q-mr-sm" font-size="16px">
                  <q-icon name="directions_car" />
                </q-avatar>
                <div class="col overflow-hidden" style="min-width: 0;">
                   <div class="row items-center justify-between no-wrap" style="min-width: 0;">
                     <span class="text-weight-bold text-body1 ellipsis" style="min-width: 0; flex: 1;">{{ vehiculo.placa }}</span>
                     <q-badge :color="getVehiculoStatusColor(vehiculo)" rounded class="q-px-sm py-1 ellipsis q-ml-sm" style="max-width: 50%; flex-shrink: 0;">
                       {{ getVehiculoStatusLabel(vehiculo) }}
                     </q-badge>
                   </div>
                   <div class="text-caption text-grey-8 ellipsis" style="width: 100%;">{{ vehiculo.marca }} {{ vehiculo.modelo }} ({{ vehiculo.anio }})</div>
                   <div class="text-caption text-grey-6 text-italic ellipsis" style="width: 100%;" v-if="vehiculo.clienteId">
                     Dueño: {{ vehiculo.clienteId.nombre }}
                   </div>
                </div>
              </q-card-section>
            </q-card>
            
            <div v-if="vehiculosFiltrados.length === 0 && !loading" class="text-center q-pa-md text-grey">
              No se encontraron vehículos.
            </div>
            <div v-if="loading" class="text-center q-pa-md">
              <q-spinner color="primary" size="md" />
            </div>
          </div>
        </div>
        
        <!-- Right Pane: Detail View -->
        <div class="col-12 col-md-8 flex column" style="height: 100%; min-width: 0;">
          <q-card v-if="selectedVehiculo" flat bordered class="h-full bg-grey-1 shadow-1 flex column no-wrap" style="height: 100%; min-width: 0; overflow: hidden;">
            <q-card-section class="q-pa-md bg-white border-bottom row items-center justify-between shrink-0">
               <div class="row items-center">
                  <q-avatar color="grey-3" text-color="grey-8" size="lg" font-size="24px" class="q-mr-md">
                    {{ selectedVehiculo.placa.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div class="text-h5 text-weight-bold">
                      {{ selectedVehiculo.placa }}
                    </div>
                    <div class="text-subtitle1 text-grey-8" style="line-height: 1.2;">
                      {{ selectedVehiculo.marca }} {{ selectedVehiculo.modelo }} ({{ selectedVehiculo.anio }})
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs" v-if="selectedVehiculo.vin">
                       VIN: {{ selectedVehiculo.vin }}
                    </div>
                  </div>
               </div>
               
               <div class="column items-end">
                  <q-btn color="primary" icon="build" label="Ingresar a Taller" unelevated no-caps size="md" @click="startWizardForVehiculo(selectedVehiculo)" class="text-weight-bold">
                    <q-tooltip>Nueva Reparación</q-tooltip>
                  </q-btn>
                  
                  <div class="q-mt-sm row q-gutter-sm">
                     <q-btn flat round dense icon="edit" color="primary" @click="openForm(selectedVehiculo)">
                        <q-tooltip>Editar Vehículo</q-tooltip>
                     </q-btn>
                     <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(selectedVehiculo)">
                        <q-tooltip>Eliminar Vehículo</q-tooltip>
                     </q-btn>
                  </div>
               </div>
            </q-card-section>
            
            <q-card-section class="q-pa-md scroll-area flex-auto" style="overflow-y: auto;">
              <div class="row q-col-gutter-md">
               <!-- Propietario Info -->
               <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-white h-full">
                    <q-card-section class="bg-grey-2 q-py-sm border-bottom">
                       <div class="text-weight-bold text-grey-8">¿De quién es este carro? (Propietario)</div>
                    </q-card-section>
                    <q-card-section v-if="selectedVehiculo.clienteId" class="q-pa-md">
                       <div class="text-weight-bold text-subtitle1">{{ selectedVehiculo.clienteId.nombre }}</div>
                       <div class="text-caption text-grey-8 q-mb-sm">Doc: {{ selectedVehiculo.clienteId.cedula }}</div>
                       <div class="row items-center text-body2 text-grey-8 q-mb-xs" v-if="selectedVehiculo.clienteId.telefono">
                         <q-icon name="phone" size="sm" class="q-mr-sm text-grey-6" /> {{ selectedVehiculo.clienteId.telefono }}
                       </div>
                       <div class="row items-center text-body2 text-grey-8 q-mb-xs" v-if="selectedVehiculo.clienteId.correo">
                         <q-icon name="email" size="sm" class="q-mr-sm text-grey-6" /> {{ selectedVehiculo.clienteId.correo }}
                       </div>
                    </q-card-section>
                    <q-card-section v-else class="text-grey-6 text-italic q-pa-md">
                       Sin propietario asignado.
                    </q-card-section>
                  </q-card>
               </div>
               
               <!-- Estado de reparación en curso -->
               <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-white h-full flex column">
                     <q-card-section class="bg-grey-2 q-py-sm border-bottom shrink-0">
                       <div class="text-weight-bold text-grey-8">Estado de Reparación en Curso</div>
                     </q-card-section>
                     
                     <q-card-section v-if="loadingOrders" class="flex-center flex column q-pa-md col">
                       <q-spinner color="primary" size="2em" />
                     </q-card-section>
                     
                     <q-card-section v-else-if="activeOrder" class="col q-pa-md flex column">
                        <div class="row items-center justify-between q-mb-md">
                           <q-badge :color="estadoColors[activeOrder.estado] || 'grey'" class="text-subtitle2 q-px-sm py-1">
                             {{ activeOrder.estado }}
                           </q-badge>
                           <div class="text-caption text-weight-bold text-primary cursor-pointer hover-underline row items-center" @click="goToOrder(activeOrder)">
                             {{ activeOrder.numeroOrden }} <q-icon name="arrow_forward" class="q-ml-xs" />
                           </div>
                        </div>
                        
                        <div class="text-body2 text-grey-9 q-mb-sm bg-blue-grey-1 q-pa-sm border-radius-4">
                           <div class="text-weight-bold text-grey-8 q-mb-xs" style="font-size: 11px; text-transform: uppercase;">Falla Reportada / Diagnóstico</div>
                           {{ activeOrder.descripcionFalla }}
                        </div>
                        
                        <div class="row q-col-gutter-sm q-mb-md">
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Mecánico asignado:</div>
                            <div class="text-body2">{{ activeOrder.mecanicoId?.nombre || 'N/A' }}</div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Ingresó el:</div>
                            <div class="text-body2">{{ formatDate(activeOrder.fechaIngreso) }}</div>
                          </div>
                        </div>
                        
                        <q-space />
                        
                        <div class="q-mt-sm border-top q-pt-md">
                           <div class="text-caption text-grey-7 q-mb-sm text-weight-medium">Actualizar estado en 1 clic:</div>
                           <div class="row q-gutter-xs">
                             <q-btn v-for="estado in quickStates" :key="estado"
                               size="sm" 
                               :unelevated="activeOrder.estado === estado"
                               :outline="activeOrder.estado !== estado"
                               :color="activeOrder.estado === estado ? estadoColors[estado] : 'grey-7'"
                               :label="estado"
                               @click="updateOrderStatus(activeOrder, estado)"
                               no-caps
                               class="text-weight-bold"
                             />
                           </div>
                        </div>
                     </q-card-section>
                     
                     <q-card-section v-else class="col flex flex-center text-grey-6 text-italic text-center q-pa-xl">
                        <div class="column items-center">
                          <q-icon name="check_circle_outline" size="xl" class="q-mb-md text-grey-4" />
                          <div class="text-h6 text-grey-5">Sin reparación activa</div>
                          <div class="text-body2">No hay reparaciones activas para este vehículo.</div>
                        </div>
                     </q-card-section>
                  </q-card>
               </div>
               
               <!-- Historial de Visitas Anteriores -->
               <div class="col-12">
                  <q-card flat bordered class="bg-white">
                     <q-card-section class="bg-grey-2 q-py-sm border-bottom">
                       <div class="text-weight-bold text-grey-8">¿Qué se le ha hecho antes? (Historial de Visitas Anteriores)</div>
                     </q-card-section>
                     
                     <div v-if="loadingOrders" class="q-pa-md text-center">
                        <q-spinner size="md" color="primary"/>
                     </div>
                     <q-list separator v-else-if="historicalOrders.length > 0">
                        <q-item v-for="order in historicalOrders" :key="order._id" class="q-py-md hover-bg-grey">
                           <q-item-section>
                              <q-item-label class="row items-center justify-between">
                                <div class="text-weight-bold text-primary cursor-pointer hover-underline text-subtitle1" @click="goToOrder(order)">
                                   {{ order.numeroOrden }}
                                </div>
                                <q-badge :color="estadoColors[order.estado] || 'grey'" outline class="text-weight-bold">{{ order.estado }}</q-badge>
                              </q-item-label>
                              <q-item-label caption class="q-mt-xs text-grey-7">
                                 <q-icon name="event" size="xs" /> Ingreso: {{ formatDate(order.fechaIngreso) }} &nbsp;&bull;&nbsp; Entrega: {{ formatDate(order.fechaEntregaReal || order.fechaEntregaEstimada) }}
                              </q-item-label>
                              <q-item-label class="text-body2 q-mt-sm bg-grey-1 q-pa-sm border-radius-4 text-grey-8">
                                 <strong>Trabajo:</strong> {{ order.descripcionFalla }}
                              </q-item-label>
                              <q-item-label class="text-caption text-grey-7 q-mt-xs" v-if="order.mecanicoId">
                                 <q-icon name="person" size="xs" /> Atendido por: {{ order.mecanicoId.nombre }}
                              </q-item-label>
                           </q-item-section>
                           <q-item-section side>
                              <q-btn flat round color="primary" icon="chevron_right" @click="goToOrder(order)" />
                           </q-item-section>
                        </q-item>
                     </q-list>
                     
                     <q-card-section v-else-if="!loadingOrders" class="text-grey-6 text-italic text-center q-pa-lg">
                        <q-icon name="history" size="md" class="q-mb-sm text-grey-4 block mx-auto" />
                        No hay registros de visitas anteriores para este vehículo.
                     </q-card-section>
                  </q-card>
               </div>
              </div>
            </q-card-section>
          </q-card>
          
          <div v-else class="h-full flex flex-center text-grey-5 column">
            <q-icon name="directions_car" size="100px" class="q-mb-md opacity-30" />
            <div class="text-h6">Seleccione un vehículo</div>
            <div class="text-body1">Para ver su información y estado de reparaciones</div>
          </div>
        </div>
        
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

import api from '@/services/api'
import { useEventBus } from '@vueuse/core'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const bus = useEventBus('app-events')

const vehiculos = ref([])
const activeOrdersAll = ref([])
const loading = ref(false)
const search = ref('')

const selectedVehiculo = ref(null)
const selectedVehiculoOrders = ref([])
const loadingOrders = ref(false)

const isCreationOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const isRegisteringNewClient = ref(false)
const clientesOptions = ref([])
const filtroEstado = ref('Todos')
const newClient = ref({ nombre: '', cedula: '', telefono: '', correo: '', direccion: '' })

const formData = ref({
  _id: null,
  placa: '',
  marca: '',
  modelo: '',
  anio: '',
  vin: '',
  clienteId: null
})

const estadoColors = {
  'En diagnóstico': 'orange-8',
  'Pendiente de aprobación': 'amber-8',
  'Esperando repuestos': 'red-8',
  'En reparación': 'blue-8',
  'Listo para entrega': 'teal-8',
  'Entregada': 'positive',
  'Cancelada': 'negative',
  'Sin orden': 'grey'
}

const quickStates = ['En diagnóstico', 'Pendiente de aprobación', 'En reparación', 'Esperando repuestos', 'Listo para entrega', 'Entregada', 'Cancelada']

const activeOrder = computed(() => {
  if (!selectedVehiculoOrders.value.length) return null;
  // Consider as active the most recent order that is not "Entregada" and not "Cancelada"
  const active = selectedVehiculoOrders.value.find(o => o.estado !== 'Entregada' && o.estado !== 'Cancelada');
  return active || null;
})

const historicalOrders = computed(() => {
  if (!selectedVehiculoOrders.value.length) return [];
  // All orders except the currently active one (if any)
  if (activeOrder.value) {
    return selectedVehiculoOrders.value.filter(o => o._id !== activeOrder.value._id);
  }
  return selectedVehiculoOrders.value;
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const loadInitialData = async (q = '') => {
  loading.value = true
  try {
    const [vehiculosRes, ordersRes] = await Promise.all([
      api.get('/vehiculos', { params: { q } }),
      api.get('/ordenes', { params: { estado: 'todas' } })
    ])
    vehiculos.value = vehiculosRes.data
    activeOrdersAll.value = ordersRes.data
    
    // Maintain selection or select first
    if (selectedVehiculo.value) {
       const stillExists = vehiculos.value.find(v => v._id === selectedVehiculo.value._id)
       if (stillExists) {
         selectVehiculo(stillExists, true)
       } else {
         selectedVehiculo.value = null
       }
    } else if (vehiculos.value.length > 0 && !q) {
       selectVehiculo(vehiculos.value[0])
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos' })
  } finally {
    loading.value = false
  }
}

let searchTimeout = null
const onSearch = (val) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadInitialData(val), 300)
}

onMounted(async () => {
  if (route.query.q) {
    search.value = route.query.q
    loadInitialData(route.query.q)
  } else {
    loadInitialData()
  }

  if (route.query.nuevo === 'true') {
    openForm()
    if (route.query.clienteId) {
      formData.value.clienteId = route.query.clienteId
      try {
        const res = await api.get(`/clientes/${route.query.clienteId}`)
        if (res.data) {
          clientesOptions.value = [res.data]
        }
      } catch (error) {
        console.error('Error fetching client details:', error)
      }
    }
  }
})

const getVehiculoActiveOrder = (vehiculo) => {
  return activeOrdersAll.value.find(o => o.vehiculoId?._id === vehiculo._id || o.vehiculoId === vehiculo._id)
}

const getVehiculoStatusLabel = (vehiculo) => {
  const order = getVehiculoActiveOrder(vehiculo);
  if (!order || order.estado === 'Cancelada' || order.estado === 'Entregada') return 'Sin orden';
  return order.estado;
}

const getVehiculoStatusColor = (vehiculo) => {
  const order = getVehiculoActiveOrder(vehiculo);
  if (!order) return 'grey-6';
  return estadoColors[order.estado] || 'grey';
}

const vehiculosFiltrados = computed(() => {
  if (filtroEstado.value === 'Todos') return vehiculos.value
  return vehiculos.value.filter(v => getVehiculoStatusLabel(v) === filtroEstado.value)
})

const selectVehiculo = async (vehiculo, forceRefresh = false) => {
  if (selectedVehiculo.value?._id === vehiculo._id && !forceRefresh) return;
  selectedVehiculo.value = vehiculo;
  
  loadingOrders.value = true;
  try {
    const res = await api.get('/ordenes', { params: { vehiculoId: vehiculo._id } });
    selectedVehiculoOrders.value = res.data;
  } catch (e) {
    console.error(e);
    $q.notify({ type: 'negative', message: 'Error al cargar historial del vehículo' });
  } finally {
    loadingOrders.value = false;
  }
}

let clientSearchTimeout = null
const filterClientes = (val, update, abort) => {
  if (clientSearchTimeout) clearTimeout(clientSearchTimeout)
  
  if (val.length < 2) {
    update(() => {
      clientesOptions.value = []
    })
    return
  }
  
  clientSearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/clientes', { params: { q: val, limit: 15 } })
      update(() => {
        clientesOptions.value = data
      })
    } catch (e) {
      abort()
    }
  }, 300)
}

const startWizardForVehiculo = (vehiculo) => {
  router.push('/ordenes?nuevo=true&vehiculoId=' + vehiculo._id)
}

const goToOrder = (order) => {
  // Ideally navigate to the specific order detail or order page with search
  router.push('/ordenes?q=' + order.numeroOrden)
}

const openForm = (vehiculo = null) => {
  isRegisteringNewClient.value = false;
  if (vehiculo) {
    isEditing.value = true
    formData.value = {
      _id: vehiculo._id,
      placa: vehiculo.placa,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      vin: vehiculo.vin,
      clienteId: vehiculo.clienteId?._id
    }
    if (vehiculo.clienteId) {
      clientesOptions.value = [vehiculo.clienteId]
    }
  } else {
    isEditing.value = false
    formData.value = {
      _id: null,
      placa: '',
      marca: '',
      modelo: '',
      anio: '',
      vin: '',
      clienteId: null
    }
    clientesOptions.value = []
    newClient.value = { nombre: '', cedula: '', telefono: '', correo: '', direccion: '' }
  }
  isCreationOpen.value = true
}

const saveVehiculo = async () => {
  saving.value = true
  try {
    let targetClienteId = formData.value.clienteId;
    
    if (isRegisteringNewClient.value && !formData.value._id) {
      const resCliente = await api.post('/clientes', newClient.value);
      targetClienteId = resCliente.data._id;
    }

    const payload = { ...formData.value, clienteId: targetClienteId }
    payload.placa = payload.placa.toUpperCase()
    
    if (!payload.vin) {
      delete payload.vin
    }
    
    if (isEditing.value) {
      await api.put(`/vehiculos/${payload._id}`, payload)
      $q.notify({ type: 'positive', message: 'Vehículo actualizado con éxito' })
    } else {
      await api.post('/vehiculos', payload)
      $q.notify({ type: 'positive', message: 'Vehículo creado con éxito' })
    }
    isCreationOpen.value = false
    loadInitialData(search.value)
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.message || 'Error al guardar' 
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Eliminar el vehículo con placa ${row.placa}?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Eliminar', unelevated: true },
    cancel: { flat: true, label: 'Cancelar' }
  }).onOk(async () => {
    try {
      await api.delete(`/vehiculos/${row._id}`)
      $q.notify({ type: 'positive', message: 'Vehículo eliminado con éxito' })
      if (selectedVehiculo.value?._id === row._id) {
         selectedVehiculo.value = null;
      }
      loadInitialData(search.value)
    } catch (error) {
      $q.notify({ 
        type: 'negative', 
        message: error.response?.data?.message || 'Error al eliminar' 
      })
    }
  })
}

const updateOrderStatus = async (order, estado) => {
  try {
    await api.patch(`/ordenes/${order._id}/estado`, { estado, nota: 'Actualizado desde perfil de vehículo' });
    $q.notify({ type: 'positive', message: 'Estado actualizado' });
    
    // Refresh vehicle orders and global active orders
    await loadInitialData(search.value);
    if (selectedVehiculo.value) {
       selectVehiculo(selectedVehiculo.value, true);
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' });
  }
}

</script>

<style scoped>
/* Las clases de utilidades se movieron a app.scss */
</style>