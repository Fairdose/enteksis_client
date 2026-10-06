import { createRouter, createWebHistory } from 'vue-router'

import * as route from './routes/_entry'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...route.publicRoutes, ...route.adminRoutes],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !window.sessionStorage.getItem('enteksis-admin-authorization')) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
})

export default router
