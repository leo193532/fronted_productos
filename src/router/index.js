import { createRouter, createWebHistory } from 'vue-router'
import LoginAuth from '@/views/auth/LoginAuth.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginAuth,
    meta: { title: 'Iniciar Sesion' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboardView.vue'),
    meta: { title: 'Dashboard' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Mi App` : 'Mi App'
  next()
})

export default router
