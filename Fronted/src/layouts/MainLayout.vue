<template>
  <!-- layout view con prioridad para el drawer lateral -->
  <q-layout view="hHh lpR fFf" class="bg-grey-1">
    <!-- BARRA SUPERIOR BLANCA Y COHERENTE -->
    <q-header class="app-topbar bg-white text-dark">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="nav-toggle-btn text-grey-8 q-mr-sm" />

        <!-- BRANDING LOGO -->
        <div class="row items-center cursor-pointer q-mr-lg" @click="router.push('/dashboard')">
          <div class="brand-badge q-mr-sm flex flex-center">
            <q-icon name="directions_car" size="20px" class="text-white" />
          </div>
          <div>
            <div class="text-weight-bolder text-subtitle1 leading-tight tracking-tight text-dark">
              AutoTaller<span class="text-primary font-weight-bold">.PRO</span>
            </div>
            <div class="text-grey-6 brand-sub">Gestión Mecánica Especializada</div>
          </div>
        </div>

        <!-- BUSCADOR GLOBAL HEADER -->
        <div class="q-ml-sm col-grow gt-xs" style="max-width: 480px;">
          <q-select
            dense
            outlined
            v-model="globalSearch"
            use-input
            hide-selected
            fill-input
            input-debounce="300"
            :options="globalSearchResults"
            @filter="doGlobalSearch"
            @update:model-value="onGlobalSelect"
            placeholder="Buscar por placa, cliente o número de orden..."
            class="header-search-input bg-grey-1"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" size="18px" />
            </template>
            <template v-slot:append>
              <span class="search-kbd-hint gt-sm">⌘K</span>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" class="search-result-item">
                <q-item-section avatar>
                  <q-avatar size="30px" :color="scope.opt.color" text-color="white" :icon="scope.opt.icon" class="shadow-1" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-dark">{{ scope.opt.title }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ scope.opt.subtitle }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item class="bg-white text-grey-6">
                <q-item-section>Sin resultados encontrados</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <q-space />

        <!-- MENÚ DE ADMINISTRADOR -->
        <q-btn-dropdown flat no-caps class="admin-dropdown-btn rounded-button">
          <template v-slot:label>
            <div class="row items-center no-wrap">
              <q-avatar size="32px" class="q-mr-sm admin-avatar shadow-1">
                <q-icon name="person" size="18px" color="white" />
              </q-avatar>
              <div class="text-left gt-xs">
                <div class="text-weight-bold text-caption text-dark leading-tight">Administrador</div>
                <div class="text-grey-6" style="font-size: 10px;">Taller Central</div>
              </div>
            </div>
          </template>

          <q-list style="min-width: 200px;" class="admin-menu-list bg-white shadow-3">
            <q-item class="border-bottom q-py-sm">
              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">Sesión Activa</q-item-label>
                <q-item-label caption class="text-grey-6">admin@taller.com</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="logout" class="text-negative q-py-md">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" size="20px" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Cerrar Sesión</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- MENÚ LATERAL BLANCO COHERENTE CON EL RESTO DE LA PÁGINA (280px) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="280" class="app-sidebar bg-white text-dark">
      <div class="column justify-between h-full">
        <q-list padding class="q-px-sm">
          <div class="sidebar-category-title">Principal</div>

          <q-item clickable v-ripple to="/dashboard" active-class="sidebar-item-active" class="sidebar-item">
            <q-item-section avatar class="min-w-0 q-pr-sm">
              <q-icon name="grid_view" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/ordenes" active-class="sidebar-item-active" class="sidebar-item">
            <q-item-section avatar class="min-w-0 q-pr-sm">
              <q-icon name="assignment" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">Órdenes de Servicio</q-item-section>
          </q-item>

          <div class="sidebar-category-title q-mt-md">Parque y Recursos</div>

          <q-item clickable v-ripple to="/vehiculos" active-class="sidebar-item-active" class="sidebar-item">
            <q-item-section avatar class="min-w-0 q-pr-sm">
              <q-icon name="directions_car" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">Vehículos</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/clientes" active-class="sidebar-item-active" class="sidebar-item">
            <q-item-section avatar class="min-w-0 q-pr-sm">
              <q-icon name="people" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">Clientes</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mecanicos" active-class="sidebar-item-active" class="sidebar-item">
            <q-item-section avatar class="min-w-0 q-pr-sm">
              <q-icon name="engineering" size="20px" />
            </q-item-section>
            <q-item-section class="text-weight-medium">Mecánicos</q-item-section>
          </q-item>
        </q-list>

        <!-- FOOTER SIDEBAR -->
        <div class="sidebar-footer q-pa-md border-top bg-grey-1">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <div class="status-dot q-mr-xs"></div>
              <span class="text-caption text-grey-8 text-weight-medium">Taller Conectado</span>
            </div>
            <span class="text-caption text-grey-5 font-bold">v2.5</span>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const leftDrawerOpen = ref(false)
