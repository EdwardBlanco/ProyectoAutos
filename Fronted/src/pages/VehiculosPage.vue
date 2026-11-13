<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="page-shell h-full flex column no-wrap" style="min-height: calc(100vh - 120px);">

      <!-- 1. HEADER (TITULO & ACCION PRINCIPAL) -->
      <PageHeader
        title="Parque Vehicular"
        subtitle="Control de flota, hojas de vida técnica, asignación de clientes y órdenes de taller"
        icon="directions_car"
        icon-bg="red-1"
        icon-color="primary"
        :badge="`${vehiculos.length} Registrados`"
        custom-class="shrink-0"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Vehículo"
            unelevated
            @click="openForm()"
            class="text-weight-bold rounded-button shadow-2 q-px-lg q-py-sm transition-all hover-scale"
            no-caps
          />
        </template>
      </PageHeader>

      <!-- MODAL DIALOG: NUEVO / EDITAR VEHÍCULO -->
      <q-dialog v-model="isCreationOpen" persistent transition-show="scale" transition-hide="scale">
        <q-card style="width: 1000px; max-width: 95vw; border-radius: 16px;" class="bg-white column no-wrap">
          <q-card-section class="row items-center justify-between q-pa-md bg-grey-1 border-bottom">
            <div class="row items-center">
              <q-avatar color="primary" text-color="white" icon="directions_car" size="42px" class="q-mr-md shadow-1" />
              <div>
                <div class="text-h6 text-weight-bold leading-tight">{{ isEditing ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo' }}</div>
                <div class="text-caption text-grey-7">Selecciona o ingresa la marca, modelo, placa y asigna el propietario correspondiente.</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense color="grey-8" @click="isCreationOpen = false" />
          </q-card-section>
          
          <q-card-section class="q-pa-lg scroll" style="max-height: 75vh;">
            <q-form @submit="saveVehiculo" id="vehiculoForm" class="row q-col-gutter-md">
              <!-- SECCION CLIENTE -->
              <div class="col-12">
                 <div class="row items-center justify-between q-mb-xs">
                   <div class="text-bold text-primary flex items-center">
                     <q-icon name="person" size="sm" class="q-mr-xs" />
                     Propietario del Vehículo
                   </div>
                   <q-btn 
                     v-if="!formData._id"
                     flat dense color="primary" no-caps size="sm"
                     :label="isRegisteringNewClient ? '← Buscar cliente existente' : '+ Registrar cliente nuevo aquí'"
                     @click="isRegisteringNewClient = !isRegisteringNewClient"
                   />
                 </div>

                 <div v-if="!isRegisteringNewClient">
                   <q-select
                     v-model="formData.clienteId"
                     :options="clientesOptions"
                     label="Buscar Propietario / Cliente *"
                     outlined
                     dense
                     option-value="_id"
                     option-label="nombre"
                     emit-value
                     map-options
                     use-input
                     @filter="filterClientes"
                     :rules="[val => !!val || 'El cliente es obligatorio']"
                     hint="Escribe al menos 2 caracteres para buscar por nombre o cédula"
                     class="bg-white"
                   >
                      <template #prepend><q-icon name="search" color="grey-6" /></template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label class="text-weight-bold">{{ scope.opt.nombre }}</q-item-label>
                            <q-item-label caption>Doc: {{ scope.opt.cedula || 'N/A' }} &bull; Tel: {{ scope.opt.telefono || 'N/A' }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                   </q-select>
                 </div>
                 <div v-else class="row q-col-gutter-sm bg-grey-2 q-pa-md rounded-borders border">
                   <div class="col-12 col-md-3"><q-input v-model="newClient.nombre" label="Nombre Completo *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                   <div class="col-12 col-md-3"><q-input v-model="newClient.cedula" label="Cédula / NIT *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                   <div class="col-12 col-md-3"><q-input v-model="newClient.telefono" label="Teléfono *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido']" /></div>
                   <div class="col-12 col-md-3"><q-input v-model="newClient.correo" label="Correo *" outlined dense class="bg-white" type="email" :rules="[val => !!val || 'Requerido']" /></div>
                   <div class="col-12"><q-input v-model="newClient.direccion" label="Dirección *" outlined dense class="bg-white" :rules="[val => !!val || 'Requerido', val => (val && val.length >= 5) || 'Mínimo 5 caracteres']" /></div>
                 </div>
              </div>

              <!-- SECCION VEHICULO -->
              <div class="col-12 text-bold text-primary flex items-center q-mt-sm">
                <q-icon name="directions_car" size="sm" class="q-mr-xs" />
                Datos del Vehículo
              </div>

              <!-- PLACA -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.placa"
                  label="Placa *"
                  outlined
                  dense
                  class="text-uppercase bg-white"
                  placeholder="Ej: ABC-123"
                  :rules="[val => !!val || 'Requerido', val => /^[A-Z0-9-]{4,10}$/i.test(val) || 'Placa inválida (4 a 10 letras/números)']"
                >
                  <template #prepend><q-icon name="badge" color="primary" /></template>
                </q-input>
              </div>

              <!-- MARCA (DROPDOWN / CATALOGO) -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="formData.marca"
                  :options="marcasOptions"
                  label="Marca *"
                  outlined
                  dense
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @filter="filterMarcas"
                  @update:model-value="onMarcaChange"
                  :rules="[val => !!val || 'Requerido']"
                  class="bg-white"
                >
                  <template #prepend><q-icon name="directions_car" color="primary" /></template>
                </q-select>
              </div>

              <!-- MODELO (DROPDOWN / SUGERENCIAS DINÁMICAS POR MARCA) -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="formData.modelo"
                  :options="modelosOptions"
                  label="Modelo *"
                  outlined
                  dense
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  new-value-mode="add-unique"
                  @filter="filterModelos"
                  :rules="[val => !!val || 'Requerido']"
                  :hint="formData.marca ? `Sugerencias para ${formData.marca}` : 'Seleccione marca o escriba'"
                  class="bg-white"
                >
                  <template #prepend><q-icon name="commute" color="grey-6" /></template>
                </q-select>
              </div>

              <!-- AÑO -->
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="formData.anio"
                  label="Año *"
                  type="number"
                  outlined
                  dense
                  class="bg-white"
                  :rules="[val => !!val || 'Requerido', val => val >= 1950 && val <= (new Date().getFullYear() + 2) || 'Año inválido']"
                >
                  <template #prepend><q-icon name="calendar_today" color="grey-6" /></template>
                </q-input>
              </div>

              <!-- VIN -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.vin"
                  label="VIN / Número de Chasis (Opcional)"
                  outlined
                  dense
                  class="text-uppercase bg-white"
                  placeholder="17 caracteres alfanuméricos"
                  :rules="[val => !val || /^[A-Z0-9]{17}$/i.test(val) || 'El VIN debe tener exactamente 17 caracteres']"
                >
                  <template #prepend><q-icon name="tag" color="grey-6" /></template>
                </q-input>
              </div>
            </q-form>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1 border-top">
            <q-btn label="Cancelar" color="grey-8" flat @click="isCreationOpen = false" class="q-mr-sm text-weight-bold" no-caps />
            <q-btn form="vehiculoForm" :label="isEditing ? 'Guardar Cambios' : 'Crear Vehículo'" type="submit" color="primary" unelevated :loading="saving" class="text-weight-bold shadow-2 q-px-lg rounded-button" no-caps icon="save" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 3. CONTROLES: BUSCADOR & FILTROS DE ESTADO (ANCHO COMPLETO) -->
      <div class="row items-center q-col-gutter-md q-mb-md shrink-0">
        <div class="col-12 col-md-4">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="Buscar por placa, cliente o modelo..."
            @update:model-value="onSearch"
            class="bg-white rounded-input shadow-1 w-full"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" size="18px" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-8">
          <q-tabs
            v-model="filtroEstado"
            dense
            class="text-grey-7 bg-white rounded-borders shadow-1 w-full"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
          >
            <q-tab name="Todos" label="Todos" no-caps class="text-weight-bold">
              <q-badge color="grey-3" text-color="grey-9" rounded class="q-ml-xs text-weight-bold">{{ vehiculos.length }}</q-badge>
            </q-tab>
            <q-tab name="En diagnóstico" label="En diagnóstico" no-caps class="text-weight-medium" />
            <q-tab name="Pendiente de aprobación" label="Pend. aprobación" no-caps class="text-weight-medium" />
            <q-tab name="En reparación" label="En reparación" no-caps class="text-weight-medium" />
            <q-tab name="Esperando repuestos" label="Espera repuestos" no-caps class="text-weight-medium" />
            <q-tab name="Listo para entrega" label="Listo p/ entrega" no-caps class="text-weight-medium" />
            <q-tab name="Entregada" label="Entregados" no-caps class="text-weight-medium" />
          </q-tabs>
        </div>
      </div>

      <!-- 4. MASTER / DETAIL LAYOUT (ESPACIO HORIZONTAL MAXIMIZADO) -->
      <div class="flex-auto" style="min-height: 520px; width: 100%; overflow: hidden;">
        <div class="row q-col-gutter-lg" style="height: 100%;">
          
          <!-- PANE IZQUIERDO: LISTA DE VEHÍCULOS (Retráctil hacia la izquierda) -->
          <div
            v-show="!isLeftCollapsed"
            class="col-12 col-md-5 col-lg-4 col-xl-3 flex column transition-all"
            style="height: 100%; min-width: 320px;"
          >
            <!-- Cabecera compacta de lista con botón para contraer -->
            <div class="row items-center justify-between q-mb-xs q-px-xs shrink-0">
              <span class="text-caption text-weight-bold text-grey-7">
                {{ vehiculosFiltrados.length }} de {{ vehiculos.length }} vehículos
              </span>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="first_page"
                color="grey-7"
                @click="isLeftCollapsed = true"
              >
                <q-tooltip>Ocultar lista para maximizar panel derecho</q-tooltip>
              </q-btn>
            </div>

            <div class="scroll-area flex-auto q-pr-sm" style="overflow-y: auto; overflow-x: hidden;">
              <q-card 
                v-for="vehiculo in vehiculosFiltrados" :key="vehiculo._id" 
                class="vehiculo-card q-mb-sm cursor-pointer transition-all hover-up" 
                :class="{'selected-card': selectedVehiculo?._id === vehiculo._id}"
                @click="selectVehiculo(vehiculo)"
                flat bordered
                style="border-radius: 12px;"
              >
                <q-card-section class="q-pa-md">
                  <div class="row items-center justify-between no-wrap q-mb-xs">
                    <div class="row items-center">
                      <PlacaBadge :placa="vehiculo.placa" size="sm" class="q-mr-sm" />
                      <span class="text-weight-bold text-dark text-body2">
                        {{ vehiculo.marca }} {{ vehiculo.modelo }}
                      </span>
                    </div>
                    <q-badge :color="getVehiculoStatusColor(vehiculo)" rounded class="q-px-sm py-1 text-weight-bold">
                      {{ getVehiculoStatusLabel(vehiculo) }}
                    </q-badge>
                  </div>
                  
                  <div class="row items-center justify-between text-caption text-grey-7 q-mt-sm">
                    <div class="row items-center">
                      <q-icon name="person" size="14px" class="q-mr-xs text-grey-5" />
                      <span class="ellipsis" style="max-width: 170px;">
                        {{ vehiculo.clienteId?.nombre || 'Sin propietario' }}
                      </span>
                    </div>
                    <span class="text-grey-6">{{ vehiculo.anio }}</span>
                  </div>
                </q-card-section>
              </q-card>
              
              <div v-if="vehiculosFiltrados.length === 0 && !loading" class="text-center q-pa-xl text-grey-6 column items-center">
                <q-icon name="directions_car" size="48px" class="q-mb-sm text-grey-4" />
                <div class="text-weight-bold text-subtitle1">No se encontraron vehículos</div>
                <div class="text-caption">Ajusta los filtros o registra un nuevo vehículo.</div>
              </div>

              <div v-if="loading" class="text-center q-pa-xl">
                <q-spinner-dots color="primary" size="40px" />
              </div>
            </div>
          </div>
          
          <!-- PANE DERECHO: VISTA DETALLADA PRÁCTICA 360° -->
          <div
            class="flex column transition-all"
            :class="isLeftCollapsed ? 'col-12' : 'col-12 col-md-7 col-lg-8 col-xl-9'"
            style="height: 100%; min-width: 0;"
          >
            <q-card v-if="selectedVehiculo" flat bordered class="h-full bg-grey-1 shadow-1 flex column no-wrap" style="height: 100%; min-width: 0; border-radius: 16px; overflow: hidden;">
              
              <!-- 1. HEADER DE DETALLES DEL VEHÍCULO -->
              <q-card-section class="q-pa-md q-px-lg bg-white border-bottom row items-center justify-between shrink-0">
                 <div class="row items-center q-gutter-x-md">
                    <!-- Botón para restaurar lista si está oculta -->
                    <q-btn
                      v-if="isLeftCollapsed"
                      unelevated
                      color="primary"
                      icon="last_page"
                      :label="`Mostrar Lista (${vehiculosFiltrados.length})`"
                      @click="isLeftCollapsed = false"
                      size="sm"
                      class="rounded-button text-weight-bold shadow-1"
                      no-caps
                    />

                    <!-- Matrícula / Placa estilo placa vehicular -->
                    <PlacaBadge :placa="selectedVehiculo.placa" variant="pro" size="lg" copyable class="shadow-1" />

                    <div>
                      <div class="row items-center q-gutter-x-sm">
                        <span class="text-h5 text-weight-bolder text-dark leading-tight">
                          {{ selectedVehiculo.marca }} {{ selectedVehiculo.modelo }}
                        </span>
                        <q-badge color="grey-3" text-color="grey-9" class="text-weight-bold q-px-sm py-1" style="font-size: 13px;">
                          Año {{ selectedVehiculo.anio }}
                        </q-badge>
                        <q-badge :color="getVehiculoStatusColor(selectedVehiculo)" rounded class="q-px-sm py-1 text-weight-bold">
                          {{ getVehiculoStatusLabel(selectedVehiculo) }}
                        </q-badge>
                      </div>
                      
                      <div class="text-caption text-grey-6 q-mt-xs flex items-center q-gutter-x-md">
                        <span v-if="selectedVehiculo.vin" class="cursor-pointer row items-center hover-underline" @click="copyToClipboard(selectedVehiculo.vin, 'VIN')">
                          <q-icon name="fingerprint" size="14px" class="q-mr-xs text-grey-7" />
                          VIN: <b class="q-ml-xs text-dark">{{ selectedVehiculo.vin }}</b>
                          <q-icon name="content_copy" size="12px" class="q-ml-xs text-grey-5" />
                          <q-tooltip>Clic para copiar VIN</q-tooltip>
                        </span>
                        <span v-if="selectedVehiculo.clienteId" class="row items-center">
                          <q-icon name="person" size="14px" class="q-mr-xs text-primary" />
                          Propietario: <b class="q-ml-xs text-dark">{{ selectedVehiculo.clienteId.nombre }}</b>
                        </span>
                      </div>
                    </div>
                 </div>
                 
                 <!-- ACCIONES RÁPIDAS DEL ENCABEZADO -->
                 <div class="row items-center q-gutter-sm">
                    <q-btn
                      v-if="activeOrder"
                      color="primary"
                      icon="arrow_forward"
                      :label="`Ver Orden #${activeOrder.numeroOrden}`"
                      unelevated
                      no-caps
                      size="md"
                      @click="goToOrder(activeOrder)"
                      class="text-weight-bold shadow-1 rounded-button"
                    >
                      <q-tooltip>Abrir la orden en curso en el módulo de órdenes</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-else
                      color="primary"
                      icon="build"
                      label="Ingresar a Taller"
                      unelevated
                      no-caps
                      size="md"
                      @click="startWizardForVehiculo(selectedVehiculo)"
                      class="text-weight-bold shadow-1 rounded-button"
                    >
                      <q-tooltip>Crear nueva orden de reparación para este vehículo</q-tooltip>
                    </q-btn>

                    <q-btn flat round dense icon="edit" color="primary" @click="openForm(selectedVehiculo)">
                       <q-tooltip>Editar información del vehículo</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="delete" color="negative" @click="confirmDelete(selectedVehiculo)">
                       <q-tooltip>Eliminar vehículo</q-tooltip>
                    </q-btn>
                 </div>
              </q-card-section>

              <!-- 2. CUERPO PRÁCTICO UNIFICADO (TODO A MANO SIN PESTAÑAS OCULTAS) -->
              <div class="flex-auto scroll-area q-pa-lg" style="overflow-y: auto;">

                <!-- BLOQUE 1: FICHA 360° (PROPIETARIO & ESPECIFICACIONES) -->
                <div class="row q-col-gutter-md q-mb-md">
                  <!-- TARJETA PROPIETARIO CON CONTACTO DIRECTO -->
                  <div class="col-12 col-lg-6">
                    <q-card flat bordered class="bg-white full-height rounded-borders shadow-xs" style="border-radius: 14px;">
                      <q-card-section class="q-pa-md border-bottom bg-grey-1 row items-center justify-between">
                        <div class="row items-center text-weight-bold text-dark text-subtitle2">
                          <q-avatar size="28px" color="blue-1" text-color="primary" icon="person" class="q-mr-sm" />
                          Propietario / Cliente
                        </div>
                        <q-btn
                          v-if="selectedVehiculo.clienteId"
                          flat
                          dense
                          no-caps
                          size="xs"
                          color="primary"
                          icon-right="open_in_new"
                          label="Ver ficha completa"
                          :to="`/clientes?q=${selectedVehiculo.clienteId.cedula || selectedVehiculo.clienteId.nombre}`"
                        />
                      </q-card-section>

                      <q-card-section class="q-pa-md" v-if="selectedVehiculo.clienteId">
                        <div class="text-subtitle1 text-weight-bolder text-dark q-mb-xs">
                          {{ selectedVehiculo.clienteId.nombre }}
                        </div>
                        <div class="text-caption text-grey-7 q-mb-sm">
                          Doc / Cédula: <b class="text-grey-9">{{ selectedVehiculo.clienteId.cedula || 'N/A' }}</b>
                        </div>

                        <!-- CANALES DE CONTACTO DIRECTO EN 1 CLIC -->
                        <div class="row q-col-gutter-xs items-center q-mb-sm">
                          <div class="col-12 col-sm-6" v-if="selectedVehiculo.clienteId.telefono">
                            <q-btn
                              outline
                              dense
                              no-caps
                              color="positive"
                              icon="phone"
                              :label="selectedVehiculo.clienteId.telefono"
                              :href="`tel:${selectedVehiculo.clienteId.telefono}`"
                              class="full-width text-weight-bold justify-start q-px-sm"
                              size="sm"
                            >
                              <q-tooltip>Llamar a este teléfono</q-tooltip>
                            </q-btn>
                          </div>
                          <div class="col-12 col-sm-6" v-if="selectedVehiculo.clienteId.telefono">
                            <q-btn
                              unelevated
                              dense
                              no-caps
                              color="green-8"
                              icon="chat"
                              label="WhatsApp"
                              :href="getWhatsappUrl(selectedVehiculo.clienteId.telefono)"
                              target="_blank"
                              class="full-width text-weight-bold justify-start q-px-sm"
                              size="sm"
                            >
                              <q-tooltip>Abrir chat de WhatsApp</q-tooltip>
                            </q-btn>
                          </div>
                        </div>

                        <div class="row items-center text-caption text-grey-8 q-mb-xs" v-if="selectedVehiculo.clienteId.correo">
                          <q-icon name="email" size="16px" class="q-mr-xs text-blue-7" />
                          <a :href="`mailto:${selectedVehiculo.clienteId.correo}`" class="text-grey-9 text-decoration-none hover-underline ellipsis">
                            {{ selectedVehiculo.clienteId.correo }}
                          </a>
                        </div>

                        <div class="row items-center text-caption text-grey-7" v-if="selectedVehiculo.clienteId.direccion">
                          <q-icon name="place" size="16px" class="q-mr-xs text-red-6" />
                          <span class="ellipsis">{{ selectedVehiculo.clienteId.direccion }}</span>
                        </div>
                      </q-card-section>

                      <q-card-section v-else class="q-pa-lg text-center text-grey-6">
                        <q-icon name="person_off" size="36px" color="grey-4" class="q-mb-xs" />
                        <div class="text-weight-medium text-body2">Sin propietario asignado</div>
                        <q-btn
                          flat
                          dense
                          color="primary"
                          label="+ Asignar propietario"
                          no-caps
                          size="sm"
                          class="q-mt-xs"
                          @click="openForm(selectedVehiculo)"
                        />
                      </q-card-section>
                    </q-card>
                  </div>

                  <!-- TARJETA ESPECIFICACIONES TÉCNICAS -->
                  <div class="col-12 col-lg-6">
                    <q-card flat bordered class="bg-white full-height rounded-borders shadow-xs" style="border-radius: 14px;">
                      <q-card-section class="q-pa-md border-bottom bg-grey-1 row items-center justify-between">
                        <div class="row items-center text-weight-bold text-dark text-subtitle2">
                          <q-avatar size="28px" color="red-1" text-color="primary" icon="tune" class="q-mr-sm" />
                          Ficha Técnica & Registro
                        </div>
                        <span class="text-caption text-grey-6">
                          {{ selectedVehiculoOrders.length }} orden(es) registrada(s)
                        </span>
                      </q-card-section>

                      <q-card-section class="q-pa-md">
                        <div class="row q-col-gutter-sm">
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Marca</div>
                            <div class="text-body2 text-weight-bold text-dark">{{ selectedVehiculo.marca }}</div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Modelo</div>
                            <div class="text-body2 text-weight-bold text-dark">{{ selectedVehiculo.modelo }}</div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Año</div>
                            <div class="text-body2 text-weight-bold text-dark">{{ selectedVehiculo.anio }}</div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-6">Placa</div>
                            <PlacaBadge :placa="selectedVehiculo.placa" size="md" copyable />
                          </div>
                          <div class="col-12 border-top q-pt-sm q-mt-xs">
                            <div class="row items-center justify-between">
                              <span class="text-caption text-grey-6">VIN / Chasis:</span>
                              <q-btn
                                v-if="selectedVehiculo.vin"
                                flat
                                dense
                                size="xs"
                                icon="content_copy"
                                color="primary"
                                label="Copiar"
                                no-caps
                                @click="copyToClipboard(selectedVehiculo.vin, 'VIN')"
                              />
                            </div>
                            <div class="text-caption text-weight-bold text-dark" style="font-family: monospace; letter-spacing: 0.5px;">
                              {{ selectedVehiculo.vin || 'No registrado' }}
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- BLOQUE 2: OPERACIÓN EN TALLER (ORDEN ACTIVA) -->
                <div class="q-mb-md">
                  <div class="text-subtitle1 text-weight-bold text-dark q-mb-sm flex items-center">
                    <q-icon name="build_circle" size="20px" class="q-mr-xs text-primary" />
                    Operación en Taller
                  </div>

                  <!-- SPINNER CARGANDO ÓRDENES -->
                  <div v-if="loadingOrders" class="flex flex-center q-pa-lg bg-white rounded-borders border">
                    <q-spinner-dots color="primary" size="36px" />
                  </div>

                  <!-- SI TIENE ORDEN ACTIVA -->
                  <q-card
                    v-else-if="activeOrder"
                    flat
                    bordered
                    class="bg-white q-pa-md rounded-borders shadow-1"
                    :style="`border-left: 6px solid var(--q-${estadoColors[activeOrder.estado] || 'primary'}); border-radius: 14px;`"
                  >
                    <div class="row items-center justify-between q-mb-sm">
                      <div class="row items-center q-gutter-x-sm">
                        <span
                          class="text-subtitle1 text-weight-bolder text-primary cursor-pointer hover-underline"
                          @click="goToOrder(activeOrder)"
                        >
                          Orden #{{ activeOrder.numeroOrden }}
                        </span>
                        <q-badge :color="estadoColors[activeOrder.estado] || 'grey'" class="text-weight-bold q-px-sm py-1 shadow-xs">
                          {{ activeOrder.estado }}
                        </q-badge>
                      </div>

                      <q-btn
                        flat
                        dense
                        color="primary"
                        label="Ver detalle completo"
                        icon-right="arrow_forward"
                        size="sm"
                        no-caps
                        @click="goToOrder(activeOrder)"
                      />
                    </div>

                    <div class="row q-col-gutter-md q-mb-sm">
                      <div class="col-12 col-sm-6">
                        <span class="text-caption text-grey-6">Mecánico asignado:</span>
                        <div class="text-body2 text-weight-bold text-dark flex items-center q-mt-xs">
                          <q-avatar size="24px" color="purple-1" text-color="purple-9" icon="engineering" class="q-mr-xs" />
                          {{ activeOrder.mecanicoId?.nombre || 'Sin asignar' }}
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <span class="text-caption text-grey-6">Fecha de ingreso:</span>
                        <div class="text-body2 text-weight-bold text-dark flex items-center q-mt-xs">
                          <q-icon name="event" size="18px" class="q-mr-xs text-grey-6" />
                          {{ formatDate(activeOrder.fechaIngreso) }}
                        </div>
                      </div>
                    </div>

                    <!-- FALLA / DIAGNOSTICO REPORTADO -->
                    <div class="bg-blue-grey-1 q-pa-sm q-px-md rounded-borders border q-mb-md">
                      <div class="text-caption text-weight-bold text-grey-7" style="font-size: 11px; text-transform: uppercase;">
                        Diagnóstico / Falla Reportada:
                      </div>
                      <div class="text-body2 text-grey-9 text-weight-medium q-mt-xs">
                        {{ activeOrder.descripcionFalla }}
                      </div>
                    </div>

                    <!-- CONTROL DE CAMBIO DE ESTADO EN 1 CLIC -->
                    <div class="border-top q-pt-sm">
                      <div class="text-caption text-grey-8 q-mb-xs text-weight-bold flex items-center">
                        <q-icon name="touch_app" size="16px" class="q-mr-xs text-primary" />
                        Cambiar estado rápidamente en 1 clic:
                      </div>
                      <div class="row q-gutter-xs">
                        <q-btn
                          v-for="estado in quickStates"
                          :key="estado"
                          size="sm"
                          :unelevated="activeOrder.estado === estado"
                          :outline="activeOrder.estado !== estado"
                          :color="activeOrder.estado === estado ? estadoColors[estado] : 'grey-8'"
                          :label="estado"
                          @click="updateOrderStatus(activeOrder, estado)"
                          no-caps
                          class="text-weight-bold rounded-button"
                        />
                      </div>
                    </div>
                  </q-card>

                  <!-- SI NO TIENE ORDEN ACTIVA -->
                  <q-card v-else flat bordered class="bg-white q-pa-md rounded-borders shadow-xs" style="border-radius: 14px;">
                    <div class="row items-center justify-between">
                      <div class="row items-center">
                        <q-avatar size="44px" color="green-1" text-color="positive" icon="check_circle" class="q-mr-md" />
                        <div>
                          <div class="text-subtitle1 text-weight-bold text-dark">Vehículo al día</div>
                          <div class="text-caption text-grey-6">No tiene órdenes de reparación activas pendientes en el taller.</div>
                        </div>
                      </div>
                      <q-btn
                        color="primary"
                        unelevated
                        icon="build"
                        label="Ingresar a Taller"
                        no-caps
                        size="sm"
                        class="text-weight-bold shadow-1 rounded-button q-px-md"
                        @click="startWizardForVehiculo(selectedVehiculo)"
                      />
                    </div>
                  </q-card>
                </div>

                <!-- BLOQUE 3: HISTORIAL DE REPARACIONES (VISITAS PREVIAS) -->
                <div>
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle1 text-weight-bold text-dark flex items-center">
                      <q-icon name="history" size="20px" class="q-mr-xs text-primary" />
                      Historial de Reparaciones ({{ historicalOrders.length }})
                    </div>
                  </div>

                  <div v-if="loadingOrders" class="text-center q-pa-md">
                    <q-spinner-dots color="primary" size="30px" />
                  </div>

                  <div v-else-if="historicalOrders.length > 0" class="column q-gutter-y-sm">
                    <q-card
                      v-for="order in historicalOrders"
                      :key="order._id"
                      flat
                      bordered
                      class="bg-white q-pa-md rounded-borders hover-border-primary transition-all shadow-xs"
                      style="border-radius: 12px;"
                    >
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="row items-center q-gutter-x-sm">
                          <span
                            class="text-weight-bold text-primary cursor-pointer hover-underline text-body1"
                            @click="goToOrder(order)"
                          >
                            Orden #{{ order.numeroOrden }}
                          </span>
                          <q-badge :color="estadoColors[order.estado] || 'grey'" outline class="text-weight-bold">
                            {{ order.estado }}
                          </q-badge>
                        </div>
                        <div class="text-caption text-grey-6 flex items-center">
                          <q-icon name="event" size="14px" class="q-mr-xs" />
                          {{ formatDate(order.fechaIngreso) }}
                        </div>
                      </div>

                      <div class="text-body2 text-grey-8 q-my-xs bg-grey-1 q-pa-sm rounded-borders">
                        <strong>Trabajo realizado:</strong> {{ order.descripcionFalla }}
                      </div>

                      <div class="row items-center justify-between text-caption text-grey-7 q-mt-xs">
                        <span v-if="order.mecanicoId">
                          <q-icon name="engineering" size="14px" class="q-mr-xs text-grey-6" />
                          Técnico: <b>{{ order.mecanicoId.nombre }}</b>
                        </span>
                        <span v-else class="text-grey-5">Sin técnico asignado</span>

                        <q-btn
                          flat
                          dense
                          color="primary"
                          label="Ver orden"
                          icon-right="chevron_right"
                          size="sm"
                          no-caps
                          @click="goToOrder(order)"
                        />
                      </div>
                    </q-card>
                  </div>

                  <div v-else class="text-center q-pa-md text-grey-5 bg-white rounded-borders border">
                    <q-icon name="history_toggle_off" size="28px" class="q-mb-xs text-grey-4" />
                    <div class="text-caption">Sin reparaciones previas finalizadas en el taller</div>
                  </div>
                </div>

              </div>
            </q-card>
            
            <div v-else class="h-full flex flex-center text-grey-5 column q-pa-xl bg-white rounded-borders border" style="border-radius: 16px;">
              <q-avatar size="80px" color="red-1" text-color="primary" icon="directions_car" class="q-mb-md shadow-1" />
              <div class="text-h6 text-grey-8 text-weight-bold">Selecciona un vehículo</div>
              <div class="text-caption text-grey-6 q-mt-xs text-center" style="max-width: 320px;">
                Haz clic en cualquiera de los vehículos de la lista izquierda para consultar su ficha técnica, propietario e historial de taller.
              </div>
            </div>
          </div>
          
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
import { getMarcas, getModelosPorMarca } from '@/constants/vehiculos'
import PageHeader from '@/components/PageHeader.vue'
import PlacaBadge from '@/components/PlacaBadge.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

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

const isLeftCollapsed = ref(false)

const copyToClipboard = (text, label = 'Texto') => {
  if (!text) return
  navigator.clipboard.writeText(text)
  $q.notify({
    type: 'positive',
    message: `${label} copiado al portapapeles`,
    timeout: 1500,
    icon: 'content_copy'
  })
}

const getWhatsappUrl = (phone) => {
  if (!phone) return '#'
  const clean = phone.replace(/\D/g, '')
  return `https://wa.me/${clean}`
}

const marcasList = getMarcas()
const marcasOptions = ref(marcasList)
const modelosOptions = ref([])

function filterMarcas(val, update) {
  if (!val) {
    update(() => { marcasOptions.value = marcasList })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    marcasOptions.value = marcasList.filter(v => v.toLowerCase().includes(needle))
  })
}

function onMarcaChange(val) {
  formData.value.marca = val || ''
  formData.value.modelo = ''
  if (val) {
    modelosOptions.value = getModelosPorMarca(val)
  } else {
    modelosOptions.value = []
  }
}

function filterModelos(val, update) {
  const allModels = getModelosPorMarca(formData.value.marca)
  if (!val) {
    update(() => { modelosOptions.value = allModels })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    modelosOptions.value = allModels.filter(v => v.toLowerCase().includes(needle))
  })
}

const newClient = ref({ nombre: '', cedula: '', telefono: '', correo: '', direccion: '' })

const formData = ref({
  _id: null,
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
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
  const active = selectedVehiculoOrders.value.find(o => o.estado !== 'Entregada' && o.estado !== 'Cancelada');
  return active || null;
})

const historicalOrders = computed(() => {
  if (!selectedVehiculoOrders.value.length) return [];
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

watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== undefined) {
      search.value = String(newQ || '')
      loadInitialData(search.value)
    }
  }
)

