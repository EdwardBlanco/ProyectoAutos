import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      { path: 'clientes', name: 'clientes', component: () => import('@/pages/ClientesPage.vue') },
      { path: 'vehiculos', name: 'vehiculos', component: () => import('@/pages/VehiculosPage.vue') },
      { path: 'ordenes', name: 'ordenes', component: () => import('@/pages/OrdenesPage.vue') },
      { path: 'expedientes', name: 'expedientes', component: () => import('@/pages/ExpedientesPage.vue') },
      { path: 'configuracion', name: 'configuracion', component: () => import('@/pages/ConfiguracionPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})
