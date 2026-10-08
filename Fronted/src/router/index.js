import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      { path: 'clientes', name: 'clientes', component: () => import('@/pages/ClientesPage.vue') },
      { path: 'vehiculos', name: 'vehiculos', component: () => import('@/pages/VehiculosPage.vue') },
      { path: 'mecanicos', name: 'mecanicos', component: () => import('@/pages/MecanicosPage.vue') },
      { path: 'ordenes', name: 'ordenes', component: () => import('@/pages/OrdenesPage.vue') }
      // { path: 'expedientes', name: 'expedientes', component: () => import('@/pages/ExpedientesPage.vue') },
      // { path: 'configuracion', name: 'configuracion', component: () => import('@/pages/ConfiguracionPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