watch(
  () => [route.query.nuevo, route.query.clienteId],
  async ([nuevo, clienteId]) => {
    if (nuevo === 'true') {
      openForm()
      if (clienteId) {
        formData.value.clienteId = clienteId
        try {
          const res = await api.get(`/clientes/${clienteId}`)
          if (res.data) {
            clientesOptions.value = [res.data]
          }
        } catch (error) {
          console.error('Error fetching client details:', error)
        }
      }
    }
  }
)

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
  router.push(`/ordenes?nuevo=true&vehiculoId=${vehiculo._id}`)
}

const goToOrder = (order) => {
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
      vin: vehiculo.vin || '',
      clienteId: vehiculo.clienteId?._id
    }
    modelosOptions.value = getModelosPorMarca(vehiculo.marca)
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
      anio: new Date().getFullYear(),
      vin: '',
      clienteId: null
    }
    modelosOptions.value = []
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
.placa-badge-pro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #f8fafc;
  border: 2px solid #334155;
  border-radius: 8px;
  padding: 4px 12px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  user-select: all;
}

.placa-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: 'Consolas', monospace;
  font-weight: 700;
  letter-spacing: 1px;
}

.vehiculo-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.vehiculo-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.08);
}

.selected-card {
  border: 1px solid #ef4444 !important;
  border-left: 5px solid #ef4444 !important;
  background-color: #fef2f2 !important;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.14) !important;
}

.hover-border-primary:hover {
  border-color: #ef4444 !important;
}

.shadow-xs {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.hover-bg-grey:hover {
  background-color: #f8fafc;
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}

.hover-underline:hover {
  text-decoration: underline;
}

.text-decoration-none {
  text-decoration: none;
}
</style>