const router = useRouter()
const $q = useQuasar()

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
  const searchVal = opt.title || ''
  globalSearch.value = null // reset input
  if (opt.type === 'cliente') router.push(`/clientes?q=${encodeURIComponent(searchVal)}`)
  if (opt.type === 'vehiculo') router.push(`/vehiculos?q=${encodeURIComponent(searchVal)}`)
  if (opt.type === 'orden') router.push(`/ordenes?q=${encodeURIComponent(searchVal)}`)

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
/* Topbar Limpia y Coherente */
.app-topbar {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.nav-toggle-btn {
  color: #475569;
  transition: all 0.2s ease;
}
.nav-toggle-btn:hover {
  color: #0f172a;
  background: #f1f5f9;
}

/* Brand Badge */
.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.brand-sub {
  font-size: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Header Search */
.header-search-input {
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.header-search-input:hover,
.header-search-input:focus-within {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.08);
}

.search-kbd-hint {
  font-size: 11px;
  font-family: monospace;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #64748b;
}

.search-result-item {
  transition: background 0.15s ease;
}
.search-result-item:hover {
  background: #f1f5f9;
}

/* Admin Dropdown */
.admin-dropdown-btn {
  transition: background 0.2s ease;
  padding: 4px 8px;
}
.admin-dropdown-btn:hover {
  background: #f8fafc;
}

.admin-avatar {
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
}

.admin-menu-list {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

/* Sidebar Coherente con las Páginas */
.app-sidebar {
  background: #ffffff !important;
  border-right: 1px solid #e2e8f0;
}

.sidebar-category-title {
  padding: 14px 16px 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #94a3b8;
}

.sidebar-item {
  border-radius: 10px;
  margin: 4px 10px;
  color: #334155 !important;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}
.sidebar-item .q-icon {
  color: #64748b;
  transition: color 0.2s ease;
}

/* HOVER: Notorio, contrastado y limpio */
.sidebar-item:hover:not(.sidebar-item-active):not(.q-router-link--exact-active) {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border-left-color: #cbd5e1 !important;
  transform: translateX(3px);
}
.sidebar-item:hover:not(.sidebar-item-active):not(.q-router-link--exact-active) .q-icon {
  color: #c62828 !important;
}

/* SELECCIONADO / ACTIVO: 100% Coherente con las tarjetas seleccionadas del taller */
.sidebar-item-active,
.sidebar-item.q-router-link--exact-active,
.app-sidebar .q-item.sidebar-item-active,
.app-sidebar .q-item.q-router-link--exact-active {
  background: #fef2f2 !important;
  color: #c62828 !important;
  font-weight: 700 !important;
  border-left: 4px solid #c62828 !important;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.12) !important;
  transform: none;
}
.sidebar-item-active .q-icon,
.sidebar-item.q-router-link--exact-active .q-icon,
.app-sidebar .q-item.sidebar-item-active .q-icon,
.app-sidebar .q-item.q-router-link--exact-active .q-icon {
  color: #c62828 !important;
}

/* Status indicator dot */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}
</style>