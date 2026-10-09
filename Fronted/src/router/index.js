import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

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
      { path: 'ordenes', name: 'ordenes', component: () => import('@/pages/OrdenesPage.vue') },
      { path: 'vehiculos', name: 'vehiculos', component: () => import('@/pages/VehiculosPage.vue') },
      { path: 'clientes', name: 'clientes', component: () => import('@/pages/ClientesPage.vue') },
      { path: 'mecanicos', name: 'mecanicos', component: () => import('@/pages/MecanicosPage.vue') }
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
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.token) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
