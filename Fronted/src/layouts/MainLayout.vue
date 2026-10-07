<template>
  <!-- layout view con prioridad para el drawer lateral -->
  <q-layout view="hHh lpR fFf">
    <!-- BARRA SUPERIOR NEGRA -->
    <q-header elevated class="bg-black text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-btn-hover"
        />

        <q-toolbar-title class="text-weight-bold">
          Taller Autos
        </q-toolbar-title>

        <!-- ESPACIADOR -->
        <q-space />

        <!-- MENÚ / BOTÓN DE ADMINISTRADOR -->
        <q-btn-dropdown
          flat
          no-caps
          class="menu-btn-hover"
        >
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
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="295"
      class="bg-black text-white"
    >
      <q-list dark padding class="rounded-borders">
        <q-item-label header class="text-grey-6 text-uppercase text-weight-bold">
          Navegación
        </q-item-label>

        <q-item
          clickable
          v-ripple
          to="/dashboard"
          active-class="active-menu-item"
          class="custom-menu-item"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/mecanicos"
          active-class="active-menu-item"
          class="custom-menu-item"
        >
          <q-item-section avatar>
            <q-icon name="engineering" />
          </q-item-section>
          <q-item-section>Mecánicos</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/clientes"
          active-class="active-menu-item"
          class="custom-menu-item"
        >
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/vehiculos"
          active-class="active-menu-item"
          class="custom-menu-item"
        >
          <q-item-section avatar>
            <q-icon name="directions_car" />
          </q-item-section>
          <q-item-section>Vehículos</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          to="/ordenes"
          active-class="active-menu-item"
          class="custom-menu-item"
        >
          <q-item-section avatar>
            <q-icon name="assignment" />
          </q-item-section>
          <q-item-section>Órdenes</q-item-section>
        </q-item>
      </q-list>
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

const leftDrawerOpen = ref(false)
const router = useRouter()
const $q = useQuasar()

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout () {
  localStorage.removeItem('token')
  
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
  background-color: #c62828 !important; /* Rojo */
  color: #ffffff !important;
}

/* Estado ACTIVO (Sección actual) */
.active-menu-item {
  background-color: #b71c1c !important; /* Rojo oscuro */
  color: #ffffff !important;
  border-left: 4px solid #ffffff;
  font-weight: bold;
}

/* Hover para los botones en la barra superior */
.menu-btn-hover:hover {
  background-color: rgba(198, 40, 40, 0.4) !important;
}
</style>