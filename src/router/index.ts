import { createRouter, createWebHistory } from 'vue-router'

import * as route from './routes/_entry'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...route.publicRoutes],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
