<template>
  <q-layout view="hHh LpR lFf">
    <q-header class="app-header">
      <q-toolbar class="q-px-md">
        <q-btn
          flat
          dense
          round
          icon="menu"
          color="secondary"
          aria-label="Menú"
          @click="drawer = !drawer"
        />

        <q-space />

        <q-btn flat round icon="notifications" color="secondary" aria-label="Notificaciones">
          <q-badge v-if="ordenesActivas" floating color="primary" :label="ordenesActivas" />
        </q-btn>
        <q-btn flat round icon="logout" color="secondary" aria-label="Cerrar sesión" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="236"
      :breakpoint="900"
      class="app-sidebar"
    >
      <div class="row items-center no-wrap q-pa-md brand-block">
        <div class="brand-mark flex flex-center">
          <q-icon name="build" color="white" size="20px" />
        </div>
        <div class="q-ml-sm">
          <div class="brand-title">Taller</div>
          <div class="brand-sub">Gestión v2.4</div>
        </div>
      </div>

      <div class="sidebar-section-label">Navegación taller</div>

      <q-list>
        <q-item
          v-for="item in menu"
          :key="item.to"
          clickable
          v-ripple
          :to="item.to"
          active-class="nav-active"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section v-if="item.badge" side>
            <q-badge color="primary" :label="item.badge" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const drawer = ref(true)
const ordenesActivas = ref(0)
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const fetchOrdenesActivas = async () => {
  try {
    const { data } = await api.get('/ordenes')
    // Contar las que no estén entregadas
    ordenesActivas.value = data.filter((o) => o.estado !== 'Entregado').length
  } catch (error) {
    console.error('Error fetching ordenes activas:', error)
  }
}

onMounted(() => {
  fetchOrdenesActivas()
})

const menu = computed(() => [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Clientes', icon: 'groups', to: '/clientes' },
  { label: 'Vehículos', icon: 'directions_car', to: '/vehiculos' },
  { label: 'Mecánicos', icon: 'engineering', to: '/mecanicos' },
  { label: 'Órdenes', icon: 'assignment', to: '/ordenes', badge: ordenesActivas.value || null },
  { label: 'Expedientes', icon: 'folder_open', to: '/expedientes' },
  { label: 'Configuración', icon: 'settings', to: '/configuracion' }
])
</script>
