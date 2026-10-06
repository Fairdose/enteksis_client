import type { RouteRecordRaw } from 'vue-router'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    components: {
      'layout-view': () => import('~layouts/LayoutPublic.vue'),
    },
    children: [
      {
        path: '',
        name: 'home',
        components: {
          'public-view': () => import('~views/home/HomeView.vue'),
        },
      },
    ],
  },
]

export default publicRoutes
