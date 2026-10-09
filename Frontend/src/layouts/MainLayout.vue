<template>
  <!-- layout view con prioridad para el drawer lateral -->
  <q-layout view="hHh lpR fFf">
    <!-- BARRA SUPERIOR NEGRA -->
    <q-header elevated class="bg-black text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="menu-btn-hover" />

        <q-toolbar-title class="text-weight-bold" style="min-width: 150px;">
          Taller Autos
        </q-toolbar-title>



        <!-- ESPACIADOR -->
        <q-space />

        <!-- MENÚ / BOTÓN DE ADMINISTRADOR -->
        <q-btn-dropdown flat no-caps class="menu-btn-hover">
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-avatar size="28px" class="q-mr-sm bg-negative text-white">
                <q-icon name="person" size="18px" />
              </q-avatar>
              <span class="text-weight-medium">Administrador</span>
            </div>
          </template>

          <q-list dark style="min-width: 180px;" class="bg-grey-10">
            <q-item clickable v-close-popup @click="logout" class="text-negative">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Cerrar Sesión</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL NEGRO DE 295px DE ANCHO -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="295" class="bg-black text-white">
      <q-list dark padding class="rounded-borders">
        <q-item-label header class="text-grey-6 text-uppercase text-weight-bold">
          Navegación
        </q-item-label>

        <q-item clickable v-ripple to="/dashboard" active-class="active-menu-item" class="custom-menu-item">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/ordenes" active-class="active-menu-item" class="custom-menu-item">
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>Órdenes</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/vehiculos" active-class="active-menu-item" class="custom-menu-item">
          <q-item-section avatar>
            <q-icon name="directions_car" />
          </q-item-section>
          <q-item-section>Vehículos</q-item-section>
        </q-item>


        <q-item clickable v-ripple to="/clientes" active-class="active-menu-item" class="custom-menu-item">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>


        <q-item clickable v-ripple to="/mecanicos" active-class="active-menu-item" class="custom-menu-item">
          <q-item-section avatar>
            <q-icon name="engineering" />
          </q-item-section>
          <q-item-section>Mecánicos</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- WIZARD REEMPLAZADO POR FLUJO INLINE -->
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { useEventBus } from '@vueuse/core'

const leftDrawerOpen = ref(false)
const router = useRouter()
const $q = useQuasar()

const bus = useEventBus('app-events')
bus.on((event, payload) => {
  if (event === 'open-wizard') {
    // Usar la página de órdenes para el flujo inline
    router.push('/ordenes?nuevo=true')
  }
})

// Global Search
const globalSearch = ref(null)
const globalSearchResults = ref([])
let searchTimeout = null

async function doGlobalSearch(val, update, abort) {
  if (val.length < 2) { update(() => { globalSearchResults.value = [] }); return; }
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    try {
      // Buscar en paralelo (limitando para no saturar)
      const [cli, veh, ord] = await Promise.all([
        api.get('/clientes', { params: { q: val, limit: 3 } }),
        api.get('/vehiculos', { params: { q: val, limit: 3 } }),
        api.get('/ordenes', { params: { q: val, limit: 3 } })
      ])

      const results = []
      cli.data.forEach(c => results.push({ type: 'cliente', id: c._id, title: c.nombre, subtitle: `Cédula: ${c.cedula}`, icon: 'person', color: 'primary' }))
      veh.data.forEach(v => results.push({ type: 'vehiculo', id: v._id, title: v.placa, subtitle: `${v.marca} ${v.modelo}`, icon: 'directions_car', color: 'orange' }))
      ord.data.forEach(o => results.push({ type: 'orden', id: o._id, title: o.numeroOrden, subtitle: o.estado, icon: 'assignment', color: 'negative' }))

      update(() => { globalSearchResults.value = results })
    } catch (e) { abort() }
  }, 400)
}

function onGlobalSelect(opt) {
  if (!opt) return
  globalSearch.value = null // reset input
  if (opt.type === 'cliente') router.push('/clientes') // ideally /clientes?id=...
  if (opt.type === 'vehiculo') router.push('/vehiculos')
  if (opt.type === 'orden') router.push('/ordenes')

  $q.notify({ type: 'info', message: `Navegando a ${opt.type}: ${opt.title}` })
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  const authStore = useAuthStore()
  authStore.clearToken()

  $q.notify({
    type: 'info',
    message: 'Sesión cerrada'
  })

  router.push('/login')
}
</script>

<style scoped>
/* Estilo base para los elementos del menú */
.custom-menu-item {
  transition: background-color 0.3s ease, color 0.3s ease;
  border-left: 4px solid transparent;
}

/* Hover rojo al pasar el cursor sobre los ítems del menú */
.custom-menu-item:hover {
  background-color: #c62828 !important;
  /* Rojo */
  color: #ffffff !important;
}

/* Estado ACTIVO (Sección actual) */
.active-menu-item {
  background-color: #b71c1c !important;
  /* Rojo oscuro */
  color: #ffffff !important;
  border-left: 4px solid #ffffff;
  font-weight: bold;
}

/* Hover para los botones en la barra superior */
.menu-btn-hover:hover {
  background-color: rgba(198, 40, 40, 0.4) !important;
}
</style>