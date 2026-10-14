import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    components: {
      'layout-view': () => import('~layouts/LayoutAdmin.vue'),
    },
    children: [
      {
        path: '',
        name: 'admin-login',
        components: {
          'admin-view': () => import('~views/admin/login/AdminLoginView.vue'),
        },
      },
      {
        path: 'requests',
        name: 'admin-requests',
        meta: { requiresAdmin: true },
        components: {
          'admin-view': () => import('~views/admin/requests/AdminRequestsView.vue'),
        },
      },
      {
        path: 'masa',
        name: 'benim-masam',
        meta: { requiresDesk: true },
        components: {
          'admin-view': () => import('~views/desk/DeskView.vue'),
        },
      },
      {
        path: 'requests/:id',
        name: 'admin-request-detail',
        meta: { requiresAdmin: true },
        components: {
          'admin-view': () => import('~views/admin/requests/AdminRequestDetailView.vue'),
        },
      },
    ],
  },
]

export default adminRoutes
