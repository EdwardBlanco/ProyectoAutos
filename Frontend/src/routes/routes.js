import { createRouter, createWebHistory } from 'vue-router'

import dashboard from '../views/dashboard.vue'
import clientes from '../views/clientes.vue'
import ordenes from '../views/ordenes.vue'
import vehiculos from '../views/vehiculos.vue'

const routes = [
  { path: '/dashboard', component: dashboard },
  { path: '/ordenes', component: ordenes },
  { path: '/vehiculos', component: vehiculos },
  { path: '/clientes', component: clientes },
  { path: '/mecanicos', component: mecanicos },
  { path: '/', redirect: '/dashboard' }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})